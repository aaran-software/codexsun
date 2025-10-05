// E:\Workspace\codexsun\apps\backend\cortex\database\migrate.ts
// WARNING: Ensure the master database exists before running migrations. If it does not exist, create it manually using SQL: CREATE DATABASE master_db;

import { query } from '../mdb';
import { Connection } from '../connection';
import { CreateTenantsMigration } from '../../migrations/master/001_create_tenants';
import { CreateUsersMigration } from '../../migrations/tenant/001_create_users';
import { CreateTodosMigration } from '../../migrations/tenant/002_create_todos';
import { getDbConfig } from '../../config/db-config';

export async function migrate(): Promise<void> {
    console.log('Starting migration-initializer.ts');
    const config = getDbConfig();

    // Initialize Connection without specific database to allow creation
    console.log('Initializing database connection');
    const initConfig = { ...config, database: '' };
    await Connection.initialize(initConfig);

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
    const defaultDbHost = process.env.DB_HOST || 'localhost';
    const defaultDbPort = process.env.DB_PORT || '3306'; // MariaDB default
    const defaultDbUser = process.env.DB_USER || 'root';
    const defaultDbPass = process.env.DB_PASS || '';
    const defaultDbSsl = process.env.DB_SSL || 'false';

    if (!masterDb || !defaultDbName || !defaultDbUser) {
        throw new Error('Missing required environment variables: MASTER_DB_NAME, DEFAULT_TENANT_DB, or DB_USER');
    }

    // Check if master_db exists, create if not
    try {
        const dbCheck = await query(`SHOW DATABASES LIKE ?`, [masterDb]);
        if (dbCheck.rowCount === 0) {
            console.warn(`Master database '${masterDb}' does not exist. Creating it now.`);
            await query(`CREATE DATABASE \`${masterDb}\``, []);
            console.log(`Created master database: ${masterDb}`);
        } else {
            console.log(`Master database '${masterDb}' already exists.`);
        }
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error checking/creating master database: ${error.message}`);
        throw error;
    }

    const defaultTenantId = 'default';

    // Create migrations tracking table in master_db
    try {
        await query(
            `
                CREATE TABLE IF NOT EXISTS migrations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL UNIQUE,
                    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `,
            [],
            masterDb
        );
        console.log('Created migrations table in master_db');
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error('Error creating migrations table in master_db:', error.message);
        throw error;
    }

    // Check and run CreateTenantsMigration
    const tenantsMigrationName = '001_create_tenants';
    const tenantsCheck = await query(`SELECT * FROM migrations WHERE name = ?`, [tenantsMigrationName], masterDb);
    if (tenantsCheck.rowCount === 0) {
        const tenantsMigration = new CreateTenantsMigration(masterDb);
        await query('BEGIN', [], masterDb);
        try {
            await tenantsMigration.up();
            await query(`INSERT INTO migrations (name) VALUES (?)`, [tenantsMigrationName], masterDb);
            await query('COMMIT', [], masterDb);
            console.log('Applied tenants migration');
        } catch (err: unknown) {
            await query('ROLLBACK', [], masterDb);
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error running tenants migration: ${error.message}`, { sql: tenantsMigrationName });
            throw error;
        }
    } else {
        console.log('Tenants migration already applied');
    }

    // Check and insert default tenant
    const tenantsCheck2 = await query(`SELECT * FROM tenants WHERE tenant_id = ?`, [defaultTenantId], masterDb);
    if (tenantsCheck2.rowCount === 0) {
        await query('BEGIN', [], masterDb);
        try {
            await query(
                `INSERT INTO tenants (tenant_id, db_host, db_port, db_user, db_pass, db_name, db_ssl) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [defaultTenantId, defaultDbHost, defaultDbPort, defaultDbUser, defaultDbPass, defaultDbName, defaultDbSsl],
                masterDb
            );
            const createDbSql = `CREATE DATABASE IF NOT EXISTS \`${defaultDbName}\``;
            await query(createDbSql, [], masterDb);
            await query(`INSERT INTO migrations (name) VALUES (?)`, [`tenant_${defaultDbName}_init`], masterDb);
            await query('COMMIT', [], masterDb);
            console.log(`Created default tenant and database: ${defaultDbName}`);
        } catch (err: unknown) {
            await query('ROLLBACK', [], masterDb);
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error creating default tenant or database ${defaultDbName}: ${error.message}`, {
                sql: err.sql || 'unknown',
            });
            throw error;
        }
    } else {
        console.log('Default tenant already exists');
    }

    // Retrieve tenant databases
    const tenantsResult = await query(`SELECT db_name FROM tenants`, [], masterDb);
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
            await query(
                `
                    CREATE TABLE IF NOT EXISTS migrations (
                                                              id INT AUTO_INCREMENT PRIMARY KEY,
                                                              name VARCHAR(255) NOT NULL UNIQUE,
                        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                `,
                [],
                tenantDb
            );
            console.log(`Created migrations table in ${tenantDb}`);
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error creating migrations table in ${tenantDb}: ${error.message}`);
            throw error;
        }

        for (const { name, cls } of tenantMigrationClasses) {
            const migrationCheck = await query(`SELECT * FROM migrations WHERE name = ?`, [name], tenantDb);
            if (migrationCheck.rowCount === 0) {
                const migration = new cls(tenantDb);
                await query('BEGIN', [], tenantDb);
                try {
                    await migration.up();
                    await query(`INSERT INTO migrations (name) VALUES (?)`, [name], tenantDb);
                    await query('COMMIT', [], tenantDb);
                    console.log(`Applied ${name} on ${tenantDb}`);
                } catch (err: unknown) {
                    await query('ROLLBACK', [], tenantDb);
                    const error = err instanceof Error ? err : new Error('Unknown error');
                    console.error(`Error running migration ${name} on ${tenantDb}: ${error.message}`, {
                        sql: err.sql || 'unknown',
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

migrate().catch((error) => {
    console.error('Migration initializer failed:', error.message);
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