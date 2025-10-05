import { tenantStorage, query } from '../../db/db';
import { getDbConfig } from '../../config/db-config';
import { logQuery } from '../../config/logger';

/**
 * Seeder class to populate tenant databases with default data for ERP system.
 */
export class TenantSeeder {
    private readonly dbConfig = getDbConfig();
    private readonly tenantDb = 'tenant_db';

    /**
     * Seeds default data into tenant databases.
     * Creates and populates users and todos tables in the specified tenant DB.
     */
    async up(): Promise<void> {
        try {
            await tenantStorage.run(this.tenantDb, async () => {
                // Create users table
                await query(
                    `CREATE TABLE IF NOT EXISTS users (
                        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(255),
                        email VARCHAR(255) UNIQUE,
                        password_hash VARCHAR(255),
                        mobile VARCHAR(20) NULL,
                        status VARCHAR(50) NULL,
                        tenant_id VARCHAR(50),
                        role VARCHAR(50) NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )`
                );
                logQuery('end', { sql: 'CREATE TABLE IF NOT EXISTS users', params: [], db: this.tenantDb });

                // Create todos table
                await query(
                    `CREATE TABLE IF NOT EXISTS todos (
                        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                        slug VARCHAR(255) UNIQUE,
                        title VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )`
                );
                logQuery('end', { sql: 'CREATE TABLE IF NOT EXISTS todos', params: [], db: this.tenantDb });

                // Seed users table
                await query(
                    `INSERT IGNORE INTO users (username, email, password_hash, tenant_id, role) VALUES (?, ?, ?, ?, ?)`,
                    ['john_doe', 'john@tenant1.com', 'hashed_password', 'tenant1', 'admin']
                );
                logQuery('end', { sql: 'INSERT IGNORE INTO users', params: ['john_doe', 'john@tenant1.com', 'hashed_password', 'tenant1', 'admin'], db: this.tenantDb });

                // Seed todos table
                await query(
                    `INSERT IGNORE INTO todos (slug, title) VALUES (?, ?)`,
                    ['task-1', 'Sample Task']
                );
                logQuery('end', { sql: 'INSERT IGNORE INTO todos', params: ['task-1', 'Sample Task'], db: this.tenantDb });
            });

            console.log('Tenant DB seeding completed successfully');
        } catch (error) {
            console.error('Tenant DB seeding failed:', (error as Error).message);
            throw error;
        }
    }

    /**
     * Cleans up seeded data and tables from tenant databases.
     */
    async down(): Promise<void> {
        try {
            await tenantStorage.run(this.tenantDb, async () => {
                // Drop tables
                await query(`DROP TABLE IF EXISTS users`);
                await query(`DROP TABLE IF EXISTS todos`);
            });
            console.log('Tenant DB seed cleanup completed successfully');
        } catch (error) {
            console.error('Tenant DB seed cleanup failed:', (error as Error).message);
            throw error;
        }
    }
}

export default TenantSeeder;