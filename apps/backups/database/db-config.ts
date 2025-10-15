// db-config.ts
import { AppEnv, getSettings } from './get-settings';
import { createLogger } from './logger';

const logger = createLogger('DbConfig');

export interface DbConfig {
    driver: 'postgres' | 'mysql' | 'mariadb' | 'sqlite';
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl: boolean;
    connectionLimit: number;
    acquireTimeout: number;
    idleTimeout: number;
    allowLocalInfile: boolean;
    charset: string;
}

export function getPrimaryDbConfig(): DbConfig {
    const settings = getSettings();
    const config: DbConfig = {
        driver: settings.DB_DRIVER,
        host: settings.DB_HOST,
        port: settings.DB_PORT,
        user: settings.DB_USER,
        password: settings.DB_PASS,
        database: settings.DB_NAME,
        ssl: settings.DB_SSL,
        connectionLimit: settings.DB_CONNECTION_LIMIT,
        acquireTimeout: settings.DB_ACQUIRE_TIMEOUT,
        idleTimeout: settings.DB_IDLE_TIMEOUT,
        allowLocalInfile: settings.DB_ALLOW_LOCAL_INFILE,
        charset: settings.DB_CHARSET,
    };

    if (!config.host || !config.user || !config.database) {
        logger.error('Missing required DBConfig properties', { host: config.host, user: config.user, database: config.database });
        throw new Error('Missing required DBConfig properties: host, user, or database');
    }

    logger.info('DB config initialized', { driver: config.driver, database: config.database });
    return config;
}