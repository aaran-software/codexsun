import { BaseMigration } from './base-migration';

export class MigrateRunner {
    // Run all migrations in the specified direction
    static async run(direction: 'up' | 'down'): Promise<void> {
        try {
            const migrations = await BaseMigration.getAllMigrations();
            console.log(`Found ${migrations.length} migrations: ${migrations.map(m => m.name).join(', ')}`);

            for (const migration of migrations) {
                console.log(`Executing ${direction} migration: ${migration.name}`);
                try {
                    if (direction === 'up') {
                        await migration.up();
                    } else {
                        await migration.down();
                    }
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