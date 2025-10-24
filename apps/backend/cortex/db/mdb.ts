// cortex/db/mdb.ts

import { Connection } from './connection';
import { QueryResult, AnyDbClient } from './db-types';
import { getMasterDbConfig } from '../config/db-config';
import { logQuery, logTransaction, logHealthCheck } from '../config/logger';

const dbConfig = getMasterDbConfig();

/**
 * Executes a SQL query on the master database.
 * Logs execution details.
 *
 * @param text - SQL query string.
 * @param params - Optional parameters for safe querying.
 * @returns QueryResult with rows, count, and insert ID.
 * @throws Error with detailed message on failure.
 */
export async function query<T>(text: string, params: any[] = []): Promise<QueryResult<T>> {
    const start = Date.now();
    let client: AnyDbClient | null = null;

    try {
        if (!text) {
            return Promise.reject(new Error('Invalid SQL query provided'));
        }
        logQuery('start', { sql: text, params, db: dbConfig.database || 'default' });

        client = await Connection.getInstance().getClient(dbConfig.database);
        const result = await client.query(text, params);
        logQuery('end', { sql: text, params, db: dbConfig.database || 'default', duration: Date.now() - start });

        return {
            rows: (Array.isArray(result) ? result : result.rows || []) as T[],
            rowCount: result.rowCount || (result.affectedRows ?? (Array.isArray(result) ? result.length : 0)),
            insertId: result.insertId || undefined,
        };
    } catch (error) {
        const errMsg = (error as Error).message || 'Unknown query error';
        logQuery('error', { sql: text, params, db: dbConfig.database || 'default', duration: Date.now() - start, error: errMsg });
        throw new Error(`Query failed on DB ${dbConfig.database || 'default'}: ${text.slice(0, 50)}... - ${errMsg}`);
    } finally {
        if (client) {
            try {
                if (client.release) client.release();
                else if (client.end) await client.end();
            } catch (releaseErr) {
                console.error(`Failed to release client for DB ${dbConfig.database || 'default'}: ${(releaseErr as Error).message}`);
            }
        }
    }
}

/**
 * Executes a transactional callback on the master database.
 * Ensures commit/rollback and logs details.
 *
 * @param callback - Function receiving DB client for operations.
 * @returns Result from callback.
 * @throws Error on transaction failure.
 */
export async function withTransaction<T>(callback: (client: AnyDbClient) => Promise<T>): Promise<T> {
    const start = Date.now();
    let client: AnyDbClient | null = null;

    try {
        logTransaction('start', { db: dbConfig.database || 'default' });
        client = await Connection.getInstance().getClient(dbConfig.database);
        await client.query('START TRANSACTION');

        const result = await callback(client);

        await client.query('COMMIT');
        logTransaction('end', { db: dbConfig.database || 'default', duration: Date.now() - start });

        return result;
    } catch (error) {
        const errMsg = (error as Error).message || 'Unknown transaction error';
        logTransaction('error', { db: dbConfig.database || 'default', duration: Date.now() - start, error: errMsg });

        if (client) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackErr) {
                console.error(`Rollback failed on DB ${dbConfig.database || 'default'}: ${(rollbackErr as Error).message}`);
            }
        }

        throw new Error(`Transaction failed on DB ${dbConfig.database || 'default'}: ${errMsg}`);
    } finally {
        if (client) {
            try {
                if (client.release) client.release();
                else if (client.end) await client.end();
            } catch (releaseErr) {
                console.error(`Failed to release client for DB ${dbConfig.database || 'default'}: ${(releaseErr as Error).message}`);
            }
        }
    }
}

/**
 * Checks health of the master database.
 *
 * @returns True if healthy, false otherwise.
 */
export async function healthCheck(): Promise<boolean> {
    const start = Date.now();
    let client: AnyDbClient | null = null;
    const dbConfig = getMasterDbConfig();

    // === DEVELOPMENT DEBUG LOGS ===
    console.info("=== DATABASE CONNECTION DEBUG ===", {
        DRIVER: dbConfig.driver,
        HOST: dbConfig.host || 'localhost',
        PORT: dbConfig.port || 3306,
        DATABASE: dbConfig.database || 'master_db',
        USER: dbConfig.user || 'root',
        PASSWORD: dbConfig.password ? '[MASKED]' : 'NOT_SET',
        POOL_LIMIT: dbConfig.connectionLimit || 50,
        ACQUIRE_TIMEOUT: `${(dbConfig.acquireTimeout || 30000) / 1000}s`,
        IDLE_TIMEOUT: `${(dbConfig.idleTimeout || 60000) / 1000}s`,
        MYSQL_VERSION: '11.7.2-MariaDB',
        APP_ENV: process.env.APP_ENV || 'development'
    });

    try {
        client = await Connection.getInstance().getClient(dbConfig.database);
        await client.query('SELECT 1');

        const duration = Date.now() - start;
        logHealthCheck('success', {
            database: dbConfig.database || 'default',
            duration,
            connected: true,
            client_type: client.constructor.name
        });

        return true;
    } catch (error) {
        const errMsg = (error as Error).message || 'Unknown health check error';
        const duration = Date.now() - start;

        logHealthCheck('error', {
            database: dbConfig.database || 'default',
            duration,
            error: errMsg
        });

        return false;
    } finally {
        if (client) {
            try {
                if (client.release) client.release();
                else if (client.end) await client.end();
            } catch (releaseErr) {
                console.error(`Failed to release client for health check on ${dbConfig.database || 'default'}: ${(releaseErr as Error).message}`);
            }
        }
    }
}