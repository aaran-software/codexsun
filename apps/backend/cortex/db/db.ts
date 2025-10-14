// cortex/db/db.ts

import { Connection } from './connection';
import { QueryResult, AnyDbClient } from './db-types';
import { getPrimaryDbConfig, getMasterDbConfig, DbConfig } from '../config/db-config';
import { logQuery, logTransaction, logHealthCheck } from '../config/logger';
import * as mdb from './mdb';

async function resolveTenant(tenantId: string): Promise<DbConfig> {
    if (tenantId === 'master_db' || process.env.TENANCY === 'false') {
        return getMasterDbConfig();
    }

    const res = await mdb.query<{
        driver: 'postgres' | 'mysql' | 'mariadb' | 'sqlite';
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
        ssl?: any;
        connectionLimit?: number;
        acquireTimeout?: number;
        idleTimeout?: number;
    }>(
        'SELECT * FROM tenants WHERE id = ?',
        [tenantId]
    );

    if (res.rows.length === 0) {
        throw new Error('Tenant not found');
    }

    const tenant = res.rows[0];

    return {
        driver: tenant.driver,
        host: tenant.host,
        port: tenant.port,
        user: tenant.user,
        password: tenant.password,
        database: tenant.database,
        ssl: tenant.ssl,
        connectionLimit: tenant.connectionLimit || 10,
        acquireTimeout: tenant.acquireTimeout || 10000,
        idleTimeout: tenant.idleTimeout || 10000,
    };
}

export async function query<T>(text: string, params: any[] = [], tenantId: string): Promise<QueryResult<T>> {
    let config: DbConfig;
    try {
        config = await resolveTenant(tenantId);
    } catch (e) {
        config = getPrimaryDbConfig();
    }

    const start = Date.now();
    let client: AnyDbClient | null = null;

    try {
        if (!text) {
            return Promise.reject(new Error('Invalid SQL query provided'));
        }
        logQuery('start', { sql: text, params, tenantId });

        const connection = await Connection.initialize(config);
        client = await connection.getClient(config.database);
        const result = await client.query(text, params);
        logQuery('end', { sql: text, params, tenantId, duration: Date.now() - start });

        return {
            rows: (Array.isArray(result) ? result : result.rows || []) as T[],
            rowCount: result.rowCount || (result.affectedRows ?? (Array.isArray(result) ? result.length : 0)) || result.changes || 0,
            insertId: result.insertId || result.lastID || undefined,
        };
    } catch (error) {
        const errMsg = (error as Error).message || 'Unknown query error';
        logQuery('error', { sql: text, params, tenantId, duration: Date.now() - start, error: errMsg });
        throw new Error(`Query failed on DB ${config.database || 'default'}: ${text.slice(0, 50)}... - ${errMsg}`);
    } finally {
        if (client) {
            try {
                if (client.release) client.release();
                else if (client.end) await client.end();
            } catch (releaseErr) {
                console.error(`Failed to release client for DB ${config.database || 'default'}: ${(releaseErr as Error).message}`);
            }
        }
    }
}

export async function withTransaction<T>(callback: (client: AnyDbClient) => Promise<T>, tenantId: string): Promise<T> {
    let config: DbConfig;
    try {
        config = await resolveTenant(tenantId);
    } catch (e) {
        config = getPrimaryDbConfig();
    }

    const start = Date.now();
    let client: AnyDbClient | null = null;
    let connection: Connection | null = null;

    try {
        logTransaction('start', { tenantId });
        connection = await Connection.initialize(config);
        client = await connection.getClient(config.database);
        await client.query('BEGIN');

        const result = await callback(client);

        await client.query('COMMIT');
        logTransaction('end', { tenantId, duration: Date.now() - start });

        return result;
    } catch (error) {
        const errMsg = (error as Error).message || 'Unknown transaction error';
        logTransaction('error', { tenantId, duration: Date.now() - start, error: errMsg });

        if (client) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackErr) {
                console.error(`Rollback failed on DB ${config.database || 'default'}: ${(rollbackErr as Error).message}`);
            }
        }

        throw new Error(`Transaction failed on DB ${config.database || 'default'}: ${errMsg}`);
    } finally {
        if (client) {
            try {
                if (client.release) client.release();
                else if (client.end) await client.end();
            } catch (releaseErr) {
                console.error(`Failed to release client for DB ${config.database || 'default'}: ${(releaseErr as Error).message}`);
            }
        }
        if (connection) {
            try {
                await connection.close();
            } catch (closeErr) {
                console.error(`Failed to close connection for DB ${config.database || 'default'}: ${(closeErr as Error).message}`);
            }
        }
    }
}

export async function healthCheck(tenantId: string): Promise<boolean> {
    let config: DbConfig;
    try {
        config = await resolveTenant(tenantId);
    } catch (e) {
        config = getPrimaryDbConfig();
    }

    const start = Date.now();
    let client: AnyDbClient | null = null;

    try {
        const connection = await Connection.initialize(config);
        client = await connection.getClient(config.database);
        await client.query('SELECT 1');
        logHealthCheck('success', { database: config.database || 'default', duration: Date.now() - start });
        return true;
    } catch (error) {
        const errMsg = (error as Error).message || 'Unknown health check error';
        logHealthCheck('error', { database: config.database || 'default', duration: Date.now() - start, error: errMsg });
        return false;
    } finally {
        if (client) {
            try {
                if (client.release) client.release();
                else if (client.end) await client.end();
            } catch (releaseErr) {
                console.error(`Failed to release client for health check on ${config.database || 'default'}: ${(releaseErr as Error).message}`);
            }
        }
    }
}