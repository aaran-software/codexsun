import { query } from '../../../db/mdb';

export class MasterSeeder {
    private readonly MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

    async up(): Promise<void> {
        console.log('Seeding tenants table');
        try {
            // Check if tenant with tenant_id = 'default' already exists
            const existingTenant = await query<{ tenant_id: string }>(
                `SELECT tenant_id FROM tenants WHERE tenant_id = ?`,
                ['default'],
                this.MASTER_DB
            );

            if (existingTenant.rows.length > 0) {
                console.log('Tenant with tenant_id "default" already exists, skipping insertion');
                return;
            }

            // Insert tenant if it doesn't exist
            const defaultTenantDb = process.env.DEFAULT_TENANT_DB || 'tenant_default_db';
            await query(
                `
                    INSERT INTO tenants (tenant_id, db_host, db_port, db_user, db_pass, db_name, db_ssl, active, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `,
                [
                    'default',
                    process.env.DB_HOST || '127.0.0.1',
                    process.env.DB_PORT || '3306',
                    process.env.DB_USER || 'root',
                    process.env.DB_PASS || 'Computer.1',
                    defaultTenantDb,
                    process.env.DB_SSL || 'false',
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