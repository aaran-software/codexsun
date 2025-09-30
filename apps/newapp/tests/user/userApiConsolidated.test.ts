import supertest, {Test, SuperTest} from "supertest";
import express from 'express';
import {createUserRouter} from '../../cortex/api/api-user';
import {createAuthRouter} from '../../cortex/api/api-auth';
import mariadb from 'mariadb';
import {MariaDBAdapter} from '../../cortex/db/adapters/mariadb';
import {DbConfig} from '../../cortex/db/db-types';

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
        for (const {database} of tenantDatabases) {
            await connection.query(`DROP DATABASE IF EXISTS \`${database}\``);
        }
        await connection.query(`DROP DATABASE IF EXISTS \`${masterDatabase}\``);
    } finally {
        await connection.release();
    }
}

describe('User and Authentication API Tests', () => {
    let app: express.Express;
    type RequestType = ReturnType<typeof supertest.agent>;
    let request: RequestType;
    let setupPool: mariadb.Pool;

    jest.setTimeout(30000);

    beforeAll(async () => {
        MariaDBAdapter.initPool(baseDbConfig);
        setupPool = mariadb.createPool({...baseDbConfig, connectionLimit: 10, acquireTimeout: 20000});
        await setupDatabases(setupPool);
        await setupPool.end();

        app = express();
        app.use(express.json());
        app.use('/api/auth', createAuthRouter());
        app.use('/api/users', createUserRouter());
        request = supertest.agent(app);
    });

    afterAll(async () => {
        const cleanupPool = mariadb.createPool({...baseDbConfig, connectionLimit: 10, acquireTimeout: 20000});
        await cleanupDatabases(cleanupPool);
        await cleanupPool.end();
        await MariaDBAdapter.closePool();
    });

    beforeEach(async () => {
        const tempPool = mariadb.createPool({...baseDbConfig, connectionLimit: 10, acquireTimeout: 20000});
        const tempConnection = await tempPool.getConnection();
        try {
            for (const {database, tenantId} of tenantDatabases) {
                const dbExists = await tempConnection.query(`SELECT 1
                                                             FROM INFORMATION_SCHEMA.SCHEMATA
                                                             WHERE SCHEMA_NAME = ?`, [database]);
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

    async function getToken(tenantId: string, email: string = 'admin@example.com', password: string = 'admin123'): Promise<string> {
        const loginResponse = await request
            .post('/api/auth/login')
            .set('X-Tenant-Id', tenantId)
            .send({email, password});
        return loginResponse.body.token;
    }

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
                .send({username, email, password, role: 'user'});

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

        test('[test 2] should fail to create user with duplicate email', async () => {
            const tenant = tenantDatabases[0];
            const username = `user_${randomString(6)}`;
            const email = `${username}@example.com`;
            const password = `pass_${randomString(8)}`;
            const token = await getToken(tenant.tenantId);

            // Debug: Check database state before first insert
            const tempPool = mariadb.createPool({...baseDbConfig, connectionLimit: 1});
            const tempConnection = await tempPool.getConnection();
            try {
                await tempConnection.query(`USE \`${tenant.database}\``);
                const users = await tempConnection.query('SELECT email FROM users');
                console.log('Users before first insert:', users);
            } finally {
                tempConnection.release();
                await tempPool.end();
            }

            await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({username, email, password, role: 'user'})
                .expect(201);

            // Debug: Check database state after first insert
            const tempPool2 = mariadb.createPool({...baseDbConfig, connectionLimit: 1});
            const tempConnection2 = await tempPool2.getConnection();
            try {
                await tempConnection2.query(`USE \`${tenant.database}\``);
                const users = await tempConnection2.query('SELECT email FROM users');
                console.log('Users after first insert:', users);
            } finally {
                tempConnection2.release();
                await tempPool2.end();
            }

            const response = await request
                .post('/api/users')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({username: `user_${randomString(6)}`, email, password: `pass_${randomString(8)}`, role: 'user'});

            expect(response.status).toBe(400);
            expect(response.body.error).toMatch(/Duplicate entry.*for key 'email'|ER_DUP_ENTRY/);
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

        test('[test 4] should return 404 for non-existent user ID', async () => {
            const tenant = tenantDatabases[0];
            const token = await getToken(tenant.tenantId);

            const response = await request
                .get('/api/users/9999')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
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

        test('[test 6] should update a user via PUT /users/:id', async () => {
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
                .send({username, email, password, role: 'user'})
                .expect(201);

            const userId = createResponse.body.id;

            const response = await request
                .put(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({username: newUsername, email: newEmail, password: newPassword});

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                id: userId,
                username: newUsername,
                email: newEmail,
                role: 'user',
                tenant_id: tenant.tenantId,
            });

            const verifyResponse = await request
                .get(`/api/users/${userId}`)
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`);

            expect(verifyResponse.status).toBe(200);
            expect(verifyResponse.body).toMatchObject({
                username: newUsername,
                email: newEmail,
                role: 'user',
                tenant_id: tenant.tenantId,
            });
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

            const validResponse = await request
                .post('/api/users/verify')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({id: userId, password});

            expect(validResponse.status).toBe(200);
            expect(validResponse.body.isValid).toBe(true);

            const invalidResponse = await request
                .post('/api/users/verify')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', `Bearer ${token}`)
                .send({id: userId, password: `wrong_${randomString(8)}`});

            expect(invalidResponse.status).toBe(200);
            expect(invalidResponse.body.isValid).toBe(false);
        });

        test('[test 9] should enforce tenant isolation for user operations', async () => {
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
                .send({username, email, password, role: 'user'})
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
                .send({email, password});

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
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
                .send({email, password: `wrong_${randomString(8)}`});

            expect(response.status).toBe(401);
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

        test('[test 13] should fail protected route with invalid JWT', async () => {
            const tenant = tenantDatabases[0];
            const response = await request
                .get('/api/users/1')
                .set('X-Tenant-Id', tenant.tenantId)
                .set('Authorization', 'Bearer invalid_token');

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Invalid or expired token');
        });

        test('[test 14] should fail protected route with missing JWT', async () => {
            const tenant = tenantDatabases[0];
            const response = await request
                .get('/api/users/1')
                .set('X-Tenant-Id', tenant.tenantId);

            expect(response.status).toBe(401);
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
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403);
            expect(response.body.error).toBe('Tenant ID mismatch');
        });
    });
});