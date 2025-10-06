// cortex/db/t04-db.test.ts

import { AsyncLocalStorage } from "async_hooks";
import { query, withTransaction, healthCheck, tenantStorage } from "./db";
import { Connection } from "./connection";
import { getDbConfig } from "../config/db-config";
import { logQuery, logTransaction, logHealthCheck } from "../config/logger";

jest.mock("./connection");
jest.mock("../config/db-config");
jest.mock("../config/logger");

describe("[1.] db", () => {
    let mockConfig;
    let mockClient;

    beforeEach(() => {
        mockConfig = { database: "master" };
        (getDbConfig as jest.Mock).mockReturnValue(mockConfig);
        mockClient = { query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }), release: jest.fn(), end: jest.fn() };
        (Connection.getInstance as jest.Mock).mockReturnValue({ getClient: jest.fn().mockResolvedValue(mockClient) });
        jest.clearAllMocks();
    });

    describe("[2.] query", () => {
        it("[test 1] executes query on tenant db if set", async () => {
            tenantStorage.run("tenantdb", async () => {
                mockClient.query.mockResolvedValue({ rows: [{ id: 1 }], rowCount: 1, insertId: 1 });
                const result = await query("SELECT * FROM table", [1]);
                expect(result).toEqual({ rows: [{ id: 1 }], rowCount: 1, insertId: 1 });
                expect(Connection.getInstance().getClient).toHaveBeenCalledWith("tenantdb");
                expect(logQuery).toHaveBeenCalledTimes(2); // start, end
            });
        });

        it("[test 2] falls back to master db", async () => {
            await query("SELECT 1");
            expect(Connection.getInstance().getClient).toHaveBeenCalledWith("master");
        });

        it("[test 3] throws on invalid sql", async () => {
            await expect(query("")).rejects.toThrow("Invalid SQL query provided");
        });

        it("[test 4] handles query error", async () => {
            mockClient.query.mockRejectedValue(new Error("query fail"));
            await expect(query("SELECT 1")).rejects.toThrow(/Query failed/);
            expect(logQuery).toHaveBeenCalledWith("error", expect.any(Object));
        });

        it("[test 5] releases client in finally", async () => {
            await query("SELECT 1");
            expect(mockClient.release).toHaveBeenCalled();
        });

        it("[test 6] handles release error", async () => {
            mockClient.release.mockImplementation(() => { throw new Error("release fail"); });
            console.error = jest.fn();
            await query("SELECT 1");
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Failed to release"));
        });
    });

    describe("[3.] withTransaction", () => {
        it("[test 1] executes transaction callback successfully", async () => {
            const callback = jest.fn().mockResolvedValue("result");
            const result = await withTransaction(callback);
            expect(mockClient.query).toHaveBeenCalledWith("START TRANSACTION");
            expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
            expect(callback).toHaveBeenCalledWith(mockClient);
            expect(result).toBe("result");
            expect(logTransaction).toHaveBeenCalledTimes(2); // start, end
        });

        it("[test 2] rolls back on error", async () => {
            const callback = jest.fn().mockRejectedValue(new Error("tx fail"));
            await expect(withTransaction(callback)).rejects.toThrow(/Transaction failed/);
            expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
            expect(logTransaction).toHaveBeenCalledWith("error", expect.any(Object));
        });

        it("[test 3] handles rollback error", async () => {
            const callback = jest.fn().mockRejectedValue(new Error("tx fail"));
            mockClient.query.mockImplementation((sql) => {
                if (sql === "ROLLBACK") throw new Error("rollback fail");
                return Promise.resolve();
            });
            console.error = jest.fn();
            await expect(withTransaction(callback)).rejects.toThrow();
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Rollback failed"));
        });

        it("[test 4] releases client in finally", async () => {
            await withTransaction(jest.fn().mockResolvedValue(null));
            expect(mockClient.release).toHaveBeenCalled();
        });
    });

    describe("[4.] healthCheck", () => {
        it("[test 1] returns true on successful ping", async () => {
            expect(await healthCheck()).toBe(true);
            expect(mockClient.query).toHaveBeenCalledWith("SELECT 1");
            expect(logHealthCheck).toHaveBeenCalledWith("success", expect.any(Object));
        });

        it("[test 2] returns false on error", async () => {
            mockClient.query.mockRejectedValue(new Error("ping fail"));
            expect(await healthCheck()).toBe(false);
            expect(logHealthCheck).toHaveBeenCalledWith("error", expect.any(Object));
        });

        it("[test 3] releases client in finally", async () => {
            await healthCheck();
            expect(mockClient.release).toHaveBeenCalled();
        });

        it("[test 4] handles release error", async () => {
            mockClient.release.mockImplementation(() => { throw new Error("release fail"); });
            console.error = jest.fn();
            await healthCheck();
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Failed to release"));
        });
    });
});