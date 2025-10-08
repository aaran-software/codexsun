// E:\Workspace\codexsun\apps\backend\cortex\db\migration\tenant\tenant-migrate.ts
import { query, tenantStorage, withTransaction } from '../../db';
import { Connection } from '../../connection';
import { getPrimaryDbConfig } from '../../../config/db-config';
import * as fs from 'fs/promises';
import * as path from 'path';

const MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';
const MIGRATIONS_DIR = path.resolve(__dirname, '../../../migrations/tenant');

const validateEnvVariables = (): void => {
    if (!MASTER_DB) {
        throw new Error('Missing required environment variable: MASTER_DB_NAME');
    }
};

const logConnectionDetails = (config: ReturnType<typeof getPrimaryDbConfig>): void => {
    console.log(`Database Driver: ${config.driver}`);
    console.log('Connection Credentials:');
    console.log(`  Host: ${config.host}`);
    console.log(`  Port: ${config.port}`);
    console.log(`  User: ${config.user}`);
    console.log(`  Password: ${config.password ? '[hidden]' : 'none'}`);
    console.log(`  SSL: ${config.ssl ? 'Enabled' : 'Disabled'}`);
};

const initializeConnection = async (config: ReturnType<typeof getPrimaryDbConfig>, noDb: boolean = false): Promise<Connection> => {
    console.log('Initializing database connection');
    const initConfig = noDb ? { ...config, database: '' } : config;
    await Connection.initialize(initConfig);
    return Connection.getInstance();
};

const getDbType = (): string => getPrimaryDbConfig().driver;

const ensureTenantDatabase = async (tenantDb: string): Promise<void> => {
    try {
        const dbType = getDbType();
        let checkSql: string;
        if (dbType === 'mysql' || dbType === 'mariadb') {
            checkSql = `SHOW DATABASES LIKE ?`;
        } else if (dbType === 'postgres') {
            checkSql = `SELECT datname FROM pg_database WHERE datname = ?`;
        } else {
            throw new Error('Unsupported database type for tenant creation');
        }
        const dbCheck = await query(checkSql, [tenantDb]);
        if (dbCheck.rows.length === 0) {
            const quote = dbType === 'postgres' ? '"' : '`';
            const createSql = `CREATE DATABASE ${quote}${tenantDb}${quote}`;
            await query(createSql, []);
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

const getTenantDbs = async (): Promise<string[]> => {
    try {
        await Connection.initialize({...getPrimaryDbConfig(), database: MASTER_DB});
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

const createMigrationsTable = async (tenantDb: string): Promise<void> => {
    try {
        const dbType = getDbType();
        let createSql = `
            CREATE TABLE IF NOT EXISTS migrations (
                                                      id INT AUTO_INCREMENT PRIMARY KEY,
                                                      name VARCHAR(255) NOT NULL UNIQUE,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
        `;
        if (dbType === 'postgres') {
            createSql = `
                CREATE TABLE IF NOT EXISTS migrations (
                                                          id SERIAL PRIMARY KEY,
                                                          name VARCHAR(255) NOT NULL UNIQUE,
                    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
            `;
        }
        await tenantStorage.run(tenantDb, () => query(createSql, []));
        console.log(`Created migrations table in ${tenantDb}`);
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error creating migrations table in ${tenantDb}: ${error.message}`);
        throw error;
    }
};

const getMigrationFiles = async (): Promise<string[]> => {
    try {
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
            console.log(`No migration files found in ${MIGRATIONS_DIR}, skipping migrations`);
            return [];
        }
        console.error(`Error reading migration files: ${error.message}`);
        throw error;
    }
};

const applyMigration = async (fileName: string, tenantDb: string): Promise<void> => {
    const migrationName = fileName.replace(/\.ts$/, '');
    console.log(`Checking migration: ${migrationName}`);
    const migrationCheck = await tenantStorage.run(tenantDb, () =>
        query(`SELECT * FROM migrations WHERE name = ?`, [migrationName])
    );
    if (migrationCheck.rows.length === 0) {
        console.log(`Applying migration: ${migrationName}`);
        const migrationPath = path.join(MIGRATIONS_DIR, fileName);
        console.log(`Loading migration from: ${migrationPath}`);
        const migrationModule = require(migrationPath);
        const MigrationClass = Object.values(migrationModule)[0] as new (dbName: string) => { up: () => Promise<void> };
        const migration = new MigrationClass(tenantDb);
        await tenantStorage.run(tenantDb, () => withTransaction(async (client) => {
            await migration.up();
            await client.query(`INSERT INTO migrations (name) VALUES (?)`, [migrationName]);
        }));
        console.log(`Applied migration ${migrationName} on ${tenantDb}`);
    } else {
        console.log(`Migration ${migrationName} already applied on ${tenantDb}`);
    }
};

const dropTenantTables = async (tenantDb: string): Promise<void> => {
    try {
        await tenantStorage.run(tenantDb, () => withTransaction(async (client) => {
            await client.query(`DROP TABLE IF EXISTS todos`);
            await client.query(`DROP TABLE IF EXISTS users`);
            await client.query(`DROP TABLE IF EXISTS migrations`);
        }));
        console.log(`Dropped tables in ${tenantDb}`);
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error dropping tables in ${tenantDb}: ${error.message}`);
        throw error;
    }
};

const dropTenantDatabase = async (tenantDb: string): Promise<void> => {
    try {
        console.log(`Dropping tenant database: ${tenantDb}`);
        const dbType = getDbType();
        const quote = dbType === 'postgres' ? '"' : '`';
        await query(`DROP DATABASE IF EXISTS ${quote}${tenantDb}${quote}`, []);
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error dropping tenant database ${tenantDb}: ${error.message}`);
        throw error;
    }
};

export async function tenantMigrate(): Promise<void> {
    console.log('Starting tenant migration');
    const config = getPrimaryDbConfig();
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
};

export async function resetTenantDatabase(tenantDb: string): Promise<void> {
    console.log('Starting tenant database reset');
    const config = getPrimaryDbConfig();
    validateEnvVariables();
    logConnectionDetails(config);
    const conn = await initializeConnection(config, true);
    try {
        await dropTenantTables(tenantDb);
        await dropTenantDatabase(tenantDb);
        console.log('Tenant database reset completed');
    } finally {
        await conn.close();
        console.log('Database connection closed');
    }
};

export async function executeTenantOperation(operation: 'migrate' | 'reset'): Promise<void> {
    try {
        if (operation === 'migrate') {
            await tenantMigrate();
        } else if (operation === 'reset') {
            const tenantDbs = await getTenantDbs();
            for (const tenantDb of tenantDbs) {
                await resetTenantDatabase(tenantDb);
            }
        } else {
            throw new Error(`Invalid operation: ${operation}. Use 'migrate' or 'reset'.`);
        }
    } catch (error) {
        console.error(`${operation === 'migrate' ? 'Tenant migration' : 'Tenant database reset'} failed:`, (error as Error).message);
        throw error;
    }
};

if (require.main === module) {
    const operation = process.argv[2] as 'migrate' | 'reset';
    executeTenantOperation(operation).then(() => process.exit(0)).catch(() => process.exit(1));
}