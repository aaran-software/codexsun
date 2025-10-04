import { BaseMigration } from './base-migration';
import { query, withTenantContext } from '../db/db';

export class MigrateRunner {
    // Check if a migration has already been executed
    private static async hasMigrationRun(migrationName: string, tenantId: string = 'default'): Promise<boolean> {
        try {
            return await withTenantContext(tenantId, async () => {
                const result = await query(
                    'SELECT migration_name FROM migrations WHERE migration_name = ?',
                    [migrationName]
                );
                return result.rows.length > 0;
            });
        } catch (error) {
            // If the migrations table doesn't exist yet, assume migration hasn't run
            if ((error as Error).message.includes('migrations')) {
                return false;
            }
            throw error;
        }
    }

    // Record a migration as executed
    private static async recordMigration(migrationName: string, tenantId: string = 'default'): Promise<void> {
        await withTenantContext(tenantId, async () => {
            await query(
                'INSERT INTO migrations (migration_name) VALUES (?)',
                [migrationName]
            );
        });
    }

    // Run all migrations in the specified direction
    static async run(direction: 'up' | 'down', tenantId: string = 'default'): Promise<void> {
        try {
            const migrations = await BaseMigration.getAllMigrations();
            console.log(`Found ${migrations.length} migrations: ${migrations.map(m => m.name).join(', ')}`);

            // Ensure system migration runs first for 'up' direction
            if (direction === 'up') {
                migrations.sort((a, b) => {
                    if (a.name === 'SystemMigration') return -1;
                    if (b.name === 'SystemMigration') return 1;
                    return a.name.localeCompare(b.name);
                });
            }

            for (const migration of migrations) {
                const hasRun = direction === 'up' ? await this.hasMigrationRun(migration.name, tenantId) : false;
                if (direction === 'up' && hasRun) {
                    console.log(`Skipping already executed migration: ${migration.name}`);
                    continue;
                }

                console.log(`Executing ${direction} migration: ${migration.name}`);
                try {
                    await withTenantContext(tenantId, async () => {
                        if (direction === 'up') {
                            await migration.up();
                            await this.recordMigration(migration.name, tenantId);
                        } else {
                            await migration.down();
                            await query(
                                'DELETE FROM migrations WHERE migration_name = ?',
                                [migration.name]
                            );
                        }
                    });
                    console.log(`Successfully executed ${direction} migration: ${migration.name}`);
                } catch (error) {
                    console.error(`Failed to execute ${direction} migration ${migration.name}: ${(error as Error).message}`);
                    throw error; // Stop on first error
                }
            }
            console.log(`All migrations executed successfully for direction: ${direction}`);
        } catch (error) {
            console.error(`Migration runner failed: ${(error as Error).message}`);
            throw error;
        }
    }
}