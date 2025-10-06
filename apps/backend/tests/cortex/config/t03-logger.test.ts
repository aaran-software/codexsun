import { logQuery, logTransaction, logHealthCheck, logConnection } from "../../../cortex/config/logger";
import { getSettings } from "../../../cortex/config/get-settings";

jest.mock("../../../cortex/config/get-settings");

describe("[1.] logger", () => {
    beforeEach(() => {
        (getSettings as jest.Mock).mockReturnValue({ APP_DEBUG: false });
        console.debug = jest.fn();
        console.info = jest.fn();
        jest.clearAllMocks();
    });

    describe("[2.] logQuery", () => {
        it("[test 1] logs start/end in debug", () => {
            (getSettings as jest.Mock).mockReturnValue({ APP_DEBUG: true });
            logQuery('start', { sql: "SELECT 1", params: [], db: "test" });
            logQuery('end', { sql: "SELECT 1", params: [], db: "test", duration: 10 });
            expect(console.debug).toHaveBeenCalledTimes(2);
            expect(console.info).toHaveBeenCalledWith(expect.stringContaining("query_duration_ms"));
        });

        it("[test 2] logs error in prod", () => {
            process.env.NODE_ENV = "production";
            logQuery('error', { sql: "SELECT 1", params: [], db: "test", error: "fail" });
            expect(console.debug).toHaveBeenCalled();
            expect(console.info).toHaveBeenCalledWith(expect.stringContaining("query_error"));
            process.env.NODE_ENV = "test";
        });

        it("[test 3] skips debug in non-debug non-prod", () => {
            logQuery('start', { sql: "SELECT 1", params: [], db: "test" });
            expect(console.debug).not.toHaveBeenCalled();
        });

        it("[test 4] metrics in non-debug", () => {
            logQuery('end', { sql: "SELECT 1", params: [], db: "test", duration: 10 });
            expect(console.info).toHaveBeenCalledWith(expect.stringContaining("query_duration_ms"));
        });

        it("[test 5] error metrics in non-prod", () => {
            logQuery('error', { sql: "SELECT 1", params: [], db: "test", error: "fail" });
            expect(console.info).toHaveBeenCalledWith(expect.stringContaining("query_error"));
        });
    });

    describe("[3.] logTransaction", () => {
        it("[test 1] logs start/end in debug", () => {
            (getSettings as jest.Mock).mockReturnValue({ APP_DEBUG: true });
            logTransaction('start', { db: "test" });
            logTransaction('end', { db: "test", duration: 10 });
            expect(console.debug).toHaveBeenCalledTimes(2);
            expect(console.info).toHaveBeenCalledWith(expect.stringContaining("transaction_duration_ms"));
        });

        it("[test 2] logs error in prod", () => {
            process.env.NODE_ENV = "production";
            logTransaction('error', { db: "test", error: "fail" });
            expect(console.debug).toHaveBeenCalled();
            expect(console.info).toHaveBeenCalledWith(expect.stringContaining("transaction_error"));
            process.env.NODE_ENV = "test";
        });
    });

    describe("[4.] logHealthCheck", () => {
        it("[test 1] logs success in debug", () => {
            (getSettings as jest.Mock).mockReturnValue({ APP_DEBUG: true });
            logHealthCheck('success', { database: "test", duration: 10 });
            expect(console.debug).toHaveBeenCalled();
            expect(console.info).toHaveBeenCalledWith(expect.stringContaining("health_check_duration_ms"));
        });

        it("[test 2] logs error in prod", () => {
            process.env.NODE_ENV = "production";
            logHealthCheck('error', { database: "test", error: "fail" });
            expect(console.debug).toHaveBeenCalled();
            expect(console.info).toHaveBeenCalledWith(expect.stringContaining("health_check_error"));
            process.env.NODE_ENV = "test";
        });
    });

    describe("[5.] logConnection", () => {
        it("[test 1] logs start/success in debug", () => {
            (getSettings as jest.Mock).mockReturnValue({ APP_DEBUG: true });
            logConnection('start', { db: "test", connectionString: "str" });
            logConnection('success', { db: "test", connectionString: "str", duration: 10 });
            expect(console.debug).toHaveBeenCalledTimes(2);
            expect(console.info).toHaveBeenCalledWith(expect.stringContaining("connection_duration_ms"));
        });

        it("[test 2] logs error in prod", () => {
            process.env.NODE_ENV = "production";
            logConnection('error', { db: "test", connectionString: "str", error: "fail" });
            expect(console.debug).toHaveBeenCalled();
            expect(console.info).toHaveBeenCalledWith(expect.stringContaining("connection_error"));
            process.env.NODE_ENV = "test";
        });
    });
});