#!/usr/bin/env ts-node
import { Connection } from '../../connection';
import { getDbConfig } from '../../../config/db-config';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Path to the master seeder folder.
 */
const SEEDERS_DIR = path.resolve(__dirname, '../../../migrations/seeder/master');

/**
 * Initializes database connection.
 * @returns Initialized Connection instance.
 */
const initializeConnection = async (): Promise<Connection> => {
    console.log('Initializing database connection');
    const config = getDbConfig();
    await Connection.initialize({ ...config, database: process.env.MASTER_DB_NAME || 'master_db' });
    return Connection.getInstance();
};

/**
 * Retrieves and sorts seeder files from the seeders folder.
 * @returns Sorted array of seeder file names.
 */
const getSeederFiles = async (): Promise<string[]> => {
    try {
        console.log(`Checking seeder directory: ${SEEDERS_DIR}`);
        await fs.access(SEEDERS_DIR);
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
 * Applies a single seeder.
 * @param fileName - Name of the seeder file.
 */
const applySeeder = async (fileName: string): Promise<void> => {
    const seederName = fileName.replace(/\.ts$/, '');
    console.log(`Applying seeder: ${seederName}`);
    const seederPath = path.join(SEEDERS_DIR, fileName);
    console.log(`Loading seeder from: ${seederPath}`);
    const seederModule = require(seederPath);
    const SeederClass = Object.values(seederModule)[0] as new () => { up: () => Promise<void> };
    const seeder = new SeederClass();
    try {
        await seeder.up();
        console.log(`Applied seeder: ${seederName}`);
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error running seeder ${seederName}: ${error.message}`);
        throw error;
    }
};

/**
 * Rolls back a single seeder.
 * @param fileName - Name of the seeder file.
 */
const rollbackSeeder = async (fileName: string): Promise<void> => {
    const seederName = fileName.replace(/\.ts$/, '');
    console.log(`Rolling back seeder: ${seederName}`);
    const seederPath = path.join(SEEDERS_DIR, fileName);
    console.log(`Loading seeder from: ${seederPath}`);
    const seederModule = require(seederPath);
    const SeederClass = Object.values(seederModule)[0] as new () => { down: () => Promise<void> };
    const seeder = new SeederClass();
    try {
        await seeder.down();
        console.log(`Rolled back seeder: ${seederName}`);
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error rolling back seeder ${seederName}: ${error.message}`);
        throw error;
    }
};

/**
 * Runs the master database seeding, applying all seeders in order.
 */
export async function masterSeed(): Promise<void> {
    console.log('Starting master database seeding');
    let conn: Connection | null = null;
    try {
        conn = await initializeConnection();
        const seederFiles = await getSeederFiles();
        if (seederFiles.length === 0) {
            console.log('No seeder files to apply');
            return;
        }
        for (const fileName of seederFiles) {
            await applySeeder(fileName);
        }
        console.log('Master database seeding completed');
    } finally {
        if (conn) {
            await conn.close();
            console.log('Database connection closed');
        }
    }
}

/**
 * Rolls back seeded data from the master database.
 */
export async function resetMasterSeed(): Promise<void> {
    console.log('Starting master database seed rollback');
    let conn: Connection | null = null;
    try {
        conn = await initializeConnection();
        const seederFiles = await getSeederFiles();
        if (seederFiles.length === 0) {
            console.log('No seeder files to roll back');
            return;
        }
        for (const fileName of seederFiles.reverse()) {
            await rollbackSeeder(fileName);
        }
        console.log('Master database seed rollback completed');
    } finally {
        if (conn) {
            await conn.close();
            console.log('Database connection closed');
        }
    }
}

/**
 * Executes the specified master database seeding operation (seed or reset).
 * @param operation - The operation to perform ('seed' or 'reset').
 */
export async function executeMasterSeedOperation(operation: 'seed' | 'reset'): Promise<void> {
    try {
        if (operation === 'seed') {
            await masterSeed();
        } else if (operation === 'reset') {
            await resetMasterSeed();
        } else {
            throw new Error(`Invalid operation: ${operation}. Use 'seed' or 'reset'.`);
        }
    } catch (error) {
        console.error(`${operation === 'seed' ? 'Master seeding' : 'Master seed rollback'} failed:`, (error as Error).message);
        throw error;
    }
}

// Execute based on command-line argument
if (require.main === module) {
    const operation = process.argv[2] as 'seed' | 'reset';
    executeMasterSeedOperation(operation).then(() => process.exit(0)).catch(() => process.exit(1));
}