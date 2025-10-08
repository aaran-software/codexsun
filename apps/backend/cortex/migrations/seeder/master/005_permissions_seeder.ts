import { query } from '../../../db/mdb';

export class PermissionsSeeder {
    private readonly MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

    async up(): Promise<void> {
        console.log('Seeding permissions table');
        try {
            const permissions = [
                { name: 'manage_users', email: 'admin@example.com', tenant_id: 'default', role_name: 'admin' },
                { name: 'view_reports', email: 'john.doe@example.com', tenant_id: 'default', role_name: 'user' },
                { name: 'view_reports', email: 'jane.smith@example.com', tenant_id: 'default', role_name: 'user' },
            ];

            for (const perm of permissions) {
                // Get tenant_id (string) from tenants table
                const tenantResult = await query<{ tenant_id: string }>(
                    `SELECT tenant_id FROM tenants WHERE tenant_id = ?`,
                    [perm.tenant_id],
                    this.MASTER_DB
                );
                if (tenantResult.rows.length === 0) {
                    throw new Error(`Tenant with tenant_id ${perm.tenant_id} not found`);
                }
                const tenant_id = tenantResult.rows[0].tenant_id;

                // Get user_id from users table
                const userResult = await query<{ id: string }>(
                    `SELECT id FROM users WHERE email = ?`,
                    [perm.email],
                    this.MASTER_DB
                );
                if (userResult.rows.length === 0) {
                    throw new Error(`User with email ${perm.email} not found`);
                }
                const user_id = userResult.rows[0].id;

                // Get role_id from roles table
                const roleResult = await query<{ id: string }>(
                    `SELECT id FROM roles WHERE name = ?`,
                    [perm.role_name],
                    this.MASTER_DB
                );
                if (roleResult.rows.length === 0) {
                    throw new Error(`Role ${perm.role_name} not found`);
                }
                const role_id = roleResult.rows[0].id;

                // Check if permission already exists to avoid duplicates
                const existingPermission = await query<{ name: string }>(
                    `SELECT name FROM permissions WHERE name = ? AND tenant_id = ? AND user_id = ? AND role_id = ?`,
                    [perm.name, tenant_id, user_id, role_id],
                    this.MASTER_DB
                );
                if (existingPermission.rows.length > 0) {
                    console.log(`Permission ${perm.name} for user ${perm.email} already exists, skipping insertion`);
                    continue;
                }

                // Insert permission with string tenant_id
                await query(
                    `
                        INSERT INTO permissions (name, tenant_id, user_id, role_id, active, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
                    `,
                    [perm.name, tenant_id, user_id, role_id, 'active'],
                    this.MASTER_DB
                );
                console.log(`Seeded permission: ${perm.name} for user ${perm.email}`);
            }
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error seeding permissions table: ${error.message}`);
            throw error;
        }
    }

    async down(): Promise<void> {
        console.log('Rolling back permissions table seed');
        try {
            await query(
                `DELETE FROM permissions WHERE name IN (?, ?)`,
                ['manage_users', 'view_reports'],
                this.MASTER_DB
            );
            console.log('Rolled back permissions seed');
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error rolling back permissions table seed: ${error.message}`);
            throw error;
        }
    }
}

export default PermissionsSeeder;