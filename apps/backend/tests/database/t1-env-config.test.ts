// [test 1] Check env variables are configured to settings and db-config

import { getSettings, settings } from '../../cortex/config/get-settings';
import { getDbConfig } from '../../cortex/config/db-config';

describe('[test 1] Environment Configuration', () => {
    it('should load and parse env variables correctly into settings', () => {
        const appSettings = getSettings();

        expect(appSettings.APP_NAME).toBe('CodexSun');
        expect(appSettings.APP_VERSION).toBe('1.0.0');
        expect(appSettings.APP_DEBUG).toBe(true);
        expect(appSettings.APP_KEY).toBe('SomeKey');
        expect(appSettings.VITE_APP_URL).toBe('http://localhost:3006');
        expect(appSettings.APP_PORT).toBe(3006);
        expect(appSettings.APP_HOST).toBe('localhost');
        expect(appSettings.MASTER_DB).toBe('master_db');
        expect(appSettings.TENANCY).toBe(true); // Assuming default false, adjust if test env sets to true
        expect(appSettings.DB_DRIVER).toBe('mariadb');
        expect(appSettings.DB_HOST).toBe('127.0.0.1');
        expect(appSettings.DB_PORT).toBe(3306);
        expect(appSettings.DB_USER).toBe('root');
        expect(appSettings.DB_PASS).toBe('Computer.1');
        expect(appSettings.DB_NAME).toBe('codexsun_db');
        expect(appSettings.DB_SSL).toBe(false);

        // Check convenience export
        expect(settings).toEqual(appSettings);
    });

    it('should derive DbConfig correctly from settings', () => {
        const dbConfig = getDbConfig();

        expect(dbConfig.driver).toBe(settings.DB_DRIVER);
        expect(dbConfig.host).toBe(settings.DB_HOST);
        expect(dbConfig.port).toBe(settings.DB_PORT);
        expect(dbConfig.user).toBe(settings.DB_USER);
        expect(dbConfig.password).toBe(settings.DB_PASS);
        expect(dbConfig.database).toBe(settings.TENANCY ? settings.MASTER_DB : settings.DB_NAME);
        expect(dbConfig.ssl).toBe(settings.DB_SSL);
        expect(dbConfig.type).toBe(settings.DB_DRIVER);
    });
});