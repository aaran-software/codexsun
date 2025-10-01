// tests/multiTenant.test.ts
import { DbConfig, AnyDbClient, QueryResult } from '../../../cortex/db/types';
import mariadb from 'mariadb';
import { MariaDBAdapter } from '../../../cortex/db/adapters/mariadb';
import { withTenantContext } from '../../../cortex/tenant';
import { query, withTransaction, healthCheck } from '../../../cortex/db/db';

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
                                                tenant_id VARCHAR(50)
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

describe('Multi-Tenant Integration Tests (Real MariaDB)', () => {
    let setupPool: mariadb.Pool;

    jest.setTimeout(30000); // Increased timeout for multi-tenant tests

    beforeAll(async () => {
        MariaDBAdapter.initPool(baseDbConfig);
        setupPool = mariadb.createPool({
            ...baseDbConfig,
            connectionLimit: 5,
            acquireTimeout: 15000,
        });
        await setupTenantDatabases(setupPool);
        await setupPool.end();
    });

    afterAll(async () => {
        const cleanupPool = mariadb.createPool({
            ...baseDbConfig,
            connectionLimit: 5,
            acquireTimeout: 15000,
        });
        await cleanupTenantDatabases(cleanupPool);
        await cleanupPool.end();
        await MariaDBAdapter.closePool();
    });

    beforeEach(async () => {
        const tempPool = mariadb.createPool({
            ...baseDbConfig,
            connectionLimit: 5,
            acquireTimeout: 15000,
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

    test('[test 3] should rollback transactions on error in tenant databases', async () => {
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

    test('[test 4] should handle multiple concurrent queries across tenants', async () => {
        const promises: Promise<void>[] = [];
        for (let i = 0; i < 10; i++) {
            const { tenantId, database } = tenantDatabases[i % tenantDatabases.length];
            promises.push(
                withTenantContext(tenantId, database, async () => {
                    const randomName = randomString(10);
                    const insertResult = await query('INSERT INTO test_table (name, tenant_id) VALUES (?, ?)', [randomName, tenantId]);
                    expect(insertResult.rowCount).toBe(1);
                    const result = await query('SELECT * FROM test_table WHERE name = ?', [randomName]);
                    expect(result.rows).toHaveLength(1);
                    expect(result.rows[0].name).toBe(randomName);
                })
            );
        }
        await Promise.all(promises);
    });

    test('[test 5] should perform random queries and check health', async () => {
        for (const { tenantId, database } of tenantDatabases) {
            await withTenantContext(tenantId, database, async () => {
                // Random inserts
                const names: string[] = [];
                for (let i = 0; i < 5; i++) {
                    const randomName = randomString(8);
                    names.push(randomName);
                    const insertResult = await query('INSERT INTO test_table (name, tenant_id) VALUES (?, ?)', [randomName, tenantId]);
                    expect(insertResult.rowCount).toBe(1);
                    // Verify insertion immediately
                    const verifyResult = await query('SELECT * FROM test_table WHERE name = ?', [randomName]);
                    expect(verifyResult.rows).toHaveLength(1);
                }
                // Random select
                const result = await query('SELECT COUNT(*) as count FROM test_table');
                expect(Number(result.rows[0].count)).toBe(5); // Convert BigInt to number

                // Verify one of the inserted names
                const randomName = names[Math.floor(Math.random() * names.length)];
                const nameResult = await query('SELECT * FROM test_table WHERE name = ?', [randomName]);
                expect(nameResult.rows).toHaveLength(1);

                // Health check
                const isHealthy = await healthCheck(database);
                expect(isHealthy).toBe(true);
            });
        }
    });

    test('[test 6] should simulate production load with multiple transactions', async () => {
        const promises: Promise<void>[] = [];
        for (let i = 0; i < 15; i++) {
            const { tenantId, database } = tenantDatabases[i % tenantDatabases.length];
            promises.push(
                withTenantContext(tenantId, database, async () => {
                    await withTransaction(async (client) => {
                        const randomName = randomString(10);
                        await client.query('INSERT INTO test_table (name, tenant_id) VALUES (?, ?)', [randomName, tenantId]);
                        const result = await client.query('SELECT * FROM test_table WHERE name = ?', [randomName]);
                        expect(result.length).toBe(1); // Raw client.query
                    });
                })
            );
        }
        await Promise.all(promises);
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