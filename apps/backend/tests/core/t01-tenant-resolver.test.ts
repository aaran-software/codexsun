import { resolveTenant } from '../../cortex/core/tenant/tenant-resolver';
import { Tenant } from '../../cortex/core/tenant/tenant.types';
import { Connection } from '../../cortex/db/connection';
import { getDbConfig } from '../../cortex/config/db-config';
import { query } from '../../cortex/db/db';

describe('Tenant Resolver with Email', () => {
    const masterDb = getDbConfig().database;

    beforeAll(async () => {
        await Connection.initialize(getDbConfig());
        await query(`CREATE DATABASE IF NOT EXISTS \`${masterDb}\``);
        await query(
            `USE \`${masterDb}\``,
            [],
            masterDb
        );
        await query(
            `
                CREATE TABLE IF NOT EXISTS tenants (
                    id VARCHAR(50),
                    db_connection TEXT
                )
            `,
            [],
            masterDb
        );
        await query(
            `
                CREATE TABLE IF NOT EXISTS tenant_users (
                    email VARCHAR(255),
                    tenant_id VARCHAR(50)
                )
            `,
            [],
            masterDb
        );
    });

    beforeEach(async () => {
        await query('DELETE FROM tenant_users', [], masterDb);
        await query('DELETE FROM tenants', [], masterDb);

        await query(
            `
                INSERT INTO tenants (id, db_connection)
                VALUES (?, ?)
            `,
            ['tenant1', 'mariadb://localhost/tenant1_db'],
            masterDb
        );
        await query(
            `
                INSERT INTO tenant_users (email, tenant_id)
                VALUES (?, ?), (?, ?)
            `,
            ['john@tenant1.com', 'tenant1', 'shared@domain.com', 'tenant1'],
            masterDb
        );
        await query(
            `
                INSERT INTO tenant_users (email, tenant_id)
                VALUES (?, ?)
            `,
            ['shared@domain.com', 'tenant2'],
            masterDb
        );
    });

    afterAll(async () => {
        await query('DROP TABLE IF EXISTS tenant_users', [], masterDb);
        await query('DROP TABLE IF EXISTS tenants', [], masterDb);
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
        const req = { body: { email: '', password: 'pass123' } } as { body: { email: string; password: string } };
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
        await query(
            `
                INSERT INTO tenant_users (email, tenant_id)
                VALUES (?, ?)
            `,
            ['test@tenant2.com', 'tenant2'],
            masterDb
        );
        const req = { body: { email: 'test@tenant2.com', password: 'pass123' } };
        await expect(resolveTenant(req)).rejects.toThrow('Tenant not found');
    });
});