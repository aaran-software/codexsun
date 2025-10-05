import { getTenantDbConnection } from '../../cortex/db/db-context-switcher';
import { Tenant } from '../../cortex/core/tenant/tenant.types';
import { query } from '../../cortex/db/db';
import { Connection } from '../../cortex/db/connection';
import { getDbConfig } from '../../cortex/config/db-config';

describe('DB Context Switching', () => {
    beforeAll(async () => {
        // Initialize connection to master DB
        await Connection.initialize(getDbConfig());

        // Seed master DB and create tenant DB
        await query(
            'CREATE TABLE IF NOT EXISTS tenants (id VARCHAR(50), db_connection TEXT)'
        );
        await query(
            'INSERT INTO tenants (id, db_connection) VALUES (?, ?)',
            ['tenant1', 'postgresql://localhost/tenant1_db']
        );
        // Create tenant1_db schema (Postgres-specific; adjust for other DBs)
        await query('CREATE SCHEMA IF NOT EXISTS tenant1_db');
    });

    afterAll(async () => {
        // Clean up test data
        await query('DROP SCHEMA IF EXISTS tenant1_db');
        await query('DROP TABLE IF EXISTS tenants');
        await Connection.getInstance().close();
    });

    test('switches to tenant-specific DB connection', async () => {
        const tenant: Tenant = { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' };
        const connection = await getTenantDbConnection(tenant);
        expect(connection.database).toBe('tenant1_db');
        expect(connection).toHaveProperty('query');
        // Verify connection works with a simple query
        const result = await connection.query('SELECT 1 AS test');
        expect(result.rows).toEqual([{ test: 1 }]);
    });

    test('throws error for invalid tenant DB connection', async () => {
        const tenant: Tenant = { id: 'tenant1', dbConnection: 'invalid://connection' };
        await expect(getTenantDbConnection(tenant)).rejects.toThrow(/Failed to connect to tenant DB/);
    });
});