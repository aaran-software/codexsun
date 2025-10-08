import { query } from '../../../db/mdb';

export class TenantUsersSeeder {
    private readonly MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

    async up(): Promise<void> {
        console.log('Seeding tenant_users table');
        try {
            const tenantUsers = [
                { email: 'admin@example.com', tenant_id: 'default' },
                { email: 'john.doe@example.com', tenant_id: 'default' },
                { email: 'jane.smith@example.com', tenant_id: 'default' },
            ];

            for (const tu of tenantUsers) {
                // Get user_id from users table
                const userResult = await query<{ id: string }>(
                    `SELECT id FROM users WHERE email = ?`,
                    [tu.email],
                    this.MASTER_DB
                );

                if (userResult.rows.length === 0) {
                    throw new Error(`User with email ${tu.email} not found`);
                }
                const user_id = userResult.rows[0].id;

                await query(
                    `
                    INSERT INTO tenant_users (user_id, tenant_id, created_at, updated_at)
                    VALUES (?, ?, NOW(), NOW())
                    `,
                    [user_id, tu.tenant_id],
                    this.MASTER_DB
                );
                console.log(`Seeded tenant_user: ${tu.email} for tenant ${tu.tenant_id}`);
            }
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
                `DELETE FROM tenant_users WHERE user_id IN (
                    SELECT id FROM users WHERE email IN (?, ?, ?)
                )`,
                ['admin@example.com', 'john.doe@example.com', 'jane.smith@example.com'],
                this.MASTER_DB
            );
            console.log('Rolled back tenant_users seed');
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error rolling back tenant_users table seed: ${error.message}`);
            throw error;
        }
    }
}

export default TenantUsersSeeder;