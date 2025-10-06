// cortex/db/adapters/t05-postgres.test.ts

import pg from "pg";
import { PostgresAdapter } from "./postgres";
import { DbConfig } from "../db-types";

jest.mock("pg");

describe("[1.] PostgresAdapter", () => {
    let adapter: PostgresAdapter;
    let mockConfig: Omit<DbConfig, "database" | "type">;

    beforeEach(() => {
        adapter = new PostgresAdapter();
        mockConfig = { host: "localhost", port: 5432, user: "user", password: "pass", ssl: false, connectionLimit: 10, acquireTimeout: 30000, idleTimeout: 60000 };
        (pg.Pool as jest.Mock).mockImplementation(() => ({
            connect: jest.fn().mockResolvedValue({
                query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
                release: jest.fn(),
            }),
            end: jest.fn(),
        }));
        jest.clearAllMocks();
    });

    it("[test 1] inits pool with config", async () => {
        await adapter.initPool(mockConfig);
        expect(pg.Pool).toHaveBeenCalledWith(expect.objectContaining({ max: 10 }));
    });

    it("[test 2] closes pool", async () => {
        await adapter.initPool(mockConfig);
        await adapter.closePool();
        expect((pg.Pool as jest.Mock).mock.instances[0].end).toHaveBeenCalled();
    });

    it("[test 3] gets connection and sets schema if database provided", async () => {
        await adapter.initPool(mockConfig);
        const client = await adapter.getConnection("testdb");
        expect(client.query).toBeDefined();
        expect(client.release).toHaveBeenCalledTimes(0);
        await client.query("SELECT 1", []);
        expect(client.query).toHaveBeenCalledWith('SET search_path TO "testdb"');
    });

    it("[test 4] connects using connect method", async () => {
        const client = await adapter.connect({ ...mockConfig as DbConfig, database: "db", type: "postgres" });
        expect(client).toBeDefined();
    });

    it("[test 5] disconnects client", async () => {
        const mockClient = { release: jest.fn() };
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
        expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
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
        const mockConnect = (pg.Pool as jest.Mock).mock.instances[0].connect;
        mockConnect.mockRejectedValue(new Error("conn fail"));
        await expect(adapter.getConnection("db")).rejects.toThrow("conn fail");
    });
});