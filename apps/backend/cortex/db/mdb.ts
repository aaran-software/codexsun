import { Connection } from './connection';
import { QueryResult, AnyDbClient } from './db-types';
import { settings } from '../config/get-settings';

export async function query<T>(text: string, params: any[] = [], database: string = settings.DB_NAME): Promise<QueryResult<T>> {
    if (!database) {
        throw new Error('Database name is required');
    }
    const conn = Connection.getInstance();
    const client = await conn.getClient(database);
    try {
        const result = await client.query(text, params);
        return {
            rows: Array.isArray(result) ? result : Array.isArray(result.rows) ? result.rows : [],
            rowCount: result.rowCount ?? (result.affectedRows ?? (Array.isArray(result) ? result.length : 0)),
            insertId: result.insertId ?? undefined,
        };
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown database error');
        console.error(`Database query error on ${database}: ${error.message}`, { sql: text, params });
        throw new Error(`Query failed: ${error.message}`);
    } finally {
        if (client.release) {
            client.release();
        } else if (client.end) {
            await client.end();
        }
    }
}

export async function withTransaction<T>(callback: (client: AnyDbClient) => Promise<T>, database: string = settings.DB_NAME): Promise<T> {
    if (!database) {
        throw new Error('Database name is required');
    }
    const conn = Connection.getInstance();
    const client = await conn.getClient(database);
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown transaction error');
        await client.query('ROLLBACK');
        console.error(`Transaction failed on ${database}: ${error.message}`);
        throw new Error(`Transaction failed: ${error.message}`);
    } finally {
        if (client.release) {
            client.release();
        } else if (client.end) {
            await client.end();
        }
    }
}

export async function healthCheck(database: string = settings.DB_NAME): Promise<boolean> {
    if (!database) {
        throw new Error('Database name is required');
    }
    const conn = Connection.getInstance();
    const client = await conn.getClient(database);
    try {
        await client.query('SELECT 1');
        return true;
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown health check error');
        console.error(`Health check failed on ${database}: ${error.message}`);
        return false;
    } finally {
        if (client.release) {
            client.release();
        } else if (client.end) {
            await client.end();
        }
    }
}