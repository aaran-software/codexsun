import { query, tenantStorage } from '../../db';
import { Connection } from '../../connection';
import { getDbConfig } from '../../../config/db-config';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Name of the master database.
 */
const MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

/**
 * Path to the tenant migrations folder.
 */
const MIGRATIONS_DIR = path.resolve(__dirname, '../../../migrations/tenant');

/**
 * Validates required environment variables.
 * @throws Error if required environment variables are missing.
 */
const validateEnvVariables = (): void => {
    if (!MASTER_DB) {
        throw new Error('Missing required environment variable: MASTER_DB_NAME');
    }
};

/**
 * Logs database connection details.
 * @param config - Database configuration.
 */
const logConnectionDetails = (config: ReturnType<typeof getDbConfig>): void => {
    console.log(`Database Driver: ${config.type}`);
    console.log('Connection Credentials:');
    console.log(`  Host: ${config.host}`);
    console.log(`  Port: ${config.port}`);
    console.log(`  User: ${config.user}`);
    console.log(`  Password: ${config.password ? '[hidden]' : 'none'}`);
    console.log(`  SSL: ${config.ssl ? 'Enabled' : 'Disabled'}`);
};

/**
 * Initializes database connection.
 * @param config - Database configuration.
 * @returns Initialized Connection instance.
 */
const initializeConnection = async (config: ReturnType<typeof getDbConfig>): Promise<Connection> => {
    console.log('Initializing database connection');
    await Connection.initialize(config);
    return Connection.getInstance();
};

/**
 * Creates a tenant database if it does not exist.
 * @param tenantDb - The tenant database name.
 */
const ensureTenantDatabase = async (tenantDb: string): Promise<void> => {
    try {
        const dbCheck = await query(`SHOW DATABASES LIKE ?`, [tenantDb]);
        if (dbCheck.rowCount === 0) {
            console.warn(`Tenant database '${tenantDb}' does not exist. Creating it now.`);
            await query(`CREATE DATABASE \`${tenantDb}\``, []);
            console.log(`Created tenant database: ${tenantDb}`);
        } else {
            console.log(`Tenant database '${tenantDb}' already exists.`);
        }
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error checking/creating tenant database ${tenantDb}: ${error.message}`);
        throw error;
    }
};

/**
 * Retrieves tenant databases from the master database.
 * @returns Array of tenant database names.
 */
const getTenantDbs = async (): Promise<string[]> => {
    try {
        const tenantsResult = await tenantStorage.run(MASTER_DB, () =>
            query(`SELECT db_name FROM tenants`, [])
        );
        const tenantDbs = tenantsResult.rows.map((row: any) => row.db_name);
        console.log(`Found tenant databases: ${tenantDbs.join(', ') || 'none'}`);
        return tenantDbs;
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error retrieving tenant databases: ${error.message}`);
        throw error;
    }
};

/**
 * Creates the migrations tracking table in a tenant database.
 * @param tenantDb - The tenant database name.
 */
const createMigrationsTable = async (tenantDb: string): Promise<void> => {
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
};

/**
 * Retrieves and sorts migration files from the migrations folder.
 * @returns Sorted array of migration file names.
 */
const getMigrationFiles = async (): Promise<string[]> => {
    try {
        await fs.access(MIGRATIONS_DIR); // Check if directory exists
        const files = await fs.readdir(MIGRATIONS_DIR);
        const migrationFiles = files
            .filter((file) => file.match(/^\d+_.+\.ts$/))
            .sort((a, b) => {
                const aTimestamp = parseInt(a.split('_')[0], 10);
                const bTimestamp = parseInt(b.split('_')[0], 10);
                return aTimestamp - bTimestamp;
            });
        console.log(`Found migration files: ${migrationFiles.join(', ') || 'none'}`);
        return migrationFiles;
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
            console.log(`No migration files found in ${MIGRATIONS_DIR}, skipping migrations`);
            return [];
        }
        console.error(`Error reading migration files: ${error.message}`);
        throw error;
    }
};

/**
 * Applies a single migration to a tenant database.
 * @param fileName - Name of the migration file.
 * @param tenantDb - The tenant database name.
 */
