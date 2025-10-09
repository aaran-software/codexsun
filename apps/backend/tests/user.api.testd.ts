import supertest, {SuperTest, Test} from "supertest";
import {generateJwt} from "../cortex/core/secret/jwt-service";
import {Connection} from "../cortex/db/connection";
import {query} from "../cortex/db/db";
import {generateHash} from "../cortex/core/secret/crypt-service";

const MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';
const API_URL = 'http://localhost:3006'; // Matches live environment

describe('[User API] CODEXSUN ERP User Endpoints', () => {
    let request: SuperTest<Test>;
    let connection: Connection;
    let testToken: string;
    let testUserId: number;
    let testTenantId = 'test_tenant';

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

        // Clean up test user data
        await query('DELETE FROM users WHERE email LIKE ?', ['test%example.com'], MASTER_DB);
        await query('DELETE FROM tenant_users WHERE tenant_id = ? AND user_id IN (SELECT id FROM users WHERE email LIKE ?)', [testTenantId, 'test%example.com'], MASTER_DB);

        // Create a test user
        const passwordHash = await generateHash('password123');
        const userResult = await query(
            'INSERT INTO users (username, email, password_hash, mobile, status, role_id, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['admin_user', 'admin@example.com', passwordHash, '1234567890', 'active', 1, null],
            MASTER_DB
        );
        testUserId = userResult.insertId!;

        // Associate user with tenant
        await query(
            'INSERT INTO tenant_users (user_id, tenant_id) VALUES (?, ?)',
            [testUserId, testTenantId],
            MASTER_DB
        );

        // Initialize supertest with the API URL
        request = supertest(API_URL);

        // Generate a test JWT token with the created user ID
        testToken = await generateJwt({id: testUserId.toString(), tenantId: testTenantId, role: "admin"});
    });

    afterAll(async () => {
        // Clean up test user data
        await query('DELETE FROM users WHERE email LIKE ?', ['test%example.com'], MASTER_DB);
        await query('DELETE FROM tenant_users WHERE tenant_id = ? AND user_id IN (SELECT id FROM users WHERE email LIKE ?)', [testTenantId, 'test%example.com'], MASTER_DB);
        await connection.close();
    });

    test('[test 1] POST /api/users should create a user', async () => {
        const userData = {
            username: 'admin_user', // Changed from 'testuser' to match beforeAll
            email: 'testuser@example.com',
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
        testUserId = response.body.id; // Save ID for later tests
    });

    test("[test 2] POST /api/users with missing tenant_id should return 400", async () => {
        const userData = {
            username: "testuser2",
            email: "testuser2@example.com",
            password: "password123"
        };
        const response = await request
            .post("/api/users")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${testToken}`)
            .send(userData);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Tenant ID is required"});
    });

    test("[test 3] POST /api/users with invalid JSON should return 400", async () => {
        const response = await request
            .post("/api/users")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${testToken}`)
            .send("invalid json");
        expect(response.status).toBe(400);
        expect(response.body.error).toContain("Unexpected token");
    });

    test("[test 4] GET /api/users?tenant_id=test_tenant should return list of users", async () => {
        const response = await request
            .get(`/api/users?tenant_id=${testTenantId}`)
            .set("Authorization", `Bearer ${testToken}`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toMatchObject({
            id: testUserId,
            username: "testuser",
            email: "testuser@example.com",
            mobile: "1234567890",
            status: "active",
            role_id: 1,
            email_verified: null,
            created_at: expect.any(String),
            updated_at: expect.any(String)
        });
    });

    test("[test 5] GET /api/users without tenant_id should return 400", async () => {
        const response = await request
            .get("/api/users")
            .set("Authorization", `Bearer ${testToken}`);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Tenant ID is required"});
    });

    test("[test 6] GET /api/users/:id?tenant_id=test_tenant should return user by ID", async () => {
        const response = await request
            .get(`/api/users/${testUserId}?tenant_id=${testTenantId}`)
            .set("Authorization", `Bearer ${testToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            id: testUserId,
            username: "testuser",
            email: "testuser@example.com",
            mobile: "1234567890",
            status: "active",
            role_id: 1,
            email_verified: null,
            created_at: expect.any(String),
            updated_at: expect.any(String)
        });
    });

    test("[test 7] GET /api/users/:id with invalid ID should return 404", async () => {
        const response = await request
            .get(`/api/users/999999?tenant_id=${testTenantId}`)
            .set("Authorization", `Bearer ${testToken}`);
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: "User not found"});
    });

    test("[test 8] GET /api/users/:id without tenant_id should return 400", async () => {
        const response = await request
            .get(`/api/users/${testUserId}`)
            .set("Authorization", `Bearer ${testToken}`);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "User ID and Tenant ID are required"});
    });

    test("[test 9] PUT /api/users/:id?tenant_id=test_tenant should update user", async () => {
        const updateData = {username: "updateduser", email: "updated@example.com"};
        const response = await request
            .put(`/api/users/${testUserId}?tenant_id=${testTenantId}`)
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${testToken}`)
            .send(updateData);
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            id: testUserId,
            username: updateData.username,
            email: updateData.email,
            mobile: "1234567890",
            status: "active",
            role_id: 1,
            email_verified: null,
            created_at: expect.any(String),
            updated_at: expect.any(String)
        });
    });

    test("[test 10] PUT /api/users/:id with invalid ID should return 404", async () => {
        const updateData = {username: "updateduser"};
        const response = await request
            .put(`/api/users/999999?tenant_id=${testTenantId}`)
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${testToken}`)
            .send(updateData);
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: "User not found or update failed"});
    });

    test("[test 11] PUT /api/users/:id with invalid JSON should return 400", async () => {
        const response = await request
            .put(`/api/users/${testUserId}?tenant_id=${testTenantId}`)
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${testToken}`)
            .send("invalid json");
        expect(response.status).toBe(400);
        expect(response.body.error).toContain("Unexpected token");
    });

    test("[test 12] DELETE /api/users/:id?tenant_id=test_tenant should delete user", async () => {
        const response = await request
            .delete(`/api/users/${testUserId}?tenant_id=${testTenantId}`)
            .set("Authorization", `Bearer ${testToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({message: "User deleted successfully"});
    });

    test("[test 13] DELETE /api/users/:id with invalid ID should return 404", async () => {
        const response = await request
            .delete(`/api/users/999999?tenant_id=${testTenantId}`)
            .set("Authorization", `Bearer ${testToken}`);
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: "User not found or deletion failed"});
    });

    test("[test 14] DELETE /api/users/:id without tenant_id should return 400", async () => {
        const response = await request
            .delete(`/api/users/${testUserId}`)
            .set("Authorization", `Bearer ${testToken}`);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "User ID and Tenant ID are required"});
    });
});