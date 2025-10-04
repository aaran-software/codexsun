// tests/migrator/reset-db.test.ts
import { Connection } from '../../cortex/db/connection';
import { MigrateRunner } from '../../cortex/migration/migrate-runner';
import { getDbConfig } from '../../cortex/config/db-config';
import { settings } from '../../cortex/config/get-settings';
import { query, withTenantContext } from '../../cortex/db/db';
import { AnyDbClient } from '../../cortex/db/db-types';

const DEFAULT_TENANT_ID = 'default';
const DEFAULT_TENANT_DB = 'codexsun_db';

describe('Database Reset and Migration', () => {
    let connection: Connection;

    beforeAll(async () => {
        const config = getDbConfig();
        connection = await Connection.initialize(config);
    });

    afterAll(async () => {
        await connection.close();
    });

    async function dropAllTables(client: AnyDbClient): Promise<void> {
        const tablesResult = await client.query('SHOW TABLES');
        for (const row of tablesResult.rows) {
            const tableName = row[Object.keys(row)[0]] as string;
            await client.query(`DROP TABLE IF EXISTS \`${tableName}\``);
        }
    }

    it('resets and migrates database tables', async () => {
        try {
            if (!settings.TENANCY) {
                const client = await connection.getClient(settings.DB_NAME);
                try {
                    await dropAllTables(client);
                } finally {
                    if (client.release) client.release();
                    else if (client.end) await client.end();
                }
                await MigrateRunner.run('up');
                console.log('Single tenant DB reset and migrated.');
            } else {
                // Reset master DB
                const masterClient = await connection.getClient(settings.MASTER_DB);
                try {
                    await dropAllTables(masterClient);
                } finally {
                    if (masterClient.release) masterClient.release();
                    else if (masterClient.end) await masterClient.end();
                }

                // Run tenants migration on master
                const TenantsMigrationClass = (await import('../../cortex/database/migrations/002_add_column')).default;
                const tenantsInstance = new TenantsMigrationClass();
                await withTenantContext(settings.MASTER_DB, async () => {
                    await tenantsInstance.up();
                });

                // Create default tenant entry if not exists
                await withTenantContext(settings.MASTER_DB, async () => {
                    await query(
                        'INSERT IGNORE INTO tenants (tenant_id, database_name) VALUES (?, ?)',
                        [DEFAULT_TENANT_ID, DEFAULT_TENANT_DB]
                    );
                });

                // Create default tenant DB if not exists
                const noDbClient = await connection.getClient('');
                try {
                    await noDbClient.query(`CREATE DATABASE IF NOT EXISTS \`${DEFAULT_TENANT_DB}\``);
                } finally {
                    if (noDbClient.release) noDbClient.release();
                    else if (noDbClient.end) await noDbClient.end();
                }

                // Reset default tenant DB
                const tenantClient = await connection.getClient(DEFAULT_TENANT_DB);
                try {
                    await dropAllTables(tenantClient);
                } finally {
                    if (tenantClient.release) tenantClient.release();
                    else if (tenantClient.end) await client.end();
                }

                // Run user migration on tenant DB
                await withTenantContext(DEFAULT_TENANT_ID, async () => {
                    const UsersMigrationClass = (await import('../../cortex/database/migrations/001_create_users')).default;
                    const usersInstance = new UsersMigrationClass();
                    await usersInstance.up();
                });

                console.log('Tenancy-enabled DBs reset and migrated for default tenant.');
            }
        } catch (error) {
            console.error('Error in DB reset:', error);
            throw error;
        }
    });
});