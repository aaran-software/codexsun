import * as dotenv from "dotenv";

jest.mock("dotenv");

describe("[1.] getSettings", () => {
    beforeEach(() => {
        jest.resetModules();
        process.env = {};
        process.env.APP_KEY = "testkey";
        process.env.DB_USER = "user";
        process.env.DB_PASS = "pass";
        jest.clearAllMocks();
    });

    it("[test 1] loads default settings", async () => {
        const { getSettings } = await import("../../../cortex/config/get-settings");
        const settings = getSettings();
        expect(settings.APP_NAME).toBe("CodexSun");
        expect(settings.DB_DRIVER).toBe("mariadb");
    });

    it("[test 2] requires mandatory env vars", async () => {
        process.env.APP_KEY = "";
        const { getSettings } = await import("../../../cortex/config/get-settings");
        expect(() => getSettings()).toThrow("Missing required env var: APP_KEY");
    });

    it("[test 3] parses bool env vars", async () => {
        process.env.APP_DEBUG = "true";
        process.env.TENANCY = "0";
        process.env.DB_SSL = "yes";
        const { getSettings } = await import("../../../cortex/config/get-settings");
        const settings = getSettings();
        expect(settings.APP_DEBUG).toBe(true);
        expect(settings.TENANCY).toBe(false);
        expect(settings.DB_SSL).toBe(true);
    });

    it("[test 3.1] parseBool fallback when undefined", async () => {
        delete process.env.APP_DEBUG;
        const { getSettings } = await import("../../../cortex/config/get-settings");
        const settings = getSettings();
        expect(settings.APP_DEBUG).toBe(true); // fallback true if not prod
    });

    it("[test 3.2] parseBool for '1'", async () => {
        process.env.APP_DEBUG = "1";
        const { getSettings } = await import("../../../cortex/config/get-settings");
        expect(getSettings().APP_DEBUG).toBe(true);
    });

    // ... (truncated for brevity, add below to existing)

    it("[test 6] enforces prod validations for APP_KEY empty", async () => {
        process.env.NODE_ENV = "production";
        process.env.APP_KEY = "";
        const { getSettings } = await import("../../../cortex/config/get-settings");
        expect(() => getSettings()).toThrow("Production requires secure APP_KEY and DB_PASS");
    });

    it("[test 6.1] enforces prod validations for APP_KEY SomeKey", async () => {
        process.env.NODE_ENV = "production";
        process.env.APP_KEY = "SomeKey";
        const { getSettings } = await import("../../../cortex/config/get-settings");
        expect(() => getSettings()).toThrow("Production requires secure APP_KEY and DB_PASS");
    });

    it("[test 6.2] enforces prod validations for DB_PASS empty", async () => {
        process.env.NODE_ENV = "production";
        process.env.APP_KEY = "securekey";
        process.env.DB_PASS = "";
        const { getSettings } = await import("../../../cortex/config/get-settings");
        expect(() => getSettings()).toThrow("Production requires secure APP_KEY and DB_PASS");
    });

    it("[test 7] caches settings", async () => {
        const { getSettings } = await import("../../../cortex/config/get-settings");
        const first = getSettings();
        const second = getSettings();
        expect(second).toBe(first); // same instance
    });
});