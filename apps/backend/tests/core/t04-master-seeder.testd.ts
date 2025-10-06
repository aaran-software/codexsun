import { Connection } from '../../cortex/db/connection';
import { getDbConfig } from '../../cortex/config/db-config';
import { query } from '../../cortex/db/mdb';
import { MasterSeeder } from '../../cortex/migrations/seeder/master/001_tenant_seeder';
import { TenantUserSeeder } from '../../cortex/migrations/seeder/master/002_tenant_user_seeder';
import { QueryResult, QueryFunction } from '../../cortex/db/db-types';
import * as sinon from 'sinon';

describe('Master DB Seeders', () => {
    const masterDb = process.env.MASTER_DB_NAME || 'master_db';

    beforeAll(async () => {
        await Connection.initialize(getDbConfig());
        await query(`CREATE DATABASE IF NOT EXISTS \`${masterDb}\``);

        // Apply migrations as prerequisite
        await query(
            `
                CREATE TABLE IF NOT EXISTS tenants (
                                                       id INT AUTO_INCREMENT PRIMARY KEY,
                                                       tenant_id VARCHAR(255) NOT NULL UNIQUE,
                    db_host VARCHAR(255) NOT NULL,
                    db_port VARCHAR(255) NOT NULL,
                    db_user VARCHAR(255) NOT NULL,
                    db_pass VARCHAR(255),
                    db_name VARCHAR(255) NOT NULL,
                    db_ssl VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
            `,
            [],
            masterDb
        );

        await query(
            `
                CREATE TABLE IF NOT EXISTS tenant_users (
                                                            id INT AUTO_INCREMENT PRIMARY KEY,
                                                            email VARCHAR(255) NOT NULL UNIQUE,
                    tenant_id VARCHAR(50) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
                    )
            `,
            [],
            masterDb
        );
    }, 15000);

    afterAll(async () => {
        try {
            await query(`DROP TABLE IF EXISTS tenant_users`, [], masterDb);
            await query(`DROP TABLE IF EXISTS tenants`, [], masterDb);
            await query(`DROP DATABASE IF EXISTS \`${masterDb}\``);
        } catch (error) {
            console.error(`Error during cleanup: ${(error as Error).message}`);
        }
        const conn = Connection.getInstance();
        if (conn) {
            await conn.close();
        }
    }, 15000);

    test('applies 001_tenant_seeder', async () => {
        const seeder = new MasterSeeder();
        await seeder.up();

        const tenants: QueryResult<{ tenant_id: string; db_host: string }> = await query(`SELECT * FROM tenants WHERE tenant_id = 'default'`, [], masterDb);
        expect(tenants.rows.length).toBe(1);
        expect(tenants.rows[0].tenant_id).toBe('default');
        expect(tenants.rows[0].db_host).toBe(process.env.DB_HOST || 'localhost');
    });

    test('rolls back 001_tenant_seeder', async () => {
        const seeder = new MasterSeeder();
        await seeder.up(); // Ensure data exists before rollback
        await seeder.down();

        const tenants: QueryResult<{ tenant_id: string }> = await query(`SELECT * FROM tenants WHERE tenant_id = 'default'`, [], masterDb);
        expect(tenants.rows.length).toBe(0);
    });

    test('applies 002_tenant_user_seeder', async () => {
        // Prerequisite: seed tenants
        const tenantSeeder = new MasterSeeder();
        await tenantSeeder.up();

        const seeder = new TenantUserSeeder();
        await seeder.up();

        const users: QueryResult<{ email: string; tenant_id: string }> = await query(`SELECT * FROM tenant_users WHERE tenant_id = 'default'`, [], masterDb);
        expect(users.rows.length).toBe(2);
        expect(users.rows).toEqual(expect.arrayContaining([
            expect.objectContaining({ email: 'admin@default.com', tenant_id: 'default' }),
            expect.objectContaining({ email: 'user@default.com', tenant_id: 'default' }),
        ]));
    });

    test('rolls back 002_tenant_user_seeder', async () => {
        // Prerequisite: seed tenants and users
        const tenantSeeder = new MasterSeeder();
        await tenantSeeder.up();
        const seeder = new TenantUserSeeder();
        await seeder.up();

        await seeder.down();

        const users: QueryResult<{ email: string; tenant_id: string }> = await query(`SELECT * FROM tenant_users WHERE tenant_id = 'default'`, [], masterDb);
        expect(users.rows.length).toBe(0);

        // Clean up prerequisite
        await tenantSeeder.down();
    });

    test('handles seeder errors gracefully', async () => {
        const seeder = new MasterSeeder();
        const stub = sinon.stub<[string, any[] | undefined, string | undefined], Promise<QueryResult<any>>>();
        stub.throws(new Error('Simulated seeder error'));

        // Temporarily replace query with stub
        const originalQuery = query;
        (query as QueryFunction) = stub as QueryFunction;

        await expect(seeder.up()).rejects.toThrow('Simulated seeder error');

        // Restore original query
        (query as QueryFunction) = originalQuery;
    });
});