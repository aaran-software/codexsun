// tests/multiTenantDeadlock.test.ts
import { DbConfig, AnyDbClient, QueryResult } from '../../../cortex/types';
import mariadb from 'mariadb';
import { MariaDBAdapter } from '../../../cortex/adapters/mariadb';
import { withTenantContext } from '../../../cortex/tenant';
import { query } from '../../../cortex/db';

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
    return Array(length).fill(0).map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
}

// Utility to set up tenant databases and master_db
async function setupTenantDatabases(pool: mariadb.Pool): Promise<void> {
    const connection = await pool.getConnection();
    try {
        // Check and create master_db
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${masterDatabase}\``);
        await connection.query(`USE \`${masterDatabase}\``);

        // Check and create tenant_settings table
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

        // Insert default tenant details
        for (const { tenantId, database } of tenantDatabases) {
            await connection.query(
                'INSERT IGNORE INTO tenant_settings (tenant_id, database_name) VALUES (?, ?)',
                [tenantId, database]
            );
        }

        // Create tenant databases and tables
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
                await new Promise(resolve => setTimeout(resolve, 100 * attempt));
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

describe('Multi-Tenant Deadlock Integration Tests (Real MariaDB)', () => {
    let setupPool: mariadb.Pool;

    jest.setTimeout(60000);

    beforeAll(async () => {
        MariaDBAdapter.initPool(baseDbConfig);
        setupPool = mariadb.createPool({ ...baseDbConfig, connectionLimit: 15, acquireTimeout: 20000 });
        await setupTenantDatabases(setupPool);
        await setupPool.end();
    });

    afterAll(async () => {
        const cleanupPool = mariadb.createPool({ ...baseDbConfig, connectionLimit: 15, acquireTimeout: 20000 });
        await cleanupTenantDatabases(cleanupPool);
        await cleanupPool.end();
        await MariaDBAdapter.closePool();
    });

    beforeEach(async () => {
        const tempPool = mariadb.createPool({ ...baseDbConfig, connectionLimit: 15, acquireTimeout: 20000 });
        const tempConnection = await tempPool.getConnection();
        try {
            for (const { database } of tenantDatabases) {
                const dbExists = await tempConnection.query(`SELECT 1 FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`, [database]);
                if (!dbExists.length) throw new Error(`Database ${database} does not exist`);
                await tempConnection.query(`USE \`${database}\``);
                const tableExists = await tempConnection.query(`SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'test_table'`, [database]);
                if (!tableExists.length) throw new Error(`Table test_table does not exist in ${database}`);
                await tempConnection.query('TRUNCATE TABLE test_table');
            }
        } finally {
            tempConnection.release();
            await tempPool.end();
        }
    });

    test('[test 1] should handle concurrent updates causing potential deadlocks', async () => {
        const promises: Promise<void>[] = [];
        const operationCount = 20;
        const sharedTenantId = tenantDatabases[0].tenantId;
        for (let i = 0; i < operationCount; i++) {
            promises.push(
                withTransactionRetry(async (client) => {
                    await client.query(
                        'INSERT INTO tenant_settings (tenant_id, database_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE database_name = ?, last_updated = CURRENT_TIMESTAMP',
                        [sharedTenantId, `updated_${sharedTenantId}_${i}`, `updated_${sharedTenantId}_${i}`]
                    );
                    await new Promise(resolve => setTimeout(resolve, 50));
                    const result = await client.query('SELECT * FROM tenant_settings WHERE tenant_id = ?', [sharedTenantId]);
                    expect(result.length).toBe(1);
                }, masterDatabase)
            );
        }
        await Promise.all(promises);

        const client = await MariaDBAdapter.getConnection(masterDatabase);
        try {
            const result = await client.query('SELECT * FROM tenant_settings WHERE tenant_id = ?', [sharedTenantId]);
            expect(result.length).toBe(1);
            expect(result[0].database_name).toMatch(new RegExp(`^updated_${sharedTenantId}_\\d+$`));
        } finally {
            if (client.release) {
                client.release();
            }
        }
    });

    test('[test 2] should handle concurrent inserts and deletes causing deadlocks', async () => {
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

    test('[test 3] should handle mixed operations causing potential deadlocks', async () => {
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

    test('[test 4] should recover from deadlocks with retries', async () => {
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

    test('[test 5] optimized concurrent updates to tenant_settings', async () => {
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
            if (client.release) {
                client.release();
            }
        }
    });
});