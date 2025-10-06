import mysql from "mysql2/promise";
import { MysqlAdapter } from "../../../../cortex/db/adapters/mysql";
import { DbConfig } from "../../../../cortex/db/db-types";

jest.mock("mysql2/promise");

describe("[1.] MysqlAdapter", () => {
    let adapter: MysqlAdapter;
    let mockConfig: Omit<DbConfig, "database" | "type">;
    let mockPool: { getConnection: jest.Mock; end: jest.Mock };
    let mockConnection: { query: jest.Mock; release: jest.Mock; end: jest.Mock };

    beforeEach(() => {
        adapter = new MysqlAdapter();
        mockConfig = { host: "localhost", port: 3306, user: "user", password: "pass", ssl: false, connectionLimit: 10, acquireTimeout: 30000, idleTimeout: 60000 };
        mockConnection = {
            query: jest.fn().mockResolvedValue([[], null]),
            release: jest.fn(),
            end: jest.fn(),
        };
        mockPool = {
            getConnection: jest.fn().mockResolvedValue(mockConnection),
            end: jest.fn(),
        };
        (mysql.createPool as jest.Mock).mockReturnValue(mockPool);
        (MysqlAdapter as any).pool = null;
        (MysqlAdapter as any).poolsInitialized = false;
        jest.clearAllMocks();
    });

    it("[test 1] inits pool with config", async () => {
        await adapter.initPool(mockConfig);
        expect(mysql.createPool).toHaveBeenCalledWith(expect.objectContaining({ connectionLimit: 10 }));
    });

    it("[test 2] closes pool", async () => {
        await adapter.initPool(mockConfig);
        await adapter.closePool();
        expect(mockPool.end).toHaveBeenCalled();
    });

    it("[test 3] gets connection and uses database if provided", async () => {
        await adapter.initPool(mockConfig);
        const conn = await adapter.getConnection("testdb");
        expect(conn.query).toBeDefined();
        expect(mockConnection.query).toHaveBeenCalledWith("USE `testdb`");
        expect(mockConnection.query).toHaveBeenCalledWith("SELECT 1");
    });

    it("[test 4] connects using connect method", async () => {
        const client = await adapter.connect({ ...mockConfig as DbConfig, database: "db", type: "mysql" });
        expect(client).toBeDefined();
    });

    it("[test 5] disconnects client", async () => {
        const mockClient = { query: jest.fn(), release: jest.fn(), end: jest.fn() };
        await adapter.disconnect(mockClient);
        expect(mockClient.release).toHaveBeenCalled();
    });

    it("[test 6] queries with client", async () => {
        const mockClient = { query: jest.fn().mockResolvedValue({ rows: [{ id: 1 }], rowCount: 1 }) };
        const result = await adapter.query(mockClient, "SELECT *", []);
        expect(result).toEqual({ rows: [{ id: 1 }], rowCount: 1, insertId: undefined });
    });

    it("[test 7] begins transaction", async () => {
        const mockClient = { query: jest.fn() };
        await adapter.beginTransaction(mockClient);
        expect(mockClient.query).toHaveBeenCalledWith("START TRANSACTION");
    });

    it("[test 8] commits transaction", async () => {
        const mockClient = { query: jest.fn() };
        await adapter.commitTransaction(mockClient);
        expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    });

    it("[test 9] rollbacks transaction", async () => {
        const mockClient = { query: jest.fn() };
        await adapter.rollbackTransaction(mockClient);
        expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    });

    it("[test 10] handles connection error", async () => {
        await adapter.initPool(mockConfig);
        mockPool.getConnection.mockRejectedValue(new Error("conn fail"));
        await expect(adapter.getConnection("db")).rejects.toThrow("conn fail");
    });
});