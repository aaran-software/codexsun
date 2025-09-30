// src/db.ts
import { AsyncLocalStorage } from 'async_hooks';
import { MariaDBAdapter } from './adapters/mariadb';
import { AnyDbClient, QueryResult } from './types';

const tenantStorage = new AsyncLocalStorage<string>();

export async function withTenantContext<T>(
    tenantId: string,
    database: string,
    callback: () => Promise<T>
): Promise<T> {
    return tenantStorage.run(database, callback);
}

export async function query<T>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    const db = tenantStorage.getStore() ?? '';
    const client = await MariaDBAdapter.getConnection(db);
    try {
        const result = await client.query<T>(sql, params); // Use generic query method
        // Ensure result is compatible with QueryResult<T>
        const rows = Array.isArray(result) ? result : result.affectedRows ? [] : result;
        return { rows: rows as T[], rowCount: result.affectedRows || rows.length };
    } finally {
        if (client.release) client.release();
        else if (client.end) await client.end();
    }
}

export async function withTransaction<T>(callback: (client: AnyDbClient) => Promise<T>): Promise<T> {
    const db = tenantStorage.getStore() ?? '';
    const client = await MariaDBAdapter.getConnection(db);
    try {
        await client.query('START TRANSACTION');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Transaction failed: ${(error as Error).message}`);
    } finally {
        if (client.release) client.release();
        else if (client.end) await client.end();
    }
}

export async function healthCheck(database: string): Promise<boolean> {
    const client = await MariaDBAdapter.getConnection(database);
    try {
        await client.query('SELECT 1');
        return true;
    } catch {
        return false;
    } finally {
        if (client.release) client.release();
        else if (client.end) await client.end();
    }
}