import { getTenantDbConnection } from '../../cortex/db/db-context-switcher';
import { Tenant } from '../../cortex/core/tenant/tenant.types';
import { query, tenantStorage } from '../../cortex/db/db';
import { Connection } from '../../cortex/db/connection';
import { getDbConfig } from '../../cortex/config/db-config';
import * as sinon from 'sinon';

describe('DB Context Switching', () => {
    const masterDb = process.env.MASTER_DB_NAME || 'master_db';
    const tenantDb = 'tenant1_db';

    beforeAll(async () => {
        // Initialize connection to master DB
        await Connection.initialize(getDbConfig());

        // Seed master DB with test data
        await tenantStorage.run(masterDb, () =>
            query(
                `
                    CREATE TABLE IF NOT EXISTS tenants (
                                                           id VARCHAR(50),
                        db_connection TEXT
                        )
                `
            )
        );
        await tenantStorage.run(masterDb, () =>
            query(
                `
                    INSERT INTO tenants (id, db_connection)
                    VALUES (?, ?)
                `,
                ['tenant1', 'mariadb://localhost/tenant1_db']
            )
        );

        // Create tenant database
        await query(`CREATE DATABASE IF NOT EXISTS \`${tenantDb}\``);
    }, 15000);

    afterAll(async () => {
        // Clean up test data
        try {
            await query(`DROP DATABASE IF EXISTS \`${tenantDb}\``);
            await tenantStorage.run(masterDb, () => query('DROP TABLE IF EXISTS tenants'));
        } catch (error) {
            console.error(`Error during cleanup: ${(error as Error).message}`);
        }
        const conn = Connection.getInstance();
        if (conn) {
            await conn.close();
        }
    }, 15000);

    test('switches to tenant-specific DB connection', async () => {
        const tenant: Tenant = { id: 'tenant1', dbConnection: 'mariadb://localhost/tenant1_db' };
        const connection = await getTenantDbConnection(tenant);
        expect(connection.database).toBe('tenant1_db');
        expect(connection).toHaveProperty('query');

        // Verify connection works with a simple query
        const result = await connection.query('SELECT 1 AS test');
        expect(result.rows).toEqual([{ test: 1 }]);

        // Test release method
        await connection.release();
        await expect(connection.query('SELECT 1')).rejects.toThrow('Cannot read properties of null');
    });

    test('throws error for invalid tenant DB connection', async () => {
        const tenant: Tenant = { id: 'invalid', dbConnection: 'mariadb://localhost/invalid_db' };
        await expect(getTenantDbConnection(tenant)).rejects.toThrow(/Failed to connect to tenant DB/);
    });

    test('releases client properly on error', async () => {
        const tenant: Tenant = { id: 'invalid', dbConnection: 'mariadb://localhost/invalid_db' };
        try {
            await getTenantDbConnection(tenant);
        } catch (error) {
            expect(error).toMatchObject({ message: expect.stringContaining('Failed to connect to tenant DB invalid_db') });
            // Verify a new connection can still be made
            const connection = await getTenantDbConnection({ id: 'tenant1', dbConnection: 'mariadb://localhost/tenant1_db' });
            const result = await connection.query('SELECT 1 AS test');
            expect(result.rows).toEqual([{ test: 1 }]);
            await connection.release();
        }
    });

    test('uses end method for non-pooled connection', async () => {
        const tenant: Tenant = { id: 'tenant1', dbConnection: 'mariadb://localhost/tenant1_db' };
        const endStub = sinon.stub();
        const stub = sinon.stub(Connection.getInstance(), 'getClient').resolves({
            query: async (sql: string) => ({ rows: [{ test: 1 }] }),
            end: endStub,
        });

        const connection = await getTenantDbConnection(tenant);
        expect(connection.database).toBe('tenant1_db');
        const result = await connection.query('SELECT 1 AS test');
        expect(result.rows).toEqual([{ test: 1 }]);

        // Test release method using end
        await connection.release();
        expect(endStub.calledOnce).toBe(true);

        // Restore stub
        stub.restore();
    });

    test('uses release method for pooled connection', async () => {
        const tenant: Tenant = { id: 'tenant1', dbConnection: 'mariadb://localhost/tenant1_db' };
        const releaseStub = sinon.stub();
        const stub = sinon.stub(Connection.getInstance(), 'getClient').resolves({
            query: async (sql: string) => ({ rows: [{ test: 1 }] }),
            release: releaseStub,
        });

        const connection = await getTenantDbConnection(tenant);
        expect(connection.database).toBe('tenant1_db');
        const result = await connection.query('SELECT 1 AS test');
        expect(result.rows).toEqual([{ test: 1 }]);

        // Test release method using release
        await connection.release();
        expect(releaseStub.calledOnce).toBe(true);

        // Restore stub
        stub.restore();
    });
});