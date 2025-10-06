// cortex/migrations/seeder/master/001_tenant_seeder.ts

import { query } from '../../../db/mdb';

/**
 * Seeds the tenants table in the master database with initial data.
 */
export class MasterSeeder {
    private readonly MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

    async up(): Promise<void> {
        console.log('Seeding tenants table');
        try {
            await query(
                `
                INSERT INTO tenants (tenant_id, db_host, db_port, db_user, db_pass, db_name, db_ssl, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `,
                [
                    'default',
                    process.env.DB_HOST || 'localhost',
                    process.env.DB_PORT || '3306',
                    process.env.DB_USER || 'root',
                    process.env.DB_PASS || '',
                    process.env.DEFAULT_TENANT_DB || 'tenant_db',
                    process.env.DB_SSL || 'false',
                ],
                this.MASTER_DB
            );
            console.log('Seeded default tenant');
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error seeding tenants table: ${error.message}`);
            throw error;
        }
    }

    async down(): Promise<void> {
        console.log('Rolling back tenants table seed');
        try {
            await query(`DELETE FROM tenants WHERE tenant_id = ?`, ['default'], this.MASTER_DB);
            console.log('Rolled back default tenant seed');
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error rolling back tenants table seed: ${error.message}`);
            throw error;
        }
    }
}

export default MasterSeeder;