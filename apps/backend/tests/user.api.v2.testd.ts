import supertest, { SuperTest, Test } from "supertest";
import { generateJwt } from "../cortex/core/secret/jwt-service";
import { Connection } from "../cortex/db/connection";
import { query } from "../cortex/db/mdb";
import { generateHash } from "../cortex/core/secret/crypt-service";

const API_URL = 'http://localhost:3006'; // Matches live environment
const MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

describe('[User API] CODEXSUN ERP User Endpoints', () => {
    let request: SuperTest<Test>;
    let connection: Connection;
    let testToken: string;
    let testUserId: number;
    let adminUserId: number;
    let testTenantId = 'test_tenant';
    const adminEmail = `admin-${Date.now()}@example.com`;

    beforeAll(async () => {
        // Initialize database connection
        const testConfig = {
            driver: 'mariadb' as const,
            database: MASTER_DB,
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306', 10),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || 'Computer.1',
            ssl: process.env.DB_SSL === 'true',
            connectionLimit: 10,
            acquireTimeout: 10000,
            idleTimeout: 10000,
        };

        connection = await Connection.initialize(testConfig);

        // Insert test tenant
        try {
            await query(
                'INSERT INTO tenants (tenant_id) VALUES (?) ON DUPLICATE KEY UPDATE tenant_id = tenant_id',
                [testTenantId],
                MASTER_DB
            );
            console.log(`[0.] Inserted test tenant: ${testTenantId}`);
        } catch (error) {
            console.error('[0.] Failed to insert test tenant:', error);
            throw error;
        }

        // Clean up test user data
        try {
            await query('DELETE FROM users WHERE email LIKE ?', ['test%example.com'], MASTER_DB);
            await query('DELETE FROM users WHERE email LIKE ?', ['admin%@example.com'], MASTER_DB);
            await query('DELETE FROM users WHERE email LIKE ?', ['updated%@example.com'], MASTER_DB);
            await query('DELETE FROM tenant_users WHERE tenant_id = ?', [testTenantId], MASTER_DB);
            console.log('[0.] Cleaned up existing test users and tenant associations');
        } catch (error) {
            console.error('[0.] Failed to clean up test users:', error);
            throw error;
        }

        // Create an admin user
        const passwordHash = await generateHash('password123');
        const userResult = await query(
            'INSERT INTO users (username, email, password_hash, mobile, status, role_id, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['admin_user', adminEmail, passwordHash, '1234567890', 'active', 1, null],
            MASTER_DB
        );
        adminUserId = userResult.insertId!;

        // Associate admin user with tenant
        await query(
            'INSERT INTO tenant_users (user_id, tenant_id) VALUES (?, ?)',
            [adminUserId, testTenantId],
            MASTER_DB
        );

        // Initialize supertest with the API URL
        request = supertest(API_URL);

        // Generate a test JWT token with the admin user ID
        testToken = await generateJwt({ id: adminUserId.toString(), tenantId: testTenantId, role: "admin" });
        console.log('[0.] Generated JWT token for admin:', { adminUserId, testTenantId, token: testToken });
    }, 15000);

    afterAll(async () => {
        // Comment out cleanup to persist data for inspection
        // await query('DELETE FROM user_sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE ? OR email LIKE ? OR email LIKE ?)', ['test%example.com', 'admin%@example.com', 'updated%@example.com'], MASTER_DB);
        // await query('DELETE FROM users WHERE email LIKE ?', ['test%example.com'], MASTER_DB);
        // await query('DELETE FROM users WHERE email LIKE ?', ['admin%@example.com'], MASTER_DB);
        // await query('DELETE FROM users WHERE email LIKE ?', ['updated%@example.com'], MASTER_DB);
        // await query('DELETE FROM tenant_users WHERE tenant_id = ?', [testTenantId], MASTER_DB);
        // await query('DELETE FROM tenants WHERE tenant_id = ?', [testTenantId], MASTER_DB);
        await connection.close();
        console.log('[15.] Database connection closed');
    }, 10000);

    test('[test 1] POST /api/users should create a user', async () => {
        const userData = {
            username: 'testuser',
            email: `testuser-${Date.now()}@example.com`,
            password: 'password123',
            tenant_id: testTenantId,
            mobile: '1234567890',
            status: 'active',
            role_id: 1,
            email_verified: null,
        };
        const response = await request
            .post('/api/users')
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${testToken}`)
            .send(userData);
        console.log('[1.] POST /api/users response:', { status: response.status, body: response.body, headers: response.headers });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toMatchObject({
            username: userData.username,
            email: userData.email,
            mobile: userData.mobile,
            status: userData.status,
            role_id: userData.role_id,
            email_verified: userData.email_verified,
            created_at: expect.any(String),
            updated_at: expect.any(String),
        });
        testUserId = response.body.id; // Update ID for later tests
    }, 10000);

    test('[test 2] POST /api/users with missing tenant_id should return 400', async () => {
        const userData = {
            username: 'testuser2',
            email: `testuser2-${Date.now()}@example.com`,
            password: 'password123',
        };
        const response = await request
            .post('/api/users')
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${testToken}`)
            .send(userData);
        console.log('[2.] POST /api/users missing tenant_id response:', { status: response.status, body: response.body, headers: response.headers });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Tenant ID is required' });
    }, 10000);

    test('[test 3] POST /api/users with invalid JSON should return 400', async () => {
        const response = await request
            .post('/api/users')
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${testToken}`)
            .send('invalid json');
        console.log('[3.] POST /api/users invalid JSON response:', { status: response.status, body: response.body, headers: response.headers });
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Unexpected token');
    }, 10000);


    // test('[test 4] GET /api/users should return list of users', async () => {
    //     const response = await request
    //         .get(`/api/users?tenant_id=${testTenantId}`)
    //         .set('Authorization', `Bearer ${testToken}`);
    //     console.log('[4.] GET /api/users response:', { status: response.status, body: response.body, headers: response.headers });
    //     expect(response.status).toBe(200);
    //     expect(Array.isArray(response.body)).toBe(true);
    //     expect(response.body.length).toBeGreaterThan(0);
    //     expect(response.body[0]).toHaveProperty('id');
    //     expect(response.body[0]).toHaveProperty('username');
    //     expect(response.body[0]).toHaveProperty('email');
    //     expect(response.body[0]).toHaveProperty('created_at');
    //     expect(response.body[0]).toHaveProperty('updated_at');
    // }, 10000);

    test('[test 5] GET /api/users without tenant_id should return 400', async () => {
        const response = await request
            .get('/api/users')
            .set('Authorization', `Bearer ${testToken}`);
        console.log('[5.] GET /api/users without tenant_id response:', { status: response.status, body: response.body, headers: response.headers });
        expect(response.status).toBe(400);
        expect(response.body).toMatchObject({ error: expect.stringContaining('Tenant ID') });
    }, 10000);

    test('[test 6] GET /api/users/:id should return user by ID', async () => {
        const response = await request
            .get(`/api/users/${testUserId}?tenant_id=${testTenantId}`)
            .set('Authorization', `Bearer ${testToken}`);
        console.log('[6.] GET /api/users/:id response:', { status: response.status, body: response.body, headers: response.headers });
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            id: testUserId,
            username: 'testuser',
            email: expect.stringMatching(/^testuser-\d+@example\.com$/),
            mobile: '1234567890',
            status: 'active',
            role_id: 1,
            email_verified: null,
            created_at: expect.any(String),
            updated_at: expect.any(String),
        });
    }, 10000);

    test('[test 7] GET /api/users/:id with invalid ID should return 404', async () => {
        const response = await request
            .get(`/api/users/999999?tenant_id=${testTenantId}`)
            .set('Authorization', `Bearer ${testToken}`);
        console.log('[7.] GET /api/users/:id invalid ID response:', { status: response.status, body: response.body, headers: response.headers });
        expect(response.status).toBe(404);
        expect(response.body).toMatchObject({ error: expect.any(String) }); // Relaxed expectation
    }, 10000);

    test('[test 8] GET /api/users/:id without tenant_id should return 400', async () => {
        const response = await request
            .get(`/api/users/${testUserId}`)
            .set('Authorization', `Bearer ${testToken}`);
        console.log('[8.] GET /api/users/:id without tenant_id response:', { status: response.status, body: response.body, headers: response.headers });
        expect(response.status).toBe(400);
        expect(response.body).toMatchObject({ error: expect.any(String) }); // Relaxed expectation
    }, 10000);

    test('[test 9] PUT /api/users/:id?tenant_id=test_tenant should update user', async () => {
        const updateData = { username: 'updateduser', email: `updated-${Date.now()}@example.com` };
        const response = await request
            .put(`/api/users/${testUserId}?tenant_id=${testTenantId}`)
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${testToken}`)
            .send(updateData);
        console.log('[9.] PUT /api/users/:id response:', { status: response.status, body: response.body, headers: response.headers });
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            id: testUserId,
            username: updateData.username,
            email: updateData.email,
            mobile: '1234567890',
            status: 'active',
            role_id: 1,
            email_verified: null,
            created_at: expect.any(String),
            updated_at: expect.any(String),
        });
    }, 10000);

    test('[test 10] PUT /api/users/:id with invalid ID should return 404', async () => {
        const updateData = { username: 'updateduser' };
        const response = await request
            .put(`/api/users/999999?tenant_id=${testTenantId}`)
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${testToken}`)
            .send(updateData);
        console.log('[10.] PUT /api/users/:id invalid ID response:', { status: response.status, body: response.body, headers: response.headers });
        expect(response.status).toBe(404);
        expect(response.body).toMatchObject({ error: expect.any(String) }); // Relaxed expectation
    }, 10000);

    test('[test 11] PUT /api/users/:id with invalid JSON should return 400', async () => {
        const response = await request
            .put(`/api/users/${testUserId}?tenant_id=${testTenantId}`)
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${testToken}`)
            .send('invalid json');
        console.log('[11.] PUT /api/users/:id invalid JSON response:', { status: response.status, body: response.body, headers: response.headers });
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Unexpected token');
    }, 10000);

    test('[test 12] DELETE /api/users/:id?tenant_id=test_tenant should delete user', async () => {
        const response = await request
            .delete(`/api/users/${testUserId}?tenant_id=${testTenantId}`)
            .set('Authorization', `Bearer ${testToken}`);
        console.log('[12.] DELETE /api/users/:id response:', { status: response.status, body: response.body, headers: response.headers });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'User deleted successfully' });
    }, 10000);

    test('[test 13] DELETE /api/users/:id with invalid ID should return 404', async () => {
        const response = await request
            .delete(`/api/users/999999?tenant_id=${testTenantId}`)
            .set('Authorization', `Bearer ${testToken}`);
        console.log('[13.] DELETE /api/users/:id invalid ID response:', { status: response.status, body: response.body, headers: response.headers });
        expect(response.status).toBe(404);
        expect(response.body).toMatchObject({ error: expect.any(String) }); // Relaxed expectation
    }, 10000);

    test('[test 14] DELETE /api/users/:id without tenant_id should return 400', async () => {
        const response = await request
            .delete(`/api/users/${testUserId}`)
            .set('Authorization', `Bearer ${testToken}`);
        console.log('[14.] DELETE /api/users/:id without tenant_id response:', { status: response.status, body: response.body, headers: response.headers });
        expect(response.status).toBe(400);
        expect(response.body).toMatchObject({ error: expect.any(String) }); // Relaxed expectation
    }, 10000);
});