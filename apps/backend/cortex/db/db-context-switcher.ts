import { Tenant, DbConnection } from '../core/app.types';
import { Connection } from './connection';
import { logConnection } from '../config/logger';

/**
 * Establishes a connection to a tenant-specific database.
 * Used in multi-tenant ERP to switch database context for tenant operations.
 * @param tenant - Tenant object containing id and dbConnection string.
 * @returns A promise resolving to a DbConnection object with database name, query method, and release method.
 * @throws Error if the connection to the tenant database fails.
 */
export async function getTenantDbConnection(tenant: Tenant): Promise<DbConnection> {
    const { dbConnection } = tenant;
    const dbName = dbConnection.split('/').pop() || '';
    const start = Date.now();

    let client: any = null;
    try {
        logConnection('start', { db: dbName, connectionString: dbConnection });
        client = await Connection.getInstance().getClient(dbName);
        logConnection('success', { db: dbName, connectionString: dbConnection, duration: Date.now() - start });

        return {
            database: dbName,
            query: async (sql: string, params?: any[]) => {
                const result = await client.query(sql, params);
                return { rows: Array.isArray(result) ? result : result.rows || [] };
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