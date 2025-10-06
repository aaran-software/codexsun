import { AsyncLocalStorage } from 'async_hooks';
import { AnyDbClient, QueryResult } from './db-types';
import { Connection } from './connection';
import { getDbConfig } from '../config/db-config';
import { logQuery, logTransaction, logHealthCheck } from '../config/logger';

export const tenantStorage = new AsyncLocalStorage<string>(); // Tenant DB context

/**
 * Executes a SQL query on the current tenant or master database.
 * Uses tenantStorage for isolation and logs execution details.
 *
 * @param sql - SQL query string.
 * @param params - Optional parameters for safe querying.
 * @returns QueryResult with rows, count, and insert ID.
 * @throws Error with detailed message on failure.
 */
export async function query<T>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    const dbConfig = getDbConfig();
    const db = tenantStorage.getStore() || dbConfig.database;
    const start = Date.now();
    let client: AnyDbClient | null = null;

    try {
        if (!sql || typeof sql !== 'string') {
            throw new Error('Invalid SQL query provided');
        }

        logQuery('start', { sql, params, db });
        client = await Connection.getInstance().getClient(db);
        const result = await client.query(sql, params);
        logQuery('end', { sql, params, db, duration: Date.now() - start });

        return {
            rows: (Array.isArray(result) ? result : result.rows || []) as T[],
            rowCount: result.rowCount || (result.affectedRows ?? (Array.isArray(result) ? result.length : 0)),
            insertId: result.insertId || undefined,
        };
    } catch (error) {
        const errMsg = (error as Error).message || 'Unknown query error';
        logQuery('error', { sql, params, db, duration: Date.now() - start, error: errMsg });
        throw new Error(`Query failed on DB ${db}: ${sql.slice(0, 50)}... - ${errMsg}`);
    } finally {
        if (client) {
            try {
                if (client.release) client.release();
                else if (client.end) await client.end();
            } catch (releaseErr) {
                console.error(`Failed to release client for DB ${db}: ${(releaseErr as Error).message}`);
            }
        }
    }
}

/**
 * Executes a transactional callback on the current tenant or master database.
 * Ensures commit/rollback and logs details.
 *
 * @param callback - Function receiving DB client for operations.
 * @returns Result from callback.
 * @throws Error on transaction failure.
 */
export async function withTransaction<T>(callback: (client: AnyDbClient) => Promise<T>): Promise<T> {
    const dbConfig = getDbConfig();
    const db = tenantStorage.getStore() || dbConfig.database;
    const start = Date.now();
    let client: AnyDbClient | null = null;

    try {
        logTransaction('start', { db });
        client = await Connection.getInstance().getClient(db);
        await client.query('START TRANSACTION');

        const result = await callback(client);

        await client.query('COMMIT');
        logTransaction('end', { db, duration: Date.now() - start });

        return result;
    } catch (error) {
        const errMsg = (error as Error).message || 'Unknown transaction error';
        logTransaction('error', { db, duration: Date.now() - start, error: errMsg });

        if (client) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackErr) {
                console.error(`Rollback failed on DB ${db}: ${(rollbackErr as Error).message}`);
            }
        }

        throw new Error(`Transaction failed on DB ${db}: ${errMsg}`);
    } finally {
        if (client) {
            try {
                if (client.release) client.release();
                else if (client.end) await client.end();
            } catch (releaseErr) {
                console.error(`Failed to release client for DB ${db}: ${(releaseErr as Error).message}`);
            }
        }
    }
}

/**
 * Checks health of the specified or current tenant database.
 *
 * @param database - Optional database name (defaults to current context).
 * @returns True if healthy, false otherwise.
 */
export async function healthCheck(database: string = tenantStorage.getStore() || getDbConfig().database): Promise<boolean> {
    const start = Date.now();
    let client: AnyDbClient | null = null;

    try {
        client = await Connection.getInstance().getClient(database);
        await client.query('SELECT 1');
        logHealthCheck('success', { database, duration: Date.now() - start });
        return true;
    } catch (error) {
        const errMsg = (error as Error).message || 'Unknown health check error';
        logHealthCheck('error', { database, duration: Date.now() - start, error: errMsg });
        return false;
    } finally {
        if (client) {
            try {
                if (client.release) client.release();
                else if (client.end) await client.end();
            } catch (releaseErr) {
                console.error(`Failed to release client for health check on ${database}: ${(releaseErr as Error).message}`);
            }
        }
    }
}