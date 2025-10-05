// E:\Workspace\codexsun\apps\backend\cortex\migration\migration-initializer.ts
import { Connection } from '../db/connection';
import { getDbConfig } from '../config/db-config';
import { MigrateRunner } from './migrate-runner';

export async function initializeAndRunMigrations(): Promise<void> {
    console.log('Starting migration-initializer.ts');
    const config = getDbConfig();

    // Initialize Connection
    console.log('Initializing database connection');
    await Connection.initialize(config); // Assuming Connection has an initialize method

    const conn = Connection.getInstance();

    // Log database driver and connection details
    console.log(`Database Driver: ${config.type}`);
    console.log(`Connection Credentials:`);
    console.log(`  Host: ${config.host}`);
    console.log(`  Port: ${config.port}`);
    console.log(`  User: ${config.user}`);
    console.log(`  Password: ${config.password ? '[hidden]' : 'none'}`);
    console.log(`  SSL: ${config.ssl ? 'Enabled' : 'Disabled'}`);

    // Run migrations for tenant_1
    try {
        console.log('Starting migrations for tenant_1');
        await MigrateRunner.run('up', 'tenant_1');
        console.log('Successfully completed migrations for tenant_1');
    } catch (error) {
        console.error(`Failed to run migrations for tenant_1: ${(error as Error).message}`);
        throw error;
    }
}

// Execute the function
initializeAndRunMigrations().catch((error) => {
    console.error('Migration initializer failed:', (error as Error).message);
    process.exit(1);
});