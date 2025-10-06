import { Connection } from '../../cortex/db/connection';
import { getDbConfig } from '../../cortex/config/db-config';
import { query } from '../../cortex/db/mdb';
import { CreateTenantsMigration } from '../../cortex/migrations/master/001_create_tenants';
import { CreateTenantUsersMigration } from '../../cortex/migrations/master/002_create_tenant_users';
import { QueryResult, ShowCreateTableResult, QueryFunction } from '../../cortex/db/db-types';
import * as sinon from 'sinon';

describe('Master DB Migrations', () => {
    const masterDb = process.env.MASTER_DB_NAME || 'master_db';

    beforeAll(async () => {
        await Connection.initialize(getDbConfig());
        await query(`CREATE DATABASE IF NOT EXISTS \`${masterDb}\``);
    }, 15000);

    afterAll(async () => {
        try {
            await query(`DROP DATABASE IF EXISTS \`${masterDb}\``);
        } catch (error) {
            console.error(`Error during cleanup: ${(error as Error).message}`);
        }
        const conn = Connection.getInstance();
        if (conn) {
            await conn.close();
        }
    }, 15000);

    test('applies 001_create_tenants migration', async () => {
        const migration = new CreateTenantsMigration(masterDb);
        await migration.up();

        const tables: QueryResult<{ Tables_in_master_db: string }> = await query(`SHOW TABLES LIKE 'tenants'`, [], masterDb);
        expect(tables.rows.length).toBe(1);

        const desc: QueryResult<{ Field: string; Type: string; Null: string; Key: string; Default: string | null; Extra: string }> = await query(`DESCRIBE tenants`, [], masterDb);
        expect(desc.rows).toEqual(expect.arrayContaining([
            { Field: 'id', Type: 'int', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
            { Field: 'tenant_id', Type: 'varchar(255)', Null: 'NO', Key: 'UNI', Default: null, Extra: '' },
            { Field: 'db_host', Type: 'varchar(255)', Null: 'NO', Key: '', Default: null, Extra: '' },
            { Field: 'db_port', Type: 'varchar(255)', Null: 'NO', Key: '', Default: null, Extra: '' },
            { Field: 'db_user', Type: 'varchar(255)', Null: 'NO', Key: '', Default: null, Extra: '' },
            { Field: 'db_pass', Type: 'varchar(255)', Null: 'YES', Key: '', Default: null, Extra: '' },
            { Field: 'db_name', Type: 'varchar(255)', Null: 'NO', Key: '', Default: null, Extra: '' },
            { Field: 'db_ssl', Type: 'varchar(255)', Null: 'YES', Key: '', Default: null, Extra: '' },
            { Field: 'created_at', Type: 'timestamp', Null: 'YES', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: '' },
            { Field: 'updated_at', Type: 'timestamp', Null: 'YES', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: 'on update CURRENT_TIMESTAMP' },
        ]));
    });

    test('rolls back 001_create_tenants migration', async () => {
        const migration = new CreateTenantsMigration(masterDb);
        await migration.up(); // Ensure table exists before rollback
        await migration.down();

        const tables: QueryResult<{ Tables_in_master_db: string }> = await query(`SHOW TABLES LIKE 'tenants'`, [], masterDb);
        expect(tables.rows.length).toBe(0);
    });

    test('applies 002_create_tenant_users migration', async () => {
        // First apply prerequisites
        const tenantsMigration = new CreateTenantsMigration(masterDb);
        await tenantsMigration.up();

        const migration = new CreateTenantUsersMigration(masterDb);
        await migration.up();

        const tables: QueryResult<{ Tables_in_master_db: string }> = await query(`SHOW TABLES LIKE 'tenant_users'`, [], masterDb);
        expect(tables.rows.length).toBe(1);

        const desc: QueryResult<{ Field: string; Type: string; Null: string; Key: string; Default: string | null; Extra: string }> = await query(`DESCRIBE tenant_users`, [], masterDb);
        expect(desc.rows).toEqual(expect.arrayContaining([
            { Field: 'id', Type: 'int', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
            { Field: 'email', Type: 'varchar(255)', Null: 'NO', Key: 'UNI', Default: null, Extra: '' },
            { Field: 'tenant_id', Type: 'varchar(50)', Null: 'NO', Key: 'MUL', Default: null, Extra: '' },
            { Field: 'created_at', Type: 'timestamp', Null: 'YES', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: '' },
            { Field: 'updated_at', Type: 'timestamp', Null: 'YES', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: 'on update CURRENT_TIMESTAMP' },
        ]));

        const constraints: QueryResult<ShowCreateTableResult> = await query(`SHOW CREATE TABLE tenant_users`, [], masterDb);
        expect(constraints.rows[0]['Create Table']).toMatch(/FOREIGN KEY \(`tenant_id`\) REFERENCES `tenants` \(`tenant_id`\) ON DELETE CASCADE/);
    });

    test('rolls back 002_create_tenant_users migration', async () => {
        // Ensure prerequisites
        const tenantsMigration = new CreateTenantsMigration(masterDb);
        await tenantsMigration.up();
        const migration = new CreateTenantUsersMigration(masterDb);
        await migration.up();

        await migration.down();

        const tables: QueryResult<{ Tables_in_master_db: string }> = await query(`SHOW TABLES LIKE 'tenant_users'`, [], masterDb);
        expect(tables.rows.length).toBe(0);

        // Roll back prerequisite
        await tenantsMigration.down();
    });

    test('handles migration errors gracefully', async () => {
        const migration = new CreateTenantsMigration(masterDb);
        const stub = sinon.stub<[string, any[] | undefined, string | undefined], Promise<QueryResult<any>>>();
        stub.throws(new Error('Simulated migration error'));

        // Temporarily replace query with stub
        const originalQuery = query;
        (query as QueryFunction) = stub as QueryFunction;

        await expect(migration.up()).rejects.toThrow('Simulated migration error');

        // Restore original query
        (query as QueryFunction) = originalQuery;
    });
});