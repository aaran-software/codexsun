import { query } from '../../../db/mdb';

export class RolesSeeder {
    private readonly MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

    async up(): Promise<void> {
        console.log('Seeding roles table');
        try {
            const roles = [
                { name: 'admin', active: 'active' },
                { name: 'user', active: 'active' },
                { name: 'viewer', active: 'active' },
            ];

            for (const role of roles) {
                await query(
                    `
                    INSERT INTO roles (name, active, created_at, updated_at)
                    VALUES (?, ?, NOW(), NOW())
                    `,
                    [role.name, role.active],
                    this.MASTER_DB
                );
                console.log(`Seeded role: ${role.name}`);
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