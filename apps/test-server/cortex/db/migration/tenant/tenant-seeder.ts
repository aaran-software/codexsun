// cortex/db/tenant-seeder.ts

import { withTransaction } from '../../db';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Connection } from '../../connection';
import { getMasterDbConfig } from '../../../config/db-config';

// Path to the tenant seeder folder
const SEEDERS_DIR = path.resolve(__dirname, '../../../migrations/seeder/tenant');

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
 * Initializes the master database connection for tenant resolution.
 * @throws Error if initialization fails.
 */
async function initializeMasterConnection(): Promise<void> {
    try {
        const masterConfig = getMasterDbConfig();
        await Connection.initialize(masterConfig);
        console.log(`Initialized master database connection: ${masterConfig.database || 'default'}`);
    } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error initializing master database connection: ${error.message}`);
        throw error;
    }
}

/**
 * Closes the master database connection.
 */
async function closeMasterConnection(): Promise<void> {
    try {
        const connection = Connection.getInstance();
        await connection.close();
        console.log('Master database connection closed');
    } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error closing master database connection: ${error.message}`);
    }
}

/**
 * Retrieves and sorts seeder files from the tenant seeders folder.
 * @returns Sorted array of seeder file names.
 */
async function getSeederFiles(): Promise<string[]> {
    try {
        console.log(`Checking seeder directory: ${SEEDERS_DIR}`);
        await fs.access(SEEDERS_DIR);
        const files = await fs.readdir(SEEDERS_DIR);
        const seederFiles = files
            .filter((file) => file.match(/^\d+_.+\.ts$/))
            .sort((a, b) => parseInt(a.split('_')[0], 10) - parseInt(b.split('_')[0], 10));
        console.log(`Found seeder files: ${seederFiles.join(', ') || 'none'}`);
        return seederFiles;
    } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
            console.log(`No seeder files found in ${SEEDERS_DIR}, returning empty list`);
            return [];
        }
        console.error(`Error reading seeder files: ${error.message}`);
        throw error;
    }
}

/**
 * Applies a single seeder for the specified tenant.
 * @param fileName - Name of the seeder file.
 * @param tenantId - Tenant ID for database operations.
 */
async function applySeeder(fileName: string, tenantId: string): Promise<void> {
    const seederName = fileName.replace(/\.ts$/, '');
    console.log(`Applying seeder: ${seederName} for tenant '${tenantId}'`);
    const seederPath = path.join(SEEDERS_DIR, fileName);
    console.log(`Loading seeder from: ${seederPath}`);
    const seederModule = require(seederPath);
    const SeederClass = seederModule.default || Object.values(seederModule)[0] as new () => { up: (tenantId: string) => Promise<void> };
    const seeder = new SeederClass();

    await withTransaction(async () => {
        await seeder.up(tenantId);
    }, tenantId);

    console.log(`Applied seeder: ${seederName} for tenant '${tenantId}'`);
}

/**
 * Rolls back a single seeder for the specified tenant.
 * @param fileName - Name of the seeder file.
 * @param tenantId - Tenant ID for database operations.
 */
async function rollbackSeeder(fileName: string, tenantId: string): Promise<void> {
    const seederName = fileName.replace(/\.ts$/, '');
    console.log(`Rolling back seeder: ${seederName} for tenant '${tenantId}'`);
    const seederPath = path.join(SEEDERS_DIR, fileName);
    console.log(`Loading seeder from: ${seederPath}`);
    const seederModule = require(seederPath);
    const SeederClass = seederModule.default || Object.values(seederModule)[0] as new () => { down: (tenantId: string) => Promise<void> };
    const seeder = new SeederClass();

    await withTransaction(async () => {
        await seeder.down(tenantId);
    }, tenantId);

    console.log(`Rolled back seeder: ${seederName} for tenant '${tenantId}'`);
}

/**
 * Runs the tenant database seeding, applying all seeders in order.
 * @param tenantId - Tenant ID for database operations (default: "default").
 */
export async function tenantSeed(tenantId: string = 'default'): Promise<void> {
    console.log(`Starting tenant database seeding for tenant '${tenantId}'`);
    validateEnvVariables();
    await initializeMasterConnection();
    try {
        const seederFiles = await getSeederFiles();
        if (seederFiles.length === 0) {
            console.log('No seeder files to apply');
            return;
        }
        for (const fileName of seederFiles) {
            await applySeeder(fileName, tenantId);
        }
        console.log(`Tenant database seeding completed for tenant '${tenantId}'`);
    } finally {
        await closeMasterConnection();
    }
}

/**
 * Rolls back seeded data from the tenant database.
 * @param tenantId - Tenant ID for database operations (default: "default").
 */
export async function resetTenantSeed(tenantId: string = 'default'): Promise<void> {
    console.log(`Starting tenant database seed rollback for tenant '${tenantId}'`);
    validateEnvVariables();
    await initializeMasterConnection();
    try {
        const seederFiles = await getSeederFiles();
        if (seederFiles.length === 0) {
            console.log('No seeder files to roll back');
            return;
        }
        for (const fileName of seederFiles.reverse()) {
            await rollbackSeeder(fileName, tenantId);
        }
        console.log(`Tenant database seed rollback completed for tenant '${tenantId}'`);
    } finally {
        await closeMasterConnection();
    }
}

/**
 * Executes the specified tenant database seeding operation (seed or reset).
 * @param operation - The operation to perform ('seed' or 'reset').
 * @param tenantId - Tenant ID for database operations (default: "default").
 */
export async function executeTenantSeedOperation(operation: 'seed' | 'reset', tenantId: string = 'default'): Promise<void> {
    try {
        if (operation === 'seed') {
            await tenantSeed(tenantId);
        } else if (operation === 'reset') {
            await resetTenantSeed(tenantId);
        } else {
            throw new Error(`Invalid operation: ${operation}. Use 'seed' or 'reset'.`);
        }
    } catch (error) {
        console.error(`Tenant ${operation} failed for tenant '${tenantId}':`, (error as Error).message);
        throw error;
    }
}

// Execute based on command-line argument
if (require.main === module) {
    const operation = process.argv[2] as 'seed' | 'reset';
    const tenantId = process.argv[3] || 'default';
    executeTenantSeedOperation(operation, tenantId).then(() => process.exit(0)).catch(() => process.exit(1));
}