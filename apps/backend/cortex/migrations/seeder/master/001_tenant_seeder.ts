import { query } from '../../../db/mdb';

export class MasterSeeder {
    private readonly MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

    async up(): Promise<void> {
        console.log('Seeding tenants table');
        try {
            await query(
                `
                    INSERT INTO tenants (tenant_id, db_host, db_port, db_user, db_pass, db_name, db_ssl, active, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `,
                [
                    'default',
                    process.env.DB_HOST || null,
                    process.env.DB_PORT || null,
                    process.env.DB_USER || null,
                    process.env.DB_PASS || null,
                    process.env.DEFAULT_TENANT_DB || null,
                    process.env.DB_SSL || null,
                    'active',
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