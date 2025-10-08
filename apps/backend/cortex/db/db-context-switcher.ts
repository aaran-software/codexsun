import { Tenant, DbConnection } from '../core/app.types';
import { Connection } from './connection';
import { logConnection } from '../config/logger';
import { QueryResult } from './db-types';

/**
 * Establishes a connection to a tenant-specific database.
 * Used in multi-tenant ERP to switch database context for tenant operations.
 * @param tenant - Tenant object containing id and dbConnection string.
 * @returns A promise resolving to a DbConnection object with database name, query method, and release method.
 * @throws Error if the connection to the tenant database fails.
 */
export async function getTenantDbConnection(tenant: Tenant): Promise<DbConnection> {
    const { dbConnection } = tenant;
    const dbName = dbConnection.split('/').pop()?.split('?')[0] || '';
    const start = Date.now();

    let client: any = null;
    try {
        logConnection('start', { db: dbName, connectionString: dbConnection });
        client = await Connection.getInstance().getClient(dbName);
        logConnection('success', { db: dbName, connectionString: dbConnection, duration: Date.now() - start });

        return {
            database: dbName,
            query: async <T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> => {
                const result = await client.query(sql, params);
                return {
                    rows: (Array.isArray(result) ? result : result.rows || []) as T[],
                    rowCount: result.rowCount || (result.affectedRows ?? (Array.isArray(result) ? result.length : 0)),
                    insertId: result.insertId || undefined,
                };
            },
            release: async () => {
                if (client) {
                    if (client.release) {
                        client.release();
                    } else if (client.end) {
                        await client.end();
                    }
                    client = null;
                }
            },
        };
    } catch (error) {
        logConnection('error', {
            db: dbName,
            connectionString: dbConnection,
            duration: Date.now() - start,
            error: (error as Error).message,
        });
        throw new Error(`Failed to connect to tenant DB ${dbName}: ${(error as Error).message}`);
    }
}