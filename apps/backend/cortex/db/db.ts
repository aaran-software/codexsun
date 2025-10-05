// cortex/db/db.ts

import { AsyncLocalStorage } from 'async_hooks';
import { AnyDbClient, QueryResult } from './db-types';
import { Connection } from './connection';
import { getDbConfig } from '../config/db-config';
import { logQuery, logTransaction, logHealthCheck } from '../config/logger';

const dbConfig = getDbConfig();
const tenantStorage = new AsyncLocalStorage<string>();

/**
 * Executes a SQL query on the current tenant's database or master database.
 * Optimized for tenant-isolated ERP operations (e.g., inventory, user queries).
 * @param sql - The SQL query string.
 * @param params - Optional query parameters for parameterized queries.
 * @returns A promise resolving to the query result with rows, row count, and optional insert ID.
 * @throws Error if the query or connection fails, with detailed context.
 */
export async function query<T>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    const db = tenantStorage.getStore() || dbConfig.database;
    const start = Date.now();
    let client: AnyDbClient | null = null;
    try {
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
        logQuery('error', { sql, params, db, duration: Date.now() - start, error: (error as Error).message });
        throw new Error(
            client
                ? `Query failed: ${sql.slice(0, 50)} - ${(error as Error).message}`
                : `Connection failed for DB ${db}: ${(error as Error).message}`
        );
    } finally {
        if (client) {
            if (client.release) client.release();
            else if (client.end) await client.end();
        }
    }
}

/**
 * Executes a callback within a database transaction for the current tenant.
 * Ensures data integrity for ERP operations (e.g., inventory updates).
 * @param callback - Function to execute within the transaction, receiving a DB client.
 * @returns A promise resolving to the callback's result.
 * @throws Error if the transaction or callback fails, with detailed context.
 */
export async function withTransaction<T>(callback: (client: AnyDbClient) => Promise<T>): Promise<T> {
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
        logTransaction('error', { db, duration: Date.now() - start, error: (error as Error).message });
        if (client) {
            await client.query('ROLLBACK');
        }
        throw new Error(`Transaction failed for DB ${db}: ${(error as Error).message}`);
    } finally {
        if (client) {
            if (client.release) client.release();
            else if (client.end) await client.end();
        }
    }
}

/**
 * Performs a health check on the specified database.
 * @param database - The database name to check.
 * @returns A promise resolving to true if the database is accessible, false otherwise.
 */
export async function healthCheck(database: string): Promise<boolean> {
    const start = Date.now();
    let client: AnyDbClient | null = null;
    try {
        client = await Connection.getInstance().getClient(database);
        await client.query('SELECT 1');
        logHealthCheck('success', { database, duration: Date.now() - start });
        return true;
    } catch {
        logHealthCheck('error', { database, duration: Date.now() - start });
        return false;
    } finally {
        if (client) {
            if (client.release) client.release();
            else if (client.end) await client.end();
        }
    }
}