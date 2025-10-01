// tests/utils/testUtils.ts
import mariadb from 'mariadb';
import { DbConfig } from '../../cortex/db/types';

// Test database configuration
export const baseDbConfig: Omit<DbConfig, 'database' | 'type'> = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Computer.1',
};

export const masterDatabase = 'master_db';
export const tenantDatabases = [
    { tenantId: 'tenant1', database: 'tenant_1' },
    { tenantId: 'tenant2', database: 'tenant_2' },
];

// Function to create random string for test data
export function randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Utility to set up databases
export async function setupDatabases(pool: mariadb.Pool): Promise<void> {
    const connection = await pool.getConnection();
    try {
        // Master database
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${masterDatabase}\``);
        await connection.query(`USE \`${masterDatabase}\``);
        const settingsTableExists = await connection.query(
            `SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tenant_settings'`,
            [masterDatabase]
        );
        if (!settingsTableExists.length) {
            await connection.query(`
                CREATE TABLE IF NOT EXISTS tenant_settings (
                    tenant_id VARCHAR(50) PRIMARY KEY,
                    database_name VARCHAR(255) NOT NULL,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
        }

        // Insert tenant details
        for (const { tenantId, database } of tenantDatabases) {
            await connection.query(
                'INSERT IGNORE INTO tenant_settings (tenant_id, database_name) VALUES (?, ?)',
                [tenantId, database]
            );
        }

        // Tenant databases with users table
        for (const { database, tenantId } of tenantDatabases) {
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
            await connection.query(`USE \`${database}\``);
            const usersTableExists = await connection.query(
                `SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`,
                [database]
            );
            if (!usersTableExists.length) {
                await connection.query(`
                    CREATE TABLE users (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(50) NOT NULL,
                        email VARCHAR(255) NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
                        tenant_id VARCHAR(50) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE (email)
                    )
                `);
            }
            // Create admin user
            await connection.query(
                'INSERT IGNORE INTO users (username, email, password_hash, role, tenant_id) VALUES (?, ?, ?, ?, ?)',
                ['admin', 'admin@example.com', '$2b$10$tCreVQTbemTktnTUugIULefUd4kmLsrqOmF3QDvo8.S8.qkY4D5ZS', 'admin', tenantId]
            );
        }
    } finally {
        connection.release();
    }
}

// Utility to clean up databases
export async function cleanupDatabases(pool: mariadb.Pool): Promise<void> {
    const connection = await pool.getConnection();
    try {
        for (const { database } of tenantDatabases) {
            await connection.query(`DROP DATABASE IF EXISTS \`${database}\``);
        }
        await connection.query(`DROP DATABASE IF EXISTS \`${masterDatabase}\``);
    } finally {
        connection.release();
    }
}

// Utility to reset tenant databases before each test
export async function resetTenantDatabases(): Promise<void> {
    const tempPool = mariadb.createPool({ ...baseDbConfig, connectionLimit: 10, acquireTimeout: 20000 });
    const tempConnection = await tempPool.getConnection();
    try {
        for (const { database, tenantId } of tenantDatabases) {
            const dbExists = await tempConnection.query(
                `SELECT 1 FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
                [database]
            );
            if (!dbExists.length) throw new Error(`Database ${database} does not exist`);
            await tempConnection.query(`USE \`${database}\``);
            await tempConnection.query('TRUNCATE TABLE users');
            await tempConnection.query(
                'INSERT INTO users (username, email, password_hash, role, tenant_id) VALUES (?, ?, ?, ?, ?)',
                ['admin', 'admin@example.com', '$2b$10$tCreVQTbemTktnTUugIULefUd4kmLsrqOmF3QDvo8.S8.qkY4D5ZS', 'admin', tenantId]
            );
        }
    } finally {
        tempConnection.release();
        await tempPool.end();
    }
}