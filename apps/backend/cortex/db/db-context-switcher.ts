import { Tenant, DbConnection } from '../core/tenant/tenant.types';
import { Connection } from './connection';
import { logConnection } from '../config/logger';

/**
 * Establishes a connection to a tenant-specific database.
 * Used in multi-tenant ERP to switch database context for tenant operations.
 * @param tenant - Tenant object containing id and dbConnection string.
 * @returns A promise resolving to a DbConnection object with database name and query method.
 * @throws Error if the connection to the tenant database fails.
 */
export async function getTenantDbConnection(tenant: Tenant): Promise<DbConnection> {
    const { dbConnection } = tenant;
    const dbName = dbConnection.split('/').pop() || '';
    const start = Date.now();

    try {
        logConnection('start', { db: dbName, connectionString: dbConnection });
        const client = await Connection.getInstance().getClient(dbName);
        logConnection('success', { db: dbName, connectionString: dbConnection, duration: Date.now() - start });
        return {
            database: dbName,
            query: async (sql: string, params?: any[]) => {
                const result = await client.query(sql, params);
                return { rows: Array.isArray(result) ? result : result.rows || [] };
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