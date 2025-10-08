import { query } from '../../mdb';
import { Connection } from '../../connection';
import { getDbConfig } from '../../../config/db-config';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Name of the master database.
 */
const MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

/**
 * Path to the master migration folder.
 */
const MIGRATIONS_DIR = path.resolve(__dirname, '../../../migrations/master');

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
 * @param noDb - Whether to initialize without a specific database.
 * @returns Initialized Connection instance.
 */
const initializeConnection = async (config: ReturnType<typeof getDbConfig>, noDb: boolean = false): Promise<Connection> => {
    console.log('Initializing database connection');
    const initConfig = noDb ? { ...config, database: '' } : config;
    await Connection.initialize(initConfig);
    return Connection.getInstance();
};

/**
 * Ensures the master database exists, creating it if necessary.
 */
const ensureMasterDatabase = async (): Promise<void> => {
    try {
        const dbCheck = await query(`SHOW DATABASES LIKE ?`, [MASTER_DB], '');
        if (dbCheck.rowCount === 0) {
            console.warn(`Master database '${MASTER_DB}' does not exist. Creating it now.`);
            await query(`CREATE DATABASE \`${MASTER_DB}\``, [], '');
            console.log(`Created master database: ${MASTER_DB}`);
        } else {
            console.log(`Master database '${MASTER_DB}' already exists.`);
        }
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error checking/creating master database: ${error.message}`);
        throw error;
    }
};

/**
 * Creates the migrations tracking table in the master database.
 */
const createMigrationsTable = async (): Promise<void> => {
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
            MASTER_DB
        );
        console.log('Created migrations table in master_db');
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error('Error creating migrations table in master_db:', error.message);
        throw error;
    }
};

/**
 * Retrieves and sorts migration files from the migrations folder.
 * @returns Sorted array of migration file names.
 */
const getMigrationFiles = async (): Promise<string[]> => {
    try {
        console.log(`Checking migration directory: ${MIGRATIONS_DIR}`);
        await fs.access(MIGRATIONS_DIR);
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
            console.log(`Migration directory ${MIGRATIONS_DIR} does not exist, returning empty list`);
            return [];
        }
        console.error(`Error reading migration files: ${error.message}`);
        throw error;
    }
};

/**
 * Applies a single migration.
 * @param fileName - Name of the migration file.
 */
const applyMigration = async (fileName: string): Promise<void> => {
    const migrationName = fileName.replace(/\.ts$/, '');
    console.log(`Checking migration: ${migrationName}`);
    const migrationCheck = await query(`SELECT * FROM migrations WHERE name = ?`, [migrationName], MASTER_DB);
    if (migrationCheck.rowCount === 0) {
        console.log(`Applying migration: ${migrationName}`);
        const migrationPath = path.join(MIGRATIONS_DIR, fileName);
        console.log(`Loading migration from: ${migrationPath}`);
        const migrationModule = require(migrationPath);
        const MigrationClass = Object.values(migrationModule)[0] as new (dbName: string) => { up: () => Promise<void> };
        const migration = new MigrationClass(MASTER_DB);
        await query('BEGIN', [], MASTER_DB);
        try {
            await migration.up();
            await query(`INSERT INTO migrations (name) VALUES (?)`, [migrationName], MASTER_DB);
            await query('COMMIT', [], MASTER_DB);
            console.log(`Applied migration: ${migrationName}`);
        } catch (err: unknown) {
            await query('ROLLBACK', [], MASTER_DB);
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error running migration ${migrationName}: ${error.message}`, {
                sql: (err as any).sql || 'unknown',
            });
            throw error;
        }
    } else {
        console.log(`Migration ${migrationName} already applied`);
    }
};

/**
 * Drops all tables in the master database.
 */
const dropMasterTables = async (): Promise<void> => {
    try {
        await query('BEGIN', [], MASTER_DB);
        // Drop tenant_users first due to FK dependency
        await query(`DROP TABLE IF EXISTS user_sessions`, [], MASTER_DB);
        await query(`DROP TABLE IF EXISTS permissions`, [], MASTER_DB);
        await query(`DROP TABLE IF EXISTS tenant_users`, [], MASTER_DB);
        await query(`DROP TABLE IF EXISTS users`, [], MASTER_DB);
        await query(`DROP TABLE IF EXISTS roles`, [], MASTER_DB);
        await query(`DROP TABLE IF EXISTS tenants`, [], MASTER_DB);
        await query(`DROP TABLE IF EXISTS migrations`, [], MASTER_DB);
        await query('COMMIT', [], MASTER_DB);
        console.log('Dropped tenant_users, tenants, and migrations tables in master_db');
    } catch (err: unknown) {
        await query('ROLLBACK', [], MASTER_DB);
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error dropping tables in master_db: ${error.message}`);
        throw error;
    }
};

/**
 * Drops the master database.
 */
const dropMasterDatabase = async (): Promise<void> => {
    try {
        console.log(`Dropping master database: ${MASTER_DB}`);
        await query(`DROP DATABASE IF EXISTS \`${MASTER_DB}\``, [], '');
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error dropping master database ${MASTER_DB}: ${error.message}`);
        throw error;
    }
};

/**
 * Runs the master database migration, setting up the master database and running all migrations.
 */
export async function masterMigrate(): Promise<void> {
    console.log('Starting master migration');
    const config = getDbConfig();
    validateEnvVariables();
    logConnectionDetails(config);
    const conn = await initializeConnection(config, true);
    try {
        await ensureMasterDatabase();
        await createMigrationsTable();
        const migrationFiles = await getMigrationFiles();
        for (const fileName of migrationFiles) {
            await applyMigration(fileName);
        }
    } finally {
        await conn.close();
        console.log('Database connection closed');
    }
}

/**
 * Resets the master database by dropping all tables and the database itself.
 */
export async function resetMasterDatabase(): Promise<void> {
    console.log('Starting master database reset');
    const config = getDbConfig();
    validateEnvVariables();
    logConnectionDetails(config);
    const conn = await initializeConnection(config);
    try {
        await dropMasterTables();
        await dropMasterDatabase();
        console.log('Master database reset completed');
    } finally {
        await conn.close();
        console.log('Database connection closed');
    }
}

/**
 * Executes the specified master database operation (migrate or reset).
 * @param operation - The operation to perform ('migrate' or 'reset').
 */
export async function executeMasterOperation(operation: 'migrate' | 'reset'): Promise<void> {
    try {
        if (operation === 'migrate') {
            await masterMigrate();
        } else if (operation === 'reset') {
            await resetMasterDatabase();
        } else {
            throw new Error(`Invalid operation: ${operation}. Use 'migrate' or 'reset'.`);
        }
    } catch (error) {
        console.error(`${operation === 'migrate' ? 'Master migration' : 'Master database reset'} failed:`, (error as Error).message);
        try {
            await Connection.getInstance().close();
            console.log('Database connection closed due to error');
        } catch (closeError) {
            console.error('Error closing connection:', (closeError as Error).message);
        }
        throw error;
    }
}

// Execute based on command-line argument
if (require.main === module) {
    const operation = process.argv[2] as 'migrate' | 'reset';
    executeMasterOperation(operation).then(() => process.exit(0)).catch(() => process.exit(1));
}