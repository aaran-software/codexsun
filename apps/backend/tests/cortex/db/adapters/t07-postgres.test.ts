import pg from "pg";
import { PostgresAdapter } from "../../../../cortex/db/adapters/postgres";
import { DbConfig } from "../../../../cortex/db/db-types";

jest.mock("pg");

describe("[1.] PostgresAdapter", () => {
    let adapter: PostgresAdapter;
    let mockConfig: Omit<DbConfig, "database" | "type">;
    let mockPool: { connect: jest.Mock; end: jest.Mock };
    let mockClient: { query: jest.Mock; release: jest.Mock };

    beforeEach(() => {
        adapter = new PostgresAdapter();
        mockConfig = { host: "localhost", port: 5432, user: "user", password: "pass", ssl: false, connectionLimit: 10, acquireTimeout: 30000, idleTimeout: 60000 };
        mockClient = {
            query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
            release: jest.fn(),
        };
        mockPool = {
            connect: jest.fn().mockResolvedValue(mockClient),
            end: jest.fn(),
        };
        (pg.Pool as unknown as jest.Mock).mockImplementation(() => mockPool);
        (PostgresAdapter as any).pool = null;
        (PostgresAdapter as any).poolsInitialized = false;
        jest.clearAllMocks();
    });

    it("[test 1] inits pool with config", async () => {
        await adapter.initPool(mockConfig);
        expect(pg.Pool).toHaveBeenCalledWith(expect.objectContaining({ max: 10 }));
    });

    it("[test 2] closes pool", async () => {
        await adapter.initPool(mockConfig);
        await adapter.closePool();
        expect(mockPool.end).toHaveBeenCalled();
    });

    it("[test 3] gets connection and sets schema if database provided", async () => {
        await adapter.initPool(mockConfig);
        const wrappedClient = await adapter.getConnection("testdb");
        expect(wrappedClient.query).toBeDefined();
        expect(mockClient.query).toHaveBeenCalledWith('SET search_path TO "testdb"');
        expect(mockClient.query).toHaveBeenCalledWith("SELECT 1");
    });

    it("[test 4] connects using connect method", async () => {
        const client = await adapter.connect({ ...mockConfig as DbConfig, database: "db", type: "postgres" });
        expect(client).toBeDefined();
    });

    it("[test 5] disconnects client", async () => {
        const mockDisconnectClient = { query: jest.fn(), release: jest.fn() };
        await adapter.disconnect(mockDisconnectClient);
        expect(mockDisconnectClient.release).toHaveBeenCalled();
    });

    it("[test 6] queries with client", async () => {
        const mockQueryClient = { query: jest.fn().mockResolvedValue({ rows: [{ id: 1 }], rowCount: 1 }) };
        const result = await adapter.query(mockQueryClient, "SELECT *", []);
        expect(result).toEqual({ rows: [{ id: 1 }], rowCount: 1, insertId: undefined });
    });

    it("[test 7] begins transaction", async () => {
        const mockTxClient = { query: jest.fn() };
        await adapter.beginTransaction(mockTxClient);
        expect(mockTxClient.query).toHaveBeenCalledWith("BEGIN");
    });

    it("[test 8] commits transaction", async () => {
        const mockTxClient = { query: jest.fn() };
        await adapter.commitTransaction(mockTxClient);
        expect(mockTxClient.query).toHaveBeenCalledWith("COMMIT");
    });

    it("[test 9] rollbacks transaction", async () => {
        const mockTxClient = { query: jest.fn() };
        await adapter.rollbackTransaction(mockTxClient);
        expect(mockTxClient.query).toHaveBeenCalledWith("ROLLBACK");
    });

    it("[test 10] handles connection error", async () => {
        await adapter.initPool(mockConfig);
        mockPool.connect.mockRejectedValue(new Error("conn fail"));
        await expect(adapter.getConnection("db")).rejects.toThrow("conn fail");
    });
});