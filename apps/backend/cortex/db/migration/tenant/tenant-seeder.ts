#!/usr/bin/env ts-node
import { Connection } from '../../connection';
import { getDbConfig } from '../../../config/db-config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { query, tenantStorage } from '../../db';

/**
 * Path to the tenant seeders folder.
 */
const SEEDERS_DIR = path.resolve(__dirname, '../../../migrations/seeder/tenant');

/**
 * Name of the master database.
 */
const MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

/**
 * Initializes database connection.
 * @returns Initialized Connection instance.
 */
const initializeConnection = async (): Promise<Connection> => {
    console.log('Initializing database connection');
    const config = getDbConfig();
    await Connection.initialize(config);
    return Connection.getInstance();
};

/**
 * Retrieves and sorts seeder files from the seeders folder.
 * @returns Sorted array of seeder file names.
 */
const getSeederFiles = async (): Promise<string[]> => {
    try {
        await fs.access(SEEDERS_DIR); // Check if directory exists
        const files = await fs.readdir(SEEDERS_DIR);
        const seederFiles = files
            .filter((file) => file.match(/^\d+_.+\.ts$/))
            .sort((a, b) => {
                const aTimestamp = parseInt(a.split('_')[0], 10);
                const bTimestamp = parseInt(b.split('_')[0], 10);
                return aTimestamp - bTimestamp;
            });
        console.log(`Found seeder files: ${seederFiles.join(', ') || 'none'}`);
        return seederFiles;
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
            console.log(`No seeder files found in ${SEEDERS_DIR}, skipping seeding`);
            return [];
        }
        console.error(`Error reading seeder files: ${error.message}`);
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
 * Applies a single seeder to a tenant database.
 * @param fileName - Name of the seeder file.
 * @param tenantDb - Tenant database name.
 */
const applySeeder = async (fileName: string, tenantDb: string): Promise<void> => {
    const seederName = fileName.replace(/\.ts$/, '');
    console.log(`Applying seeder ${seederName} on ${tenantDb}`);
    const seederPath = path.join(SEEDERS_DIR, fileName);
    const seederModule = await import(`file://${seederPath.replace(/\\/g, '/')}`);
    const SeederClass = Object.values(seederModule)[0] as new (dbName: string) => { up: () => Promise<void> };
    const seeder = new SeederClass(tenantDb);
    try {
        await tenantStorage.run(tenantDb, () => seeder.up());
        console.log(`Applied seeder ${seederName} on ${tenantDb}`);
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error running seeder ${seederName} on ${tenantDb}: ${error.message}`);
        throw error;
    }
};

/**
 * Rolls back a single seeder from a tenant database.
 * @param fileName - Name of the seeder file.
 * @param tenantDb - Tenant database name.
 */
const rollbackSeeder = async (fileName: string, tenantDb: string): Promise<void> => {
    const seederName = fileName.replace(/\.ts$/, '');
    console.log(`Rolling back seeder ${seederName} on ${tenantDb}`);
    const seederPath = path.join(SEEDERS_DIR, fileName);
    const seederModule = await import(`file://${seederPath.replace(/\\/g, '/')}`);
    const SeederClass = Object.values(seederModule)[0] as new (dbName: string) => { down: () => Promise<void> };
    const seeder = new SeederClass(tenantDb);
    try {
        await tenantStorage.run(tenantDb, () => seeder.down());
        console.log(`Rolled back seeder ${seederName} on ${tenantDb}`);
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error rolling back seeder ${seederName} on ${tenantDb}: ${error.message}`);
        throw error;
    }
};

/**
 * Runs the tenant database seeding, applying all seeders to each tenant database.
 */
export async function tenantSeed(): Promise<void> {
    console.log('Starting tenant database seeding');
    let conn: Connection | null = null;
    try {
        conn = await initializeConnection();
        const tenantDbs = await getTenantDbs();
        if (tenantDbs.length === 0) {
            console.log('No tenant databases to seed');
            return;
        }
        const seederFiles = await getSeederFiles();
        if (seederFiles.length === 0) {
            console.log('No seeder files to apply');
            return;
        }
        for (const tenantDb of tenantDbs) {
            for (const fileName of seederFiles) {
                await applySeeder(fileName, tenantDb);
            }
            console.log(`Seeding completed for tenant database: ${tenantDb}`);
        }
        console.log('Tenant database seeding completed');
    } finally {
        if (conn) {
            await conn.close();
            console.log('Database connection closed');
        }
    }
}

/**
 * Rolls back seeded data from all tenant databases.
 */
export async function resetTenantSeed(): Promise<void> {
    console.log('Starting tenant database seed rollback');
    let conn: Connection | null = null;
    try {
        conn = await initializeConnection();
        const tenantDbs = await getTenantDbs();
        if (tenantDbs.length === 0) {
            console.log('No tenant databases to roll back');
            return;
        }
        const seederFiles = await getSeederFiles();
        if (seederFiles.length === 0) {
            console.log('No seeder files to roll back');
            return;
        }
        for (const tenantDb of tenantDbs) {
            for (const fileName of seederFiles.reverse()) {
                await rollbackSeeder(fileName, tenantDb);
            }
            console.log(`Seed rollback completed for tenant database: ${tenantDb}`);
        }
        console.log('Tenant database seed rollback completed');
    } finally {
        if (conn) {
            await conn.close();
            console.log('Database connection closed');
        }
    }
}

/**
 * Executes the specified tenant database seeding operation (seed or reset).
 * @param operation - The operation to perform ('seed' or 'reset').
 */
export async function executeTenantSeedOperation(operation: 'seed' | 'reset'): Promise<void> {
    try {
        if (operation === 'seed') {
            await tenantSeed();
        } else if (operation === 'reset') {
            await resetTenantSeed();
        } else {
            throw new Error(`Invalid operation: ${operation}. Use 'seed' or 'reset'.`);
        }
    } catch (error) {
        console.error(`${operation === 'seed' ? 'Tenant seeding' : 'Tenant seed rollback'} failed:`, (error as Error).message);
        throw error;
    }
}

// Execute based on command-line argument
if (require.main === module) {
    const operation = process.argv[2] as 'seed' | 'reset';
    executeTenantSeedOperation(operation).then(() => process.exit(0)).catch(() => process.exit(1));
}