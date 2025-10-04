// tests/migrator/system-migration.test.ts
import { Connection } from '../../cortex/db/connection';
import { getDbConfig } from '../../cortex/config/db-config';
import { settings } from '../../cortex/config/get-settings';
import { runSystemMigration } from '../../cortex/migration/system_migration';

describe('System Migration', () => {
    let connection: Connection;

    beforeAll(async () => {
        const config = getDbConfig();
        connection = await Connection.initialize(config);
    });

    afterAll(async () => {
        await connection.close();
    });

    it('creates master DB, tenants table, default tenant entry, tenant DB, and migrations table', async () => {
        try {
            // Drop master and tenant DBs if they exist to start fresh
            let noDbClient = await connection.getClient('');
            try {
                await noDbClient.query(`DROP DATABASE IF EXISTS \`${settings.MASTER_DB}\``);
                await noDbClient.query(`DROP DATABASE IF EXISTS \`codexsun_db\``);
            } finally {
                if (noDbClient.release) noDbClient.release();
                else if (noDbClient.end) await noDbClient.end();
            }

            // Run system migration using the existing connection
            await runSystemMigration();

            // Verify master DB exists
            noDbClient = await connection.getClient('');
            try {
                const masterDbCheck = await noDbClient.query(
                    `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?`,
                    [settings.MASTER_DB]
                );
                expect(masterDbCheck.rows).toHaveLength(1);
                expect(masterDbCheck.rows[0].SCHEMA_NAME).toBe(settings.MASTER_DB);
            } finally {
                if (noDbClient.release) noDbClient.release();
                else if (noDbClient.end) await noDbClient.end();
            }

            // Verify tenants table exists and structure in master DB
            const masterClient = await connection.getClient(settings.MASTER_DB);
            try {
                const tenantsTableCheck = await masterClient.query(
                    `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
                    [settings.MASTER_DB, 'tenants']
                );
                expect(tenantsTableCheck.rows).toHaveLength(1);
                expect(tenantsTableCheck.rows[0].TABLE_NAME).toBe('tenants');

                const tenantsColumnCheck = await masterClient.query(
                    `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = ? AND table_name = ?`,
                    [settings.MASTER_DB, 'tenants']
                );
                const expectedTenantsColumns = [
                    { column_name: 'id', data_type: 'bigint', is_nullable: 'NO', column_default: null },
                    { column_name: 'tenant_id', data_type: 'varchar', is_nullable: 'NO', column_default: null },
                    { column_name: 'database_name', data_type: 'varchar', is_nullable: 'NO', column_default: null },
                    { column_name: 'host', data_type: 'varchar', is_nullable: 'NO', column_default: null },
                    { column_name: 'port', data_type: 'int', is_nullable: 'NO', column_default: null },
                    { column_name: 'user', data_type: 'varchar', is_nullable: 'NO', column_default: null },
                    { column_name: 'password', data_type: 'varchar', is_nullable: 'NO', column_default: null },
                    { column_name: 'type', data_type: 'varchar', is_nullable: 'NO', column_default: null },
                    { column_name: 'ssl', data_type: 'tinyint', is_nullable: 'NO', column_default: null },
                    { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'YES', column_default: 'current_timestamp()' },
                    { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'YES', column_default: 'current_timestamp()' }
                ];
                expect(tenantsColumnCheck.rows).toHaveLength(expectedTenantsColumns.length);
                expect(tenantsColumnCheck.rows).toEqual(expect.arrayContaining(expectedTenantsColumns));

                // Verify default tenant entry
                const tenantEntryCheck = await masterClient.query(
                    'SELECT tenant_id, database_name, host, port, user, type, ssl FROM tenants WHERE tenant_id = ?',
                    ['default']
                );
                expect(tenantEntryCheck.rows).toHaveLength(1);
                expect(tenantEntryCheck.rows[0]).toMatchObject({
                    tenant_id: 'default',
                    database_name: 'codexsun_db',
                    host: settings.DB_HOST,
                    port: settings.DB_PORT,
                    user: settings.DB_USER,
                    type: settings.DB_DRIVER,
                    ssl: settings.DB_SSL ? 1 : 0
                });
            } finally {
                if (masterClient.release) masterClient.release();
                else if (masterClient.end) await masterClient.end();
            }

            // Verify tenant DB exists
            noDbClient = await connection.getClient('');
            try {
                const tenantDbCheck = await noDbClient.query(
                    `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?`,
                    ['codexsun_db']
                );
                expect(tenantDbCheck.rows).toHaveLength(1);
                expect(tenantDbCheck.rows[0].SCHEMA_NAME).toBe('codexsun_db');
            } finally {
                if (noDbClient.release) noDbClient.release();
                else if (noDbClient.end) await noDbClient.end();
            }

            // Verify migrations table exists and structure in tenant DB
            const tenantClient = await connection.getClient('codexsun_db');
            try {
                const migrationsTableCheck = await tenantClient.query(
                    `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
                    ['codexsun_db', 'migrations']
                );
                expect(migrationsTableCheck.rows).toHaveLength(1);
                expect(migrationsTableCheck.rows[0].TABLE_NAME).toBe('migrations');

                const migrationsColumnCheck = await tenantClient.query(
                    `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = ? AND table_name = ?`,
                    ['codexsun_db', 'migrations']
                );
                const expectedMigrationsColumns = [
                    { column_name: 'id', data_type: 'bigint', is_nullable: 'NO', column_default: null },
                    { column_name: 'migration_name', data_type: 'varchar', is_nullable: 'NO', column_default: null },
                    { column_name: 'executed_at', data_type: 'timestamp', is_nullable: 'YES', column_default: 'current_timestamp()' }
                ];
                expect(migrationsColumnCheck.rows).toHaveLength(expectedMigrationsColumns.length);
                expect(migrationsColumnCheck.rows).toEqual(expect.arrayContaining(expectedMigrationsColumns));
            } finally {
                if (tenantClient.release) tenantClient.release();
                else if (tenantClient.end) await tenantClient.end();
            }
        } catch (error) {
            console.error('Test failed:', error);
            throw error;
        }
    });
});