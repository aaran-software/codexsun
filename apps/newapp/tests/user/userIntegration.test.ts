// tests/database/userIntegration.test.ts
import mariadb from 'mariadb';
import { MariaDBAdapter } from '../../src/adapters/mariadb';
import { withTenantContext, query } from '../../src/db';
import { createUser, getUserById, getUserByEmail, updateUser, deleteUser } from '../../src/user';
import { DbConfig, QueryResult } from '../../src/types';

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

// Utility to set up databases
async function setupDatabases(pool: mariadb.Pool): Promise<void> {
    const connection = await pool.getConnection();
    try {
        // Master database
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${masterDatabase}\``);
        await connection.query(`USE \`${masterDatabase}\``);
        const settingsTableExists = await connection.query(`SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tenant_settings'`, [masterDatabase]);
        if (!settingsTableExists.length) {
            await connection.query(`
                CREATE TABLE tenant_settings (
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
        for (const { database } of tenantDatabases) {
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
            await connection.query(`USE \`${database}\``);
            const usersTableExists = await connection.query(`SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`, [database]);
            if (!usersTableExists.length) {
                await connection.query(`
                    CREATE TABLE users (
                                           id INT AUTO_INCREMENT PRIMARY KEY,
                                           username VARCHAR(50) NOT NULL,
                                           email VARCHAR(255) NOT NULL,
                                           tenant_id VARCHAR(50) NOT NULL,
                                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                           UNIQUE (email)
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
        for (const { database } of tenantDatabases) {
            await connection.query(`DROP DATABASE IF EXISTS \`${database}\``);
        }
        await connection.query(`DROP DATABASE IF EXISTS \`${masterDatabase}\``);
    } finally {
        connection.release();
    }
}

