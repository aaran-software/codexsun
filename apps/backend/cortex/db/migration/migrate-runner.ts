// E:\Workspace\codexsun\apps\backend\cortex\database\migrations\migrate-runner.ts
import { BaseMigration } from './base-migration';
import { query } from '../db/mdb';
import { Connection } from '../db/connection';
import { getDbConfig } from '../config/db-config';

const MASTER_DB = 'master_db';
const TENANT_1_DB = 'tenant_1_db';

export class MigrateRunner {
    private static async hasMigrationRun(migrationName: string): Promise<boolean> {
        const conn = Connection.getInstance();
        const client = await conn.getClient(TENANT_1_DB);
        try {
            const result = await query(
                'SELECT migration_name FROM migrations WHERE migration_name = ?',
                [migrationName]
            );
            return result.rows.length > 0;
        } catch (error) {
            if ((error as Error).message.includes('migrations')) {
                return false;
            }
            throw error;
        } finally {
            if (client.release) client.release();
            else if (client.end) await client.end();
        }
    }

    private static async recordMigration(migrationName: string): Promise<void> {
        const conn = Connection.getInstance();
        const client = await conn.getClient(TENANT_1_DB);
        try {
            await query(
                'INSERT INTO migrations (migration_name) VALUES (?)',
                [migrationName]
            );
        } finally {
            if (client.release) client.release();
            else if (client.end) await client.end();
        }
    }

    static async run(direction: 'up' | 'down'): Promise<void> {
        try {
            const migrations = await BaseMigration.getAllMigrations();
            console.log(`Found ${migrations.length} migrations: ${migrations.map(m => m.name).join(', ') || 'none'}`);
            if (migrations.length === 0) {
                console.log('No migrations to execute');
                return;
            }

            if (direction === 'up') {
                migrations.sort((a, b) => {
                    if (a.name === 'system_migration') return -1;
                    if (b.name === 'system_migration') return 1;
                    return a.name.localeCompare(b.name);
                });
            }

            for (const migration of migrations) {
                const hasRun = direction === 'up' ? await this.hasMigrationRun(migration.name) : false;
                if (direction === 'up' && hasRun) {
                    console.log(`Skipping already executed migration: ${migration.name}`);
                    continue;
                }

                console.log(`Executing ${direction} migration: ${migration.name}`);
                try {
                    const conn = Connection.getInstance();
                    const client = await conn.getClient(TENANT_1_DB);
                    try {
                        if (direction === 'up') {
                            await migration.up();
                            await this.recordMigration(migration.name);
                        } else {
                            await migration.down();
                            await query(
                                'DELETE FROM migrations WHERE migration_name = ?',
                                [migration.name]
                            );
                        }
                        console.log(`Successfully executed ${direction} migration: ${migration.name}`);
                    } finally {
                        if (client.release) client.release();
                        else if (client.end) await client.end();
                    }
                } catch (error) {
                    console.error(`Failed to execute ${direction} migration ${migration.name}: ${(error as Error).message}`);
                    throw error;
                }
            }
            console.log(`All migrations executed successfully for direction: ${direction}`);
        } catch (error) {
            console.error(`Migration runner failed: ${(error as Error).message}`);
            throw error;
        }
    }
}