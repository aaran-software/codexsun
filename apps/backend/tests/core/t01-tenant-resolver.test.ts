import { resolveTenant } from '../../cortex/core/tenant/tenant-resolver';
import { Tenant } from '../../cortex/core/tenant/tenant.types';
import { query, tenantStorage } from '../../cortex/db/db';
import { Connection } from '../../cortex/db/connection';
import { getDbConfig } from '../../cortex/config/db-config';

describe('Tenant Resolver with Email', () => {
    const masterDb = process.env.MASTER_DB_NAME || 'master_db';

    beforeAll(async () => {
        // Initialize connection to master DB
        await Connection.initialize(getDbConfig());

        // Seed master DB with test data
        await tenantStorage.run(masterDb, () =>
            query(
                `
                    CREATE TABLE IF NOT EXISTS tenant_users (
                                                                email VARCHAR(255),
                        tenant_id VARCHAR(50)
                        )
                `
            )
        );
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
                    INSERT INTO tenant_users (email, tenant_id)
                    VALUES (?, ?), (?, ?)
                `,
                ['john@tenant1.com', 'tenant1', 'shared@domain.com', 'tenant1']
            )
        );
        await tenantStorage.run(masterDb, () =>
            query(
                `
                    INSERT INTO tenant_users (email, tenant_id)
                    VALUES (?, ?)
                `,
                ['shared@domain.com', 'tenant2']
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
    });

    afterAll(async () => {
        // Clean up test data
        await tenantStorage.run(masterDb, () => query('DROP TABLE IF EXISTS tenant_users'));
        await tenantStorage.run(masterDb, () => query('DROP TABLE IF EXISTS tenants'));
        const conn = Connection.getInstance();
        if (conn) {
            await conn.close();
        }
    });

    test('resolves tenant from email in master DB', async () => {
        const req = { body: { email: 'john@tenant1.com', password: 'pass123' } };
        const tenant = await resolveTenant(req);
        expect(tenant).toEqual({ id: 'tenant1', dbConnection: 'mariadb://localhost/tenant1_db' });
    });

    test('throws error for missing email in request body', async () => {
        const req = { body: { password: 'pass123' } } as { body: Partial<{ email: string; password: string }> };
        await expect(resolveTenant(req)).rejects.toThrow('Email is required');
    });

    test('throws error for email not found in master DB', async () => {
        const req = { body: { email: 'unknown@domain.com', password: 'pass123' } };
        await expect(resolveTenant(req)).rejects.toThrow('Email not associated with any tenant');
    });

    test('throws error for email associated with multiple tenants', async () => {
        const req = { body: { email: 'shared@domain.com', password: 'pass123' } };
        await expect(resolveTenant(req)).rejects.toThrow('Multiple tenants found for email');
    });

    test('throws error for tenant not found in tenants table', async () => {
        await tenantStorage.run(masterDb, () =>
            query(
                `
                    INSERT INTO tenant_users (email, tenant_id)
                    VALUES (?, ?)
                `,
                ['test@tenant2.com', 'tenant2']
            )
        );
        const req = { body: { email: 'test@tenant2.com', password: 'pass123' } };
        await expect(resolveTenant(req)).rejects.toThrow('Tenant not found');
    });
});