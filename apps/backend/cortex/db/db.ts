// cortex/db/db.ts

import { AsyncLocalStorage } from 'async_hooks';
import { AnyDbClient, QueryResult } from './db-types';
import { Connection } from './connection';
import { settings } from '../config/get-settings';

const tenantStorage = new AsyncLocalStorage<string>();
const DEFAULT_TENANT_ID = 'default'; // Internal default
const DEFAULT_TENANT_DB = 'codexsun_db'; // Internal default

async function getTenantDbName(tenantId: string): Promise<string> {
    if (!settings.TENANCY) {
        return settings.DB_NAME;
    }
    const conn = Connection.getInstance();
    const client = await conn.getClient(settings.MASTER_DB);
    try {
        const result = await client.query('SELECT database_name FROM tenants WHERE tenant_id = ?', [tenantId]);
        if (result.rows.length > 0) {
            return result.rows[0].db_name;
        } else if (tenantId === DEFAULT_TENANT_ID) {
            return DEFAULT_TENANT_DB;
        } else {
            throw new Error(`Tenant not found: ${tenantId}`);
        }
    } finally {
        if (client.release) client.release();
        else if (client.end) await client.end();
    }
}

export async function withTenantContext<T>(tenantId: string, callback: () => Promise<T>): Promise<T> {
    const dbName = await getTenantDbName(tenantId);
    return tenantStorage.run(dbName, callback);
}

export async function query<T>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    const db = tenantStorage.getStore() || settings.DB_NAME;
    const conn = Connection.getInstance();
    const client = await conn.getClient(db);
    try {
        const result = await client.query(sql, params);
        return {
            rows: Array.isArray(result) ? result : Array.isArray(result.rows) ? result.rows : [],
            rowCount: result.rowCount || (result.affectedRows ?? (Array.isArray(result) ? result.length : 0)),
            insertId: result.insertId || undefined,
        };
    } finally {
        if (client.release) client.release();
        else if (client.end) await client.end();
    }
}

export async function withTransaction<T>(callback: (client: AnyDbClient) => Promise<T>): Promise<T> {
    const db = tenantStorage.getStore() || settings.DB_NAME;
    const conn = Connection.getInstance();
    const client = await conn.getClient(db);
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
    const conn = Connection.getInstance();
    const client = await conn.getClient(database);
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

export async function createTenant(tenantId: string, dbName: string): Promise<void> {
    if (!settings.TENANCY) {
        throw new Error('Tenancy is disabled. Cannot create new tenant.');
    }
    const conn = Connection.getInstance();
    let client = await conn.getClient('');
    try {
        if (settings.DB_DRIVER === 'postgres') {
            await client.query(`CREATE SCHEMA IF NOT EXISTS "${dbName}"`);
        } else {
            await client.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        }
    } finally {
        if (client.release) client.release();
        else if (client.end) await client.end();
    }

    client = await conn.getClient(settings.MASTER_DB);
    try {
        await client.query('INSERT INTO tenants (tenant_id, database_name) VALUES (?, ?)', [tenantId, dbName]);
    } finally {
        if (client.release) client.release();
        else if (client.end) await client.end();
    }
}