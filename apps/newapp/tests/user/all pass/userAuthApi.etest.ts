// tests/api/userAuthApi.test.ts
import supertest from 'supertest';
import express from 'express';
import { createUserRouter } from '../../../cortex/api/api-user';
import { createAuthRouter } from '../../../cortex/api/api-auth';
import mariadb from 'mariadb';
import { MariaDBAdapter } from '../../../cortex/db/adapters/mariadb';
import { DbConfig } from '../../../cortex/db/types';

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

describe('User Authentication API Tests', () => {
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

    describe('JWT Authentication', () => {
        test('[test 1] should login with valid credentials and return JWT', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant.tenantId, 'admin@example.com', 'admin123');

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

        test('[test 2] should fail login with invalid credentials', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant.tenantId, 'admin@example.com', 'admin123');

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

        test('[test 3] should access protected route with valid JWT', async () => {
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

            const loginResponse = await request
                .post('/api/auth/login')
                .set('X-Tenant-Id', tenant.tenantId)
                .send({ email, password })
                .expect(200);

            const userToken = loginResponse.body.token;

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

        test('[test 4] should fail protected route with invalid JWT', async () => {
            const tenant = tenantDatabases[0];
            const response = await request
                .get('/api/users/1')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', 'Bearer invalid_token');

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Invalid or expired token');
        });

        test('[test 5] should fail protected route with missing JWT', async () => {
            const tenant = tenantDatabases[0];
            const response = await request
                .get('/api/users/1')
                .set('X-Tenant-Id', tenant.tenantId);

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Authorization token required');
        });

        test('[test 6] should enforce tenant isolation with JWT', async () => {
            const tenant1 = tenantDatabases[0];
            const tenant2 = tenantDatabases[1];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const adminToken = await getToken(tenant1.tenantId, 'admin@example.com', 'admin123');

            const createResponse = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant1.tenantId)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ username, email, password, role: 'user' })
                .expect(201);

            const userId = createResponse.body.id;

            const loginResponse = await request
                .post('/api/auth/login')
                .set('X-Tenant-Id', tenant1.tenantId)
                .send({ email, password })
                .expect(200);

            const userToken = loginResponse.body.token;

            const response = await request
                .get(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant2.tenantId)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403);
            expect(response.body.error).toBe('Tenant ID mismatch');
        });

        test('[test 7] should create user with valid JWT', async () => {
            const tenant = tenantDatabases[0];
            const token = await getToken(tenant.tenantId, 'admin@example.com', 'admin123');

            const newUsername = `user_${randomString(6)}`;
            const newEmail = `${newUsername}@example.com`;
            const newPassword = `pass_${randomString(8)}`;

            const response = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({ username: newUsername, email: newEmail, password: newPassword, role: 'user' });

            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                username: newUsername,
                email: newEmail,
                role: 'user',
                tenant_id: tenant.tenantId,
            });
        });
    });
});