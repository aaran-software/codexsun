#!/usr/bin/env ts-node
import { Connection } from '../connection';
import { getDbConfig } from '../../config/db-config';
import { MasterSeeder } from '../../migrations/seeder/master-seeder';
import { TenantSeeder } from '../../migrations/seeder/tenant-seeder';

/**
 * Runs database seeding for the multi-tenant ERP system.
 */
async function run(): Promise<void> {
    try {
        // Initialize DB connection
        await Connection.initialize(getDbConfig());

        // Seed master DB
        const masterSeeder = new MasterSeeder();
        await masterSeeder.up();

        // Seed tenant DB
        const tenantSeeder = new TenantSeeder();
        await tenantSeeder.up();

        console.log('Seed runner completed successfully');
    } catch (error) {
        console.error('Seed runner failed:', (error as Error).message);
        throw error;
    } finally {
        await Connection.getInstance().close();
    }
}

/**
 * Rolls back seeded data from the database.
 */
async function rollback(): Promise<void> {
    try {
        // Initialize DB connection
        await Connection.initialize(getDbConfig());

        // Rollback tenant DB first to avoid dependency issues
        const tenantSeeder = new TenantSeeder();
        await tenantSeeder.down();

        // Rollback master DB
        const masterSeeder = new MasterSeeder();
        await masterSeeder.down();

        console.log('Seed rollback completed successfully');
    } catch (error) {
        console.error('Seed rollback failed:', (error as Error).message);
        throw error;
    } finally {
        await Connection.getInstance().close();
    }
}

// Execute based on CLI argument
if (process.argv[2] === 'rollback') {
    rollback().catch(() => process.exit(1));
} else {
    run().catch(() => process.exit(1));
}