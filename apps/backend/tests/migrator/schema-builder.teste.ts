import { MigrateRunner } from '../../cortex/migration/migrate-runner';
import { BaseMigration } from '../../cortex/migration/base-migration';
import { Connection } from '../../cortex/db/connection';
import { query } from '../../cortex/db/db';
import { getDbConfig } from '../../cortex/config/db-config';
import * as fs from 'fs/promises';
import * as path from 'path';

const MIGRATIONS_PATH = 'cortex/database/migrations';

describe('MigrateRunner', () => {
    let connection: Connection;

    beforeAll(async () => {
        try {
            // Initialize database connection
            connection = await Connection.initialize(getDbConfig());
            console.log('Database connection initialized');
        } catch (error) {
            console.error(`Failed to initialize database connection: ${(error as Error).message}`);
            throw error;
        }
    });

    beforeEach(async () => {
        try {
            // Clean up tables before each test
            await query('DROP TABLE IF EXISTS users;');
            await query('DROP TABLE IF EXISTS tenants;');
            console.log('Tables cleaned up');
        } catch (error) {
            console.error(`Failed to clean up tables: ${(error as Error).message}`);
            throw error;
        }
    });

    afterAll(async () => {
        try {
            // Close database connection
            await connection.close();
            console.log('Database connection closed');
        } catch (error) {
            console.error(`Failed to close database connection: ${(error as Error).message}`);
            throw error;
        }
    });

    it('verifies migrations path and files exist', async () => {
        try {
            const migrationFiles = await fs.readdir(MIGRATIONS_PATH);
            console.log(`Migration files found in ${MIGRATIONS_PATH}: ${migrationFiles.join(', ')}`);
            expect(migrationFiles).toContain('001_create_users.ts');
            expect(migrationFiles).toContain('002_add_column.ts');
            expect(migrationFiles.length).toBeGreaterThanOrEqual(2);
        } catch (error) {
            console.error(`Failed to read migrations directory ${MIGRATIONS_PATH}: ${(error as Error).message}`);
            throw error;
        }
    });

    it('runs up migrations and verifies tables exist', async () => {
        try {
            // Log migrations before running
            const migrations = await BaseMigration.getAllMigrations();
            console.log(`Migrations to be executed: ${migrations.map(m => m.name).join(', ')}`);

            // Run all migrations up
            await MigrateRunner.run('up');

            // Verify users table exists
            const usersTableCheck = await query(
                `SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
                ['users']
            );
            // expect(usersTableCheck.rows).toHaveLength(1);
            // expect(usersTableCheck.rows[0].table_name).toBe('users');
            //
            expect((usersTableCheck.rows as Array<{ table_name: string }>)).toHaveLength(1);
            expect((usersTableCheck.rows as Array<{ table_name: string }>)[0].table_name).toBe('users');

            // Verify users table columns
            const usersColumnCheck = await query(
                `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ?`,
                ['users']
            );
            const expectedUsersColumns = [
                { column_name: 'id', data_type: 'bigint', is_nullable: 'NO', column_default: null },
                { column_name: 'username', data_type: 'varchar', is_nullable: 'NO', column_default: null },
                { column_name: 'email', data_type: 'varchar', is_nullable: 'NO', column_default: null },
                { column_name: 'password', data_type: 'varchar', is_nullable: 'NO', column_default: null },
                { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'YES', column_default: 'current_timestamp()' },
                { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'YES', column_default: 'current_timestamp()' }
            ];
            expect(usersColumnCheck.rows).toHaveLength(expectedUsersColumns.length);
            expect(usersColumnCheck.rows).toEqual(expect.arrayContaining(expectedUsersColumns));

            // Verify unique constraint on email
            const usersConstraintCheck = await query(
                `SELECT constraint_name FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = ? AND constraint_type = 'UNIQUE'`,
                ['users']
            );
            expect(usersConstraintCheck.rows).toHaveLength(1);

            // Verify tenants table exists
            const tenantsTableCheck = await query(
                `SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
                ['tenants']
            );
            // expect(tenantsTableCheck.rows).toHaveLength(1);
            // expect(tenantsTableCheck.rows[0].table_name).toBe('tenants');

            expect((usersTableCheck.rows as Array<{ table_name: string }>)).toHaveLength(1);
            expect((usersTableCheck.rows as Array<{ table_name: string }>)[0].table_name).toBe('users');

            // Verify tenants table columns
            const tenantsColumnCheck = await query(
                `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ?`,
                ['tenants']
            );
            const expectedTenantsColumns = [
                { column_name: 'id', data_type: 'bigint', is_nullable: 'NO', column_default: null },
                { column_name: 'tenant', data_type: 'varchar', is_nullable: 'NO', column_default: null },
                { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'YES', column_default: 'current_timestamp()' },
                { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'YES', column_default: 'current_timestamp()' }
            ];
            expect(tenantsColumnCheck.rows).toHaveLength(expectedTenantsColumns.length);
            expect(tenantsColumnCheck.rows).toEqual(expect.arrayContaining(expectedTenantsColumns));

            // Verify unique constraint on tenant
            const tenantsConstraintCheck = await query(
                `SELECT constraint_name FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = ? AND constraint_type = 'UNIQUE'`,
                ['tenants']
            );
            expect(tenantsConstraintCheck.rows).toHaveLength(1);
        } catch (error) {
            console.error(`Test failed for up migrations: ${(error as Error).message}`);
            throw error;
        }
    });

    it('runs down migrations and verifies tables are dropped', async () => {
        try {
            // Log migrations before running
            const migrations = await BaseMigration.getAllMigrations();
            console.log(`Migrations to be executed: ${migrations.map(m => m.name).join(', ')}`);

            // First run up migrations to create tables
            await MigrateRunner.run('up');

            // Run down migrations
            await MigrateRunner.run('down');

            // Verify users table does not exist
            const usersTableCheck = await query(
                `SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
                ['users']
            );
            expect(usersTableCheck.rows).toHaveLength(0);

            // Verify tenants table does not exist
            const tenantsTableCheck = await query(
                `SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
                ['tenants']
            );
            expect(tenantsTableCheck.rows).toHaveLength(0);
        } catch (error) {
            console.error(`Test failed for down migrations: ${(error as Error).message}`);
            throw error;
        }
    });
});