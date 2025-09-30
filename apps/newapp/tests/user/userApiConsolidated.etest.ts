import supertest, {Test, SuperTest} from "supertest";
import express from 'express';
import {createUserRouter} from '../../cortex/api/api-user';
import {createAuthRouter} from '../../cortex/api/api-auth';
import mariadb from 'mariadb';
import {MariaDBAdapter} from '../../cortex/db/adapters/mariadb';
import {DbConfig} from '../../cortex/db/db-types';
import jwt from 'jsonwebtoken';

// Test database configuration
const baseDbConfig: Omit<DbConfig, 'database' | 'type'> = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Computer.1',
};

const masterDatabase = 'master_db';
const tenantDatabases = [
    {tenantId: 'tenant1', database: 'tenant_1'},
    {tenantId: 'tenant2', database: 'tenant_2'},
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

// Utility to add a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Utility to set up databases
async function setupDatabases(pool: mariadb.Pool): Promise<void> {
    const connection = await pool.getConnection();
    try {
        // Master database
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${masterDatabase}\``);
        await connection.query(`USE \`${masterDatabase}\``);
        const settingsTableExists = await connection.query(`SELECT 1
                                                            FROM INFORMATION_SCHEMA.TABLES
                                                            WHERE TABLE_SCHEMA = ?
                                                              AND TABLE_NAME = 'tenant_settings'`, [masterDatabase]);
        if (!settingsTableExists.length) {
            await connection.query(`
                CREATE TABLE IF NOT EXISTS tenant_settings
                (
                    tenant_id
                    VARCHAR
                (
                    50
                ) PRIMARY KEY,
                    database_name VARCHAR
                (
                    255
                ) NOT NULL,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
            `);
        }

        // Insert tenant details
        for (const {tenantId, database} of tenantDatabases) {
            await connection.query(
                'INSERT IGNORE INTO tenant_settings (tenant_id, database_name) VALUES (?, ?)',
                [tenantId, database]
            );
        }

        // Tenant databases with users table
        for (const {database, tenantId} of tenantDatabases) {
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
            await connection.query(`USE \`${database}\``);
            const usersTableExists = await connection.query(`SELECT 1
                                                             FROM INFORMATION_SCHEMA.TABLES
                                                             WHERE TABLE_SCHEMA = ?
                                                               AND TABLE_NAME = 'users'`, [database]);
            if (!usersTableExists.length) {
                await connection.query(`
                    CREATE TABLE users
                    (
                        id            INT AUTO_INCREMENT PRIMARY KEY,
                        username      VARCHAR(50)  NOT NULL,
                        email         VARCHAR(255) NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        role          ENUM('admin', 'user') NOT NULL DEFAULT 'user',
                        tenant_id     VARCHAR(50)  NOT NULL,
                        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE (email)
                    )
                `);
            }
            const revokedTokensTableExists = await connection.query(`SELECT 1
                                                                     FROM INFORMATION_SCHEMA.TABLES
                                                                     WHERE TABLE_SCHEMA = ?
                                                                       AND TABLE_NAME = 'revoked_tokens'`, [database]);
            if (!revokedTokensTableExists.length) {
                await connection.query(`
                    CREATE TABLE IF NOT EXISTS revoked_tokens (
                                                                  id INT AUTO_INCREMENT PRIMARY KEY,
                                                                  token TEXT NOT NULL,
                                                                  expiry TIMESTAMP NOT NULL,
                                                                  tenant_id VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        INDEX idx_token (token(255)),
                        INDEX idx_expiry (expiry)
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
        await connection.release();
    }
}

// Utility to clean up databases
async function cleanupDatabases(pool: mariadb.Pool): Promise<void> {
    const connection = await pool.getConnection();
    try {
        // Drop tenant databases
        for (const {database} of tenantDatabases) {
            await connection.query(`DROP DATABASE IF EXISTS \`${database}\``);
        }
        // Drop master database
        await connection.query(`DROP DATABASE IF EXISTS \`${masterDatabase}\``);
    } finally {
        await connection.release();
    }
}

let app: express.Express;
let request: SuperTest<Test>;
let pool: mariadb.Pool;

beforeAll(async () => {
    pool = mariadb.createPool({...baseDbConfig, connectionLimit: 10});
    await setupDatabases(pool);

    MariaDBAdapter.initPool(baseDbConfig);

    app = express();
    app.use(express.json());
    app.use('/api/users', createUserRouter());
    app.use('/api/auth', createAuthRouter());

    request = supertest(app);
});

afterAll(async () => {
    await cleanupDatabases(pool);
    await pool.end();
    await MariaDBAdapter.closePool();
});

async function getToken(tenantId: string): Promise<string> {
    const response = await request
        .post('/api/auth/login')
        .set('X-Tenant-Id', tenantId)
        .send({email: 'admin@example.com', password: 'admin123'});
    return response.body.token;
}

describe('User and Authentication API Tests', () => {
    describe('User CRUD Operations', () => {
        test('[test 1] should create a user via POST /users', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const token = await getToken(tenant.tenantId);

            const response = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({username, email, password, role: 'user'})
                .expect(201);

            expect(response.body).toMatchObject({
                id: expect.any(Number),
                username,
                email,
                role: 'user',
                tenant_id: tenant.tenantId,
            });
        });

        test('[test 2] should fail to create user with duplicate email', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const token = await getToken(tenant.tenantId);

            await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({username, email, password, role: 'user'})
                .expect(201);

            const duplicateResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({username: `dup_${username}`, email, password: `new_${password}`, role: 'user'})
                .expect(400);

            expect(duplicateResponse.body.error).toContain('Duplicate entry');
        });

        test('[test 3] should retrieve a user by ID via GET /users/:id', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const token = await getToken(tenant.tenantId);

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({username, email, password, role: 'user'})
                .expect(201);

            const userId = createResponse.body.id;

            const response = await request
                .get(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body).toMatchObject({
                id: userId,
                username,
                email,
                role: 'user',
                tenant_id: tenant.tenantId,
            });
        });

        test('[test 4] should return 404 for non-existent user ID', async () => {
            const tenant = tenantDatabases[0];
            const token = await getToken(tenant.tenantId);

            const response = await request
                .get('/api/users/999999')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .expect(404);

            expect(response.body.error).toBe('User not found');
        });

        test('[test 5] should retrieve a user by email via GET /users/email/:email', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const token = await getToken(tenant.tenantId);

            await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({username, email, password, role: 'user'})
                .expect(201);

            const response = await request
                .get(`/api/users/email/${email}`)
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body).toMatchObject({
                username,
                email,
                role: 'user',
                tenant_id: tenant.tenantId,
            });
        });

        test('[test 6] should update a user via PUT /users/:id', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const token = await getToken(tenant.tenantId);

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({username, email, password, role: 'user'})
                .expect(201);

            const userId = createResponse.body.id;
            const newUsername = `updated_${username}`;

            const updateResponse = await request
                .put(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({username: newUsername})
                .expect(200);

            expect(updateResponse.body.username).toBe(newUsername);
        });

        test('[test 7] should delete a user via DELETE /users/:id', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const token = await getToken(tenant.tenantId);

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({username, email, password, role: 'user'})
                .expect(201);

            const userId = createResponse.body.id;

            await request
                .delete(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .expect(204);

            await request
                .get(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .expect(404);
        });

        test('[test 8] should verify a user’s password via POST /users/verify', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const token = await getToken(tenant.tenantId);

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({username, email, password, role: 'user'})
                .expect(201);

            const userId = createResponse.body.id;

            const verifyResponse = await request
                .post('/api/users/verify')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({id: userId, password})
                .expect(200);

            expect(verifyResponse.body.isValid).toBe(true);
        });

        test('[test 9] should enforce tenant isolation for user operations', async () => {
            const tenant1 = tenantDatabases[0];
            const tenant2 = tenantDatabases[1];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const token1 = await getToken(tenant1.tenantId);

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant1.tenantId)
                .set('Authorization', `Bearer ${token1}`)
                .send({username, email, password, role: 'user'})
                .expect(201);

            const userId = createResponse.body.id;

            const token2 = await getToken(tenant2.tenantId);

            await request
                .get(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant2.tenantId)
                .set('Authorization', `Bearer ${token2}`)
                .expect(404);
        });
    });

    describe('JWT Authentication', () => {
        test('[test 10] should login with valid credentials and return JWT', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant.tenantId);

            await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({username, email, password, role: 'user'})
                .expect(201);

            const response = await request
                .post('/api/auth/login')
                .set('X-Tenant-Id', tenant.tenantId)
                .send({email, password})
                .expect(200);

            expect(response.body.token).toBeDefined();
        });

        test('[test 11] should fail login with invalid credentials', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant.tenantId);

            await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({username, email, password, role: 'user'})
                .expect(201);

            const response = await request
                .post('/api/auth/login')
                .set('X-Tenant-Id', tenant.tenantId)
                .send({email, password: `wrong_${randomString(8)}`})
                .expect(401);

            expect(response.body.error).toBe('Invalid credentials');
        });

        test('[test 12] should access protected route with valid JWT', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant.tenantId);

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({username, email, password, role: 'user'})
                .expect(201);

            const userId = createResponse.body.id;

            const loginResponse = await request
                .post('/api/auth/login')
                .set('X-Tenant-Id', tenant.tenantId)
                .send({email, password})
                .expect(200);

            const userToken = loginResponse.body.token;

            const response = await request
                .get(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                id: userId,
                username,
                email,
                role: 'user',
                tenant_id: tenant.tenantId,
            });
        });

        test('[test 13] should fail protected route with invalid JWT', async () => {
            const tenant = tenantDatabases[0];
            const response = await request
                .get('/api/users/1')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', 'Bearer invalid_token')
                .expect(401);

            expect(response.body.error).toBe('Invalid or expired token');
        });

        test('[test 14] should fail protected route with missing JWT', async () => {
            const tenant = tenantDatabases[0];
            const response = await request
                .get('/api/users/1')
                .set('X-Tenant-Id', tenant.tenantId)
                .expect(401);

            expect(response.body.error).toBe('Authorization token required');
        });

        test('[test 15] should enforce tenant isolation with JWT', async () => {
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
                .send({username, email, password, role: 'user'})
                .expect(201);

            const userId = createResponse.body.id;

            const loginResponse = await request
                .post('/api/auth/login')
                .set('X-Tenant-Id', tenant1.tenantId)
                .send({email, password})
                .expect(200);

            const userToken = loginResponse.body.token;

            const response = await request
                .get(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant2.tenantId)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);

            expect(response.body.error).toBe('Tenant ID mismatch');
        });

        test('[test 16] should logout successfully and revoke token', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant.tenantId);

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({username, email, password, role: 'user'})
                .expect(201);

            const userId = createResponse.body.id;

            const loginResponse = await request
                .post('/api/auth/login')
                .set('X-Tenant-Id', tenant.tenantId)
                .send({email, password})
                .expect(200);

            const userToken = loginResponse.body.token;

            // Logout
            const logoutResponse = await request
                .post('/api/auth/logout')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(logoutResponse.body.message).toBe('Logged out successfully');

            // Try to access protected route with revoked token
            const accessResponse = await request
                .get(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(401);

            expect(accessResponse.body.error).toBe('Token has been revoked');
        });

        test('[test 17] should fail logout without authorization', async () => {
            const tenant = tenantDatabases[0];
            const response = await request
                .post('/api/auth/logout')
                .set('X-Tenant-Id', tenant.tenantId)
                .expect(401);

            expect(response.body.error).toBe('Authorization token required');
        });

        test('[test 18] should allow login after logout and use new token', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant.tenantId);

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({username, email, password, role: 'user'})
                .expect(201);

            const userId = createResponse.body.id;

            const loginResponse1 = await request
                .post('/api/auth/login')
                .set('X-Tenant-Id', tenant.tenantId)
                .send({email, password})
                .expect(200);

            const token1 = loginResponse1.body.token;
            const decodedToken1 = jwt.decode(token1) as { iat: number; exp: number };
            console.log('Token 1:', { token: token1, decoded: decodedToken1 });

            await request
                .post('/api/auth/logout')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token1}`)
                .expect(200);

            // Add a small delay to ensure different timestamps
            await delay(1000);

            const loginResponse2 = await request
                .post('/api/auth/login')
                .set('X-Tenant-Id', tenant.tenantId)
                .send({email, password})
                .expect(200);

            const token2 = loginResponse2.body.token;
            const decodedToken2 = jwt.decode(token2) as { iat: number; exp: number };
            console.log('Token 2:', { token: token2, decoded: decodedToken2 });

            expect(token2).not.toBe(token1);
            expect(decodedToken2.iat).toBeGreaterThan(decodedToken1.iat);

            // Access with new token should succeed
            const accessResponse = await request
                .get(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token2}`)
                .expect(200);

            expect(accessResponse.body).toMatchObject({
                id: userId,
                username,
                email,
                role: 'user',
                tenant_id: tenant.tenantId,
            });
        });

        test('[test 19] should handle logout with invalid token', async () => {
            const tenant = tenantDatabases[0];
            const response = await request
                .post('/api/auth/logout')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', 'Bearer invalid_token')
                .expect(401);

            expect(response.body.error).toBe('Invalid or expired token');
        });

        test('[test 20] should enforce tenant isolation on logout', async () => {
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
                .send({username, email, password, role: 'user'})
                .expect(201);

            const loginResponse = await request
                .post('/api/auth/login')
                .set('X-Tenant-Id', tenant1.tenantId)
                .send({email, password})
                .expect(200);

            const userToken = loginResponse.body.token;

            const response = await request
                .post('/api/auth/logout')
                .set('X-Tenant-Id', tenant2.tenantId)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);

            expect(response.body.error).toBe('Tenant ID mismatch');
        });
    });
});