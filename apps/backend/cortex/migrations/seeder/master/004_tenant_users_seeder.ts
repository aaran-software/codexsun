import { query } from '../../../db/mdb';

export class TenantUsersSeeder {
    private readonly MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

    // Check if a tenant-user mapping exists
    private async tenantUserExists(userId: string, tenantId: string): Promise<boolean> {
        const result = await query<{ user_id: string; tenant_id: string }>(
            `SELECT user_id, tenant_id FROM tenant_users WHERE user_id = ? AND tenant_id = ?`,
            [userId, tenantId],
            this.MASTER_DB
        );
        return result.rows.length > 0;
    }

    // Get user_id by email
    private async getUserId(email: string): Promise<string> {
        const result = await query<{ id: string }>(
            `SELECT id FROM users WHERE email = ?`,
            [email],
            this.MASTER_DB
        );
        if (result.rows.length === 0) {
            throw new Error(`User with email ${email} not found`);
        }
        return result.rows[0].id;
    }

    // Insert a tenant-user mapping
    private async insertTenantUser(userId: string, tenantId: string): Promise<void> {
        await query(
            `INSERT INTO tenant_users (user_id, tenant_id, created_at, updated_at)
             VALUES (?, ?, NOW(), NOW())`,
            [userId, tenantId],
            this.MASTER_DB
        );
        console.log(`Seeded tenant_user: ${userId} for tenant ${tenantId}`);
    }

    async up(): Promise<void> {
        console.log('Seeding tenant_users table');
        try {
            const tenantUsers = [
                { email: 'admin@example.com', tenant_id: 'default' },
                { email: 'john.doe@example.com', tenant_id: 'default' },
                { email: 'jane.smith@example.com', tenant_id: 'default' },
            ];

            for (const tu of tenantUsers) {
                const userId = await this.getUserId(tu.email);
                if (await this.tenantUserExists(userId, tu.tenant_id)) {
                    console.log(`Tenant-user mapping for ${tu.email} and tenant ${tu.tenant_id} already exists, skipping insertion`);
                    continue;
                }
                await this.insertTenantUser(userId, tu.tenant_id);
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