const applyMigration = async (fileName: string, tenantDb: string): Promise<void> => {
    const migrationName = fileName.replace(/\.ts$/, '');
    const migrationCheck = await tenantStorage.run(tenantDb, () =>
        query(`SELECT * FROM migrations WHERE name = ?`, [migrationName])
    );
    if (migrationCheck.rowCount === 0) {
        const migrationPath = path.join(MIGRATIONS_DIR, fileName);
        const migrationModule = await import(`file://${migrationPath.replace(/\\/g, '/')}`);
        const MigrationClass = Object.values(migrationModule)[0] as new (dbName: string) => { up: () => Promise<void> };
        const migration = new MigrationClass(tenantDb);
        await tenantStorage.run(tenantDb, () => query('BEGIN', []));
        try {
            await migration.up();
            await tenantStorage.run(tenantDb, () =>
                query(`INSERT INTO migrations (name) VALUES (?)`, [migrationName])
            );
            await tenantStorage.run(tenantDb, () => query('COMMIT', []));
            console.log(`Applied migration ${migrationName} on ${tenantDb}`);
        } catch (err: unknown) {
            await tenantStorage.run(tenantDb, () => query('ROLLBACK', []));
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error running migration ${migrationName} on ${tenantDb}: ${error.message}`, {
                sql: (err instanceof Error && 'sql' in err) ? err.sql : 'unknown',
            });
            throw error;
        }
    } else {
        console.log(`Migration ${migrationName} already applied on ${tenantDb}`);
    }
};

/**
 * Drops all tables in a tenant database.
 * @param tenantDb - The tenant database name.
 */
const dropTenantTables = async (tenantDb: string): Promise<void> => {
    try {
        await tenantStorage.run(tenantDb, () => query('BEGIN', []));
        await tenantStorage.run(tenantDb, () => query(`DROP TABLE IF EXISTS users`, []));
        await tenantStorage.run(tenantDb, () => query(`DROP TABLE IF EXISTS todos`, []));
        await tenantStorage.run(tenantDb, () => query(`DROP TABLE IF EXISTS migrations`, []));
        await tenantStorage.run(tenantDb, () => query('COMMIT', []));
        console.log(`Dropped tables in ${tenantDb}`);
    } catch (err: unknown) {
        await tenantStorage.run(tenantDb, () => query('ROLLBACK', []));
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error dropping tables in ${tenantDb}: ${error.message}`);
        throw error;
    }
};

/**
 * Drops a tenant database.
 * @param tenantDb - The tenant database name.
 */
const dropTenantDatabase = async (tenantDb: string): Promise<void> => {
    try {
        console.log(`Dropping tenant database: ${tenantDb}`);
        await query(`DROP DATABASE IF EXISTS \`${tenantDb}\``, []);
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error dropping tenant database ${tenantDb}: ${error.message}`);
        throw error;
    }
};

/**
 * Runs the tenant database migration, running all migrations on each tenant database.
 */
export async function tenantMigrate(): Promise<void> {
    console.log('Starting tenant migration');
    const config = getDbConfig();
    validateEnvVariables();
    logConnectionDetails(config);
    const conn = await initializeConnection(config);
    try {
        const tenantDbs = await getTenantDbs();
        if (tenantDbs.length === 0) {
            console.log('No tenant databases to migrate');
            return;
        }
        const migrationFiles = await getMigrationFiles();
        if (migrationFiles.length === 0) {
            console.log('No migration files to apply');
            return;
        }
        for (const tenantDb of tenantDbs) {
            await ensureTenantDatabase(tenantDb);
            await createMigrationsTable(tenantDb);
            for (const fileName of migrationFiles) {
                await applyMigration(fileName, tenantDb);
            }
            console.log(`Migrations completed for tenant database: ${tenantDb}`);
        }
    } finally {
        await conn.close();
        console.log('Database connection closed');
    }
}

/**
 * Resets all tenant databases by dropping all tables and the databases themselves.
 */
export async function resetTenantDatabase(): Promise<void> {
    console.log('Starting tenant database reset');
    const config = getDbConfig();
    validateEnvVariables();
    logConnectionDetails(config);
    const conn = await initializeConnection(config);
    try {
        const tenantDbs = await getTenantDbs();
        if (tenantDbs.length === 0) {
            console.log('No tenant databases to reset');
            return;
        }
        for (const tenantDb of tenantDbs) {
            await dropTenantTables(tenantDb);
            await dropTenantDatabase(tenantDb);
        }
        console.log('Tenant databases reset completed');
    } finally {
        await conn.close();
        console.log('Database connection closed');
    }
}

/**
 * Executes the specified tenant database operation (migrate or reset).
 * @param operation - The operation to perform ('migrate' or 'reset').
 */
export async function executeTenantOperation(operation: 'migrate' | 'reset'): Promise<void> {
    try {
        if (operation === 'migrate') {
            await tenantMigrate();
        } else if (operation === 'reset') {
            await resetTenantDatabase();
        } else {
            throw new Error(`Invalid operation: ${operation}. Use 'migrate' or 'reset'.`);
        }
    } catch (error) {
        console.error(`${operation === 'migrate' ? 'Tenant migration' : 'Tenant database reset'} failed:`, (error as Error).message);
        throw error;
    }
}

// Execute based on command-line argument
if (require.main === module) {
    const operation = process.argv[2] as 'migrate' | 'reset';
    executeTenantOperation(operation).then(() => process.exit(0)).catch(() => process.exit(1));
}