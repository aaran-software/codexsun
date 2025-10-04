import { Connection } from '../../cortex/db/connection';
import { MigrateRunner } from '../../cortex/migration/migrate-runner';
import { getDbConfig } from '../../cortex/config/db-config';
import { settings } from '../../cortex/config/get-settings';
import { query, withTenantContext } from '../../cortex/db/db';
import { AnyDbClient } from '../../cortex/db/db-types';

const DEFAULT_TENANT_ID = 'default';
const DEFAULT_TENANT_DB = 'codexsun_db';

describe('Database Check, Migration, and Rollback', () => {
    let connection: Connection;
    let migrationLog: string[] = [];

    beforeAll(async () => {
        const config = getDbConfig();
        connection = await Connection.initialize(config);
    });

    afterAll(async () => {
        await connection.close();
    });

    async function checkMasterDb(client: AnyDbClient): Promise<boolean> {
        const result = await client.query('SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?', [settings.MASTER_DB]);
        return result.rows.length > 0;
    }

    async function dropAllTables(client: AnyDbClient): Promise<void> {
        try {
            const tablesResult = await client.query('SHOW TABLES');
            for (const row of tablesResult.rows) {
                const tableName = row[Object.keys(row)[0]] as string;
                await client.query(`DROP TABLE IF EXISTS \`${tableName}\``);
                migrationLog.push(`Dropped table: ${tableName}`);
            }
        } catch (error) {
            migrationLog.push(`Error dropping tables: ${error.message}`);
            throw error;
        }
    }

    async function logTableStatus(client: AnyDbClient, table: string): Promise<void> {
        try {
            const res = await client.query(`SHOW COLUMNS FROM \`${table}\``);
            migrationLog.push(`Columns in ${table}: ${res.rows.map((r: any) => r.Field).join(', ')}`);
        } catch (err) {
            migrationLog.push(`Table ${table} status: ${(err as Error).message}`);
        }
    }

    async function rollbackMigration(client: AnyDbClient, migrationClass: any, dbName: string): Promise<void> {
        try {
            const instance = new migrationClass();
            await withTenantContext(dbName, async () => {
                await instance.down();
                migrationLog.push(`Rolled back migration on ${dbName}`);
            });
        } catch (error) {
            migrationLog.push(`Rollback failed on ${dbName}: ${error.message}`);
            throw error;
        }
    }

    it('checks master DB, migrates tables, logs migrations, and supports rollback', async () => {
        try {
            migrationLog = []; // Reset log
            const masterClient = await connection.getClient(settings.MASTER_DB);

            try {
                // Check if master DB exists
                const masterDbExists = await checkMasterDb(masterClient);
                if (!masterDbExists) {
                    throw new Error(`Master database ${settings.MASTER_DB} does not exist`);
                }
                migrationLog.push(`Master database ${settings.MASTER_DB} verified`);

                // Reset master DB
                await dropAllTables(masterClient);
                migrationLog.push('Master DB tables dropped');
                await logTableStatus(masterClient, 'tenants');

                if (settings.TENANCY) {
                    // Run tenants migration on master
                    const TenantsMigrationClass = (await import('../../cortex/database/migrations/002_create_todos')).default;
                    const tenantsInstance = new TenantsMigrationClass();
                    await tenantsInstance.up();
                    migrationLog.push('Tenants migration applied on master DB');
                    await logTableStatus(masterClient, 'tenants');

                    // Create default tenant entry
                    await logTableStatus(masterClient, 'tenants');
                    await query(
                        'INSERT IGNORE INTO tenants (tenant_id, database_name) VALUES (?, ?)',
                        [DEFAULT_TENANT_ID, DEFAULT_TENANT_DB],
                        masterClient
                    );
                    migrationLog.push(`Default tenant entry created: ${DEFAULT_TENANT_ID}`);

                    // Create default tenant DB
                    const noDbClient = await connection.getClient('');
                    try {
                        await noDbClient.query(`CREATE DATABASE IF NOT EXISTS \`${DEFAULT_TENANT_DB}\``);
                        migrationLog.push(`Default tenant DB created: ${DEFAULT_TENANT_DB}`);
                    } finally {
                        if (noDbClient.release) noDbClient.release();
                        else if (noDbClient.end) await noDbClient.end();
                    }

                    // Reset and migrate tenant DB
                    const tenantClient = await connection.getClient(DEFAULT_TENANT_DB);
                    try {
                        await dropAllTables(tenantClient);
                        migrationLog.push('Tenant DB tables dropped');

                        const UsersMigrationClass = (await import('../../cortex/database/migrations/001_create_users')).default;
                        const usersInstance = new UsersMigrationClass();
                        await withTenantContext(DEFAULT_TENANT_ID, async () => {
                            await usersInstance.up();
                            migrationLog.push('Users migration applied on tenant DB');
                        });

                        // Rollback tenant DB migration
                        await rollbackMigration(tenantClient, UsersMigrationClass, DEFAULT_TENANT_ID);
                    } finally {
                        if (tenantClient.release) tenantClient.release();
                        else if (tenantClient.end) await tenantClient.end();
                    }

                    // Rollback master DB migration
                    await tenantsInstance.down();
                    migrationLog.push('Tenants migration rolled back on master DB');
                    await logTableStatus(masterClient, 'tenants');
                } else {
                    // Single tenant migration
                    await MigrateRunner.run('up');
                    migrationLog.push('Single tenant migrations applied');

                    // Rollback single tenant migration
                    await MigrateRunner.run('down');
                    migrationLog.push('Single tenant migrations rolled back');
                }

                console.log('Migration log:\n', migrationLog.join('\n'));
            } finally {
                if (masterClient.release) masterClient.release();
                else if (masterClient.end) await masterClient.end();
            }
        } catch (error) {
            console.error('Error in DB operations:', error);
            console.log('Migration log:\n', migrationLog.join('\n'));
            throw error;
        }
    });
});