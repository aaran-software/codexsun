// cortex/db/adapters/t06-mysql.test.ts

import mysql from "mysql2/promise";
import { MysqlAdapter } from "./mysql";
import { DbConfig } from "../db-types";

jest.mock("mysql2/promise");

describe("[1.] MysqlAdapter", () => {
    let adapter: MysqlAdapter;
    let mockConfig: Omit<DbConfig, "database" | "type">;

    beforeEach(() => {
        adapter = new MysqlAdapter();
        mockConfig = { host: "localhost", port: 3306, user: "user", password: "pass", ssl: false, connectionLimit: 10, idleTimeout: 60000 };
        (mysql.createPool as jest.Mock).mockReturnValue({
            getConnection: jest.fn().mockResolvedValue({
                query: jest.fn().mockResolvedValue([[], null]),
                release: jest.fn(),
                end: jest.fn(),
            }),
            end: jest.fn(),
        });
        jest.clearAllMocks();
    });

    it("[test 1] inits pool with config", async () => {
        await adapter.initPool(mockConfig);
        expect(mysql.createPool).toHaveBeenCalledWith(expect.objectContaining({ connectionLimit: 10 }));
    });

    it("[test 2] closes pool", async () => {
        await adapter.initPool(mockConfig);
        await adapter.closePool();
        expect((mysql.createPool as jest.Mock).mock.results[0].value.end).toHaveBeenCalled();
    });

    it("[test 3] gets connection and uses database if provided", async () => {
        await adapter.initPool(mockConfig);
        const conn = await adapter.getConnection("testdb");
        expect(conn.query).toBeDefined();
        await conn.query("SELECT 1", []);
        expect(conn.query).toHaveBeenCalledWith("USE `testdb`");
    });

    it("[test 4] connects using connect method", async () => {
        const client = await adapter.connect({ ...mockConfig as DbConfig, database: "db", type: "mysql" });
        expect(client).toBeDefined();
    });

    it("[test 5] disconnects client", async () => {
        const mockClient = { release: jest.fn(), end: jest.fn() };
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
        const mockGetConn = (mysql.createPool as jest.Mock).mock.results[0].value.getConnection;
        mockGetConn.mockRejectedValue(new Error("conn fail"));
        await expect(adapter.getConnection("db")).rejects.toThrow("conn fail");
    });
});