import { open } from "sqlite";
import { SqliteAdapter } from "../../../../cortex/db/adapters/sqlite";
import { DbConfig } from "../../../../cortex/db/db-types";

jest.mock("sqlite");

describe("[1.] SqliteAdapter", () => {
    let adapter: SqliteAdapter;
    let mockDb: {
        prepare: jest.Mock;
        exec: jest.Mock;
        close: jest.Mock;
    };

    beforeEach(() => {
        adapter = new SqliteAdapter();
        mockDb = {
            prepare: jest.fn().mockReturnValue({
                all: jest.fn().mockResolvedValue([]),
                run: jest.fn().mockResolvedValue({ changes: 1, lastID: 1 }),
                finalize: jest.fn(),
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
        expect(client.query).toBeDefined();
    });

    it("[test 4] throws if no database for connection", async () => {
        await expect(adapter.getConnection("")).rejects.toThrow("Database filename is required for SQLite");
    });

    it("[test 5] connects using connect method", async () => {
        const client = await adapter.connect({ database: "db.sqlite" } as DbConfig);
        expect(client).toBeDefined();
    });

    it"[test 6] disconnects client", async () => {
        const mockClient = { query: jest.fn(), end: jest.fn().mockResolvedValue(undefined) };
        await adapter.disconnect(mockClient);
        expect(mockClient.end).toHaveBeenCalled();
    });

    it"[test 7] queries with client for SELECT", async () => {
        const mockStmt = {
            all: jest.fn().mockResolvedValue([{ id: 1 }]),
            run: jest.fn().mockResolvedValue({ changes: 0, lastID: undefined }),
            finalize: jest.fn(),
        };
        mockDb.prepare.mockResolvedValue(mockStmt);
        const client = await adapter.getConnection("test.db");
        const result = await client.query("SELECT * FROM table WHERE id = ?", [1]);
        expect(result).toEqual({ rows: [{ id: 1 }], rowCount: 1, insertId: undefined });
    });

    it"[test 8] begins transaction", async () => {
        const mockClient = { query: jest.fn() };
        await adapter.beginTransaction(mockClient);
        expect(mockClient.query).toHaveBeenCalledWith("BEGIN TRANSACTION");
    });

    it"[test 9] commits transaction", async () => {
        const mockClient = { query: jest.fn() };
        await adapter.commitTransaction(mockClient);
        expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    });

    it"[test 10] rollbacks transaction", async () => {
        const mockClient = { query: jest.fn() };
        await adapter.rollbackTransaction(mockClient);
        expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    });

    it"[test 11] catches getConnection error", async () => {
        mockDb.exec.mockRejectedValueOnce(new Error("exec fail"));
        console.error = jest.fn();
        await expect(adapter.getConnection("test.db")).rejects.toThrow("exec fail");
        expect(console.error).toHaveBeenCalledWith("SQLite connection error:", expect.any(Error));
    });

    it"[test 12] queries with client for INSERT", async () => {
        const mockStmt = {
            all: jest.fn().mockResolvedValue([]),
            run: jest.fn().mockResolvedValue({ changes: 1, lastID: 42 }),
            finalize: jest.fn(),
        };
        mockDb.prepare.mockResolvedValue(mockStmt);
        const client = await adapter.getConnection("test.db");
        const result = await client.query("INSERT INTO table (name) VALUES (?)", ["test"]);
        expect(result).toEqual({ rows: [], rowCount: 1, insertId: 42 });
    });
});