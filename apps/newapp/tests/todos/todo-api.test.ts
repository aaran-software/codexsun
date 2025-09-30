import supertest, {Test, SuperTest} from "supertest";
import express from 'express';
import {createUserRouter} from '../../cortex/api/api-user';
import {createAuthRouter} from '../../cortex/api/api-auth';
import {createTodoRouter} from '../../cortex/todos/todo.routes';
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
                CREATE TABLE IF NOT EXISTS users
                (
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
                CREATE TABLE IF NOT EXISTS todos
                (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    text VARCHAR(255) NOT NULL,
                    completed BOOLEAN DEFAULT FALSE,
                    category VARCHAR(50) NOT NULL,
                    due_date DATE DEFAULT NULL,
                    priority ENUM('low', 'medium', 'high') NOT NULL,
                    tenant_id VARCHAR(50) NOT NULL,
                    position INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
}
} finally {
    connection.release();
}
}

async function seedAdmin(pool: mariadb.Pool) {
    const connection = await pool.getConnection();
    try {
        for (const tenant of tenantDatabases) {
            await connection.query(`USE \`${tenant.database}\``);
            await connection.query(`TRUNCATE TABLE users`);
            await connection.query(`TRUNCATE TABLE todos`);

            const adminEmail = tenant.tenantId === 'tenant1' ? 'sundar@sundar.com' : 'admin@example.com';
            const adminUsername = 'admin';
            const adminRole = 'admin';
            const passwordHash = '$2b$10$x0aKXyaw5FpQXDsz.s8pce/tFTkKmTesgZfREI0twTzl4J91j.cEW'; // Hash for 'admin123'

            await connection.query(`
                INSERT INTO users (username, email, password_hash, tenant_id, role) VALUES (?, ?, ?, ?, ?)
            `, [adminUsername, adminEmail, passwordHash, tenant.tenantId, adminRole]);
        }
    } finally {
        connection.release();
    }
}

