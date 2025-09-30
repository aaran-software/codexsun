// tests/multiTenantConcurrent.test.ts
import { DbConfig, AnyDbClient, QueryResult } from '../../../cortex/types';
import mariadb from 'mariadb';
import { MariaDBAdapter } from '../../../cortex/adapters/mariadb';
import { withTenantContext } from '../../../cortex/tenant';
import { query, withTransaction, healthCheck } from '../../../cortex/db';

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
                                                 database_name VARCHAR(255) NOT NULL
                )
            `);
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

describe('Multi-Tenant Concurrent Integration Tests (Real MariaDB)', () => {
    let setupPool: mariadb.Pool;

    jest.setTimeout(60000); // Increased timeout for high-concurrency tests

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
        } finally {
            tempConnection.release();
            await tempPool.end();
        }
    });

    test('[test 1] should handle high-concurrency inserts and selects', async () => {
        const promises: Promise<void>[] = [];
        const operationCount = 50; // High concurrency
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

    test('[test 2] should handle concurrent transactions with mixed reads and writes', async () => {
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

    test('[test 3] should stress test with very high concurrent queries', async () => {
        const promises: Promise<void>[] = [];
        const operationCount = 100;
        for (let i = 0; i < operationCount; i++) {
            const { tenantId, database } = tenantDatabases[i % tenantDatabases.length];
            promises.push(
                withTenantContext(tenantId, database, async () => {
                    const randomName = randomString(10);
                    const insertResult = await query('INSERT INTO test_table (name, tenant_id) VALUES (?, ?)', [randomName, tenantId]);
                    expect(insertResult.rowCount).toBe(1);
                    const result = await query('SELECT * FROM test_table WHERE name = ?', [randomName]);
                    expect(result.rows).toHaveLength(1);
                })
            );
        }
        await Promise.all(promises);
    });

    test('[test 4] should handle concurrent health checks across all tenants', async () => {
        const promises: Promise<void>[] = [];
        for (const { database } of tenantDatabases) {
            promises.push(
                (async () => {
                    const isHealthy = await healthCheck(database);
                    expect(isHealthy).toBe(true);
                })()
            );
        }
        await Promise.all(promises);
    });

    test('[test 5] should handle concurrent updates to tenant_settings in master_db', async () => {
        const promises: Promise<void>[] = [];
        const operationCount = 20;
        for (let i = 0; i < operationCount; i++) {
            const { tenantId } = tenantDatabases[i % tenantDatabases.length];
            promises.push(
                (async () => {
                    const client = await MariaDBAdapter.getConnection(masterDatabase);
                    try {
                        await client.query('START TRANSACTION');
                        try {
                            const tableExists = await client.query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tenant_settings'`, [masterDatabase]);
                            if (tableExists.length === 0) {
                                throw new Error('Table tenant_settings does not exist in master_db');
                            }
                            await client.query(
                                'INSERT INTO tenant_settings (tenant_id, database_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE database_name = ?',
                                [tenantId, `updated_${tenantId}`, `updated_${tenantId}`]
                            );
                            const result = await client.query('SELECT * FROM tenant_settings WHERE tenant_id = ?', [tenantId]);
                            expect(result.length).toBe(1);
                            expect(result[0].database_name).toBe(`updated_${tenantId}`);
                            await client.query('COMMIT');
                        } catch (error) {
                            await client.query('ROLLBACK');
                            throw error;
                        }
                    } finally {
                        if (client.release) client.release();
                        else if (client.end) await client.end();
                    }
                })()
            );
        }
        await Promise.all(promises);

        // Verify final state
        const client = await MariaDBAdapter.getConnection(masterDatabase);
        try {
            const result = await client.query('SELECT * FROM tenant_settings');
            expect(result.length).toBe(tenantDatabases.length);
            for (const { tenantId } of tenantDatabases) {
                const row = result.find((r: any) => r.tenant_id === tenantId);
                expect(row).toBeDefined();
                expect(row.database_name).toBe(`updated_${tenantId}`);
            }
        } finally {
            if (client.release) client.release();
            else if (client.end) await client.end();
        }
    });
});