// db-config.ts
import { getSettings } from "./get-settings";

export interface DbConfig {
    driver: "postgres" | "mysql" | "mariadb" | "sqlite";
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl: boolean;
    type: "postgres" | "mysql" | "mariadb" | "sqlite";
    connectionLimit?: number; // Added for prod pooling
    acquireTimeout?: number;
    idleTimeout?: number;
}

export function getDbConfig(): DbConfig {
    const settings = getSettings();
    return {
        driver: settings.DB_DRIVER,
        host: settings.DB_HOST,
        port: settings.DB_PORT,
        user: settings.DB_USER,
        password: settings.DB_PASS,
        database: settings.TENANCY ? settings.MASTER_DB : settings.DB_NAME,
        ssl: settings.DB_SSL,
        type: settings.DB_DRIVER,
        connectionLimit: process.env.NODE_ENV === 'production' ? 50 : 10, // Prod default
        acquireTimeout: 30000,
        idleTimeout: 60000,
    };
}