describe('Todo API Tests', () => {
    let pool: mariadb.Pool;
    let app: express.Application;
    let request: SuperTest<Test>;

    beforeAll(async () => {
        pool = mariadb.createPool({...baseDbConfig, connectionLimit: 5});
        MariaDBAdapter.initPool(baseDbConfig);

        await setupDatabases(pool);
        await seedAdmin(pool);

        app = express();
        app.use(express.json());
        app.use('/api/auth', createAuthRouter());
        app.use('/api/users', createUserRouter());
        app.use('/api/todos', createTodoRouter());

        request = supertest(app);
    });

    afterAll(async () => {
        await MariaDBAdapter.closePool();
        await pool.end();
    });

    beforeEach(async () => {
        const connection = await pool.getConnection();
        try {
            for (const tenant of tenantDatabases) {
                await connection.query(`USE \`${tenant.database}\``);
                await connection.query(`TRUNCATE TABLE todos`);
            }
        } finally {
            connection.release();
        }
    });

    async function getToken(tenantId: string): Promise<string> {
        const email = tenantId === 'tenant1' ? 'sundar@sundar.com' : 'admin@example.com';
        const loginResponse = await request
            .post('/api/auth/login')
            .set('X-Tenant-Id', tenantId)
            .send({email, password: 'admin123'})
            .expect(200);
        return loginResponse.body.token;
    }

    async function createTodo(tenantId: string, token: string, overrides = {}): Promise<number> {
        const text = `test_todo_${randomString(4)}`;
        const category = 'Work';
        const priority = 'medium';
        const due_date = '2025-10-01';

        const createResponse = await request
            .post('/api/todos')
            .set('X-Tenant-Id', tenantId)
            .set('Authorization', `Bearer ${token}`)
            .send({text, category, priority, due_date, ...overrides})
            .expect(201);

        return createResponse.body.id;
    }

    test('[todo-test-1] should create a todo with valid data', async () => {
        const tenant = tenantDatabases[0];
        const token = await getToken(tenant.tenantId);

        const text = `test_todo_${randomString(4)}`;
        const category = 'Work';
        const priority = 'high';
        const due_date = '2025-10-01';

        const createResponse = await request
            .post('/api/todos')
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${token}`)
            .send({text, category, priority, due_date})
            .expect(201);

        expect(createResponse.body).toMatchObject({
            text,
            category,
            priority,
            tenant_id: tenant.tenantId,
            completed: false,
            position: expect.any(Number),
        });
        const expectedDateStr = new Date(due_date + 'T00:00:00').toISOString().split('T')[0];
        expect(new Date(createResponse.body.due_date).toISOString().split('T')[0]).toBe(expectedDateStr);
    });

    test('[todo-test-2] should fail to create todo without required fields', async () => {
        const tenant = tenantDatabases[0];
        const token = await getToken(tenant.tenantId);

        await request
            .post('/api/todos')
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${token}`)
            .send({category: 'Work', priority: 'high'}) // Missing text
            .expect(400);

        await request
            .post('/api/todos')
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${token}`)
            .send({text: 'Test', priority: 'high'}) // Missing category
            .expect(400);

        await request
            .post('/api/todos')
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${token}`)
            .send({text: 'Test', category: 'Work'}) // Missing priority
            .expect(400);
    });

    test('[todo-test-3] should fail to create todo without tenant ID', async () => {
        const tenant = tenantDatabases[0];
        const token = await getToken(tenant.tenantId);

        await request
            .post('/api/todos')
            .set('Authorization', `Bearer ${token}`)
            .send({text: 'Test', category: 'Work', priority: 'high'})
            .expect(400);
    });

    test('[todo-test-4] should get all todos for tenant', async () => {
        const tenant = tenantDatabases[0];
        const token = await getToken(tenant.tenantId);

        // Create two todos
        await createTodo(tenant.tenantId, token);
        await createTodo(tenant.tenantId, token);

        const getResponse = await request
            .get('/api/todos')
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(getResponse.body.length).toBe(2);
        expect(getResponse.body[0]).toHaveProperty('position');
    });

    test('[todo-test-5] should get todo by ID', async () => {
        const tenant = tenantDatabases[0];
        const token = await getToken(tenant.tenantId);

        const todoId = await createTodo(tenant.tenantId, token);

        const getResponse = await request
            .get(`/api/todos/${todoId}`)
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(getResponse.body.id).toBe(todoId);
    });

    test('[todo-test-6] should fail to get non-existent todo by ID', async () => {
        const tenant = tenantDatabases[0];
        const token = await getToken(tenant.tenantId);

        await request
            .get('/api/todos/999999')
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
    });

    test('[todo-test-7] should update a todo', async () => {
        const tenant = tenantDatabases[0];
        const token = await getToken(tenant.tenantId);

        const todoId = await createTodo(tenant.tenantId, token);

        const updatedText = `updated_text_${randomString(4)}`;
        const updatedCategory = 'Personal';
        const updatedPriority = 'low';
        const updatedDueDate = '2025-11-01';

        const updateResponse = await request
            .put(`/api/todos/${todoId}`)
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${token}`)
            .send({text: updatedText, category: updatedCategory, priority: updatedPriority, due_date: updatedDueDate})
            .expect(200);

        expect(updateResponse.body.text).toBe(updatedText);
        expect(updateResponse.body.category).toBe(updatedCategory);
        expect(updateResponse.body.priority).toBe(updatedPriority);
        const expectedDateStr = new Date(updatedDueDate + 'T00:00:00').toISOString().split('T')[0];
        expect(new Date(updateResponse.body.due_date).toISOString().split('T')[0]).toBe(expectedDateStr);
    });

    test('[todo-test-8] should toggle completed status', async () => {
        const tenant = tenantDatabases[0];
        const token = await getToken(tenant.tenantId);

        const todoId = await createTodo(tenant.tenantId, token);

        const toggleResponse = await request
            .patch(`/api/todos/${todoId}/toggle`)
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(toggleResponse.body.completed).toBe(true);

        // Toggle back
        await request
            .patch(`/api/todos/${todoId}/toggle`)
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    });

    test('[todo-test-9] should delete a todo', async () => {
        const tenant = tenantDatabases[0];
        const token = await getToken(tenant.tenantId);

        const todoId = await createTodo(tenant.tenantId, token);

        await request
            .delete(`/api/todos/${todoId}`)
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${token}`)
            .expect(204);

        // Verify deleted
        await request
            .get(`/api/todos/${todoId}`)
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
    });

    test('[todo-test-10] should update todo order', async () => {
        const tenant = tenantDatabases[0];
        const token = await getToken(tenant.tenantId);

        const todoId1 = await createTodo(tenant.tenantId, token);
        const todoId2 = await createTodo(tenant.tenantId, token);

        await request
            .post('/api/todos/order')
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${token}`)
            .send({orderedIds: [todoId2, todoId1]})
            .expect(200);

        const getResponse = await request
            .get('/api/todos')
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(getResponse.body[0].id).toBe(todoId2);
        expect(getResponse.body[0].position).toBe(1);
        expect(getResponse.body[1].id).toBe(todoId1);
        expect(getResponse.body[1].position).toBe(2);
    });

    test('[todo-test-11] should enforce tenant isolation on get todo', async () => {
        const tenant1 = tenantDatabases[0];
        const tenant2 = tenantDatabases[1];

        const token1 = await getToken(tenant1.tenantId);
        const todoId = await createTodo(tenant1.tenantId, token1);

        const token2 = await getToken(tenant2.tenantId);

        await request
            .get(`/api/todos/${todoId}`)
            .set('X-Tenant-Id', tenant2.tenantId)
            .set('Authorization', `Bearer ${token2}`)
            .expect(404);
    });

    test('[todo-test-12] should handle invalid token on create todo', async () => {
        const tenant = tenantDatabases[0];

        await request
            .post('/api/todos')
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', 'Bearer invalid_token')
            .send({text: 'Test', category: 'Work', priority: 'high'})
            .expect(401);
    });

    test('[todo-test-13] should update positions after delete', async () => {
        const tenant = tenantDatabases[0];
        const token = await getToken(tenant.tenantId);

        const todoId1 = await createTodo(tenant.tenantId, token);
        const todoId2 = await createTodo(tenant.tenantId, token);
        const todoId3 = await createTodo(tenant.tenantId, token);

        // Delete middle todo
        await request
            .delete(`/api/todos/${todoId2}`)
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${token}`)
            .expect(204);

        const getResponse = await request
            .get('/api/todos')
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(getResponse.body.length).toBe(2);
        expect(getResponse.body[0].position).toBe(1);
        expect(getResponse.body[1].position).toBe(2);
    });

    test('[todo-test-14] should set position on create', async () => {
        const tenant = tenantDatabases[0];
        const token = await getToken(tenant.tenantId);

        // Create new todo
        const todoId = await createTodo(tenant.tenantId, token);

        const getResponse = await request
            .get(`/api/todos/${todoId}`)
            .set('X-Tenant-Id', tenant.tenantId)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(getResponse.body.position).toBe(1); // Since beforeEach truncates, position starts from 1
    });
});