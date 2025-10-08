import { query } from '../../../db/mdb';

export class RolesSeeder {
    private readonly MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

    // Check if a role exists by name
    private async roleExists(roleName: string): Promise<boolean> {
        const result = await query<{ name: string }>(
            `SELECT name FROM roles WHERE name = ?`,
            [roleName],
            this.MASTER_DB
        );
        return result.rows.length > 0;
    }

    // Insert a role
    private async insertRole(roleName: string, active: string): Promise<void> {
        await query(
            `INSERT INTO roles (name, active, created_at, updated_at)
             VALUES (?, ?, NOW(), NOW())`,
            [roleName, active],
            this.MASTER_DB
        );
        console.log(`Seeded role: ${roleName}`);
    }

    async up(): Promise<void> {
        console.log('Seeding roles table');
        try {
            const roles = [
                { name: 'admin', active: 'active' },
                { name: 'user', active: 'active' },
                { name: 'viewer', active: 'active' },
            ];

            for (const role of roles) {
                if (await this.roleExists(role.name)) {
                    console.log(`Role ${role.name} already exists, skipping insertion`);
                    continue;
                }
                await this.insertRole(role.name, role.active);
            }
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error seeding roles table: ${error.message}`);
            throw error;
        }
    }

    async down(): Promise<void> {
        console.log('Rolling back roles table seed');
        try {
            await query(`DELETE FROM roles WHERE name IN (?, ?, ?)`, ['admin', 'user', 'viewer'], this.MASTER_DB);
            console.log('Rolled back roles seed');
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error rolling back roles table seed: ${error.message}`);
            throw error;
        }
    }
}

export default RolesSeeder;