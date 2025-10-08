import { query } from '../../../db/mdb';

export class PermissionsSeeder {
    private readonly MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

    // Check if a tenant exists by tenant_id
    private async tenantExists(tenantId: string): Promise<string> {
        const result = await query<{ tenant_id: string }>(
            `SELECT tenant_id FROM tenants WHERE tenant_id = ?`,
            [tenantId],
            this.MASTER_DB
        );
        if (result.rows.length === 0) {
            throw new Error(`Tenant with tenant_id ${tenantId} not found`);
        }
        return result.rows[0].tenant_id;
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

    // Get role_id by role name
    private async getRoleId(roleName: string): Promise<string> {
        const result = await query<{ id: string }>(
            `SELECT id FROM roles WHERE name = ?`,
            [roleName],
            this.MASTER_DB
        );
        if (result.rows.length === 0) {
            throw new Error(`Role ${roleName} not found`);
        }
        return result.rows[0].id;
    }

    // Check if a permission exists
    private async permissionExists(name: string, tenantId: string, userId: string, roleId: string): Promise<boolean> {
        const result = await query<{ name: string }>(
            `SELECT name FROM permissions WHERE name = ? AND tenant_id = ? AND user_id = ? AND role_id = ?`,
            [name, tenantId, userId, roleId],
            this.MASTER_DB
        );
        return result.rows.length > 0;
    }

    // Insert a permission
    private async insertPermission(name: string, tenantId: string, userId: string, roleId: string): Promise<void> {
        await query(
            `INSERT INTO permissions (name, tenant_id, user_id, role_id, active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [name, tenantId, userId, roleId, 'active'],
            this.MASTER_DB
        );
        console.log(`Seeded permission: ${name} for user ${userId}`);
    }

    async up(): Promise<void> {
        console.log('Seeding permissions table');
        try {
            const permissions = [
                { name: 'manage_users', email: 'admin@example.com', tenant_id: 'default', role_name: 'admin' },
                { name: 'view_reports', email: 'john.doe@example.com', tenant_id: 'default', role_name: 'user' },
                { name: 'view_reports', email: 'jane.smith@example.com', tenant_id: 'default', role_name: 'user' },
            ];

            for (const perm of permissions) {
                const tenantId = await this.tenantExists(perm.tenant_id);
                const userId = await this.getUserId(perm.email);
                const roleId = await this.getRoleId(perm.role_name);

                if (await this.permissionExists(perm.name, tenantId, userId, roleId)) {
                    console.log(`Permission ${perm.name} for user ${perm.email} already exists, skipping insertion`);
                    continue;
                }

                await this.insertPermission(perm.name, tenantId, userId, roleId);
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