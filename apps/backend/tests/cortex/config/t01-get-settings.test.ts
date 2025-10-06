// E:\Workspace\codexsun\apps\backend\cortex\config\t01-get-settings.test.ts

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
        expect(settings.APP_DEBUG).toBe(true); // since NODE_ENV !== 'production' by default in test
    });

    it("[test 3.2] parseBool for '1'", async () => {
        process.env.APP_DEBUG = "1";
        const { getSettings } = await import("../../../cortex/config/get-settings");
        expect(getSettings().APP_DEBUG).toBe(true);
    });

    it("[test 3.3] parseBool for 'true'", async () => {
        process.env.APP_DEBUG = "true";
        const { getSettings } = await import("../../../cortex/config/get-settings");
        expect(getSettings().APP_DEBUG).toBe(true);
    });

    it("[test 3.4] parseBool for 'yes'", async () => {
        process.env.APP_DEBUG = "yes";
        const { getSettings } = await import("../../../cortex/config/get-settings");
        expect(getSettings().APP_DEBUG).toBe(true);
    });

    it("[test 3.5] parseBool for 'y'", async () => {
        process.env.APP_DEBUG = "y";
        const { getSettings } = await import("../../../cortex/config/get-settings");
        expect(getSettings().APP_DEBUG).toBe(true);
    });

    it("[test 3.6] parseBool for 'on'", async () => {
        process.env.APP_DEBUG = "on";
        const { getSettings } = await import("../../../cortex/config/get-settings");
        expect(getSettings().APP_DEBUG).toBe(true);
    });

    it("[test 3.7] parseBool for false values", async () => {
        process.env.APP_DEBUG = "false";
        const { getSettings } = await import("../../../cortex/config/get-settings");
        expect(getSettings().APP_DEBUG).toBe(false);
    });

    it("[test 4] parses int env vars", async () => {
        process.env.APP_PORT = "4000";
        process.env.DB_PORT = "5432";
        const { getSettings } = await import("../../../cortex/config/get-settings");
        const settings = getSettings();
        expect(settings.APP_PORT).toBe(4000);
        expect(settings.DB_PORT).toBe(5432);
    });

    it("[test 4.1] handles invalid int fallback", async () => {
        process.env.APP_PORT = "invalid";
        const { getSettings } = await import("../../../cortex/config/get-settings");
        const settings = getSettings();
        expect(settings.APP_PORT).toBe(3006);
    });

    it("[test 5] validates driver", async () => {
        process.env.DB_DRIVER = "invalid";
        const { getSettings } = await import("../../../cortex/config/get-settings");
        expect(() => getSettings()).toThrow("Invalid DB_DRIVER");
    });

    it("[test 5.1] uses driver fallback when undefined", async () => {
        delete process.env.DB_DRIVER;
        const { getSettings } = await import("../../../cortex/config/get-settings");
        const settings = getSettings();
        expect(settings.DB_DRIVER).toBe("mariadb");
    });

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

    it("[test 6.3] enforces prod validations for DB_PASS spaces", async () => {
        process.env.NODE_ENV = "production";
        process.env.APP_KEY = "securekey";
        process.env.DB_PASS = "   ";
        const { getSettings } = await import("../../../cortex/config/get-settings");
        expect(() => getSettings()).toThrow("Production requires secure APP_KEY and DB_PASS");
    });

    it("[test 6.4] no throw in prod if secure", async () => {
        process.env.NODE_ENV = "production";
        process.env.APP_KEY = "securekey";
        process.env.DB_PASS = "securepass";
        const { getSettings } = await import("../../../cortex/config/get-settings");
        expect(() => getSettings()).not.toThrow();
    });

    it("[test 7] caches settings", async () => {
        const { getSettings } = await import("../../../cortex/config/get-settings");
        const first = getSettings();
        const second = getSettings();
        expect(second).toBe(first); // same instance
    });
});