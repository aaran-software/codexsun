// cortex/db/mdb.ts

import { Connection } from './connection';
import { QueryResult, AnyDbClient } from './db-types';
import { getMasterDbConfig } from '../config/db-config';
import { logQuery, logTransaction, logHealthCheck } from '../config/logger';

const dbConfig = getMasterDbConfig();

/**
 * Executes a SQL query on the master database or a specified database.
 * Logs execution details.
 *
 * @param text - SQL query string.
 * @param params - Optional parameters for safe querying.
 * @param dbName - Optional database name to override master database.
 * @returns QueryResult with rows, count, and insert ID.
 * @throws Error with detailed message on failure.
 */
export async function query<T>(text: string, params: any[] = [], dbName?: string): Promise<QueryResult<T>> {
    const database = dbName !== undefined ? dbName : dbConfig.database;
    const effectiveDb = database === '' ? undefined : database;
    const start = Date.now();
    let client: AnyDbClient | null = null;

    try {
        if (!text) {
            return Promise.reject(new Error('Invalid SQL query provided'));
        }
        logQuery('start', { sql: text, params, db: effectiveDb || 'default' });

        client = await Connection.getInstance().getClient(effectiveDb);
        const result = await client.query(text, params);
        logQuery('end', { sql: text, params, db: effectiveDb || 'default', duration: Date.now() - start });

        return {
            rows: (Array.isArray(result) ? result : result.rows || []) as T[],
            rowCount: result.rowCount || (result.affectedRows ?? (Array.isArray(result) ? result.length : 0)),
            insertId: result.insertId || undefined,
        };
    } catch (error) {
        const errMsg = (error as Error).message || 'Unknown query error';
        logQuery('error', { sql: text, params, db: effectiveDb || 'default', duration: Date.now() - start, error: errMsg });
        throw new Error(`Query failed on DB ${effectiveDb || 'default'}: ${text.slice(0, 50)}... - ${errMsg}`);
    } finally {
        if (client) {
            try {
                if (client.release) client.release();
                else if (client.end) await client.end();
            } catch (releaseErr) {
                console.error(`Failed to release client for DB ${effectiveDb || 'default'}: ${(releaseErr as Error).message}`);
            }
        }
    }
}

/**
 * Executes a transactional callback on the master database or a specified database.
 * Ensures commit/rollback and logs details.
 *
 * @param callback - Function receiving DB client for operations.
 * @param dbName - Optional database name to override master database.
 * @returns Result from callback.
 * @throws Error on transaction failure.
 */
export async function withTransaction<T>(callback: (client: AnyDbClient) => Promise<T>, dbName?: string): Promise<T> {
    const database = dbName !== undefined ? dbName : dbConfig.database;
    const effectiveDb = database === '' ? undefined : database;
    const start = Date.now();
    let client: AnyDbClient | null = null;

    try {
        logTransaction('start', { db: effectiveDb || 'default' });
        client = await Connection.getInstance().getClient(effectiveDb);
        await client.query('START TRANSACTION');

        const result = await callback(client);

        await client.query('COMMIT');
        logTransaction('end', { db: effectiveDb || 'default', duration: Date.now() - start });

        return result;
    } catch (error) {
        const errMsg = (error as Error).message || 'Unknown transaction error';
        logTransaction('error', { db: effectiveDb || 'default', duration: Date.now() - start, error: errMsg });

        if (client) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackErr) {
                console.error(`Rollback failed on DB ${effectiveDb || 'default'}: ${(rollbackErr as Error).message}`);
            }
        }

        throw new Error(`Transaction failed on DB ${effectiveDb || 'default'}: ${errMsg}`);
    } finally {
        if (client) {
            try {
                if (client.release) client.release();
                else if (client.end) await client.end();
            } catch (releaseErr) {
                console.error(`Failed to release client for DB ${effectiveDb || 'default'}: ${(releaseErr as Error).message}`);
            }
        }
    }
}

/**
 * Checks health of the master database or a specified database.
 *
 * @param dbName - Optional database name (defaults to master database).
 * @returns True if healthy, false otherwise.
 */
export async function healthCheck(dbName?: string): Promise<boolean> {
    const database = dbName !== undefined ? dbName : dbConfig.database;
    const effectiveDb = database === '' ? undefined : database;
    const start = Date.now();
    let client: AnyDbClient | null = null;

    try {
        client = await Connection.getInstance().getClient(effectiveDb);
        await client.query('SELECT 1');
        logHealthCheck('success', { database: effectiveDb || 'default', duration: Date.now() - start });
        return true;
    } catch (error) {
        const errMsg = (error as Error).message || 'Unknown health check error';
        logHealthCheck('error', { database: effectiveDb || 'default', duration: Date.now() - start, error: errMsg });
        return false;
    } finally {
        if (client) {
            try {
                if (client.release) client.release();
                else if (client.end) await client.end();
            } catch (releaseErr) {
                console.error(`Failed to release client for health check on ${effectiveDb || 'default'}: ${(releaseErr as Error).message}`);
            }
        }
    }
}