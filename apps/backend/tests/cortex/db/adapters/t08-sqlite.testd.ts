// cortex/db/adapters/t08-sqlite.test.ts

import { open } from "sqlite";
import { SqliteAdapter } from "./sqlite";
import { DbConfig } from "../db-types";

jest.mock("sqlite");

describe("[1.] SqliteAdapter", () => {
    let adapter: SqliteAdapter;
    let mockDb;

    beforeEach(() => {
        adapter = new SqliteAdapter();
        mockDb = {
            prepare: jest.fn().mockReturnValue({
                all: jest.fn().mockResolvedValue([]),
                run: jest.fn().mockResolvedValue(undefined),
                finalize: jest.fn(),
                changes: 1,
                lastID: 1,
            }),
            exec: jest.fn().mockResolvedValue(undefined),
            close: jest.fn(),
        };
        (open as jest.Mock).mockResolvedValue(mockDb);
        jest.clearAllMocks();
    });

    it("[test 1] initPool is no-op", async () => {
        await adapter.initPool({} as any);
        expect(open).not.toHaveBeenCalled();
    });

    it("[test 2] closePool is no-op", async () => {
        await adapter.closePool();
        expect(mockDb.close).not.toHaveBeenCalled();
    });

    it("[test 3] gets connection with database file", async () => {
        const client = await adapter.getConnection("test.db");
        expect(open).toHaveBeenCalledWith(expect.objectContaining({ filename: "test.db" }));
        expect(mockDb.exec).toHaveBeenCalledWith("SELECT 1");
        await client.query("SELECT 1");
        expect(mockDb.prepare).toHaveBeenCalled();
    });

    it("[test 4] throws if no database for connection", async () => {
        await expect(adapter.getConnection("")).rejects.toThrow("Database filename is required for SQLite");
    });

    it("[test 5] connects using connect method", async () => {
        const client = await adapter.connect({ database: "db.sqlite" } as DbConfig);
        expect(client).toBeDefined();
    });

    it("[test 6] disconnects client", async () => {
        const mockClient = { end: jest.fn() };
        await adapter.disconnect(mockClient);
        expect(mockClient.end).toHaveBeenCalled();
    });

    it("[test 7] queries with client for SELECT", async () => {
        const mockClient = await adapter.getConnection("test.db");
        mockClient.query = jest.fn().mockResolvedValue({ rows: [{ id: 1 }], rowCount: 1 });
        const result = await adapter.query(mockClient as AnyDbClient, "SELECT *", []);
        expect(result).toEqual({ rows: [{ id: 1 }], rowCount: 1, insertId: undefined });
    });

    it("[test 8] begins transaction", async () => {
        const mockClient = { query: jest.fn() };
        await adapter.beginTransaction(mockClient);
        expect(mockClient.query).toHaveBeenCalledWith("BEGIN TRANSACTION");
    });

    it("[test 9] commits transaction", async () => {
        const mockClient = { query: jest.fn() };
        await adapter.commitTransaction(mockClient);
        expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    });

    it("[test 10] rollbacks transaction", async () => {
        const mockClient = { query: jest.fn() };
        await adapter.rollbackTransaction(mockClient);
        expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    });
});