describe('User Integration Tests (Real MariaDB)', () => {
    let setupPool: mariadb.Pool;

    jest.setTimeout(30000);

    beforeAll(async () => {
        MariaDBAdapter.initPool(baseDbConfig);
        setupPool = mariadb.createPool({ ...baseDbConfig, connectionLimit: 10, acquireTimeout: 20000 });
        await setupDatabases(setupPool);
        await setupPool.end();
    });

    afterAll(async () => {
        const cleanupPool = mariadb.createPool({ ...baseDbConfig, connectionLimit: 10, acquireTimeout: 20000 });
        await cleanupDatabases(cleanupPool);
        await cleanupPool.end();
        await MariaDBAdapter.closePool();
    });

    beforeEach(async () => {
        const tempPool = mariadb.createPool({ ...baseDbConfig, connectionLimit: 10, acquireTimeout: 20000 });
        const tempConnection = await tempPool.getConnection();
        try {
            for (const { database } of tenantDatabases) {
                const dbExists = await tempConnection.query(`SELECT 1 FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`, [database]);
                if (!dbExists.length) throw new Error(`Database ${database} does not exist`);
                await tempConnection.query(`USE \`${database}\``);
                await tempConnection.query('TRUNCATE TABLE users');
            }
        } finally {
            tempConnection.release();
            await tempPool.end();
        }
    });

    describe('User Management Tests', () => {
        test('[test 1] should create a user in a tenant database', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;

            await withTenantContext(tenant.tenantId, tenant.database, async () => {
                const result = await createUser({ username, email, tenantId: tenant.tenantId });
                expect(result.rowCount).toBe(1);

                const users = await query<{ id: number; username: string; email: string; tenant_id: string }>(
                    'SELECT * FROM users WHERE username = ?',
                    [username]
                );
                expect(users.rows).toHaveLength(1);
                expect(users.rows[0]).toMatchObject({
                    username,
                    email,
                    tenant_id: tenant.tenantId,
                });
            });
        });

        test('[test 2] should enforce tenant isolation for users', async () => {
            const tenant1 = tenantDatabases[0];
            const tenant2 = tenantDatabases[1];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;

            // Create user in tenant1
            await withTenantContext(tenant1.tenantId, tenant1.database, async () => {
                await createUser({ username, email, tenantId: tenant1.tenantId });
                const users = await query('SELECT * FROM users WHERE username = ?', [username]);
                expect(users.rows).toHaveLength(1);
                expect(users.rows[0].tenant_id).toBe(tenant1.tenantId);
            });

            // Verify user does not exist in tenant2
            await withTenantContext(tenant2.tenantId, tenant2.database, async () => {
                const users = await query('SELECT * FROM users WHERE username = ?', [username]);
                expect(users.rows).toHaveLength(0);
            });
        });

        test('[test 3] should handle concurrent user creation', async () => {
            const tenant = tenantDatabases[0];
            const promises: Promise<void>[] = [];
            const operationCount = 20;

            for (let i = 0; i < operationCount; i++) {
                const username = `user_${randomString(6)}`;
                const email = `${username}@example.com`;
                promises.push(
                    withTenantContext(tenant.tenantId, tenant.database, async () => {
                        const result = await createUser({ username, email, tenantId: tenant.tenantId });
                        expect(result.rowCount).toBe(1);
                        const users = await query('SELECT * FROM users WHERE username = ?', [username]);
                        expect(users.rows).toHaveLength(1);
                        expect(users.rows[0]).toMatchObject({ username, email, tenant_id: tenant.tenantId });
                    })
                );
            }
            await Promise.all(promises);

            // Verify total users
            await withTenantContext(tenant.tenantId, tenant.database, async () => {
                const result = await query('SELECT COUNT(*) as count FROM users');
                expect(Number(result.rows[0].count)).toBe(operationCount);
            });
        });

        test('[test 4] should fail to create user with duplicate email in same tenant', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;

            await withTenantContext(tenant.tenantId, tenant.database, async () => {
                // Create first user
                await createUser({ username, email, tenantId: tenant.tenantId });

                // Attempt to create another user with same email
                await expect(
                    createUser({ username: `user_${randomString(6)}`, email, tenantId: tenant.tenantId })
                ).rejects.toThrow(/Duplicate entry.*for key 'email'|ER_DUP_ENTRY/);

                // Verify only one user with the email exists
                const users = await query('SELECT * FROM users WHERE email = ?', [email]);
                expect(users.rows).toHaveLength(1);
            });
        });

        test('[test 5] should retrieve a user by ID', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;

            await withTenantContext(tenant.tenantId, tenant.database, async () => {
                const createResult = await createUser({ username, email, tenantId: tenant.tenantId });
                expect(createResult.rowCount).toBe(1);

                const user = await getUserById(Number(createResult.insertId), tenant.tenantId);
                expect(user).toMatchObject({
                    id: Number(createResult.insertId),
                    username,
                    email,
                    tenant_id: tenant.tenantId,
                });
            });
        });

        test('[test 6] should retrieve a user by email', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;

            await withTenantContext(tenant.tenantId, tenant.database, async () => {
                await createUser({ username, email, tenantId: tenant.tenantId });

                const user = await getUserByEmail(email, tenant.tenantId);
                expect(user).toMatchObject({
                    username,
                    email,
                    tenant_id: tenant.tenantId,
                });
            });
        });

        test('[test 7] should update a user’s details', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const newUsername = `updated_${randomString(6)}`;
            const newEmail = `${newUsername}@example.com`;

            await withTenantContext(tenant.tenantId, tenant.database, async () => {
                const createResult = await createUser({ username, email, tenantId: tenant.tenantId });
                expect(createResult.rowCount).toBe(1);

                const updateResult = await updateUser(Number(createResult.insertId), { username: newUsername, email: newEmail, tenantId: tenant.tenantId });
                expect(updateResult.rowCount).toBe(1);

                const users = await query<{ id: number; username: string; email: string; tenant_id: string }>(
                    'SELECT * FROM users WHERE id = ?',
                    [Number(createResult.insertId)]
                );
                expect(users.rows).toHaveLength(1);
                expect(users.rows[0]).toMatchObject({
                    username: newUsername,
                    email: newEmail,
                    tenant_id: tenant.tenantId,
                });

                // Verify email uniqueness
                await expect(
                    createUser({ username: `user_${randomString(6)}`, email: newEmail, tenantId: tenant.tenantId })
                ).rejects.toThrow(/Duplicate entry.*for key 'email'|ER_DUP_ENTRY/);
            });
        });

        test('[test 8] should delete a user', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;

            await withTenantContext(tenant.tenantId, tenant.database, async () => {
                const createResult = await createUser({ username, email, tenantId: tenant.tenantId });
                expect(createResult.rowCount).toBe(1);

                const deleteResult = await deleteUser(Number(createResult.insertId), tenant.tenantId);
                expect(deleteResult.rowCount).toBe(1);

                const users = await query('SELECT * FROM users WHERE id = ?', [Number(createResult.insertId)]);
                expect(users.rows).toHaveLength(0);
            });
        });

        test('[test 9] should handle concurrent user updates', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const promises: Promise<void>[] = [];
            const operationCount = 10;

            await withTenantContext(tenant.tenantId, tenant.database, async () => {
                const createResult = await createUser({ username, email, tenantId: tenant.tenantId });
                expect(createResult.rowCount).toBe(1);
                const userId = Number(createResult.insertId);

                for (let i = 0; i < operationCount; i++) {
                    const newUsername = `updated_${randomString(6)}`;
                    const newEmail = `${newUsername}@example.com`;
                    promises.push(
                        withTenantContext(tenant.tenantId, tenant.database, async () => {
                            const result = await updateUser(userId, { username: newUsername, email: newEmail, tenantId: tenant.tenantId });
                            expect(result.rowCount).toBe(1);
                        })
                    );
                }
                await Promise.all(promises);

                const users = await query('SELECT * FROM users WHERE id = ?', [userId]);
                expect(users.rows).toHaveLength(1);
            });
        });
    });
});