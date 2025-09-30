import supertest, { SuperTest, Test } from 'supertest';
import jwt from 'jsonwebtoken';
import mariadb from 'mariadb';
import * as bcrypt from 'bcrypt';

// Configuration
const API_BASE_URL = 'http://localhost:3000';
const TENANT_ID = 'tenant1';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';
const JWT_SECRET = 'your_jwt_secret_key';
const SALT_ROUNDS = 10;

// Database configuration
const baseDbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Computer.1',
    connectionLimit: 10,
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

// Setup databases
async function setupDatabases(pool: mariadb.Pool): Promise<void> {
    const connection = await pool.getConnection();
    try {
        // Master database
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${masterDatabase}\``);
        await connection.query(`USE \`${masterDatabase}\``);
        const settingsTableExists = await connection.query(`SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tenant_settings'`, [masterDatabase]);
        if (settingsTableExists.length === 0) {
            await connection.query(`
                CREATE TABLE IF NOT EXISTS tenant_settings (
                    tenant_id VARCHAR(50) PRIMARY KEY,
                    database_name VARCHAR(255) NOT NULL,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
        }

        // Tenant databases
        for (const tenant of tenantDatabases) {
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${tenant.database}\``);
            await connection.query(`USE \`${tenant.database}\``);

            // Users table
            await connection.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    tenant_id VARCHAR(50) NOT NULL,
                    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Todos table
            await connection.query(`
                CREATE TABLE IF NOT EXISTS todos (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    text VARCHAR(255) NOT NULL,
                    completed TINYINT(1) NOT NULL DEFAULT 0,
                    category VARCHAR(50) NOT NULL,
                    due_date DATE NULL,
                    priority ENUM('low', 'medium', 'high') NOT NULL,
                    tenant_id VARCHAR(50) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    position INT NOT NULL DEFAULT 0
                )
            `);
        }
    } finally {
        connection.release();
    }
}

// Create admin if not exists
async function createAdminIfNotExists(tenant: { tenantId: string; database: string }, pool: mariadb.Pool): Promise<void> {
    const connection = await pool.getConnection();
    try {
        await connection.query(`USE \`${tenant.database}\``);
        const existing = await connection.query(
            'SELECT 1 FROM users WHERE email = ? AND tenant_id = ?',
            [ADMIN_EMAIL, tenant.tenantId]
        );
        if (existing.length === 0) {
            const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
            await connection.query(
                'INSERT INTO users (username, email, password_hash, tenant_id, role) VALUES (?, ?, ?, ?, ?)',
                ['admin', ADMIN_EMAIL, passwordHash, tenant.tenantId, 'admin']
            );
        }
    } finally {
        connection.release();
    }
}

