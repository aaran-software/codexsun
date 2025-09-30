// tests/multiTenantCrossDeadlock.test.ts
import { DbConfig, AnyDbClient, QueryResult } from '../src/types';
import mariadb from 'mariadb';
import { MariaDBAdapter } from '../src/adapters/mariadb';
import { withTenantContext } from '../src/tenant';
import { query } from '../src/db';

// Test database configuration
const baseDbConfig: Omit<DbConfig, 'database' | 'type'> = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Computer.1',
};

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

// Utility to set up tenant databases and master_db
async function setupTenantDatabases(pool: mariadb.Pool): Promise<void> {
    const connection = await pool.getConnection();
    try {
        // Check if master_db exists
        const dbExists = await connection.query(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`, [masterDatabase]);
        if (dbExists.length === 0) {
            await connection.query(`CREATE DATABASE \`${masterDatabase}\``);
        }
        await connection.query(`USE \`${masterDatabase}\``);

        // Check if tenant_settings table exists
        const tableExists = await connection.query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tenant_settings'`, [masterDatabase]);
        if (tableExists.length === 0) {
            await connection.query(`
                CREATE TABLE tenant_settings (
                    tenant_id VARCHAR(50) PRIMARY KEY,
                    database_name VARCHAR(255) NOT NULL,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    shared_resource INT DEFAULT 0
                )
            `);
        }

        // Check if shared_resources table exists
        const sharedTableExists = await connection.query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'shared_resources'`, [masterDatabase]);
        if (sharedTableExists.length === 0) {
            await connection.query(`
                CREATE TABLE shared_resources (
                    resource_id VARCHAR(50) PRIMARY KEY,
                    value INT DEFAULT 0,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            await connection.query('INSERT INTO shared_resources (resource_id, value) VALUES (?, 0)', ['shared1']);
        }

        // Insert default tenant details
        for (const { tenantId, database } of tenantDatabases) {
            await connection.query(
                'INSERT IGNORE INTO tenant_settings (tenant_id, database_name) VALUES (?, ?)',
                [tenantId, database]
            );
        }

        // Create tenant databases and tables
        for (const { tenantId, database } of tenantDatabases) {
            // Check if tenant db exists
            const tenantDbExists = await connection.query(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`, [database]);
            if (tenantDbExists.length === 0) {
                await connection.query(`CREATE DATABASE \`${database}\``);
            }
            await connection.query(`USE \`${database}\``);

            // Check if test_table exists
            const tenantTableExists = await connection.query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'test_table'`, [database]);
            if (tenantTableExists.length === 0) {
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

// Utility to clean up tenant databases
async function cleanupTenantDatabases(pool: mariadb.Pool): Promise<void> {
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

// Utility for transactions with retry on deadlock
async function withTransactionRetry<T>(
    callback: (client: AnyDbClient) => Promise<T>,
    database: string,
    maxRetries: number = 5
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
                await new Promise(resolve => setTimeout(resolve, 100 * attempt)); // Exponential backoff
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

describe('Multi-Tenant Cross-Deadlock Integration Tests (Real MariaDB)', () => {
    let setupPool: mariadb.Pool;

    jest.setTimeout(60000); // Increased timeout for deadlock tests

    beforeAll(async () => {
        MariaDBAdapter.initPool(baseDbConfig);
        setupPool = mariadb.createPool({
            ...baseDbConfig,
            connectionLimit: 10,
            acquireTimeout: 20000,
        });
        await setupTenantDatabases(setupPool);
        await setupPool.end();
    });

    afterAll(async () => {
        const cleanupPool = mariadb.createPool({
            ...baseDbConfig,
            connectionLimit: 10,
            acquireTimeout: 20000,
        });
        await cleanupTenantDatabases(cleanupPool);
        await cleanupPool.end();
        await MariaDBAdapter.closePool();
    });

    beforeEach(async () => {
        const tempPool = mariadb.createPool({
            ...baseDbConfig,
            connectionLimit: 10,
            acquireTimeout: 20000,
        });
        const tempConnection = await tempPool.getConnection();
        try {
            for (const { database } of tenantDatabases) {
                const dbExists = await tempConnection.query(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`, [database]);
                if (dbExists.length === 0) {
                    throw new Error(`Database ${database} does not exist`);
                }
                await tempConnection.query(`USE \`${database}\``);
                const tableExists = await tempConnection.query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'test_table'`, [database]);
                if (tableExists.length === 0) {
                    throw new Error(`Table test_table does not exist in ${database}`);
                }
                await tempConnection.query('TRUNCATE TABLE test_table');
            }
            // Reset shared_resources in master_db
            await tempConnection.query(`USE \`${masterDatabase}\``);
            await tempConnection.query('UPDATE shared_resources SET value = 0, last_updated = CURRENT_TIMESTAMP WHERE resource_id = ?', ['shared1']);
        } finally {
            tempConnection.release();
            await tempPool.end();
        }
    });

    test('[test 1] should handle cross-tenant deadlocks on shared resource', async () => {
        const promises: Promise<void>[] = [];
        const operationCount = 15;
        const resourceId = 'shared1';
        for (let i = 0; i < operationCount; i++) {
            const { tenantId, database } = tenantDatabases[i % tenantDatabases.length];
            promises.push(
                withTenantContext(tenantId, database, async () => {
                    await withTransactionRetry(async (client) => {
                        // Update shared resource in master_db
                        await client.query(`USE \`${masterDatabase}\``);
                        await client.query('UPDATE shared_resources SET value = value + 1, last_updated = CURRENT_TIMESTAMP WHERE resource_id = ?', [resourceId]);
                        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate contention
                        // Insert into tenant database
                        await client.query(`USE \`${database}\``);
                        await client.query('INSERT INTO test_table (name, tenant_id, data) VALUES (?, ?, ?)', [resourceId, tenantId, randomString(100)]);
                    }, database);
                })
            );
        }
        await Promise.all(promises);

        // Verify final state
        const client = await MariaDBAdapter.getConnection(masterDatabase);
        try {
            const resourceResult = await client.query('SELECT value FROM shared_resources WHERE resource_id = ?', [resourceId]);
            expect(resourceResult[0].value).toBe(operationCount);
            for (const { tenantId, database } of tenantDatabases) {
                await withTenantContext(tenantId, database, async () => {
                    const result = await query('SELECT * FROM test_table WHERE name = ?', [resourceId]);
                    expect(result.rows.length).toBeGreaterThanOrEqual(1);
                });
            }
        } finally {
            if (client.release) client.release();
            else if (client.end) await client.end();
        }
    });

    test('[test 2] should handle cross-tenant deadlocks with interlinked updates', async () => {
        const promises: Promise<void>[] = [];
        const operationCount = 10;
        const resourceId = 'shared1';
        for (let i = 0; i < operationCount; i++) {
            const { tenantId, database } = tenantDatabases[i % tenantDatabases.length];
            const nextTenant = tenantDatabases[(i + 1) % tenantDatabases.length];
            promises.push(
                withTenantContext(tenantId, database, async () => {
                    await withTransactionRetry(async (client) => {
                        // Update shared resource in master_db
                        await client.query(`USE \`${masterDatabase}\``);
                        await client.query('UPDATE shared_resources SET value = value + 1, last_updated = CURRENT_TIMESTAMP WHERE resource_id = ?', [resourceId]);
                        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate contention
                        // Update next tenant's tenant_settings
                        await client.query(
                            'UPDATE tenant_settings SET shared_resource = shared_resource + 1, last_updated = CURRENT_TIMESTAMP WHERE tenant_id = ?',
                            [nextTenant.tenantId]
                        );
                        // Insert into own tenant database
                        await client.query(`USE \`${database}\``);
                        await client.query('INSERT INTO test_table (name, tenant_id, data) VALUES (?, ?, ?)', [resourceId, tenantId, randomString(100)]);
                    }, database);
                })
            );
        }
        await Promise.all(promises);

        // Verify final state
        const client = await MariaDBAdapter.getConnection(masterDatabase);
        try {
            const resourceResult = await client.query('SELECT value FROM shared_resources WHERE resource_id = ?', [resourceId]);
            expect(resourceResult[0].value).toBe(operationCount);
            const settingsResult = await client.query('SELECT * FROM tenant_settings');
            expect(settingsResult.length).toBe(tenantDatabases.length);
            for (const { tenantId } of tenantDatabases) {
                const row = settingsResult.find((r: any) => r.tenant_id === tenantId);
                expect(row.shared_resource).toBeGreaterThanOrEqual(1);
            }
        } finally {
            if (client.release) client.release();
            else if (client.end) await client.end();
        }
    });

    test('[test 3] should handle cross-tenant mixed operations deadlocks', async () => {
        const promises: Promise<void>[] = [];
        const operationCount = 15;
        const sharedName = 'cross_mixed';
        // Pre-insert shared record in each tenant database
        for (const { tenantId, database } of tenantDatabases) {
            await withTenantContext(tenantId, database, async () => {
                await query('INSERT INTO test_table (name, tenant_id, data) VALUES (?, ?, ?)', [sharedName, tenantId, randomString(100)]);
            });
        }

        for (let i = 0; i < operationCount; i++) {
            const { tenantId, database } = tenantDatabases[i % tenantDatabases.length];
            promises.push(
                withTenantContext(tenantId, database, async () => {
                    await withTransactionRetry(async (client) => {
                        const action = i % 3;
                        if (action === 0) {
                            // Update shared resource in master_db
                            await client.query(`USE \`${masterDatabase}\``);
                            await client.query('UPDATE shared_resources SET value = value + 1, last_updated = CURRENT_TIMESTAMP WHERE resource_id = ?', ['shared1']);
                            await new Promise(resolve => setTimeout(resolve, 50)); // Simulate contention
                        } else if (action === 1) {
                            // Lock record in tenant database
                            await client.query(`USE \`${database}\``);
                            await client.query('SELECT * FROM test_table WHERE name = ? FOR UPDATE', [sharedName]);
                            await new Promise(resolve => setTimeout(resolve, 50)); // Simulate contention
                        } else {
                            // Update tenant database
                            await client.query(`USE \`${database}\``);
                            await client.query('UPDATE test_table SET data = ? WHERE name = ?', [randomString(100), sharedName]);
                        }
                    }, database);
                })
            );
        }
        await Promise.all(promises);

        // Verify final state
        const client = await MariaDBAdapter.getConnection(masterDatabase);
        try {
            const resourceResult = await client.query('SELECT value FROM shared_resources WHERE resource_id = ?', ['shared1']);
            expect(resourceResult[0].value).toBeGreaterThanOrEqual(Math.floor(operationCount / 3));
            for (const { tenantId, database } of tenantDatabases) {
                await withTenantContext(tenantId, database, async () => {
                    const result = await query('SELECT * FROM test_table WHERE name = ?', [sharedName]);
                    expect(result.rows).toHaveLength(1);
                });
            }
        } finally {
            if (client.release) client.release();
            else if (client.end) await client.end();
        }
    });

    test('[test 4] should recover from cross-tenant deadlocks with retries', async () => {
        const promises: Promise<void>[] = [];
        const operationCount = 10;
        const sharedName = 'cross_retry';
        // Pre-insert shared record in each tenant database
        for (const { tenantId, database } of tenantDatabases) {
            await withTenantContext(tenantId, database, async () => {
                await query('INSERT INTO test_table (name, tenant_id, data) VALUES (?, ?, ?)', [sharedName, tenantId, randomString(100)]);
            });
        }

        for (let i = 0; i < operationCount; i++) {
            const { tenantId, database } = tenantDatabases[i % tenantDatabases.length];
            promises.push(
                withTenantContext(tenantId, database, async () => {
                    await withTransactionRetry(async (client) => {
                        // Update master_db shared resource
                        await client.query(`USE \`${masterDatabase}\``);
                        await client.query('UPDATE shared_resources SET value = value + 1, last_updated = CURRENT_TIMESTAMP WHERE resource_id = ?', ['shared1']);
                        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate contention
                        // Update tenant database
                        await client.query(`USE \`${database}\``);
                        await client.query('UPDATE test_table SET data = ? WHERE name = ?', [randomString(100), sharedName]);
                        const result = await client.query('SELECT * FROM test_table WHERE name = ?', [sharedName]);
                        expect(result.length).toBe(1);
                    }, database);
                })
            );
        }
        await Promise.all(promises);

        // Verify final state
        const client = await MariaDBAdapter.getConnection(masterDatabase);
        try {
            const resourceResult = await client.query('SELECT value FROM shared_resources WHERE resource_id = ?', ['shared1']);
            expect(resourceResult[0].value).toBe(operationCount);
            for (const { tenantId, database } of tenantDatabases) {
                await withTenantContext(tenantId, database, async () => {
                    const result = await query('SELECT * FROM test_table WHERE name = ?', [sharedName]);
                    expect(result.rows).toHaveLength(1);
                });
            }
        } finally {
            if (client.release) client.release();
            else if (client.end) await client.end();
        }
    });

    test('[test 5] should handle optimized concurrent updates to tenant_settings', async () => {
        const promises: Promise<void>[] = tenantDatabases.map(({ tenantId }) =>
            withTransactionRetry(async (client) => {
                const tableExists = await client.query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tenant_settings'`, [masterDatabase]);
                if (tableExists.length === 0) {
                    throw new Error('Table tenant_settings does not exist in master_db');
                }
                await client.query(
                    'INSERT INTO tenant_settings (tenant_id, database_name, last_updated, shared_resource) VALUES (?, ?, CURRENT_TIMESTAMP, 0) ON DUPLICATE KEY UPDATE database_name = ?, last_updated = CURRENT_TIMESTAMP, shared_resource = shared_resource + 1',
                    [tenantId, `optimized_${tenantId}`, `optimized_${tenantId}`]
                );
                const result = await client.query('SELECT * FROM tenant_settings WHERE tenant_id = ?', [tenantId]);
                expect(result.length).toBe(1);
                expect(result[0].database_name).toBe(`optimized_${tenantId}`);
                expect(result[0].shared_resource).toBeGreaterThanOrEqual(1);
            }, masterDatabase)
        );

        await Promise.all(promises);

        // Verify final state
        const client = await MariaDBAdapter.getConnection(masterDatabase);
        try {
            const result = await client.query('SELECT * FROM tenant_settings');
            expect(result.length).toBe(tenantDatabases.length);
            for (const { tenantId } of tenantDatabases) {
                const row = result.find((r: any) => r.tenant_id === tenantId);
                expect(row).toBeDefined();
                expect(row.database_name).toBe(`optimized_${tenantId}`);
                expect(row.shared_resource).toBeGreaterThanOrEqual(1);
            }
        } finally {
            if (client.release) client.release();
            else if (client.end) await client.end();
        }
    });
});