import { createApp } from '../../../cortex/core/app';
import { Connection } from '../../../cortex/db/connection';
import { tenantStorage, query } from '../../../cortex/db/db';
import * as jwt from 'jsonwebtoken';

const TEST_DB = process.env.DB_NAME || 'codexsun_db';
const MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-please-replace';

describe('[23.] Express App Tests', () => {
    let connection: Connection;

    beforeAll(async () => {
        // Initialize MariaDB connection
        const testConfig = {
            type: 'mariadb' as const,
            database: MASTER_DB,
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306', 10),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            ssl: process.env.DB_SSL === 'true',
            connectionLimit: 10,
            acquireTimeout: 10000,
            idleTimeout: 10000,
        };

        connection = await Connection.initialize(testConfig);

        // Setup master and tenant DB schema
        await tenantStorage.run(MASTER_DB, () => query('DROP TABLE IF EXISTS tenants', []));
        await tenantStorage.run(MASTER_DB, () => query(`
            CREATE TABLE tenants (
                id VARCHAR(255) PRIMARY KEY,
                tenant_id VARCHAR(50) UNIQUE NOT NULL,
                db_host VARCHAR(255),
                db_port VARCHAR(10),
                db_user VARCHAR(255),
                db_pass VARCHAR(255),
                db_name VARCHAR(255) NOT NULL,
                db_ssl VARCHAR(10),
                created_at DATETIME,
                updated_at DATETIME
            )`, []));

        await tenantStorage.run(MASTER_DB, () => query(`
            INSERT INTO tenants (id, tenant_id, db_host, db_port, db_user, db_pass, db_name, db_ssl, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            ['1', 'tenant1', 'localhost', '3306', 'root', '', TEST_DB, 'false']));

        await tenantStorage.run(MASTER_DB, () => query('DROP TABLE IF EXISTS tenant_users', []));
        await tenantStorage.run(MASTER_DB, () => query(`
            CREATE TABLE tenant_users (
                email VARCHAR(255) UNIQUE NOT NULL,
                tenant_id VARCHAR(50) NOT NULL,
                created_at DATETIME,
                updated_at DATETIME
            )`, []));

        await tenantStorage.run(TEST_DB, () => query('DROP TABLE IF EXISTS users', []));
        await tenantStorage.run(TEST_DB, () => query(`
            CREATE TABLE users (
                id VARCHAR(255) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                tenant_id VARCHAR(50) NOT NULL,
                role VARCHAR(50) NOT NULL,
                created_at DATETIME,
                updated_at DATETIME
            )`, []));

        // Seed test data
        await tenantStorage.run(MASTER_DB, () => query(`
            INSERT INTO tenant_users (email, tenant_id, created_at, updated_at)
            VALUES (?, ?, NOW(), NOW())`, ['john@tenant1.com', 'tenant1']));

        await tenantStorage.run(TEST_DB, () => query(`
            INSERT INTO users (id, email, password_hash, tenant_id, role, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            ['user1', 'john@tenant1.com', 'pass123', 'tenant1', 'admin']));
    });

    afterAll(async () => {
        // Cleanup
        await tenantStorage.run(TEST_DB, () => query('DROP TABLE IF EXISTS users', []));
        await tenantStorage.run(MASTER_DB, () => query('DROP TABLE IF EXISTS tenant_users', []));
        await tenantStorage.run(MASTER_DB, () => query('DROP TABLE IF EXISTS tenants', []));
        await connection.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('[test 1] handles login request and returns user and tenant data', async () => {
        const app = createApp();
        const response = await mockRequest(app, 'POST', '/login', {
            email: 'john@tenant1.com',
            password: 'pass123',
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            user: { id: 'user1', tenantId: 'tenant1', role: 'admin', token: expect.any(String) },
            tenant: { id: 'tenant1', dbConnection: `mariadb://root@localhost:3306/${TEST_DB}` },
        });
        expect(response.body.user.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });

    test('[test 2] rejects login with invalid credentials', async () => {
        const app = createApp();
        const response = await mockRequest(app, 'POST', '/login', {
            email: 'john@tenant1.com',
            password: 'wrongpass',
        });
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Invalid credentials' });
    });

    test('[test 3] rejects login with unknown email', async () => {
        const app = createApp();
        const response = await mockRequest(app, 'POST', '/login', {
            email: 'unknown@domain.com',
            password: 'pass123',
        });
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: expect.stringContaining('Tenant resolution failed') });
    });

    test('[test 4] rejects login when rate limit is exceeded', async () => {
        const app = createApp();
        const loginPayload = { email: 'john@tenant1.com', password: 'pass123' };

        for (let i = 0; i < 5; i++) {
            await mockRequest(app, 'POST', '/login', loginPayload, undefined, '127.0.0.1');
        }

        const response = await mockRequest(app, 'POST', '/login', loginPayload, undefined, '127.0.0.1');
        expect(response.status).toBe(429);
        expect(response.body).toEqual({ error: 'Too many requests, please try again later' });
    });

    test('[test 5] handles unexpected error during login', async () => {
        const app = createApp();
        // Simulate a database error by using an invalid DB configuration
        const originalConfig = process.env.DB_NAME;
        process.env.DB_NAME = 'invalid_db';
        const response = await mockRequest(app, 'POST', '/login', {
            email: 'john@tenant1.com',
            password: 'pass123',
        });
        process.env.DB_NAME = originalConfig;
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: expect.stringContaining('Failed to connect to tenant DB') });
    });

    test('[test 6] rejects non-POST login requests', async () => {
        const app = createApp();
        const response = await mockRequest(app, 'GET', '/login', {});
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Not found' });
    });
});

async function mockRequest(app: any, method: string, url: string, body: any, auth?: string, ip: string = '127.0.0.1'): Promise<any> {
    return new Promise((resolve) => {
        const req = { method, url, body, headers: { authorization: auth ? `Bearer ${auth}` : undefined }, context: {}, ip };
        const res = {
            statusCode: 200,
            status: (code: number) => {
                res.statusCode = code;
                return res;
            },
            json: (data: any) => {
                resolve({ status: res.statusCode, body: data });
            },
        };
        app(req, res);
    });
}