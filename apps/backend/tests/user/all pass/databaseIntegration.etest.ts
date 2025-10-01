// tests/database/databaseIntegration.test.ts
import { Connection } from '../../../cortex/db/connection';
import { DbConfig, AnyDbClient, QueryResult } from '../../../cortex/db/types';
import mariadb from 'mariadb';
import { MariaDBAdapter } from '../../../cortex/db/adapters/mariadb';
import { withTenantContext, withTransaction, query, healthCheck } from '../../../cortex/db/db';

// Test database configuration
const baseDbConfig: Omit<DbConfig, 'database' | 'type'> = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Computer.1',
};

const testDatabase = 'codexsun_test';
const masterDatabase = 'master_db';
const tenantDatabases = [
    { tenantId: 'tenant1', database: 'tenant_1' },
    { tenantId: 'tenant2', database: 'tenant_2' },
    { tenantId: 'tenant3', database: 'tenant_3' },
];

// Function to create random string for test data
function randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Utility to set up databases
async function setupDatabases(pool: mariadb.Pool): Promise<void> {
    const connection = await pool.getConnection();
    try {
        // Single-tenant database
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${testDatabase}\``);
        await connection.query(`USE \`${testDatabase}\``);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS test_table (
                                                      id INT AUTO_INCREMENT PRIMARY KEY,
                                                      name VARCHAR(255)
                )
        `);

        // Master database
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${masterDatabase}\``);
        await connection.query(`USE \`${masterDatabase}\``);
        const settingsTableExists = await connection.query(`SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tenant_settings'`, [masterDatabase]);
        if (!settingsTableExists.length) {
            await connection.query(`
                CREATE TABLE IF NOT EXISTS tenant_settings (
                                                               tenant_id VARCHAR(50) PRIMARY KEY,
                    database_name VARCHAR(255) NOT NULL,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    shared_resource INT DEFAULT 0
                    )
            `);
        }
        const sharedTableExists = await connection.query(`SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'shared_resources'`, [masterDatabase]);
        if (!sharedTableExists.length) {
            await connection.query(`
                CREATE TABLE shared_resources (
                                                  resource_id VARCHAR(50) PRIMARY KEY,
                                                  value INT DEFAULT 0,
                                                  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            await connection.query('INSERT IGNORE INTO shared_resources (resource_id, value) VALUES (?, 0)', ['shared1']);
        }

        // Insert tenant details
        for (const { tenantId, database } of tenantDatabases) {
            await connection.query(
                'INSERT IGNORE INTO tenant_settings (tenant_id, database_name) VALUES (?, ?)',
                [tenantId, database]
            );
        }

        // Tenant databases
        for (const { database, tenantId } of tenantDatabases) {
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
            await connection.query(`USE \`${database}\``);
            const testTableExists = await connection.query(`SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'test_table'`, [database]);
            if (!testTableExists.length) {
                await connection.query(`
                    CREATE TABLE test_table (
                                                id INT AUTO_INCREMENT PRIMARY KEY,
                                                name VARCHAR(255),
                                                tenant_id VARCHAR(50),
                                                data TEXT
                    )
                `);
            }
            const usersTableExists = await connection.query(`SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`, [database]);
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
async function cleanupDatabases(pool: mariadb.Pool): Promise<void> {
    const connection = await pool.getConnection();
    try {
        await connection.query(`DROP DATABASE IF EXISTS \`${testDatabase}\``);
        for (const { database } of tenantDatabases) {
            await connection.query(`DROP DATABASE IF EXISTS \`${database}\``);
        }
        await connection.query(`DROP DATABASE IF EXISTS \`${masterDatabase}\``);
    } finally {
        connection.release();
    }
}

// Utility for transactions with retry on deadlock
async function withTransactionRetry<T>(
    callback: (client: AnyDbClient) => Promise<T>,
    database: string,
    maxRetries: number = 3
): Promise<T> {
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const client = await MariaDBAdapter.getConnection(database);
        try {
            await client.query('START TRANSACTION');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            lastError = error instanceof Error ? error : new Error('Unknown error');
            if (lastError.message.includes('Deadlock found') && attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 50 * attempt));
                continue;
            }
            throw lastError;
        } finally {
            if (client.release) client.release();
            else if (client.end) await client.end();
        }
    }
    throw lastError || new Error('Transaction failed after retries');
}

