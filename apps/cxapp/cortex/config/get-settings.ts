// Loads and exposes all app & database environment variables in a typed, parsed form.

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
    const drv = raw.toLowerCase();
    if (drv === "postgres" || drv === "mysql" || drv === "mariadb" || drv === "sqlite") {
        return drv as Driver;
    }
    throw new Error(
        `Invalid ${key}: expected one of "postgres" | "mysql" | "mariadb" | "sqlite", got "${raw}"`
    );
}

/**
 * Read and cache settings from process.env (loaded via dotenv).
 * Call this anywhere to get typed settings.
 */
export function getSettings(): AppSettings {
    if (_settings) return _settings;

    _settings = {
        // App
        APP_NAME: requireStr("APP_NAME", "CodexSun"),
        APP_VERSION: requireStr("APP_VERSION", "1.0.0"),
        APP_DEBUG: parseBool(process.env.APP_DEBUG, true),
        APP_KEY: requireStr("APP_KEY", "Some"),
        VITE_APP_URL: requireStr("VITE_APP_URL", "http://localhost:3006"),
        APP_PORT: parseIntSafe(process.env.APP_PORT, 3006),

        // Database
        DB_DRIVER: requireDriver("DB_DRIVER", "postgres"),
        DB_HOST: requireStr("DB_HOST", "127.0.0.1"),
        DB_PORT: parseIntSafe(process.env.DB_PORT, 5432),
        DB_USER: requireStr("DB_USER", "postgres"),
        DB_PASS: requireStr("DB_PASS", ""),
        DB_NAME: requireStr("DB_NAME", "blue_codexsun_db"),
        DB_SSL: parseBool(process.env.DB_SSL, false),
    };

    return _settings;
}

// Optional convenience export
export const settings: AppSettings = getSettings();
