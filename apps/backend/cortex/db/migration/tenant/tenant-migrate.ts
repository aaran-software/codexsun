// cortex/db/tenant-migrate.ts

import { query, withTransaction } from '../../db';
import * as fs from 'fs/promises';
import * as path from 'path';

// Path to the migration folder for tenant migrations
const MIGRATIONS_DIR = path.resolve(__dirname, '../../../migrations/tenant');

/**
 * Validates required environment variables.
 * @throws Error if DB_NAME is missing.
 */
function validateEnvVariables(): void {
    if (!process.env.DB_NAME) {
        throw new Error('Missing required environment variable: DB_NAME');
    }
}

/**
 * Ensures the tenant database exists, creating it if necessary.
 * @param tenantId - Tenant ID for database operations.
 */
async function ensureTenantDatabase(tenantId: string): Promise<void> {
    try {
        const dbCheck = await query(`SHOW DATABASES LIKE ?`, [process.env.DB_NAME], tenantId);
        if (dbCheck.rowCount === 0) {
            console.warn(`Tenant database '${process.env.DB_NAME}' does not exist. Creating it now.`);
            await query(`CREATE DATABASE \`${process.env.DB_NAME}\``, [], tenantId);
            console.log(`Created tenant database: ${process.env.DB_NAME}`);
        } else {
            console.log(`Tenant database '${process.env.DB_NAME}' already exists.`);
        }
    } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error checking/creating tenant database: ${error.message}`);
        throw error;
    }
}

/**
 * Creates the migrations tracking table in the tenant database.
 * @param tenantId - Tenant ID for database operations.
 */
async function createMigrationsTable(tenantId: string): Promise<void> {
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
            tenantId
        );
        console.log(`Created migrations table for tenant '${tenantId}'`);
    } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error creating migrations table for tenant '${tenantId}': ${error.message}`);
        throw error;
    }
}

/**
 * Retrieves and sorts migration files from the migrations folder.
 * @returns Sorted array of migration file names.
 */
async function getMigrationFiles(): Promise<string[]> {
    try {
        console.log(`Checking migration directory: ${MIGRATIONS_DIR}`);
        await fs.access(MIGRATIONS_DIR);
        const files = await fs.readdir(MIGRATIONS_DIR);
        const migrationFiles = files
            .filter((file) => file.match(/^\d+_.+\.ts$/))
            .sort((a, b) => parseInt(a.split('_')[0], 10) - parseInt(b.split('_')[0], 10));
        console.log(`Found migration files: ${migrationFiles.join(', ') || 'none'}`);
        return migrationFiles;
    } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
            console.log(`Migration directory ${MIGRATIONS_DIR} does not exist, returning empty list`);
            return [];
        }
        console.error(`Error reading migration files: ${error.message}`);
        throw error;
    }
}

/**
 * Applies a single migration for the specified tenant.
 * @param fileName - Name of the migration file.
 * @param tenantId - Tenant ID for database operations.
 */
async function applyMigration(fileName: string, tenantId: string): Promise<void> {
    const migrationName = fileName.replace(/\.ts$/, '');
    console.log(`Checking migration: ${migrationName} for tenant '${tenantId}'`);
    const migrationCheck = await query(`SELECT * FROM migrations WHERE name = ?`, [migrationName], tenantId);
    if (migrationCheck.rowCount === 0) {
        console.log(`Applying migration: ${migrationName} for tenant '${tenantId}'`);
        const migrationPath = path.join(MIGRATIONS_DIR, fileName);
        console.log(`Loading migration from: ${migrationPath}`);
        const migrationModule = require(migrationPath);
        const MigrationClass = Object.values(migrationModule)[0] as new (dbName: string) => { up: () => Promise<void> };
        const migration = new MigrationClass(process.env.DB_NAME!);

        await withTransaction(async (client) => {
            await migration.up();
            await client.query(`INSERT INTO migrations (name) VALUES (?)`, [migrationName]);
        }, tenantId);

        console.log(`Applied migration: ${migrationName} for tenant '${tenantId}'`);
    } else {
        console.log(`Migration ${migrationName} already applied for tenant '${tenantId}'`);
    }
}

/**
 * Drops all tables in the tenant database.
 * @param tenantId - Tenant ID for database operations.
 */
async function dropTenantTables(tenantId: string): Promise<void> {
    try {
        await withTransaction(async (client) => {
            await client.query(`DROP TABLE IF EXISTS todos`);
            await client.query(`DROP TABLE IF EXISTS migrations`);
        }, tenantId);
        console.log(`Dropped all tables for tenant '${tenantId}'`);
    } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error dropping tables for tenant '${tenantId}': ${error.message}`);
        throw error;
    }
}

/**
 * Drops the tenant database.
 * @param tenantId - Tenant ID for database operations.
 */
async function dropTenantDatabase(tenantId: string): Promise<void> {
    try {
        console.log(`Dropping tenant database: ${process.env.DB_NAME}`);
        await query(`DROP DATABASE IF EXISTS \`${process.env.DB_NAME}\``, [], tenantId);
    } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error dropping tenant database ${process.env.DB_NAME}: ${error.message}`);
        throw error;
    }
}

/**
 * Runs the tenant database migration, setting up the database and running migrations.
 * @param tenantId - Tenant ID for database operations (default: "default").
 */
export async function tenantMigrate(tenantId: string = 'default'): Promise<void> {
    console.log(`Starting tenant migration for tenant '${tenantId}'`);
    validateEnvVariables();
    await ensureTenantDatabase(tenantId);
    await createMigrationsTable(tenantId);
    const migrationFiles = await getMigrationFiles();
    for (const fileName of migrationFiles) {
        await applyMigration(fileName, tenantId);
    }
    console.log(`Migration completed for tenant '${tenantId}'`);
}

/**
 * Resets the tenant database by dropping all tables and the database itself.
 * @param tenantId - Tenant ID for database operations (default: "default").
 */
export async function resetTenantDatabase(tenantId: string = 'default'): Promise<void> {
    console.log(`Starting tenant database reset for tenant '${tenantId}'`);
    validateEnvVariables();
    await dropTenantTables(tenantId);
    await dropTenantDatabase(tenantId);
    console.log(`Tenant database reset completed for tenant '${tenantId}'`);
}

/**
 * Executes the specified tenant database operation (migrate or reset).
 * @param operation - The operation to perform ('migrate' or 'reset').
 * @param tenantId - Tenant ID for database operations (default: "default").
 */
export async function executeTenantOperation(operation: 'migrate' | 'reset', tenantId: string = 'default'): Promise<void> {
    try {
        if (operation === 'migrate') {
            await tenantMigrate(tenantId);
        } else if (operation === 'reset') {
            await resetTenantDatabase(tenantId);
        } else {
            throw new Error(`Invalid operation: ${operation}. Use 'migrate' or 'reset'.`);
        }
    } catch (error) {
        console.error(`Tenant ${operation} failed for tenant '${tenantId}':`, (error as Error).message);
        throw error;
    }
}

// Execute based on command-line argument
if (require.main === module) {
    const operation = process.argv[2] as 'migrate' | 'reset';
    executeTenantOperation(operation).then(() => process.exit(0)).catch(() => process.exit(1));
}