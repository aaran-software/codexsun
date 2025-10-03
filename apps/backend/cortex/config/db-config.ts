// Database-only config derived from get-settings.ts

import { settings } from "./get-settings";

export interface DbConfig {
    driver: "postgres" | "mysql" | "mariadb" | "sqlite";
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl: boolean;
    type: "postgres" | "mysql" | "mariadb" | "sqlite";
}

/**
 * Minimal DB config for adapters/repositories.
 */
export function getDbConfig(): DbConfig {
    return {
        driver: settings.DB_DRIVER,
        host: settings.DB_HOST,
        port: settings.DB_PORT,
        user: settings.DB_USER,
        password: settings.DB_PASS,
        database: settings.TENANCY ? settings.MASTER_DB : settings.DB_NAME,
        ssl: settings.DB_SSL,
        type: settings.DB_DRIVER,
    };
}