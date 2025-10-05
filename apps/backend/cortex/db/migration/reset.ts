// E:\Workspace\codexsun\apps\backend\cortex\database\reset.ts
import { query } from '../mdb';
import { Connection } from '../connection';
import { getDbConfig } from '../../config/db-config';

export async function resetDatabase(): Promise<void> {
    console.log('Starting database reset');

    const config = getDbConfig();

    // Initialize Connection
    console.log('Initializing database connection');
    await Connection.initialize(config);

    const conn = Connection.getInstance();

    // Log database driver and connection details
    console.log(`Database Driver: ${config.type}`);
    console.log(`Connection Credentials:`);
    console.log(`  Host: ${config.host}`);
    console.log(`  Port: ${config.port}`);
    console.log(`  User: ${config.user}`);
    console.log(`  Password: ${config.password ? '[hidden]' : 'none'}`);
    console.log(`  SSL: ${config.ssl ? 'Enabled' : 'Disabled'}`);

    // Validate environment variables
    const masterDb = process.env.MASTER_DB_NAME || 'master_db';
    const defaultDbName = process.env.DEFAULT_TENANT_DB || 'tenant_db';

    if (!masterDb || !defaultDbName) {
        throw new Error('Missing required environment variables: MASTER_DB_NAME or DEFAULT_TENANT_DB');
    }

    // Drop tenant databases
    try {
        const tenantsResult = await query(`SELECT db_name FROM tenants`, [], masterDb);
        const tenantDbs: string[] = tenantsResult.rows.map((row: any) => row.db_name);
        console.log(`Found tenant databases: ${tenantDbs.join(', ')}`);

        for (const tenantDb of tenantDbs) {
            console.log(`Dropping database: ${tenantDb}`);
            await query(`DROP DATABASE IF EXISTS \`${tenantDb}\``, [], masterDb);
        }
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error dropping tenant databases: ${error.message}`);
        throw error;
    }

    // Drop tenants and migrations tables in master_db
    try {
        await query('BEGIN', [], masterDb);
        await query(`DROP TABLE IF EXISTS tenants`, [], masterDb);
        await query(`DROP TABLE IF EXISTS migrations`, [], masterDb);
        await query('COMMIT', [], masterDb);
        console.log('Dropped tenants and migrations tables in master_db');
    } catch (err: unknown) {
        await query('ROLLBACK', [], masterDb);
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error dropping tables in master_db: ${error.message}`);
        throw error;
    }

    // Close connection
    await conn.close();
    console.log('Database connection closed');
    console.log('Database reset completed');
}

resetDatabase().catch((error) => {
    console.error('Database reset failed:', error.message);
    Connection.getInstance()
        .close()
        .then(() => {
            console.log('Database connection closed due to error');
            process.exit(1);
        })
        .catch((closeError) => {
            console.error('Error closing connection:', closeError.message);
            process.exit(1);
        });
}).then(() => {
    process.exit(0);
});