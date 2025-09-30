// src/db.ts
import { AnyDbClient, QueryResult } from './types';
import { getTenantId, getTenantDatabase } from './tenant';
import { MariaDBAdapter } from './adapters/mariadb';

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult> {
    const tenantDatabase = getTenantDatabase();
    if (!tenantDatabase) {
        throw new Error('Tenant database not set in context');
    }
    const client = await MariaDBAdapter.getConnection(tenantDatabase);
    try {
        let modifiedText = text;
        let modifiedParams = params ? [...params] : [];
        const tenantId = getTenantId();
        if (tenantId && !text.toUpperCase().includes('INSERT')) { // Skip tenant_id filter for INSERT
            const hasWhereClause = /WHERE\s/i.test(text);
            if (hasWhereClause) {
                modifiedText = text.replace(/WHERE\s/i, `WHERE tenant_id = ? AND `);
                modifiedParams = [tenantId, ...modifiedParams];
            } else {
                modifiedText = text.replace(/FROM\s+(\w+)/i, `FROM $1 WHERE tenant_id = ?`);
                modifiedParams = [tenantId, ...modifiedParams];
            }
        }
        const result = await client.query(modifiedText, modifiedParams);
        return {
            rows: Array.isArray(result) ? result : [],
            rowCount: (result as any).affectedRows || result.length || 0,
        };
    } finally {
        if (client.release) {
            client.release();
        } else if (client.end) {
            await client.end();
        }
    }
}

export async function withTransaction<T>(callback: (client: AnyDbClient) => Promise<T>): Promise<T> {
    const tenantDatabase = getTenantDatabase();
    if (!tenantDatabase) {
        throw new Error('Tenant database not set in context');
    }
    const adapter = new MariaDBAdapter();
    const client = await MariaDBAdapter.getConnection(tenantDatabase);
    try {
        await adapter.beginTransaction(client);
        const result = await callback(client);
        await adapter.commitTransaction(client);
        return result;
    } catch (error) {
        await adapter.rollbackTransaction(client);
        if (error instanceof Error) {
            throw new Error(`Transaction failed: ${error.message}`);
        } else {
            throw new Error(`Transaction failed: Unknown error`);
        }
    } finally {
        if (client.release) {
            client.release();
        } else if (client.end) {
            await client.end();
        }
    }
}

export async function healthCheck(database: string = 'codexsun_db'): Promise<boolean> {
    try {
        const client = await MariaDBAdapter.getConnection(database);
        try {
            const result = await client.query('SELECT 1 AS value');
            return Array.isArray(result) && result.length === 1 && result[0].value === 1;
        } finally {
            if (client.release) {
                client.release();
            } else if (client.end) {
                await client.end();
            }
        }
    } catch {
        return false;
    }
}