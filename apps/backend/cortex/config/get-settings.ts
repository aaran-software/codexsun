import * as dotenv from "dotenv";

dotenv.config();

/**
 * Database driver types supported by the application.
 */
export type Driver = "postgres" | "mariadb" | "mysql" | "sqlite";

/**
 * Environment types for APP_ENV.
 */
export enum AppEnv {
    Production = "production",
    Test = "test",
    Development = "development",
}

/**
 * Application configuration settings loaded from environment variables.
 */
export interface AppSettings {
    // Application Settings
    APP_NAME: string;
    APP_VERSION: string;
    APP_ENV: string;
    APP_DEBUG: boolean;
    APP_PORT: number;
    APP_HOST: string;

    // Primary Database Settings
    DB_DRIVER: Driver;
    DB_HOST: string;
    DB_PORT: number;
    DB_USER: string;
    DB_PASS: string;
    DB_NAME: string;
    DB_SSL: boolean;

    // Multi-Tenant Database Settings
    MASTER_DB: string;
    MASTER_DB_DRIVER: Driver;
    MASTER_DB_HOST: string;
    MASTER_DB_PORT: number;
    MASTER_DB_USER: string;
    MASTER_DB_PASS: string;
    MASTER_DB_NAME: string;
    MASTER_DB_SSL: boolean;

    /** Sandbox mode toggle */
    SANDBOX: boolean;
    SANDBOX_DB_DRIVER: Driver;
    SANDBOX_DB_STORAGE: string;

    /** Blue database mode toggle */
    BLUE_DB: boolean;
    BLUE_DB_DRIVER: Driver;
    BLUE_DB_HOST: string;
    BLUE_DB_PORT: number;
    BLUE_DB_USER: string;
    BLUE_DB_PASS: string;
    BLUE_DB_NAME: string;
    BLUE_DB_SSL: boolean;

    // Security Settings
    APP_KEY: string;
    JWT_SECRET: string;
    TENANCY: boolean;
}

let _settings: AppSettings | null = null;

/**
 * Parses a string to a boolean value.
 * @param v - The string to parse.
 * @param fallback - The default value if undefined.
 * @returns Parsed boolean.
 */
function parseBool(v: string | undefined, fallback = false): boolean {
    if (v == null) return fallback;
    const s = String(v).trim().toLowerCase();
    return s === "1" || s === "true" || s === "yes" || s === "y" || s === "on";
}

/**
 * Parses a string to an integer with a fallback.
 * @param v - The string to parse.
 * @param fallback - The default value if invalid.
 * @returns Parsed integer.
 */
function parseIntSafe(v: string | undefined, fallback: number): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}

/**
 * Retrieves a required string from environment variables.
 * @param key - The environment variable key.
 * @param fallback - Optional fallback value.
 * @returns The string value.
 * @throws Error if the value is missing or empty.
 */
function requireStr(key: string, fallback?: string): string {
    const val = process.env[key] ?? fallback;
    if (val == null || String(val).trim() === "") {
        throw new Error(`Missing required env var: ${key}`);
    }
    return String(val);
}

/**
 * Validates and retrieves a database driver.
 * @param key - The environment variable key.
 * @param fallback - The default driver.
 * @returns Valid driver type.
 * @throws Error if the driver is invalid.
 */
function requireDriver(key: string, fallback: Driver): Driver {
    const raw = (process.env[key] ?? fallback) as string;
    const drv = raw.toLowerCase() as Driver;
    if (["postgres", "mysql", "mariadb", "sqlite"].includes(drv)) {
        return drv;
    }
    throw new Error(
        `Invalid ${key}: expected "postgres|mysql|mariadb|sqlite", got "${raw}"`,
    );
}

/**
 * Retrieves and caches application settings from environment variables.
 * @returns Singleton instance of AppSettings.
 * @throws Error if required variables are missing or invalid in production.
 */
export function getSettings(): AppSettings {
    if (_settings) return _settings;

    // Production validation: Ensure sensitive variables
    if (process.env.APP_ENV === AppEnv.Production) {
        const appKey = process.env.APP_KEY ?? "";
        if (appKey.trim() === "" || appKey === "SomeKey") {
            throw new Error("Production requires secure APP_KEY and DB_PASS");
        }
        const dbPass = process.env.DB_PASS ?? "";
        if (dbPass.trim() === "") {
            throw new Error("Production requires secure APP_KEY and DB_PASS");
        }
    }

    _settings = {
        // Application Settings
        APP_NAME: requireStr("APP_NAME", "CodexSun"),
        APP_VERSION: requireStr("APP_VERSION", "1.0.0"),
        APP_ENV: requireStr("APP_ENV", "test"),
        APP_DEBUG: parseBool(process.env.APP_DEBUG, process.env.APP_ENV !== AppEnv.Production),
        APP_PORT: parseIntSafe(process.env.APP_PORT, 3006),
        APP_HOST: requireStr("APP_HOST", "0.0.0.0"),

        // Primary Database Settings
        DB_DRIVER: requireDriver("DB_DRIVER", "mariadb"),
        DB_HOST: requireStr("DB_HOST", "127.0.0.1"),
        DB_PORT: parseIntSafe(process.env.DB_PORT, 3306),
        DB_USER: requireStr("DB_USER"),
        DB_PASS: requireStr("DB_PASS"),
        DB_NAME: requireStr("DB_NAME", "test_db"),
        DB_SSL: parseBool(process.env.DB_SSL, process.env.APP_ENV === AppEnv.Production),

        // Multi-Tenant Database Settings
        MASTER_DB: requireStr("MASTER_DB", "master_db"),
        MASTER_DB_DRIVER: requireDriver("MASTER_DB_DRIVER", "mariadb"),
        MASTER_DB_HOST: requireStr("MASTER_DB_HOST", "127.0.0.1"),
        MASTER_DB_PORT: parseIntSafe(process.env.MASTER_DB_PORT, 3306),
        MASTER_DB_USER: requireStr("MASTER_DB_USER"),
        MASTER_DB_PASS: requireStr("MASTER_DB_PASS"),
        MASTER_DB_NAME: requireStr("MASTER_DB_NAME", "master_db"),
        MASTER_DB_SSL: parseBool(process.env.MASTER_DB_SSL, process.env.APP_ENV === AppEnv.Production),

        SANDBOX: parseBool(process.env.SANDBOX, false),
        SANDBOX_DB_DRIVER: requireDriver("SANDBOX_DB_DRIVER", "sqlite"),
        SANDBOX_DB_STORAGE: requireStr("SANDBOX_DB_STORAGE", "./codesun.sqlite"),

        BLUE_DB: parseBool(process.env.BLUE_DB, false),
        BLUE_DB_DRIVER: requireDriver("BLUE_DB_DRIVER", "postgres"),
        BLUE_DB_HOST: requireStr("BLUE_DB_HOST", "localhost"),
        BLUE_DB_PORT: parseIntSafe(process.env.BLUE_DB_PORT, 5432),
        BLUE_DB_USER: requireStr("BLUE_DB_USER"),
        BLUE_DB_PASS: requireStr("BLUE_DB_PASS"),
        BLUE_DB_NAME: requireStr("BLUE_DB_NAME", "blue_db"),
        BLUE_DB_SSL: parseBool(process.env.BLUE_DB_SSL, process.env.APP_ENV === AppEnv.Production),

        // Security Settings
        APP_KEY: requireStr("APP_KEY"),
        JWT_SECRET: requireStr("JWT_SECRET", process.env.APP_KEY ?? "SomeKey"),
        TENANCY: parseBool(process.env.TENANCY, true),
    };

    return _settings;
}