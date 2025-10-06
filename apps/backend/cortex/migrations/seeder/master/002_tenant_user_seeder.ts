import { query } from '../../../db/mdb';

/**
 * Seeds the tenant_users table in the master database with initial user data.
 */
export class TenantUserSeeder {
    private readonly MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

    async up(): Promise<void> {
        console.log('Seeding tenant_users table');
        try {
            await query(
                `
                    INSERT INTO tenant_users (email, tenant_id, created_at, updated_at)
                    VALUES
                        (?, ?, NOW(), NOW()),
                        (?, ?, NOW(), NOW())
                `,
                [
                    'admin@default.com',
                    'default',
                    'user@default.com',
                    'default'
                ],
                this.MASTER_DB
            );
            console.log('Seeded default tenant users');
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error seeding tenant_users table: ${error.message}`);
            throw error;
        }
    }

    async down(): Promise<void> {
        console.log('Rolling back tenant_users table seed');
        try {
            await query(
                `DELETE FROM tenant_users WHERE email IN (?, ?)`,
                ['admin@default.com', 'user@default.com'],
                this.MASTER_DB
            );
            console.log('Rolled back default tenant user seed');
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error rolling back tenant_users table seed: ${error.message}`);
            throw error;
        }
    }
}

export default TenantUserSeeder;