import supertest, { Test, SuperTest } from 'supertest';
import express from 'express';
import { createUserRouter } from '../../cortex/user/user.routes';
import { createAuthRouter } from '../../cortex/api/api-auth';
import mariadb from 'mariadb';
import { MariaDBAdapter } from '../../cortex/db/adapters/mariadb';
import { DbConfig } from '../../cortex/db/db-types';
import * as bcrypt from 'bcrypt';

// Test configuration
const API_BASE_URL = 'http://localhost:3000';
const TENANT_ID = 'tenant1';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';
const SALT_ROUNDS = 10;

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

// Utility to add a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Utility to set up databases
async function setupDatabases(pool: mariadb.Pool): Promise<void> {
    const connection = await pool.getConnection();
    try {
        // Master database
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${masterDatabase}\``);
        await connection.query(`USE \`${masterDatabase}\``);
        const settingsTableExists = await connection.query(
            `SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tenant_settings'`,
            [masterDatabase]
        );
        if (!settingsTableExists.length) {
            await connection.query(`
                CREATE TABLE IF NOT EXISTS tenant_settings (
                    tenant_id VARCHAR(50) PRIMARY KEY,
                    database_name VARCHAR(255) NOT NULL,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                );
            `);
        }

        // Clear tenant settings
        await connection.query('TRUNCATE TABLE tenant_settings');

        // Insert tenant settings
        for (const tenant of tenantDatabases) {
            await connection.query(
                'INSERT INTO tenant_settings (tenant_id, database_name) VALUES (?, ?)',
                [tenant.tenantId, tenant.database]
            );
        }

        // Create tenant databases and users table
        for (const tenant of tenantDatabases) {
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${tenant.database}\``);
            await connection.query(`USE \`${tenant.database}\``);
            await connection.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    mobile VARCHAR(255) NULL,
                    status ENUM('active', 'inactive', 'invited', 'suspended') NOT NULL DEFAULT 'active',
                    tenant_id VARCHAR(255) NOT NULL,
                    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY idx_email_tenant (email, tenant_id),
                    KEY idx_tenant_id (tenant_id)
                );
            `);
            await connection.query(`
                CREATE TABLE IF NOT EXISTS revoked_tokens (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    token TEXT NOT NULL,
                    expiry TIMESTAMP NOT NULL,
                    tenant_id VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    KEY idx_token (token(255)),
                    KEY idx_expiry (expiry)
                );
            `);
            // Clear data
            await connection.query('TRUNCATE TABLE users');
            await connection.query('TRUNCATE TABLE revoked_tokens');
            // Seed admin user
            const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
            await connection.query(
                'INSERT INTO users (username, email, password_hash, mobile, status, tenant_id, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
                ['admin', ADMIN_EMAIL, adminPasswordHash, '9876543210', 'active', tenant.tenantId, 'admin']
            );
        }
    } finally {
        connection.end();
    }
}

// Utility to get admin token
async function getAdminToken(request: SuperTest<Test>, tenantId: string): Promise<string> {
    const loginResponse = await request
        .post('/api/auth/login')
        .set('X-Tenant-Id', tenantId)
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        .expect(200);
    return loginResponse.body.token;
}

describe('User API Tests', () => {
    let request: SuperTest<Test>;
    let pool: mariadb.Pool;
    let dbAdapter: MariaDBAdapter;
    let adminToken: string;

    beforeAll(async () => {
        pool = mariadb.createPool(baseDbConfig);
        await setupDatabases(pool);

        const app = express();
        app.use(express.json());
        dbAdapter = new MariaDBAdapter(baseDbConfig as DbConfig);
        app.use('/api/users', createUserRouter(dbAdapter));
        app.use('/api/auth', createAuthRouter(dbAdapter));

        request = supertest(app);

        adminToken = await getAdminToken(request, tenantDatabases[0].tenantId);
    }, 15000);

    afterAll(async () => {
        await pool.end();
    });

    test('[user-test-1] should create a new user', async () => {
        const tenant = tenantDatabases[0];
        const username = `test_user_${randomString(6)}`;
        const email = `${username}@example.com`;
        const password = `test_pass_${randomString(8)}`;
        const mobile = '1234567890';
        const status = 'active';
        const role = 'user';

        const createResponse = await request
            .post('/api/users')
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ username, email, password, mobile, status, role })
            .expect(201);

        expect(createResponse.body).toMatchObject({
            id: expect.any(Number),
            username,
            email,
            mobile,
            status,
            role,
            tenant_id: tenant.tenantId,
            created_at: expect.any(String),
        });
    });

    test('[user-test-2] should get all users', async () => {
        const tenant = tenantDatabases[0];

        // Create a user to ensure data exists
        const username = `test_user_${randomString(6)}`;
        const email = `${username}@example.com`;
        await request
            .post('/api/users')
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ username, email, password: `test_pass_${randomString(8)}`, role: 'user' })
            .expect(201);

        const response = await request
            .get('/api/users')
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('username');
        expect(response.body[0]).toHaveProperty('email');
        expect(response.body[0]).toHaveProperty('mobile');
        expect(response.body[0]).toHaveProperty('status');
        expect(response.body[0]).toHaveProperty('role');
        expect(response.body[0]).toHaveProperty('tenant_id', tenant.tenantId);
    });

    test('[user-test-3] should get user by ID', async () => {
        const tenant = tenantDatabases[0];
        const username = `test_user_${randomString(6)}`;
        const email = `${username}@example.com`;
        const password = `test_pass_${randomString(8)}`;
        const mobile = '1234567890';
        const status = 'active';

        const createResponse = await request
            .post('/api/users')
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ username, email, password, mobile, status, role: 'user' })
            .expect(201);

        const userId = createResponse.body.id;

        const getResponse = await request
            .get(`/api/users/${userId}`)
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(getResponse.body).toMatchObject({
            id: userId,
            username,
            email,
            mobile,
            status,
            role: 'user',
            tenant_id: tenant.tenantId,
            created_at: expect.any(String),
        });
    });

    test('[user-test-4] should update user', async () => {
        const tenant = tenantDatabases[0];
        const username = `test_user_${randomString(6)}`;
        const email = `${username}@example.com`;
        const password = `test_pass_${randomString(8)}`;

        const createResponse = await request
            .post('/api/users')
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ username, email, password, role: 'user' })
            .expect(201);

        const userId = createResponse.body.id;
        const newUsername = `updated_${username}`;
        const newMobile = '9876543210';
        const newStatus = 'invited';

        const updateResponse = await request
            .put(`/api/users/${userId}`)
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ username: newUsername, mobile: newMobile, status: newStatus })
            .expect(200);

        expect(updateResponse.body).toMatchObject({
            id: userId,
            username: newUsername,
            email,
            mobile: newMobile,
            status: newStatus,
            role: 'user',
            tenant_id: tenant.tenantId,
        });
    });

    test('[user-test-5] should delete user', async () => {
        const tenant = tenantDatabases[0];
        const username = `test_user_${randomString(6)}`;
        const email = `${username}@example.com`;
        const password = `test_pass_${randomString(8)}`;

        const createResponse = await request
            .post('/api/users')
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ username, email, password, role: 'user' })
            .expect(201);

        const userId = createResponse.body.id;

        await request
            .delete(`/api/users/${userId}`)
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(204);

        await request
            .get(`/api/users/${userId}`)
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(404);
    });

    test('[user-test-6] should add 10 users', async () => {
        const tenant = tenantDatabases[0];
        for (let i = 1; i <= 10; i++) {
            const username = `test_user_${i}_${randomString(4)}`;
            const email = `${username}@example.com`;
            const password = `test_pass_${randomString(8)}`;
            const mobile = i % 2 === 0 ? `555000${i}` : null; // Alternate null/non-null
            const status = 'active';

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ username, email, password, mobile, status, role: 'user' })
                .expect(201);

            expect(createResponse.body).toMatchObject({
                id: expect.any(Number),
                username,
                email,
                mobile,
                status,
                role: 'user',
                tenant_id: tenant.tenantId,
                created_at: expect.any(String),
            });
        }
    });
}, 15000);