import { Connection } from './connection';
import { AnyDbClient, QueryResult } from './types';
import { getTenantId } from './tenant';

let defaultConnection: Connection | null = null;

export function setDefaultConnection(connection: Connection): void {
    defaultConnection = connection;
}

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult> {
    if (!defaultConnection) {
        throw new Error('Default connection not set');
    }
    const client = defaultConnection.getClient();
    const adapter = defaultConnection['adapter'] as any;
    const tenantId = getTenantId();
    let modifiedText = text;

    if (tenantId) {
        modifiedText = text.replace(/FROM\s+(\w+)/i, `FROM $1 WHERE tenant_id = $2`);
        params = params ? [tenantId, ...params] : [tenantId];
    }

    try {
        return await adapter.query(client, modifiedText, params);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Query failed: ${error.message}`);
        } else {
            throw new Error(`Query failed: Unknown error`);
        }
    }
}

export async function withTransaction<T>(callback: (client: AnyDbClient) => Promise<T>): Promise<T> {
    if (!defaultConnection) {
        throw new Error('Default connection not set');
    }
    const client = defaultConnection.getClient();
    const adapter = defaultConnection['adapter'] as any;

    try {
        await adapter.beginTransaction(client);
        const result = await callback(client);
        await adapter.commitTransaction(client);
        return result;
    } catch (error) {
        if (error instanceof Error) {
            await adapter.rollbackTransaction(client);
            throw new Error(`Transaction failed: ${error.message}`);
        } else {
            throw new Error(`Transaction failed: Unknown error`);
        }
    }
}

export async function healthCheck(): Promise<boolean> {
    if (!defaultConnection) {
        return false;
    }
    try {
        const result = await query('SELECT 1 AS value');
        return result.rows.length === 1 && result.rows[0].value === 1;
    } catch (error) {
        return false;
    }
}