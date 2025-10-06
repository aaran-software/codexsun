// E:\Workspace\codexsun\apps\backend\cortex\config\get-settings.ts
import * as dotenv from "dotenv";
dotenv.config();

export type Driver = "postgres" | "mariadb" | "mysql" | "sqlite";

export interface AppSettings {
    APP_NAME: string;
    APP_VERSION: string;
    APP_DEBUG: boolean;
    APP_KEY: string;
    VITE_APP_URL: string;
    APP_PORT: number;
    APP_HOST: string;
    MASTER_DB: string;
    TENANCY: boolean;
    DB_DRIVER: Driver;
    DB_HOST: string;
    DB_PORT: number;
    DB_USER: string;
    DB_PASS: string;
    DB_NAME: string;
    DB_SSL: boolean;
}

let _settings: AppSettings | null = null;

function parseBool(v: string | undefined, fallback = false): boolean {
    if (v == null) return fallback;
    const s = String(v).trim().toLowerCase();
    return s === "1" || s === "true" || s === "yes" || s === "y" || s === "on";
}

function parseIntSafe(v: string | undefined, fallback: number): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}

function requireStr(key: string, fallback?: string): string {
    const val = process.env[key] ?? fallback;
    if (val == null || String(val).trim() === "") {
        throw new Error(`Missing required env var: ${key}`);
    }
    return String(val);
}

function requireDriver(key: string, fallback: Driver): Driver {
    const raw = (process.env[key] ?? fallback) as string;
    const drv = raw.toLowerCase() as Driver;
    if (['postgres', 'mysql', 'mariadb', 'sqlite'].includes(drv)) {
        return drv;
    }
    throw new Error(`Invalid ${key}: expected "postgres|mysql|mariadb|sqlite", got "${raw}"`);
}

export function getSettings(): AppSettings {
    if (_settings) return _settings;

    // Prod validation: Ensure sensitive vars
    if (process.env.NODE_ENV === 'production') {
        const appKey = process.env.APP_KEY ?? '';
        if (appKey.trim() === '' || appKey === 'SomeKey') {
            throw new Error('Production requires secure APP_KEY and DB_PASS');
        }
        const dbPass = process.env.DB_PASS ?? '';
        if (dbPass.trim() === '') {
            throw new Error('Production requires secure APP_KEY and DB_PASS');
        }
    }

    _settings = {
        APP_NAME: requireStr("APP_NAME", "CodexSun"),
        APP_VERSION: requireStr("APP_VERSION", "1.0.0"),
        APP_DEBUG: parseBool(process.env.APP_DEBUG, process.env.NODE_ENV !== 'production'), // Debug off in prod
        APP_KEY: requireStr("APP_KEY"),
        VITE_APP_URL: requireStr("VITE_APP_URL", "http://localhost:3006"),
        APP_PORT: parseIntSafe(process.env.APP_PORT, 3006),
        APP_HOST: requireStr("APP_HOST", "0.0.0.0"), // Bind all in prod

        MASTER_DB: requireStr("MASTER_DB", "master_db"),
        TENANCY: parseBool(process.env.TENANCY, true), // Default on

        DB_DRIVER: requireDriver("DB_DRIVER", "mariadb"),
        DB_HOST: requireStr("DB_HOST", "127.0.0.1"),
        DB_PORT: parseIntSafe(process.env.DB_PORT, 3306),
        DB_USER: requireStr("DB_USER"),
        DB_PASS: requireStr("DB_PASS"),
        DB_NAME: requireStr("DB_NAME", "test_db"),
        DB_SSL: parseBool(process.env.DB_SSL, process.env.NODE_ENV === 'production'), // Enforce in prod
    };

    return _settings;
}