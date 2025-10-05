import { query } from '../../db/mdb';
import { getDbConfig } from '../../config/db-config';
import { logQuery } from '../../config/logger';

/**
 * Seeder class to populate the master database with default data for ERP system.
 */
export class MasterSeeder {
    private readonly dbConfig = getDbConfig();

    /**
     * Seeds default data into the master database.
     * Creates and populates tenants and tenant_users tables.
     */
    async up(): Promise<void> {
        try {
            // Create tenants table
            await query(
                `CREATE TABLE IF NOT EXISTS tenants (
                    id VARCHAR(50) PRIMARY KEY,
                    db_connection TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`
            );
            logQuery('end', { sql: 'CREATE TABLE IF NOT EXISTS tenants', params: [], db: this.dbConfig.database });

            // Create tenant_users table
            await query(
                `CREATE TABLE IF NOT EXISTS tenant_users (
                    email VARCHAR(255),
                    tenant_id VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (email, tenant_id)
                )`
            );
            logQuery('end', { sql: 'CREATE TABLE IF NOT EXISTS tenant_users', params: [], db: this.dbConfig.database });

            // Seed tenants table
            await query(
                `INSERT IGNORE INTO tenants (id, db_connection) VALUES (?, ?)`,
                ['tenant1', `${this.dbConfig.driver}://localhost/tenant1_db`]
            );
            logQuery('end', { sql: 'INSERT IGNORE INTO tenants', params: ['tenant1', `${this.dbConfig.driver}://localhost/tenant1_db`], db: this.dbConfig.database });

            // Seed tenant_users table
            await query(
                `INSERT IGNORE INTO tenant_users (email, tenant_id) VALUES (?, ?), (?, ?)`,
                ['john@tenant1.com', 'tenant1', 'shared@domain.com', 'tenant1']
            );
            await query(
                `INSERT IGNORE INTO tenant_users (email, tenant_id) VALUES (?, ?)`,
                ['shared@domain.com', 'tenant2']
            );
            logQuery('end', { sql: 'INSERT IGNORE INTO tenant_users', params: ['john@tenant1.com', 'tenant1', 'shared@domain.com', 'tenant1', 'shared@domain.com', 'tenant2'], db: this.dbConfig.database });

            console.log('Master DB seeding completed successfully');
        } catch (error) {
            console.error('Master DB seeding failed:', (error as Error).message);
            throw error;
        }
    }

    /**
     * Cleans up seeded data and tables from the master database.
     */
    async down(): Promise<void> {
        try {
            // Drop tables
            await query(`DROP TABLE IF EXISTS tenant_users`);
            await query(`DROP TABLE IF EXISTS tenants`);
            console.log('Master DB seed cleanup completed successfully');
        } catch (error) {
            console.error('Master DB seed cleanup failed:', (error as Error).message);
            throw error;
        }
    }
}

export default MasterSeeder;