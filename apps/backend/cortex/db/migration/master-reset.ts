// E:\Workspace\codexsun\apps\backend\cortex\database\master-reset.ts
import { query } from '../mdb';
import { Connection } from '../connection';
import { getDbConfig } from '../../config/db-config';

export async function resetMasterDatabase(): Promise<void> {
    console.log('Starting master database reset');

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

    if (!masterDb) {
        throw new Error('Missing required environment variable: MASTER_DB_NAME');
    }

    // Drop master database tables
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

    // Drop master database
    try {
        console.log(`Dropping master database: ${masterDb}`);
        await query(`DROP DATABASE IF EXISTS \`${masterDb}\``, [], config.database);
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error dropping master database ${masterDb}: ${error.message}`);
        throw error;
    }

    // Close connection
    await conn.close();
    console.log('Database connection closed');
    console.log('Master database reset completed');
}

resetMasterDatabase().catch((error) => {
    console.error('Master database reset failed:', error.message);
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