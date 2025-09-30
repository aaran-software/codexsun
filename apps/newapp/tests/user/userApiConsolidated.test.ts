// tests/api/userApiConsolidated.test.ts
import supertest from 'supertest';
import express from 'express';
import { createUserRouter } from '../../cortex/api/api-user';
import { createAuthRouter } from '../../cortex/api/api-auth';
import mariadb from 'mariadb';
import { MariaDBAdapter } from '../../cortex/adapters/mariadb';
import { baseDbConfig, masterDatabase, tenantDatabases, setupDatabases, cleanupDatabases, resetTenantDatabases, randomString } from '../utils/testUtils';

describe('Consolidated User API Tests', () => {
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
        await resetTenantDatabases();
    });

    async function getToken(tenantId: string, email: string = 'admin@example.com', password: string = 'admin123'): Promise<string> {
        const loginResponse = await request
            .post('/api/auth/login')
            .set('X-Tenant-Id', tenantId)
            .send({ email, password });
        return loginResponse.body.token;
    }

    describe('Database and Table Existence', () => {
        test('[test 1] should verify master and tenant databases and tables exist', async () => {
            const pool = mariadb.createPool({ ...baseDbConfig, connectionLimit: 10, acquireTimeout: 20000 });
            const connection = await pool.getConnection();
            try {
                // Check master database
                const masterDbExists = await connection.query(
                    `SELECT 1 FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
                    [masterDatabase]
                );
                expect(masterDbExists.length).toBeGreaterThan(0);

                const settingsTableExists = await connection.query(
                    `SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tenant_settings'`,
                    [masterDatabase]
                );
                expect(settingsTableExists.length).toBeGreaterThan(0);

                // Check tenant databases and users table
                for (const { database } of tenantDatabases) {
                    const tenantDbExists = await connection.query(
                        `SELECT 1 FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
                        [database]
                    );
                    expect(tenantDbExists.length).toBeGreaterThan(0);

                    await connection.query(`USE \`${database}\``);
                    const usersTableExists = await connection.query(
                        `SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`,
                        [database]
                    );
                    expect(usersTableExists.length).toBeGreaterThan(0);
                }
            } finally {
                connection.release();
                await pool.end();
            }
        });
    });

    describe('JWT Authentication', () => {
        test('[test 2] should login with valid credentials and return JWT', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant.tenantId);

            await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ username, email, password, role: 'user' })
                .expect(201);

            const response = await request
                .post('/api/auth/login')
                .set('X-Tenant-Id', tenant.tenantId)
                .send({ email, password });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body.token).toBeDefined();
        });

        test('[test 3] should fail login with invalid credentials', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant.tenantId);

            await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ username, email, password, role: 'user' })
                .expect(201);

            const response = await request
                .post('/api/auth/login')
                .set('X-Tenant-Id', tenant.tenantId)
                .send({ email, password: `wrong_${randomString(8)}` });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Invalid credentials');
        });

        test('[test 4] should access protected route with valid JWT', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant.tenantId);

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

        test('[test 5] should fail protected route with invalid JWT', async () => {
            const tenant = tenantDatabases[0];
            const response = await request
                .get('/api/users/1')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', 'Bearer invalid_token');

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Invalid or expired token');
        });

        test('[test 6] should fail protected route with missing JWT', async () => {
            const tenant = tenantDatabases[0];
            const response = await request
                .get('/api/users/1')
                .set('X-Tenant-Id', tenant.tenantId);

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Authorization token required');
        });

        test('[test 7] should enforce tenant isolation with JWT', async () => {
            const tenant1 = tenantDatabases[0];
            const tenant2 = tenantDatabases[1];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant1.tenantId);

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant1.tenantId)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ username, email, password, role: 'user' })
                .expect(201);

            const userId = createResponse.body.id;
            const userToken = await getToken(tenant1.tenantId, email, password);

            const response = await request
                .get(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant2.tenantId)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403);
            expect(response.body.error).toBe('Tenant ID mismatch');
        });
    });

    describe('User CRUD Operations', () => {
        test('[test 8] should create a user via POST /users as admin', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const token = await getToken(tenant.tenantId);

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

        test('[test 9] should deny regular user from creating a user', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant.tenantId);

            await request
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

        test('[test 10] should fail to create user with duplicate email', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const token = await getToken(tenant.tenantId);

            await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({ username, email, password, role: 'user' })
                .expect(201);

            const response = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({ username: `user_${randomString(6)}`, email, password: `pass_${randomString(8)}`, role: 'user' });

            expect(response.status).toBe(400);
            expect(response.body.error).toMatch(/Duplicate entry.*for key 'email'|ER_DUP_ENTRY/);
        });

        test('[test 11] should retrieve a user by ID as admin', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const token = await getToken(tenant.tenantId);

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({ username, email, password, role: 'user' })
                .expect(201);

            const userId = createResponse.body.id;

            const response = await request
                .get(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                id: userId,
                username,
                email,
                role: 'user',
                tenant_id: tenant.tenantId,
            });
            expect(response.body.created_at).toBeDefined();
        });

        test('[test 12] should allow regular user to view their own profile', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant.tenantId);

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

        test('[test 13] should deny regular user from viewing another user', async () => {
            const tenant = tenantDatabases[0];
            const username1 = `user1_${randomString(6)}`;
            const email1 = `${username1}@example.com`;
            const password1 = `pass_${randomString(6)}`;
            const username2 = `user2_${randomString(6)}`;
            const email2 = `${username2}@example.com`;
            const password2 = `pass_${randomString(6)}`;
            const adminToken = await getToken(tenant.tenantId);

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

        test('[test 14] should return 404 for non-existent user ID', async () => {
            const tenant = tenantDatabases[0];
            const token = await getToken(tenant.tenantId);

            const response = await request
                .get('/api/users/9999')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('User not found');
        });

        test('[test 15] should retrieve a user by email as admin', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const token = await getToken(tenant.tenantId);

            await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({ username, email, password, role: 'user' })
                .expect(201);

            const response = await request
                .get(`/api/users/email/${email}`)
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                username,
                email,
                role: 'user',
                tenant_id: tenant.tenantId,
            });
            expect(response.body.created_at).toBeDefined();
        });

        test('[test 16] should allow admin to update any user', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const newUsername = `updated_${randomString(6)}`;
            const newEmail = `${newUsername}@example.com`;
            const newPassword = `pass_${randomString(8)}`;
            const token = await getToken(tenant.tenantId);

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

        test('[test 17] should allow regular user to update their own profile', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const newUsername = `updated_${randomString(6)}`;
            const newEmail = `${newUsername}@example.com`;
            const newPassword = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant.tenantId);

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

        test('[test 18] should deny regular user from updating another user', async () => {
            const tenant = tenantDatabases[0];
            const username1 = `user1_${randomString(6)}`;
            const email1 = `${username1}@example.com`;
            const password1 = `pass_${randomString(6)}`;
            const username2 = `user2_${randomString(6)}`;
            const email2 = `${username2}@example.com`;
            const password2 = `pass_${randomString(6)}`;
            const adminToken = await getToken(tenant.tenantId);

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
                .put(`/api/users/${userId2}`)
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ username: `updated_${randomString(6)}`, email: `updated_${randomString(6)}@example.com`, password: `pass_${randomString(8)}` });

            expect(response.status).toBe(403);
            expect(response.body.error).toBe('Admin access required or cannot modify another user');
        });

        test('[test 19] should allow admin to delete any user', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const token = await getToken(tenant.tenantId);

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

        test('[test 20] should deny regular user from deleting any user', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant.tenantId);

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

        test('[test 21] should verify a user’s password', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const token = await getToken(tenant.tenantId);

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({ username, email, password, role: 'user' })
                .expect(201);

            const userId = createResponse.body.id;

            const validResponse = await request
                .post('/api/users/verify')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({ id: userId, password });

            expect(validResponse.status).toBe(200);
            expect(validResponse.body.isValid).toBe(true);

            const invalidResponse = await request
                .post('/api/users/verify')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({ id: userId, password: `wrong_${randomString(8)}` });

            expect(invalidResponse.status).toBe(200);
            expect(invalidResponse.body.isValid).toBe(false);
        });

        test('[test 22] should enforce tenant isolation', async () => {
            const tenant1 = tenantDatabases[0];
            const tenant2 = tenantDatabases[1];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const token = await getToken(tenant1.tenantId);

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant1.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({ username, email, password, role: 'user' })
                .expect(201);

            const userId = createResponse.body.id;
            const tenant2Token = await getToken(tenant2.tenantId);

            const response = await request
                .get(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant2.tenantId)
                .set('Authorization', `Bearer ${tenant2Token}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('User not found');
        });
    });
});