describe('Database Integration Tests (Real MariaDB)', () => {
    let setupPool: mariadb.Pool;
    let connection: Connection;

    jest.setTimeout(60000);

    beforeAll(async () => {
        MariaDBAdapter.initPool(baseDbConfig);
        setupPool = mariadb.createPool({ ...baseDbConfig, connectionLimit: 15, acquireTimeout: 30000 });
        await setupDatabases(setupPool);
        await setupPool.end();
    });

    afterAll(async () => {
        const cleanupPool = mariadb.createPool({ ...baseDbConfig, connectionLimit: 15, acquireTimeout: 30000 });
        await cleanupDatabases(cleanupPool);
        await cleanupPool.end();
        await MariaDBAdapter.closePool();
    });

    beforeEach(async () => {
        const tempPool = mariadb.createPool({ ...baseDbConfig, connectionLimit: 15, acquireTimeout: 30000 });
        const tempConnection = await tempPool.getConnection();
        try {
            await tempConnection.query(`USE \`${testDatabase}\``);
            await tempConnection.query('TRUNCATE TABLE test_table');
            for (const { database, tenantId } of tenantDatabases) {
                const dbExists = await tempConnection.query(`SELECT 1 FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`, [database]);
                if (!dbExists.length) throw new Error(`Database ${database} does not exist`);
                await tempConnection.query(`USE \`${database}\``);
                await tempConnection.query('TRUNCATE TABLE test_table');
                await tempConnection.query('TRUNCATE TABLE users');
                await tempConnection.query(
                    'INSERT INTO users (username, email, password_hash, role, tenant_id) VALUES (?, ?, ?, ?, ?)',
                    ['admin', 'admin@example.com', '$2b$10$tCreVQTbemTktnTUugIULefUd4kmLsrqOmF3QDvo8.S8.qkY4D5ZS', 'admin', tenantId]
                );
            }
            await tempConnection.query(`USE \`${masterDatabase}\``);
            await tempConnection.query('UPDATE shared_resources SET value = 0, last_updated = CURRENT_TIMESTAMP WHERE resource_id = ?', ['shared1']);
        } finally {
            tempConnection.release();
            await tempPool.end();
        }
        connection = new Connection({ ...baseDbConfig, database: testDatabase, type: 'mariadb' });
    });

    afterEach(async () => {
        try {
            if (connection.getClient()) {
                await connection.close();
            }
        } catch (error) {
            // Ignore cleanup errors
        }
    });

    // Connection Tests
    describe('Connection Tests', () => {
        test('[test 1] should initialize connection successfully', async () => {
            await expect(connection.init()).resolves.toBeUndefined();
            expect(connection.getClient()).toBeDefined();
            expect(connection.getConfig()).toEqual({ ...baseDbConfig, database: testDatabase, type: 'mariadb' });
        });

        test('[test 2] should fail to initialize with invalid credentials', async () => {
            await MariaDBAdapter.closePool();
            MariaDBAdapter.initPool({ ...baseDbConfig, user: 'invalid_user', password: 'wrong_password' });
            const invalidConnection = new Connection({ ...baseDbConfig, user: 'invalid_user', password: 'wrong_password', database: testDatabase, type: 'mariadb' });
            await expect(invalidConnection.init()).rejects.toThrow(
                /Access denied for user|ER_ACCESS_DENIED_ERROR|pool timeout|Connection refused/
            );
            expect(() => invalidConnection.getClient()).toThrow('Connection not initialized');
            await MariaDBAdapter.closePool();
            MariaDBAdapter.initPool(baseDbConfig);
        }, 20000);

        test('[test 3] should close connection successfully', async () => {
            await connection.init();
            await expect(connection.close()).resolves.toBeUndefined();
            expect(() => connection.getClient()).toThrow('Connection not initialized');
        });

        test('[test 4] should execute a simple query', async () => {
            await connection.init();
            const client = connection.getClient();
            const result = await client.query('SELECT 1 as value');
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('value', 1);
        });

        test('[test 5] should insert and retrieve data', async () => {
            await connection.init();
            const client = connection.getClient();
            await client.query('INSERT INTO test_table (name) VALUES (?)', ['test_name']);
            const result = await client.query('SELECT name FROM test_table');
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('name', 'test_name');
        });

        test('[test 6] should handle query errors gracefully', async () => {
            await connection.init();
            const client = connection.getClient();
            await expect(client.query('SELECT * FROM nonexistent_table')).rejects.toThrow(
                /Table '.*nonexistent_table' doesn't exist|ER_NO_SUCH_TABLE/
            );
        });

        test('[test 7] should handle multiple connections and closures', async () => {
            await connection.init();
            const secondConnection = new Connection({ ...baseDbConfig, database: testDatabase, type: 'mariadb' });
            await expect(secondConnection.init()).resolves.toBeUndefined();
            await expect(secondConnection.close()).resolves.toBeUndefined();
            await expect(connection.close()).resolves.toBeUndefined();
            expect(() => connection.getClient()).toThrow('Connection not initialized');
            expect(() => secondConnection.getClient()).toThrow('Connection not initialized');
        });
    });

    // Multi-Tenant Tests
    describe('Multi-Tenant Tests', () => {
        test('[test 1] should perform queries in different tenant databases', async () => {
            for (const { tenantId, database } of tenantDatabases) {
                await withTenantContext(tenantId, database, async () => {
                    const testName = `test_name_${tenantId}`;
                    const insertResult = await query('INSERT INTO test_table (name, tenant_id) VALUES (?, ?)', [testName, tenantId]);
                    expect(insertResult.rowCount).toBe(1);
                    const result = await query('SELECT * FROM test_table WHERE name = ?', [testName]);
                    expect(result.rows).toHaveLength(1);
                    expect(result.rows[0].name).toBe(testName);
                    expect(result.rows[0].tenant_id).toBe(tenantId);
                });
            }
            // Verify isolation
            await withTenantContext(tenantDatabases[0].tenantId, tenantDatabases[0].database, async () => {
                const result = await query('SELECT * FROM test_table WHERE name = ?', [`test_name_${tenantDatabases[0].tenantId}`]);
                expect(result.rows).toHaveLength(1);
                expect(result.rows[0].name).toBe(`test_name_${tenantDatabases[0].tenantId}`);
            });
            await withTenantContext(tenantDatabases[1].tenantId, tenantDatabases[1].database, async () => {
                const result = await query('SELECT * FROM test_table WHERE name = ?', [`test_name_${tenantDatabases[1].tenantId}`]);
                expect(result.rows).toHaveLength(1);
                expect(result.rows[0].name).toBe(`test_name_${tenantDatabases[1].tenantId}`);
            });
        });

        test('[test 2] should perform transactions in different tenant databases', async () => {
            for (const { tenantId, database } of tenantDatabases) {
                await withTenantContext(tenantId, database, async () => {
                    const testName = `trans_name_${tenantId}`;
                    await withTransaction(async (client) => {
                        await client.query('INSERT INTO test_table (name, tenant_id) VALUES (?, ?)', [testName, tenantId]);
                    });
                    const result = await query('SELECT * FROM test_table WHERE name = ?', [testName]);
                    expect(result.rows).toHaveLength(1);
                    expect(result.rows[0].name).toBe(testName);
                });
            }
        });

        test('[test 3] should rollback transactions on error', async () => {
            const tenant = tenantDatabases[0];
            const testName = `test_name_${randomString(6)}`;

            await expect(
                withTenantContext(tenant.tenantId, tenant.database, async () => {
                    await withTransaction(async (client) => {
                        await client.query('INSERT INTO test_table (name, tenant_id) VALUES (?, ?)', [testName, tenant.tenantId]);
                        throw new Error('Test error');
                    });
                })
            ).rejects.toThrow('Transaction failed: Test error');

            await withTenantContext(tenant.tenantId, tenant.database, async () => {
                const result = await query('SELECT * FROM test_table WHERE name = ?', [testName]);
                expect(result.rows).toHaveLength(0);
            });
        });

        test('[test 4] should handle concurrent operations across tenants', async () => {
            const promises: Promise<void>[] = [];
            const operationCount = 20;

            for (let i = 0; i < operationCount; i++) {
                const tenant = tenantDatabases[i % tenantDatabases.length];
                const testName = `test_name_${randomString(6)}`;
                promises.push(
                    withTenantContext(tenant.tenantId, tenant.database, async () => {
                        const result = await query('INSERT INTO test_table (name, tenant_id) VALUES (?, ?)', [testName, tenant.tenantId]);
                        expect(result.rowCount).toBe(1);
                    })
                );
            }
            await Promise.all(promises);
        });

        // Add more tests as needed...
    });
});