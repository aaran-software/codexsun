// tests/database/databaseIntegration.test.ts
import { Connection } from '../../src/connection';
import { DbConfig, AnyDbClient, QueryResult } from '../../src/types';
import mariadb from 'mariadb';
import { MariaDBAdapter } from '../../src/adapters/mariadb';
import { withTenantContext, withTransaction, query, healthCheck } from '../../src/db';

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
                CREATE TABLE tenant_settings (
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
        for (const { database } of tenantDatabases) {
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
            await connection.query(`USE \`${database}\``);
            const tenantTableExists = await connection.query(`SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'test_table'`, [database]);
            if (!tenantTableExists.length) {
                await connection.query(`
                    CREATE TABLE test_table (
                                                id INT AUTO_INCREMENT PRIMARY KEY,
                                                name VARCHAR(255),
                                                tenant_id VARCHAR(50),
                                                data TEXT
                    )
                `);
            }
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
            for (const { database } of tenantDatabases) {
                const dbExists = await tempConnection.query(`SELECT 1 FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`, [database]);
                if (!dbExists.length) throw new Error(`Database ${database} does not exist`);
                await tempConnection.query(`USE \`${database}\``);
                await tempConnection.query('TRUNCATE TABLE test_table');
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
            for (const { tenantId, database } of tenantDatabases) {
                await withTenantContext(tenantId, database, async () => {
                    await expect(
                        withTransaction(async (client) => {
                            await client.query('INSERT INTO test_table (name, tenant_id) VALUES (?, ?)', ['rollback_name', tenantId]);
                            throw new Error('Simulated error');
                        })
                    ).rejects.toThrow('Transaction failed: Simulated error');
                    const result = await query('SELECT * FROM test_table WHERE name = ?', ['rollback_name']);
                    expect(result.rows).toHaveLength(0);
                });
            }
        });

        test('[test 4] should handle high-concurrency queries', async () => {
            const promises: Promise<void>[] = [];
            const operationCount = 50;
            for (let i = 0; i < operationCount; i++) {
                const { tenantId, database } = tenantDatabases[i % tenantDatabases.length];
                promises.push(
                    withTenantContext(tenantId, database, async () => {
                        const randomName = randomString(10);
                        const randomData = randomString(100);
                        const insertResult = await query(
                            'INSERT INTO test_table (name, tenant_id, data) VALUES (?, ?, ?)',
                            [randomName, tenantId, randomData]
                        );
                        expect(insertResult.rowCount).toBe(1);
                        const result = await query('SELECT * FROM test_table WHERE name = ?', [randomName]);
                        expect(result.rows).toHaveLength(1);
                        expect(result.rows[0].name).toBe(randomName);
                        expect(result.rows[0].tenant_id).toBe(tenantId);
                        expect(result.rows[0].data).toBe(randomData);
                    })
                );
            }
            await Promise.all(promises);
        });

        test('[test 5] should handle concurrent transactions with mixed reads and writes', async () => {
            const promises: Promise<void>[] = [];
            const operationCount = 30;
            for (let i = 0; i < operationCount; i++) {
                const { tenantId, database } = tenantDatabases[i % tenantDatabases.length];
                promises.push(
                    withTenantContext(tenantId, database, async () => {
                        await withTransaction(async (client) => {
                            const randomName = randomString(10);
                            await client.query('INSERT INTO test_table (name, tenant_id) VALUES (?, ?)', [randomName, tenantId]);
                            const countResult = await client.query('SELECT COUNT(*) as count FROM test_table WHERE tenant_id = ?', [tenantId]);
                            expect(Number(countResult[0].count)).toBeGreaterThanOrEqual(1);
                            const selectResult = await client.query('SELECT * FROM test_table WHERE name = ?', [randomName]);
                            expect(selectResult.length).toBe(1);
                        });
                    })
                );
            }
            await Promise.all(promises);
        });

        test('[test 6] should perform random queries and check health', async () => {
            for (const { tenantId, database } of tenantDatabases) {
                await withTenantContext(tenantId, database, async () => {
                    const names: string[] = [];
                    for (let i = 0; i < 5; i++) {
                        const randomName = randomString(8);
                        names.push(randomName);
                        const insertResult = await query('INSERT INTO test_table (name, tenant_id) VALUES (?, ?)', [randomName, tenantId]);
                        expect(insertResult.rowCount).toBe(1);
                        const verifyResult = await query('SELECT * FROM test_table WHERE name = ?', [randomName]);
                        expect(verifyResult.rows).toHaveLength(1);
                    }
                    const result = await query('SELECT COUNT(*) as count FROM test_table');
                    expect(Number(result.rows[0].count)).toBe(5);
                    const randomName = names[Math.floor(Math.random() * names.length)];
                    const nameResult = await query('SELECT * FROM test_table WHERE name = ?', [randomName]);
                    expect(nameResult.rows).toHaveLength(1);
                    const isHealthy = await healthCheck(database);
                    expect(isHealthy).toBe(true);
                });
            }
        });

        test('[test 7] should query master_db for tenant settings', async () => {
            const client = await MariaDBAdapter.getConnection(masterDatabase);
            try {
                const tableExists = await client.query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tenant_settings'`, [masterDatabase]);
                if (tableExists.length === 0) {
                    throw new Error('Table tenant_settings does not exist in master_db');
                }
                const result = await client.query('SELECT * FROM tenant_settings');
                expect(result.length).toBe(tenantDatabases.length);
                const tenantIds = tenantDatabases.map(t => t.tenantId);
                const tenantDbs = tenantDatabases.map(t => t.database);
                for (const row of result) {
                    expect(tenantIds).toContain(row.tenant_id);
                    expect(tenantDbs).toContain(row.database_name);
                }
            } finally {
                if (client.release) client.release();
                else if (client.end) await client.end();
            }
        });
    });

    // Deadlock Tests
    describe('Deadlock Tests', () => {
        test('[test 1] should handle single-tenant concurrent updates causing deadlocks', async () => {
            const { tenantId, database } = tenantDatabases[0];
            const promises: Promise<void>[] = [];
            const operationCount = 20;
            for (let i = 0; i < operationCount; i++) {
                promises.push(
                    withTransactionRetry(async (client) => {
                        await client.query(
                            'INSERT INTO tenant_settings (tenant_id, database_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE database_name = ?, last_updated = CURRENT_TIMESTAMP',
                            [tenantId, `updated_${tenantId}_${i}`, `updated_${tenantId}_${i}`]
                        );
                        await new Promise(resolve => setTimeout(resolve, 50));
                        const result = await client.query('SELECT * FROM tenant_settings WHERE tenant_id = ?', [tenantId]);
                        expect(result.length).toBe(1);
                    }, masterDatabase)
                );
            }
            await Promise.all(promises);

            const client = await MariaDBAdapter.getConnection(masterDatabase);
            try {
                const result = await client.query('SELECT * FROM tenant_settings WHERE tenant_id = ?', [tenantId]);
                expect(result.length).toBe(1);
                expect(result[0].database_name).toMatch(new RegExp(`^updated_${tenantId}_\\d+$`));
            } finally {
                if (client.release) client.release();
            }
        });

        test('[test 2] should handle single-tenant inserts and deletes causing deadlocks', async () => {
            const { tenantId, database } = tenantDatabases[0];
            const sharedName = 'shared_record';
            await withTenantContext(tenantId, database, async () => {
                await query('INSERT INTO test_table (name, tenant_id, data) VALUES (?, ?, ?)', [sharedName, tenantId, randomString(100)]);
            });

            const promises: Promise<void>[] = [];
            const operationCount = 15;
            for (let i = 0; i < operationCount; i++) {
                promises.push(
                    withTenantContext(tenantId, database, async () => {
                        await withTransactionRetry(async (client) => {
                            await client.query('DELETE FROM test_table WHERE name = ?', [sharedName]);
                            await new Promise(resolve => setTimeout(resolve, 50));
                            await client.query('INSERT INTO test_table (name, tenant_id, data) VALUES (?, ?, ?)', [sharedName, tenantId, randomString(100)]);
                        }, database);
                    })
                );
            }
            await Promise.all(promises);

            await withTenantContext(tenantId, database, async () => {
                const result = await query('SELECT * FROM test_table WHERE name = ?', [sharedName]);
                expect(result.rows).toHaveLength(1);
                expect(result.rows[0].name).toBe(sharedName);
            });
        });

        test('[test 3] should handle single-tenant mixed operations causing deadlocks', async () => {
            const { tenantId, database } = tenantDatabases[0];
            const sharedName = 'mixed_record';
            await withTenantContext(tenantId, database, async () => {
                await query('INSERT INTO test_table (name, tenant_id, data) VALUES (?, ?, ?)', [sharedName, tenantId, randomString(100)]);
            });

            const promises: Promise<void>[] = [];
            const operationCount = 20;
            for (let i = 0; i < operationCount; i++) {
                promises.push(
                    withTenantContext(tenantId, database, async () => {
                        await withTransactionRetry(async (client) => {
                            const action = i % 3;
                            if (action === 0) {
                                await client.query('UPDATE test_table SET data = ? WHERE name = ?', [randomString(100), sharedName]);
                            } else if (action === 1) {
                                await client.query('SELECT * FROM test_table WHERE name = ? FOR UPDATE', [sharedName]);
                                await new Promise(resolve => setTimeout(resolve, 50));
                            } else {
                                await client.query('INSERT INTO test_table (name, tenant_id, data) VALUES (?, ?, ?)', [`${sharedName}_${i}`, tenantId, randomString(100)]);
                            }
                        }, database);
                    })
                );
            }
            await Promise.all(promises);

            await withTenantContext(tenantId, database, async () => {
                const result = await query('SELECT * FROM test_table WHERE name = ?', [sharedName]);
                expect(result.rows).toHaveLength(1);
            });
        });

        test('[test 4] should recover from single-tenant deadlocks with retries', async () => {
            const { tenantId, database } = tenantDatabases[0];
            const sharedName = 'retry_record';
            await withTenantContext(tenantId, database, async () => {
                await query('INSERT INTO test_table (name, tenant_id, data) VALUES (?, ?, ?)', [sharedName, tenantId, randomString(100)]);
            });

            const promises: Promise<void>[] = [];
            const operationCount = 10;
            for (let i = 0; i < operationCount; i++) {
                promises.push(
                    withTenantContext(tenantId, database, async () => {
                        await withTransactionRetry(async (client) => {
                            await client.query('UPDATE test_table SET data = ? WHERE name = ?', [randomString(100), sharedName]);
                            await new Promise(resolve => setTimeout(resolve, 100));
                            const result = await client.query('SELECT * FROM test_table WHERE name = ?', [sharedName]);
                            expect(result.length).toBe(1);
                        }, database);
                    })
                );
            }
            await Promise.all(promises);

            await withTenantContext(tenantId, database, async () => {
                const result = await query('SELECT * FROM test_table WHERE name = ?', [sharedName]);
                expect(result.rows).toHaveLength(1);
            });
        });

        test('[test 5] should handle cross-tenant shared resource contention', async () => {
            const resourceId = 'shared1';
            const promises = tenantDatabases.map(({ tenantId, database }) =>
                withTransactionRetry(async (client) => {
                    await client.query(`USE \`${masterDatabase}\``);
                    await client.query('UPDATE shared_resources SET value = value + 1 WHERE resource_id = ?', [resourceId]);
                    await new Promise(resolve => setTimeout(resolve, 30));
                    await client.query(`USE \`${database}\``);
                    await client.query('INSERT INTO test_table (name, tenant_id) VALUES (?, ?)', [resourceId, tenantId]);
                }, database)
            );
            await Promise.all(promises);

            const client = await MariaDBAdapter.getConnection(masterDatabase);
            try {
                const result = await client.query('SELECT value FROM shared_resources WHERE resource_id = ?', [resourceId]);
                expect(result[0].value).toBe(tenantDatabases.length);
            } finally {
                if (client.release) client.release();
            }
        });

        test('[test 6] should handle cross-tenant interlinked updates', async () => {
            const promises = tenantDatabases.map(({ tenantId, database }, i) => {
                const nextTenant = tenantDatabases[(i + 1) % tenantDatabases.length];
                return withTransactionRetry(async (client) => {
                    await client.query(`USE \`${masterDatabase}\``);
                    await client.query('UPDATE tenant_settings SET shared_resource = shared_resource + 1 WHERE tenant_id = ?', [nextTenant.tenantId]);
                    await new Promise(resolve => setTimeout(resolve, 30));
                    await client.query(`USE \`${database}\``);
                    await client.query('INSERT INTO test_table (name, tenant_id) VALUES (?, ?)', [`record_${tenantId}`, tenantId]);
                }, database);
            });
            await Promise.all(promises);

            const client = await MariaDBAdapter.getConnection(masterDatabase);
            try {
                const result = await client.query('SELECT shared_resource FROM tenant_settings');
                for (const row of result) expect(row.shared_resource).toBeGreaterThanOrEqual(1);
            } finally {
                if (client.release) client.release();
            }
        });

        test('[test 7] should handle cross-tenant mixed operation deadlock', async () => {
            const sharedName = 'mixed';
            for (const { tenantId, database } of tenantDatabases) {
                await withTenantContext(tenantId, database, async () => {
                    await query('INSERT INTO test_table (name, tenant_id) VALUES (?, ?)', [sharedName, tenantId]);
                });
            }

            const promises = tenantDatabases.map(({ tenantId, database }, i) =>
                withTransactionRetry(async (client) => {
                    const action = i % 2;
                    if (action === 0) {
                        await client.query(`USE \`${masterDatabase}\``);
                        await client.query('UPDATE shared_resources SET value = value + 1 WHERE resource_id = ?', ['shared1']);
                        await new Promise(resolve => setTimeout(resolve, 30));
                    } else {
                        await client.query(`USE \`${database}\``);
                        await client.query('SELECT * FROM test_table WHERE name = ? FOR UPDATE', [sharedName]);
                    }
                }, database)
            );
            await Promise.all(promises);

            const client = await MariaDBAdapter.getConnection(masterDatabase);
            try {
                const result = await client.query('SELECT value FROM shared_resources WHERE resource_id = ?', ['shared1']);
                expect(result[0].value).toBeGreaterThanOrEqual(Math.floor(tenantDatabases.length / 2));
            } finally {
                if (client.release) client.release();
            }
        });

        test('[test 8] should handle optimized concurrent updates to tenant_settings', async () => {
            const promises = tenantDatabases.map(({ tenantId }) =>
                withTransactionRetry(async (client) => {
                    await client.query(
                        'INSERT INTO tenant_settings (tenant_id, database_name, shared_resource) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE shared_resource = shared_resource + 1, last_updated = CURRENT_TIMESTAMP',
                        [tenantId, `optimized_${tenantId}`]
                    );
                    const result = await client.query('SELECT shared_resource FROM tenant_settings WHERE tenant_id = ?', [tenantId]);
                    expect(result[0].shared_resource).toBeGreaterThanOrEqual(1);
                }, masterDatabase)
            );
            await Promise.all(promises);

            const client = await MariaDBAdapter.getConnection(masterDatabase);
            try {
                const result = await client.query('SELECT tenant_id, shared_resource FROM tenant_settings');
                expect(result.length).toBe(tenantDatabases.length);
                for (const { tenantId } of tenantDatabases) {
                    expect(result.find((r: any) => r.tenant_id === tenantId).shared_resource).toBeGreaterThanOrEqual(1);
                }
            } finally {
                if (client.release) client.release();
            }
        });
    });
});