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
 * Combined database configurations for primary, master, sandbox, and blue databases.
 */
export interface DbConfigs {
    driver: string;
    primary: DbConfig;
    master: DbConfig;
    sandbox: DbConfig;
    blue: DbConfig;
}

/**
 * Retrieves database configurations for all databases.
 * @returns Combined database configurations.
 */
export function getDbConfig(): DbConfigs {
    const settings = getSettings();

    return {
        driver: "",
        // Primary Database Configuration
        primary: {
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
        },

        // Master Database Configuration
        master: {
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
        },

        // Sandbox Database Configuration
        sandbox: {
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
        },

        // Blue Database Configuration
        blue: {
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
        }
    };
}