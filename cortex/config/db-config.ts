// Database-only config derived from get-settings.ts

import { getSettings } from "./get-settings";

export interface DbConfig {
    driver: "postgres" | "mysql" | "mariadb" | "sqlite";
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl: boolean;
}

/**
 * Minimal DB config for adapters/repositories.
 */
export function getDbConfig(): DbConfig {
    const s = getSettings();
    return {
        driver: s.DB_DRIVER,
        host: s.DB_HOST,
        port: s.DB_PORT,
        user: s.DB_USER,
        password: s.DB_PASS,
        database: s.DB_NAME,
        ssl: s.DB_SSL,
    };
}

/**
 * Optional helper to build a connection string for common drivers.
 * Postgres: postgres://user:pass@host:port/dbname
 * MySQL:    mysql://user:pass@host:port/dbname
 * MariaDB:  mariadb://user:pass@host:port/dbname
 * SQLite:   sqlite:///<file-path>
 */
export function getDbConnectionString(cfg: DbConfig = getDbConfig()): string {
    const enc = (s: string) => encodeURIComponent(s);

    switch (cfg.driver) {
        case "sqlite":
            // Example: use DB_NAME as path to sqlite file
            return `sqlite:///${cfg.database}`;

        case "postgres": {
            const auth = cfg.user ? `${enc(cfg.user)}:${enc(cfg.password)}@` : "";
            const host = `${cfg.host}:${cfg.port}`;
            return `postgres://${auth}${host}/${cfg.database}`;
        }

        case "mysql":
        case "mariadb": {
            const auth = cfg.user ? `${enc(cfg.user)}:${enc(cfg.password)}@` : "";
            const host = `${cfg.host}:${cfg.port}`;
            return `${cfg.driver}://${auth}${host}/${cfg.database}`;
        }

        default:
            throw new Error(`Unsupported driver: ${cfg.driver}`);
    }
}
