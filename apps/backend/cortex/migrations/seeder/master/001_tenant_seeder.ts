import { query } from '../../../db/mdb';

export class MasterSeeder {
    private readonly MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

    // Check if a tenant exists by tenant_id
    private async tenantExists(tenantId: string): Promise<boolean> {
        const result = await query<{ tenant_id: string }>(
            `SELECT tenant_id FROM tenants WHERE tenant_id = ?`,
            [tenantId],
            this.MASTER_DB
        );
        return result.rows.length > 0;
    }

    // Insert a tenant
    private async insertTenant(): Promise<void> {
        const defaultTenantDb = process.env.DEFAULT_TENANT_DB || 'tenant_db';
        await query(
            `INSERT INTO tenants (tenant_id, db_driver, db_host, db_port, db_user, db_pass, db_name, db_ssl, active, created_at, updated_at)
             VALUES (?, ?,?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                'default',
                process.env.DB_DRIVER || 'mariadb',
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
    }

    async up(): Promise<void> {
        console.log('Seeding tenants table');
        try {
            if (await this.tenantExists('default')) {
                console.log('Tenant with tenant_id "default" already exists, skipping insertion');
                return;
            }
            await this.insertTenant();
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