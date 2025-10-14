// get-settings.ts
import * as dotenv from 'dotenv';
import { createLogger } from './logger';

dotenv.config();

const logger = createLogger('Settings');

export type Driver = 'postgres' | 'mariadb' | 'mysql' | 'sqlite';

export enum AppEnv {
    Production = 'production',
    Test = 'test',
    Development = 'development',
}

export interface AppSettings {
    APP_NAME: string;
    APP_VERSION: string;
    APP_ENV: string;
    APP_DEBUG: boolean;
    APP_PORT: number;
    APP_HOST: string;
    DB_DRIVER: Driver;
    DB_HOST: string;
    DB_PORT: number;
    DB_USER: string;
    DB_PASS: string;
    DB_NAME: string;
    DB_SSL: boolean;
    DB_CONNECTION_LIMIT: number;
    DB_ACQUIRE_TIMEOUT: number;
    DB_IDLE_TIMEOUT: number;
    DB_ALLOW_LOCAL_INFILE: boolean;
    DB_CHARSET: string;
    APP_KEY: string;
    JWT_SECRET: string;
}

let _settings: AppSettings | null = null;

function parseBool(v: string | undefined, fallback = false): boolean {
    if (v == null) return fallback;
    const s = String(v).trim().toLowerCase();
    return s === '1' || s === 'true' || s === 'yes' || s === 'y' || s === 'on';
}

function parseIntSafe(v: string | undefined, fallback: number): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}

function requireStr(key: string, fallback?: string): string {
    const val = process.env[key] ?? fallback;
    if (val == null || String(val).trim() === '') {
        logger.error(`Missing required env var: ${key}`);
        throw new Error(`Missing required env var: ${key}`);
    }
    return String(val);
}

function requireDriver(key: string, fallback: Driver): Driver {
    const raw = process.env[key] ?? fallback;
    const drv = raw.toLowerCase() as Driver;
    if (['postgres', 'mysql', 'mariadb', 'sqlite'].includes(drv)) {
        return drv;
    }
    logger.error(`Invalid ${key}`, { expected: 'postgres|mysql|mariadb|sqlite', got: raw });
    throw new Error(`Invalid ${key}: expected "postgres|mysql|mariadb|sqlite", got "${raw}"`);
}

export function getSettings(): AppSettings {
    if (_settings) return _settings;

    try {
        if (process.env.APP_ENV === AppEnv.Production) {
            const appKey = process.env.APP_KEY ?? '';
            const dbPass = process.env.DB_PASS ?? '';
            if (appKey.trim() === '' || dbPass.trim() === '') {
                logger.error('Production requires secure APP_KEY and DB_PASS');
                throw new Error('Production requires secure APP_KEY and DB_PASS');
            }
        }

        const settings: AppSettings = {
            APP_NAME: requireStr('APP_NAME', 'CodexSun'),
            APP_VERSION: requireStr('APP_VERSION', '1.0.0'),
            APP_ENV: requireStr('APP_ENV', 'development'),
            APP_DEBUG: parseBool(process.env.APP_DEBUG, true),
            APP_PORT: parseIntSafe(process.env.APP_PORT, 3006),
            APP_HOST: requireStr('APP_HOST', '0.0.0.0'),
            DB_DRIVER: requireDriver('DB_DRIVER', 'mariadb'),
            DB_HOST: requireStr('DB_HOST', '127.0.0.1'),
            DB_PORT: parseIntSafe(process.env.DB_PORT, 3306),
            DB_USER: requireStr('DB_USER'),
            DB_PASS: requireStr('DB_PASS'),
            DB_NAME: requireStr('DB_NAME', 'codexsun_db'),
            DB_SSL: parseBool(process.env.DB_SSL, false),
            DB_CONNECTION_LIMIT: parseIntSafe(process.env.DB_CONNECTION_LIMIT, 1),
            DB_ACQUIRE_TIMEOUT: parseIntSafe(process.env.DB_ACQUIRE_TIMEOUT, 30000),
            DB_IDLE_TIMEOUT: parseIntSafe(process.env.DB_IDLE_TIMEOUT, 60000),
            DB_ALLOW_LOCAL_INFILE: parseBool(process.env.DB_ALLOW_LOCAL_INFILE, false),
            DB_CHARSET: requireStr('DB_CHARSET', 'utf8mb4'),
            APP_KEY: requireStr('APP_KEY'),
            JWT_SECRET: requireStr('JWT_SECRET', process.env.APP_KEY ?? 'SomeKey'),
        };

        if (!['utf8mb4', 'utf8', 'latin1'].includes(settings.DB_CHARSET)) {
            logger.error('Invalid DB_CHARSET', { charset: settings.DB_CHARSET });
            throw new Error(`Invalid DB_CHARSET: ${settings.DB_CHARSET}. Expected utf8mb4, utf8, or latin1`);
        }

        if (settings.DB_CONNECTION_LIMIT < 1 || settings.DB_ACQUIRE_TIMEOUT < 1000 || settings.DB_IDLE_TIMEOUT < 1000) {
            logger.error('Invalid DB configuration values', {
                connectionLimit: settings.DB_CONNECTION_LIMIT,
                acquireTimeout: settings.DB_ACQUIRE_TIMEOUT,
                idleTimeout: settings.DB_IDLE_TIMEOUT,
            });
            throw new Error('Invalid DB configuration: connectionLimit, acquireTimeout, and idleTimeout must be positive');
        }

        _settings = settings;
        logger.info('Settings initialized', { appName: settings.APP_NAME, env: settings.APP_ENV });
        return settings;
    } catch (error) {
        logger.error('Failed to initialize settings', { message: error.message, stack: error.stack });
        throw error;
    }
}