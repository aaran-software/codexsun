import supertest, { SuperTest, Test } from 'supertest';
import jwt from 'jsonwebtoken';

// Configuration
const API_BASE_URL = 'http://localhost:3000';
const TENANT_ID = 'tenant1';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';
const JWT_SECRET = 'your_jwt_secret_key';

// Function to create random string for test data
function randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Utility to add a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Utility to check server connectivity with retries using /hz
async function checkServerConnectivity(request: SuperTest<Test>, retries = 3, delayMs = 2000): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await request.get('/hz');
            if (response.status === 200 && response.body.status === 'ok') {
                console.log(`Server is reachable at ${API_BASE_URL}`);
                return;
            }
            throw new Error(`Unexpected status: ${response.status}, body: ${JSON.stringify(response.body)}`);
        } catch (error: any) {
            console.log(`Connectivity check attempt ${attempt} failed: ${error.message}`);
            if (attempt === retries) {
                throw new Error(`Server not running at ${API_BASE_URL} after ${retries} attempts: ${error.message}`);
            }
            console.log(`Retrying in ${delayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
}

describe('Live Server API Tests', () => {
    let request: SuperTest<Test>;
    let adminToken: string;

    beforeAll(async () => {
        request = supertest(API_BASE_URL);

        // Test server connectivity with retries
        await checkServerConnectivity(request);

        // Login as admin to get token
        const response = await request
            .post('/api/auth/login')
            .set('X-Tenant-Id', TENANT_ID)
            .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
            .expect(200);

        adminToken = response.body.token;
        expect(adminToken).toBeDefined();
    }, 15000);

    test('[live-test-1] should create a user and login', async () => {
        const username = `user_${randomString(6)}`;
        const email = `${username}@example.com`;
        const password = `pass_${randomString(8)}`;

        const createResponse = await request
            .post('/api/users')
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ username, email, password, role: 'user' })
            .expect(201);

        expect(createResponse.body).toMatchObject({
            id: expect.any(Number),
            username,
            email,
            role: 'user',
            tenant_id: TENANT_ID,
        });

        const userId = createResponse.body.id;

        const loginResponse = await request
            .post('/api/auth/login')
            .set('X-Tenant-Id', TENANT_ID)
            .send({ email, password })
            .expect(200);

        expect(loginResponse.body.token).toBeDefined();
    });

    test('[live-test-2] should access protected route with valid token', async () => {
        const username = `user_${randomString(6)}`;
        const email = `${username}@example.com`;
        const password = `pass_${randomString(8)}`;

        const createResponse = await request
            .post('/api/users')
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ username, email, password, role: 'user' })
            .expect(201);

        const userId = createResponse.body.id;

        const loginResponse = await request
            .post('/api/auth/login')
            .set('X-Tenant-Id', TENANT_ID)
            .send({ email, password })
            .expect(200);

        const userToken = loginResponse.body.token;

        const userResponse = await request
            .get(`/api/users/${userId}`)
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

        expect(userResponse.body).toMatchObject({
            id: userId,
            username,
            email,
            role: 'user',
            tenant_id: TENANT_ID,
        });
    });

    test('[live-test-3] should logout and revoke token', async () => {
        const username = `user_${randomString(6)}`;
        const email = `${username}@example.com`;
        const password = `pass_${randomString(8)}`;

        const createResponse = await request
            .post('/api/users')
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ username, email, password, role: 'user' })
            .expect(201);

        const userId = createResponse.body.id;

        const loginResponse = await request
            .post('/api/auth/login')
            .set('X-Tenant-Id', TENANT_ID)
            .send({ email, password })
            .expect(200);

        const userToken = loginResponse.body.token;

        await request
            .post('/api/auth/logout')
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

        const accessResponse = await request
            .get(`/api/users/${userId}`)
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(401);

        expect(accessResponse.body.error).toBe('Token has been revoked');
    });

    test('[live-test-4] should fail with invalid tenant ID', async () => {
        const response = await request
            .post('/api/auth/login')
            .set('X-Tenant-Id', 'invalid_tenant')
            .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

        console.log(`[live-test-4] Response: ${JSON.stringify(response.body)}`);
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Tenant not found');
    });

    test('[live-test-5] should enforce tenant isolation', async () => {
        const username = `user_${randomString(6)}`;
        const email = `${username}@example.com`;
        const password = `pass_${randomString(8)}`;

        const createResponse = await request
            .post('/api/users')
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ username, email, password, role: 'user' })
            .expect(201);

        const userId = createResponse.body.id;

        const loginResponse = await request
            .post('/api/auth/login')
            .set('X-Tenant-Id', TENANT_ID)
            .send({ email, password })
            .expect(200);

        const userToken = loginResponse.body.token;

        const accessResponse = await request
            .get(`/api/users/${userId}`)
            .set('X-Tenant-Id', 'tenant2')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(403);

        expect(accessResponse.body.error).toBe('Tenant ID mismatch');
    });

    test('[live-test-6] should compare JWT tokens after multiple logins', async () => {
        const loginResponse1 = await request
            .post('/api/auth/login')
            .set('X-Tenant-Id', TENANT_ID)
            .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
            .expect(200);

        const token1 = loginResponse1.body.token;
        const decoded1 = jwt.decode(token1) as { iat: number; exp: number };

        await delay(2000); // Increased delay to ensure distinct timestamps

        const loginResponse2 = await request
            .post('/api/auth/login')
            .set('X-Tenant-Id', TENANT_ID)
            .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
            .expect(200);

        const token2 = loginResponse2.body.token;
        const decoded2 = jwt.decode(token2) as { iat: number; exp: number };

        console.log('Token 1:', { token: token1, decoded: decoded1 });
        console.log('Token 2:', { token: token2, decoded: decoded2 });

        expect(token1).not.toBe(token2);
        expect(decoded2.iat).toBeGreaterThan(decoded1.iat);
    });

    test('[live-test-7] should add 10 users to the database', async () => {
        for (let i = 1; i <= 10; i++) {
            const username = `test_user_${i}_${randomString(4)}`;
            const email = `${username}@example.com`;
            const password = `test_pass_${randomString(8)}`;

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', TENANT_ID)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ username, email, password, role: 'user' })
                .expect(201);

            expect(createResponse.body).toMatchObject({
                id: expect.any(Number),
                username,
                email,
                role: 'user',
                tenant_id: TENANT_ID,
            });
        }
    });
}, 15000);