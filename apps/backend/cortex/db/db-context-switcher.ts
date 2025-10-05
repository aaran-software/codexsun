import { Tenant, DbConnection } from '../core/tenant/tenant.types';

// Mock DB client (replace with actual DB client like pg in production)
const mockDbClient = {
    connect: async (connectionString: string): Promise<DbConnection> => {
        if (connectionString.startsWith('invalid://')) {
            throw new Error('Failed to connect to tenant DB');
        }
        return {
            database: connectionString.split('/').pop() || '',
            query: async (query: string, params?: any[]) => ({ rows: [] }),
        };
    },
};

export async function getTenantDbConnection(tenant: Tenant): Promise<DbConnection> {
    const { dbConnection } = tenant;

    try {
        const connection = await mockDbClient.connect(dbConnection);
        return connection;
    } catch (error) {
        throw new Error('Failed to connect to tenant DB');
    }
}