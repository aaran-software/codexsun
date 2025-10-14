// connection.ts
import { MariaDBAdapter } from './mariadbAdapter';
import { DbConfig } from './db-config';
import type { Connection } from 'mariadb';
import { createLogger } from './logger';

const logger = createLogger('Connection');

export interface DatabaseAdapter {
    init(config: DbConfig): Promise<void>;
    getConnection(): Promise<Connection>;
    end(): Promise<void>;
    isHealthy(): Promise<boolean>;
}

export let dbAdapter: DatabaseAdapter | null = null;

export class AdapterFactory {
    static create(config: DbConfig): DatabaseAdapter {
        if (config.driver === 'mariadb') {
            return new MariaDBAdapter();
        }
        logger.error('Unsupported database adapter', { driver: config.driver });
        throw new Error(`Unsupported database adapter: ${config.driver}`);
    }
}

export async function connect(config: DbConfig): Promise<void> {
    const maxRetries = 3;
    logger.info('Initializing database connection', { driver: config.driver, database: config.database });

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            dbAdapter = AdapterFactory.create(config);
            await dbAdapter.init(config);
            logger.info('Database adapter initialized successfully', { database: config.database });
            return;
        } catch (error: unknown) {
            lastError = error as Error;
            logger.error(`Connection attempt ${attempt} failed`, { error: (error as Error).message });
            if (attempt === maxRetries) {
                logger.error('Failed to connect after retries', { error: (error as Error).message });
                throw error;
            }
            const delay = 1000 * Math.pow(2, attempt - 1); // Exponential backoff: 1s, 2s, 4s
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
    throw lastError!;
}

export async function disconnect(): Promise<void> {
    if (dbAdapter) {
        try {
            logger.info('Gracefully closing database connection');
            await dbAdapter.end();
            dbAdapter = null;
            logger.info('Database connection closed');
        } catch (error) {
            logger.error('Failed to disconnect', { message: error.message });
        }
    }
}

export function isConnected(): boolean {
    return dbAdapter !== null;
}

export async function isHealthy(): Promise<boolean> {
    if (!dbAdapter) {
        logger.error('Database adapter not initialized');
        return false;
    }
    try {
        const result = await dbAdapter.isHealthy();
        if (process.env.APP_DEBUG === 'true') {
            logger.debug('Connection health check', { isHealthy: result });
        }
        return result;
    } catch (error) {
        logger.error('Health check failed', { error: error.message });
        return false;
    }
}