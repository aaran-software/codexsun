// cortex/db/t02-db-config.test.ts

import { getDbConfig, DbConfig } from "../../../cortex/config/db-config";
import { getSettings } from "../../../cortex/config/get-settings";

jest.mock("../../../cortex/config/get-settings");

describe("[1.] getDbConfig", () => {
    beforeEach(() => {
        (getSettings as jest.Mock).mockReturnValue({ DB_DRIVER: "mariadb", DB_HOST: "host", DB_PORT: 3306, DB_USER: "user", DB_PASS: "pass", DB_NAME: "db", MASTER_DB: "master", TENANCY: true, DB_SSL: false });
        process.env.NODE_ENV = "test";
        jest.clearAllMocks();
    });

    it("[test 1] returns config with tenancy master db", () => {
        const config = getDbConfig();
        expect(config).toEqual(expect.objectContaining({ database: "master", connectionLimit: 10 }));
    });

    it("[test 2] uses db_name without tenancy", () => {
        (getSettings as jest.Mock).mockReturnValue({ ...getSettings(), TENANCY: false });
        const config = getDbConfig();
        expect(config.database).toBe("db");
    });

    it("[test 3] sets higher limit in production", () => {
        process.env.NODE_ENV = "production";
        const config = getDbConfig();
        expect(config.connectionLimit).toBe(50);
    });
});