// tests/multiTenantConciseCrossDeadlock.test.ts
import { DbConfig, AnyDbClient, QueryResult } from '../../../src/types';
import mariadb from 'mariadb';
import { MariaDBAdapter } from '../../../src/adapters/mariadb';
import { withTenantContext } from '../../../src/tenant';
import { query } from '../../../src/db';

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

        // Check and create shared_resources table
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

describe('Multi-Tenant Concise Cross-Deadlock Tests (Real MariaDB)', () => {
    let setupPool: mariadb.Pool;

    jest.setTimeout(30000);

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
            await tempConnection.query(`USE \`${masterDatabase}\``);
            await tempConnection.query('UPDATE shared_resources SET value = 0, last_updated = CURRENT_TIMESTAMP WHERE resource_id = ?', ['shared1']);
        } finally {
            tempConnection.release();
            await tempPool.end();
        }
    });

    test('[test 1] cross-tenant shared resource contention', async () => {
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
            if (client.release) {
                client.release();
            }
        }
    });

    test('[test 2] cross-tenant interlinked updates', async () => {
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
            if (client.release) {
                client.release();
            }
        }
    });

    test('[test 3] cross-tenant mixed operation deadlock', async () => {
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
            if (client.release) {
                client.release();
            }
        }
    });

    test('[test 4] cross-tenant deadlock recovery', async () => {
        const sharedName = 'recovery';
        for (const { tenantId, database } of tenantDatabases) {
            await withTenantContext(tenantId, database, async () => {
                await query('INSERT INTO test_table (name, tenant_id) VALUES (?, ?)', [sharedName, tenantId]);
            });
        }

        const promises = tenantDatabases.map(({ tenantId, database }) =>
            withTransactionRetry(async (client) => {
                await client.query(`USE \`${masterDatabase}\``);
                await client.query('UPDATE shared_resources SET value = value + 1 WHERE resource_id = ?', ['shared1']);
                await new Promise(resolve => setTimeout(resolve, 30));
                await client.query(`USE \`${database}\``);
                await client.query('UPDATE test_table SET name = ? WHERE name = ?', [`updated_${sharedName}`, sharedName]);
            }, database)
        );
        await Promise.all(promises);

        const client = await MariaDBAdapter.getConnection(masterDatabase);
        try {
            const result = await client.query('SELECT value FROM shared_resources WHERE resource_id = ?', ['shared1']);
            expect(result[0].value).toBe(tenantDatabases.length);
        } finally {
            if (client.release) {
                client.release();
            }
        }
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