describe('Live Server Todo API Tests', () => {
    let request: SuperTest<Test>;
    let adminToken: string;

    beforeAll(async () => {
        request = supertest(API_BASE_URL);

        // Test server connectivity with retries
        await checkServerConnectivity(request);

        // Setup databases and admins
        const pool = mariadb.createPool(baseDbConfig);
        await setupDatabases(pool);
        for (const tenant of tenantDatabases) {
            await createAdminIfNotExists(tenant, pool);
        }
        await pool.end();

        // Login as admin to get token
        const response = await request
            .post('/api/auth/login')
            .set('X-Tenant-Id', TENANT_ID)
            .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
            .expect(200);

        adminToken = response.body.token;
        expect(adminToken).toBeDefined();
    }, 30000);

    test('[live-todo-test-1] should create a todo and retrieve it', async () => {
        const text = `Todo_${randomString(6)}`;
        const category = 'Work';
        const priority = 'high';

        const createResponse = await request
            .post('/api/todos')
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ text, category, priority })
            .expect(201);

        expect(createResponse.body).toMatchObject({
            id: expect.any(Number),
            text,
            category,
            priority,
            tenant_id: TENANT_ID,
            completed: false,
            position: expect.any(Number),
        });

        const todoId = createResponse.body.id;

        const getResponse = await request
            .get(`/api/todos/${todoId}`)
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(getResponse.body).toMatchObject({
            id: todoId,
            text,
            category,
            priority,
            tenant_id: TENANT_ID,
        });
    });

    test('[live-todo-test-2] should get all todos', async () => {
        const text = `Todo_${randomString(6)}`;
        await request
            .post('/api/todos')
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ text, category: 'Personal', priority: 'medium' })
            .expect(201);

        const getAllResponse = await request
            .get('/api/todos')
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(Array.isArray(getAllResponse.body)).toBe(true);
        expect(getAllResponse.body.length).toBeGreaterThan(0);
    });

    test('[live-todo-test-3] should update a todo', async () => {
        const createResponse = await request
            .post('/api/todos')
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ text: `UpdateMe_${randomString(6)}`, category: 'Work', priority: 'low' })
            .expect(201);

        const todoId = createResponse.body.id;

        const updateResponse = await request
            .put(`/api/todos/${todoId}`)
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ text: 'Updated Text', priority: 'high' })
            .expect(200);

        expect(updateResponse.body).toMatchObject({
            id: todoId,
            text: 'Updated Text',
            priority: 'high',
        });
    });

    test('[live-todo-test-4] should toggle completed status', async () => {
        const createResponse = await request
            .post('/api/todos')
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ text: `ToggleMe_${randomString(6)}`, category: 'Work', priority: 'medium' })
            .expect(201);

        const todoId = createResponse.body.id;

        const toggleResponse = await request
            .patch(`/api/todos/${todoId}/toggle`)
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(toggleResponse.body.completed).toBe(true);

        await request
            .patch(`/api/todos/${todoId}/toggle`)
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        const getResponse = await request
            .get(`/api/todos/${todoId}`)
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(getResponse.body.completed).toBe(false);
    });

    test('[live-todo-test-5] should delete a todo', async () => {
        const createResponse = await request
            .post('/api/todos')
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ text: `DeleteMe_${randomString(6)}`, category: 'Work', priority: 'low' })
            .expect(201);

        const todoId = createResponse.body.id;

        await request
            .delete(`/api/todos/${todoId}`)
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(204);

        await request
            .get(`/api/todos/${todoId}`)
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(404);
    });

    test('[live-todo-test-6] should update todo order and compare positions', async () => {
        const create1 = await request
            .post('/api/todos')
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ text: `Order1_${randomString(6)}`, category: 'Work', priority: 'medium' })
            .expect(201);
        const todoId1 = create1.body.id;

        const create2 = await request
            .post('/api/todos')
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ text: `Order2_${randomString(6)}`, category: 'Work', priority: 'medium' })
            .expect(201);
        const todoId2 = create2.body.id;

        await request
            .post('/api/todos/order')
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ orderedIds: [todoId2, todoId1] })
            .expect(200);

        const getAllResponse1 = await request
            .get('/api/todos')
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        const todo1Pos1 = getAllResponse1.body.find((t: any) => t.id === todoId1).position;
        const todo2Pos1 = getAllResponse1.body.find((t: any) => t.id === todoId2).position;

        console.log('Positions after first order:', { todo1: todo1Pos1, todo2: todo2Pos1 });

        expect(todo2Pos1).toBeLessThan(todo1Pos1);

        // Update order again to reverse
        await request
            .post('/api/todos/order')
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ orderedIds: [todoId1, todoId2] })
            .expect(200);

        const getAllResponse2 = await request
            .get('/api/todos')
            .set('X-Tenant-Id', TENANT_ID)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        const todo1Pos2 = getAllResponse2.body.find((t: any) => t.id === todoId1).position;
        const todo2Pos2 = getAllResponse2.body.find((t: any) => t.id === todoId2).position;

        console.log('Positions after second order:', { todo1: todo1Pos2, todo2: todo2Pos2 });

        expect(todo1Pos2).toBeLessThan(todo2Pos2);
    });

    test('[live-todo-test-7] should add 10 todos to the database', async () => {
        for (let i = 1; i <= 10; i++) {
            const text = `test_todo_${i}_${randomString(4)}`;
            const category = 'Test';
            const priority = 'medium';

            const createResponse = await request
                .post('/api/todos')
                .set('X-Tenant-Id', TENANT_ID)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ text, category, priority })
                .expect(201);

            expect(createResponse.body).toMatchObject({
                id: expect.any(Number),
                text,
                category,
                priority,
                tenant_id: TENANT_ID,
            });
        }
    });
}, 30000);