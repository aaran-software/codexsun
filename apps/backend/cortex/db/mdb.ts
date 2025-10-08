// cortex/db/mdb.ts

import { Connection } from './connection';
import { QueryResult, AnyDbClient } from './db-types';
import { getMasterDbConfig } from '../config/db-config';
import { logQuery, logTransaction, logHealthCheck } from '../config/logger';

const dbConfig = getMasterDbConfig();

export async function query<T>(text: string, params: any[] = [], dbName?: string): Promise<QueryResult<T>> {
    const database = dbName !== undefined ? dbName : dbConfig.database;
    if (database == null) {
        throw new Error('Database name is required');
    }
    const effectiveDb = database === '' ? undefined : database;
    const start = Date.now();
    let client: AnyDbClient | null = null;

    try {
        if (!text) {
            return Promise.reject(new Error('Invalid SQL query provided'));
        }

        logQuery('start', { sql: text, params, db: database });
        client = await Connection.getInstance().getClient(effectiveDb);
        const result = await client.query(text, params);
        logQuery('end', { sql: text, params, db: database, duration: Date.now() - start });

        return {
            rows: (Array.isArray(result) ? result : result.rows || []) as T[],
            rowCount: result.rowCount || (result.affectedRows ?? (Array.isArray(result) ? result.length : 0)),
            insertId: result.insertId || undefined,
        };
    } catch (error) {
        const errMsg = (error as Error).message || 'Unknown query error';
        logQuery('error', { sql: text, params, db: database, duration: Date.now() - start, error: errMsg });
        throw new Error(`Query failed on DB ${database}: ${text.slice(0, 50)}... - ${errMsg}`);
    } finally {
        if (client) {
            try {
                if (client.release) client.release();
                else if (client.end) await client.end();
            } catch (releaseErr) {
                console.error(`Failed to release client for DB ${database}: ${(releaseErr as Error).message}`);
            }
        }
    }
}

export async function withTransaction<T>(callback: (client: AnyDbClient) => Promise<T>, dbName?: string): Promise<T> {
    const database = dbName !== undefined ? dbName : dbConfig.database;
    if (database == null) {
        throw new Error('Database name is required');
    }
    const effectiveDb = database === '' ? undefined : database;
    const start = Date.now();
    let client: AnyDbClient | null = null;

    try {
        logTransaction('start', { db: database });
        client = await Connection.getInstance().getClient(effectiveDb);
        await client.query('START TRANSACTION');

        const result = await callback(client);

        await client.query('COMMIT');
        logTransaction('end', { db: database, duration: Date.now() - start });

        return result;
    } catch (error) {
        const errMsg = (error as Error).message || 'Unknown transaction error';
        logTransaction('error', { db: database, duration: Date.now() - start, error: errMsg });

        if (client) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackErr) {
                console.error(`Rollback failed on DB ${database}: ${(rollbackErr as Error).message}`);
            }
        }

        throw new Error(`Transaction failed on DB ${database}: ${errMsg}`);
    } finally {
        if (client) {
            try {
                if (client.release) client.release();
                else if (client.end) await client.end();
            } catch (releaseErr) {
                console.error(`Failed to release client for DB ${database}: ${(releaseErr as Error).message}`);
            }
        }
    }
}

export async function healthCheck(dbName?: string): Promise<boolean> {
    const database = dbName !== undefined ? dbName : dbConfig.database;
    if (database == null) {
        throw new Error('Database name is required');
    }
    const effectiveDb = database === '' ? undefined : database;
    const start = Date.now();
    let client: AnyDbClient | null = null;

    try {
        client = await Connection.getInstance().getClient(effectiveDb);
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