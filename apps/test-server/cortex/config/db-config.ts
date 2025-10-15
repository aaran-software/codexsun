import {AppEnv, getSettings} from "./get-settings";

/**
 * Configuration for a single database connection.
 */
export interface DbConfig {
    /** Database driver */
    driver: "postgres" | "mysql" | "mariadb" | "sqlite";
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl: boolean;
    connectionLimit?: number;
    acquireTimeout?: number;
    idleTimeout?: number;
}

/**
 * Retrieves primary database configuration.
 * @returns Primary database configuration.
 */
export function getPrimaryDbConfig(): DbConfig {
    const settings = getSettings();
    return {
        driver: settings.DB_DRIVER,
        host: settings.DB_HOST,
        port: settings.DB_PORT,
        user: settings.DB_USER,
        password: settings.DB_PASS,
        database: settings.DB_NAME,
        ssl: settings.DB_SSL,
        connectionLimit: process.env.APP_ENV === AppEnv.Production ? 50 : 10,
        acquireTimeout: 30000,
        idleTimeout: 60000,
    };
}

/**
 * Retrieves master database configuration.
 * @returns Master database configuration.
 */
export function getMasterDbConfig(): DbConfig {
    const settings = getSettings();
    return {
        driver: settings.MASTER_DB_DRIVER,
        host: settings.MASTER_DB_HOST,
        port: settings.MASTER_DB_PORT,
        user: settings.MASTER_DB_USER,
        password: settings.MASTER_DB_PASS,
        database: settings.MASTER_DB_NAME,
        ssl: settings.MASTER_DB_SSL,
        connectionLimit: process.env.APP_ENV === AppEnv.Production ? 50 : 10,
        acquireTimeout: 30000,
        idleTimeout: 60000,
    };
}

/**
 * Retrieves sandbox database configuration.
 * @returns Sandbox database configuration.
 */
export function getSandboxDbConfig(): DbConfig {
    const settings = getSettings();
    return {
        driver: settings.SANDBOX_DB_DRIVER,
        database: settings.SANDBOX_DB_STORAGE,
        ssl: false, // SQLite does not use SSL
        connectionLimit: process.env.APP_ENV === AppEnv.Production ? 50 : 10,
        acquireTimeout: 30000,
        idleTimeout: 60000,
        host: "",
        port: 0,
        user: "",
        password: ""
    };
}

/**
 * Retrieves blue database configuration.
 * @returns Blue database configuration.
 */
export function getBlueDbConfig(): DbConfig {
    const settings = getSettings();
    return {
        driver: settings.BLUE_DB_DRIVER,
        host: settings.BLUE_DB_HOST,
        port: settings.BLUE_DB_PORT,
        user: settings.BLUE_DB_USER,
        password: settings.BLUE_DB_PASS,
        database: settings.BLUE_DB_NAME,
        ssl: settings.BLUE_DB_SSL,
        connectionLimit: process.env.APP_ENV === AppEnv.Production ? 50 : 10,
        acquireTimeout: 30000,
        idleTimeout: 60000,
    };
}