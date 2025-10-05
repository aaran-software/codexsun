import { query, tenantStorage } from '../../db';
import { Connection } from '../../connection';
import { CreateUsersMigration } from '../../../migrations/tenant/001_create_users';
import { CreateTodosMigration } from '../../../migrations/tenant/002_create_todos';
import { getDbConfig } from '../../../config/db-config';

export async function tenantMigrate(): Promise<void> {
    console.log('Starting tenant migration');
    const config = getDbConfig();

    // Initialize Connection
    console.log('Initializing database connection');
    await Connection.initialize(config);

    const conn = Connection.getInstance();
    const masterDb = process.env.MASTER_DB_NAME || 'master_db';

    // Retrieve tenant databases
    const tenantsResult = await tenantStorage.run(masterDb, () =>
        query(`SELECT db_name FROM tenants`, [])
    );
    const tenantDbs: string[] = tenantsResult.rows.map((row: any) => row.db_name);
    console.log(`Found tenant databases: ${tenantDbs.join(', ')}`);

    // Run tenant migrations with tracking
    const tenantMigrationClasses = [
        { name: '001_create_users', cls: CreateUsersMigration },
        { name: '002_create_todos', cls: CreateTodosMigration },
    ];

    for (const tenantDb of tenantDbs) {
        console.log(`Running migrations on tenant database: ${tenantDb}`);
        // Ensure migrations table exists in tenant database
        try {
            await tenantStorage.run(tenantDb, () =>
                query(
                    `
                        CREATE TABLE IF NOT EXISTS migrations (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(255) NOT NULL UNIQUE,
                            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                    `,
                    []
                )
            );
            console.log(`Created migrations table in ${tenantDb}`);
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error creating migrations table in ${tenantDb}: ${error.message}`);
            throw error;
        }

        for (const { name, cls } of tenantMigrationClasses) {
            const migrationCheck = await tenantStorage.run(tenantDb, () =>
                query(`SELECT * FROM migrations WHERE name = ?`, [name])
            );
            if (migrationCheck.rowCount === 0) {
                const migration = new cls(tenantDb);
                await tenantStorage.run(tenantDb, () => query('BEGIN', []));
                try {
                    await migration.up();
                    await tenantStorage.run(tenantDb, () =>
                        query(`INSERT INTO migrations (name) VALUES (?)`, [name])
                    );
                    await tenantStorage.run(tenantDb, () => query('COMMIT', []));
                    console.log(`Applied ${name} on ${tenantDb}`);
                } catch (err: unknown) {
                    await tenantStorage.run(tenantDb, () => query('ROLLBACK', []));
                    const error = err instanceof Error ? err : new Error('Unknown error');
                    console.error(`Error running migration ${name} on ${tenantDb}: ${error.message}`, {
                        sql: (err instanceof Error && 'sql' in err) ? err.sql : 'unknown',
                    });
                    throw error;
                }
            } else {
                console.log(`Migration ${name} already applied on ${tenantDb}`);
            }
        }
        console.log(`Migrations completed for tenant database: ${tenantDb}`);
    }

    // Close connection
    await conn.close();
    console.log('Database connection closed');
}

tenantMigrate().catch((error) => {
    console.error('Tenant migration failed:', error.message);
    Connection.getInstance()
        .close()
        .then(() => {
            console.log('Database connection closed due to error');
            process.exit(1);
        })
        .catch((closeError: { message: any }) => {
            console.error('Error closing connection:', closeError.message);
            process.exit(1);
        });
}).then(() => {
    process.exit(0);
});