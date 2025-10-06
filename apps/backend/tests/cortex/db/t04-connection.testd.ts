import { Connection } from "../../../cortex/db/connection";
import { getDbConfig } from "../../../cortex/config/db-config";
import { MariaDBAdapter } from "../../../cortex/db/adapters/mariadb";
import { PostgresAdapter } from "../../../cortex/db/adapters/postgres";
import { MysqlAdapter } from "../../../cortex/db/adapters/mysql";
import { SqliteAdapter } from "../../../cortex/db/adapters/sqlite";
import { logConnection } from "../../../cortex/config/logger";
import { DbConfig } from "cortex/db/db-types";

jest.mock("../../../cortex/db/adapters/mariadb");
jest.mock("../../../cortex/db/adapters/postgres");
jest.mock("../../../cortex/db/adapters/mysql");
jest.mock("../../../cortex/db/adapters/sqlite");
jest.mock("../../../cortex/config/logger");
jest.mock("../../../cortex/config/db-config");

describe("[1.] Connection", () => {
    let mockConfig: DbConfig;

    beforeEach(() => {
        mockConfig = { type: "mariadb", host: "localhost", port: 3306, user: "user", password: "pass", database: "db", ssl: false, connectionLimit: 10, acquireTimeout: 30000, idleTimeout: 60000 };
        (getDbConfig as jest.Mock).mockReturnValue(mockConfig);
        (Connection as any).instance = null; // Reset singleton
        jest.clearAllMocks();
    });

    it("[test 1] initializes singleton with config and calls init", async () => {
        const mockInitPool = jest.fn().mockResolvedValue(undefined);
        (MariaDBAdapter as unknown as jest.Mock).mockImplementation(() => ({
            initPool: mockInitPool,
            getConnection: jest.fn().mockResolvedValue({ query: jest.fn() }),
            closePool: jest.fn().mockResolvedValue(undefined),
        }));

        const conn = await Connection.initialize(mockConfig);
        expect(conn).toBeInstanceOf(Connection);
        expect(mockInitPool).toHaveBeenCalledWith(expect.objectContaining({ host: "localhost" }));
        expect(logConnection).toHaveBeenCalledTimes(2); // start and success
    });

    it("[test 2] throws on unsupported type", () => {
        (mockConfig as any).type = "invalid";
        expect(() => new (Connection as any)(mockConfig)).toThrow("Unsupported database type: invalid");
    });

    it("[test 3] gets instance after initialize", async () => {
        (MariaDBAdapter as unknown as jest.Mock).mockImplementation(() => ({
            initPool: jest.fn().mockResolvedValue(undefined),
            getConnection: jest.fn().mockResolvedValue({ query: jest.fn() }),
            closePool: jest.fn().mockResolvedValue(undefined),
        }));
        await Connection.initialize(mockConfig);
        expect(Connection.getInstance()).toBeDefined();
    });

    it("[test 4] throws if getInstance before initialize", () => {
        (Connection as any).instance = null;
        expect(() => Connection.getInstance()).toThrow("Connection not initialized");
    });

    it("[test 5] closes pool and resets instance", async () => {
        const mockClosePool = jest.fn().mockResolvedValue(undefined);
        (MariaDBAdapter as unknown as jest.Mock).mockImplementation(() => ({
            initPool: jest.fn().mockResolvedValue(undefined),
            closePool: mockClosePool,
            getConnection: jest.fn().mockResolvedValue({ query: jest.fn() }),
        }));
        await Connection.initialize(mockConfig);
        await Connection.getInstance().close();
        expect(mockClosePool).toHaveBeenCalled();
        expect((Connection as any).instance).toBeNull();
    });

    it("[test 6] gets client from adapter", async () => {
        const mockGetConnection = jest.fn().mockResolvedValue({ query: jest.fn() });
        (MariaDBAdapter as unknown as jest.Mock).mockImplementation(() => ({
            initPool: jest.fn().mockResolvedValue(undefined),
            getConnection: mockGetConnection,
            closePool: jest.fn().mockResolvedValue(undefined),
        }));
        await Connection.initialize(mockConfig);
        await Connection.getInstance().getClient("testdb");
        expect(mockGetConnection).toHaveBeenCalledWith("testdb");
    });

    it("[test 7] gets config", async () => {
        (MariaDBAdapter as unknown as jest.Mock).mockImplementation(() => ({
            initPool: jest.fn().mockResolvedValue(undefined),
            getConnection: jest.fn().mockResolvedValue({ query: jest.fn() }),
            closePool: jest.fn().mockResolvedValue(undefined),
        }));
        await Connection.initialize(mockConfig);
        expect(Connection.getInstance().getConfig()).toEqual(mockConfig);
    });


    it("[test 8] handles init error with retry in production", async () => {
        process.env.NODE_ENV = "production";
        const mockInitPool = jest.fn()
            .mockRejectedValueOnce(new Error("fail"))
            .mockResolvedValueOnce(undefined);
        (MariaDBAdapter as unknown as jest.Mock).mockImplementation(() => ({
            initPool: mockInitPool,
            getConnection: jest.fn().mockResolvedValue({ query: jest.fn() }),
            closePool: jest.fn().mockResolvedValue(undefined),
        }));
        await Connection.initialize(mockConfig);
        expect(mockInitPool).toHaveBeenCalledTimes(2); // Initial + retry
        process.env.NODE_ENV = "test";
    }, 10000);

    it("[test 9] throws on init error in non-production", async () => {
        process.env.NODE_ENV = "test";
        const mockInitPool = jest.fn().mockRejectedValue(new Error("fail"));
        (MariaDBAdapter as unknown as jest.Mock).mockImplementation(() => ({
            initPool: mockInitPool,
            getConnection: jest.fn().mockResolvedValue({ query: jest.fn() }),
            closePool: jest.fn().mockResolvedValue(undefined),
        }));
        await expect(Connection.initialize(mockConfig)).rejects.toThrow("Failed to initialize pool: fail");
    });

    it("[test 10] handles close error", async () => {
        const mockClosePool = jest.fn().mockRejectedValue(new Error("close fail"));
        (MariaDBAdapter as unknown as jest.Mock).mockImplementation(() => ({
            initPool: jest.fn().mockResolvedValue(undefined),
            closePool: mockClosePool,
            getConnection: jest.fn().mockResolvedValue({ query: jest.fn() }),
        }));
        await Connection.initialize(mockConfig);
        await expect(Connection.getInstance().close()).rejects.toThrow("Failed to close pool: close fail");
    });

    it("[test 11] initializes with postgres", async () => {
        mockConfig.type = "postgres";
        (PostgresAdapter as unknown as jest.Mock).mockImplementation(() => ({ initPool: jest.fn().mockResolvedValue(undefined), getConnection: jest.fn(), closePool: jest.fn() }));
        await Connection.initialize(mockConfig);
        expect(PostgresAdapter).toHaveBeenCalled();
    });

    it("[test 12] initializes with mysql", async () => {
        mockConfig.type = "mysql";
        (MysqlAdapter as unknown as jest.Mock).mockImplementation(() => ({ initPool: jest.fn().mockResolvedValue(undefined), getConnection: jest.fn(), closePool: jest.fn() }));
        await Connection.initialize(mockConfig);
        expect(MysqlAdapter).toHaveBeenCalled();
    });

    it("[test 13] initializes with sqlite", async () => {
        mockConfig.type = "sqlite";
        (SqliteAdapter as jest.Mock).mockImplementation(() => ({ initPool: jest.fn().mockResolvedValue(undefined), getConnection: jest.fn(), closePool: jest.fn() }));
        await Connection.initialize(mockConfig);
        expect(SqliteAdapter).toHaveBeenCalled();
    });
});