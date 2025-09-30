// tests/api/userRoleApi.test.ts
import supertest from 'supertest';
import express from 'express';
import { createUserRouter } from '../../src/api/user';
import { createAuthRouter } from '../../src/api/auth';
import mariadb from 'mariadb';
import { MariaDBAdapter } from '../../src/adapters/mariadb';
import { DbConfig } from '../../src/types';

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
        for (const { database } of tenantDatabases) {
            await connection.query(`DROP DATABASE IF EXISTS \`${database}\``);
        }
        await connection.query(`DROP DATABASE IF EXISTS \`${masterDatabase}\``);
    } finally {
        connection.release();
    }
}

describe('User Role-Based Access API Tests', () => {
    let app: express.Express;
    let request: supertest.SuperTest<supertest.Test>;
    let setupPool: mariadb.Pool;

    jest.setTimeout(30000);

    beforeAll(async () => {
        MariaDBAdapter.initPool(baseDbConfig);
        setupPool = mariadb.createPool({ ...baseDbConfig, connectionLimit: 10, acquireTimeout: 20000 });
        await setupDatabases(setupPool);
        await setupPool.end();

        app = express();
        app.use(express.json());
        app.use('/api/auth', createAuthRouter());
        app.use('/api/users', createUserRouter());
        request = supertest(app);
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
            for (const { database, tenantId } of tenantDatabases) {
                const dbExists = await tempConnection.query(`SELECT 1 FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`, [database]);
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
    });

    async function getToken(tenantId: string, email: string, password: string): Promise<string> {
        const loginResponse = await request
            .post('/api/auth/login')
            .set('X-Tenant-Id', tenantId)
            .send({ email, password });
        return loginResponse.body.token;
    }

    describe('Role-Based Access Control', () => {
        test('[test 1] should allow admin to create a user', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const token = await getToken(tenant.tenantId, 'admin@example.com', 'admin123');

            const response = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({ username, email, password, role: 'user' });

            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                id: expect.any(Number),
                username,
                email,
                role: 'user',
                tenant_id: tenant.tenantId,
            });
            expect(response.body.created_at).toBeDefined();
        });

        test('[test 2] should deny regular user from creating a user', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant.tenantId, 'admin@example.com', 'admin123');

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ username, email, password, role: 'user' })
                .expect(201);

            const userToken = await getToken(tenant.tenantId, email, password);

            const response = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ username: `new_${randomString(6)}`, email: `new_${randomString(6)}@example.com`, password: `pass_${randomString(8)}`, role: 'user' });

            expect(response.status).toBe(403);
            expect(response.body.error).toBe('Admin access required');
        });

        test('[test 3] should allow admin to update any user', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const newUsername = `updated_${randomString(6)}`;
            const newEmail = `${newUsername}@example.com`;
            const newPassword = `pass_${randomString(8)}`;
            const token = await getToken(tenant.tenantId, 'admin@example.com', 'admin123');

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({ username, email, password, role: 'user' })
                .expect(201);

            const userId = createResponse.body.id;

            const response = await request
                .put(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({ username: newUsername, email: newEmail, password: newPassword });

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                id: userId,
                username: newUsername,
                email: newEmail,
                role: 'user',
                tenant_id: tenant.tenantId,
            });
        });

        test('[test 4] should allow regular user to update their own profile', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const newUsername = `updated_${randomString(6)}`;
            const newEmail = `${newUsername}@example.com`;
            const newPassword = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant.tenantId, 'admin@example.com', 'admin123');

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ username, email, password, role: 'user' })
                .expect(201);

            const userId = createResponse.body.id;
            const userToken = await getToken(tenant.tenantId, email, password);

            const response = await request
                .put(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ username: newUsername, email: newEmail, password: newPassword });

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                id: userId,
                username: newUsername,
                email: newEmail,
                role: 'user',
                tenant_id: tenant.tenantId,
            });
        });

        test('[test 5] should deny regular user from updating another user', async () => {
            const tenant = tenantDatabases[0];
            const username1 = `user1_${randomString(6)}`;
            const email1 = `${username1}@example.com`;
            const password1 = `pass_${randomString(8)}`;
            const username2 = `user2_${randomString(6)}`;
            const email2 = `${username2}@example.com`;
            const password2 = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant.tenantId, 'admin@example.com', 'admin123');

            const createResponse1 = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ username: username1, email: email1, password: password1, role: 'user' })
                .expect(201);

            const userId1 = createResponse1.body.id;

            await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ username: username2, email: email2, password: password2, role: 'user' })
                .expect(201);

            const userToken = await getToken(tenant.tenantId, email1, password1);

            const response = await request
                .put(`/api/users/${userId1 + 1}`)
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ username: `updated_${randomString(6)}`, email: `updated_${randomString(6)}@example.com`, password: `pass_${randomString(8)}` });

            expect(response.status).toBe(403);
            expect(response.body.error).toBe('Admin access required or cannot modify another user');
        });

        test('[test 6] should allow admin to delete any user', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const token = await getToken(tenant.tenantId, 'admin@example.com', 'admin123');

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({ username, email, password, role: 'user' })
                .expect(201);

            const userId = createResponse.body.id;

            const response = await request
                .delete(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(204);

            const verifyResponse = await request
                .get(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`);

            expect(verifyResponse.status).toBe(404);
            expect(verifyResponse.body.error).toBe('User not found');
        });

        test('[test 7] should deny regular user from deleting any user', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant.tenantId, 'admin@example.com', 'admin123');

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ username, email, password, role: 'user' })
                .expect(201);

            const userId = createResponse.body.id;
            const userToken = await getToken(tenant.tenantId, email, password);

            const response = await request
                .delete(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403);
            expect(response.body.error).toBe('Admin access required');
        });

        test('[test 8] should allow regular user to view their own profile', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant.tenantId, 'admin@example.com', 'admin123');

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ username, email, password, role: 'user' })
                .expect(201);

            const userId = createResponse.body.id;
            const userToken = await getToken(tenant.tenantId, email, password);

            const response = await request
                .get(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                id: userId,
                username,
                email,
                role: 'user',
                tenant_id: tenant.tenantId,
            });
        });

        test('[test 9] should deny regular user from viewing another user', async () => {
            const tenant = tenantDatabases[0];
            const username1 = `user1_${randomString(6)}`;
            const email1 = `${username1}@example.com`;
            const password1 = `pass_${randomString(8)}`;
            const username2 = `user2_${randomString(6)}`;
            const email2 = `${username2}@example.com`;
            const password2 = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant.tenantId, 'admin@example.com', 'admin123');

            const createResponse1 = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ username: username1, email: email1, password: password1, role: 'user' })
                .expect(201);

            const userId2 = (await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ username: username2, email: email2, password: password2, role: 'user' })
                .expect(201)).body.id;

            const userToken = await getToken(tenant.tenantId, email1, password1);

            const response = await request
                .get(`/api/users/${userId2}`)
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403);
            expect(response.body.error).toBe('Cannot access another user');
        });

        test('[test 10] should enforce tenant isolation with roles', async () => {
            const tenant1 = tenantDatabases[0];
            const tenant2 = tenantDatabases[1];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const token = await getToken(tenant1.tenantId, 'admin@example.com', 'admin123');

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant1.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({ username, email, password, role: 'user' })
                .expect(201);

            const userId = createResponse.body.id;

            const tenant2Token = await getToken(tenant2.tenantId, 'admin@example.com', 'admin123');

            const response = await request
                .get(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant2.tenantId)
                .set('Authorization', `Bearer ${tenant2Token}`);

            expect(response.status).toBe(403);
            expect(response.body.error).toBe('Tenant ID mismatch');
        });
    });
});