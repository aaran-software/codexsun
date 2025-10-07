import { createApp } from '../../../cortex/core/app';
import { Connection } from '../../../cortex/db/connection';
import { tenantStorage, query } from '../../../cortex/db/db';
import * as jwt from 'jsonwebtoken';

const TEST_DB = process.env.DB_NAME || 'codexsun_db';
const MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-please-replace';

jest.mock('../../../cortex/core/tenant/tenant-middleware');
jest.mock('../../../cortex/core/auth/auth-middleware');
jest.mock('../../../cortex/core/user/user-controller');
jest.mock('../../../cortex/core/todo/todo-controller');
jest.mock('../../../cortex/core/auth/login-controller');

import { tenantMiddleware } from '../../../cortex/core/tenant/tenant-middleware';
import { authMiddleware } from '../../../cortex/core/auth/auth-middleware';
import { createUser } from '../../../cortex/core/user/user-controller';
import { createTodoItem } from '../../../cortex/core/todo/todo-controller';
import { login } from '../../../cortex/core/auth/login-controller';

const mockTenantMiddleware = tenantMiddleware as jest.Mock;
const mockAuthMiddleware = authMiddleware as jest.Mock;
const mockCreateUser = createUser as jest.Mock;
const mockCreateTodoItem = createTodoItem as jest.Mock;
const mockLogin = login as jest.Mock;

describe('[23.] App Tests', () => {
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

        await tenantStorage.run(MASTER_DB, () => query(`
            INSERT INTO tenant_users (email, tenant_id, created_at, updated_at)
            VALUES (?, ?, NOW(), NOW())`,
            ['john@tenant1.com', 'tenant1']));

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

        await tenantStorage.run(TEST_DB, () => query(`
            INSERT INTO users (id, email, password_hash, tenant_id, role, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            ['user1', 'john@tenant1.com', 'pass123', 'tenant1', 'admin']));
    });

    afterAll(async () => {
        await tenantStorage.run(MASTER_DB, () => query('DROP TABLE IF EXISTS tenants', []));
        await tenantStorage.run(MASTER_DB, () => query('DROP TABLE IF EXISTS tenant_users', []));
        await tenantStorage.run(TEST_DB, () => query('DROP TABLE IF EXISTS users', []));
        await connection.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockTenantMiddleware.mockImplementation((req: any, res: any, next: (err?: Error) => void) => {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return next(new Error('No token provided'));
            }
            try {
                const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                if (payload.tenantId === 'invalid') {
                    return next(new Error('Invalid tenant'));
                }
                req.context.tenant = { id: payload.tenantId || 'tenant1', dbConnection: '' };
                next();
            } catch (error) {
                next(new Error('Invalid token'));
            }
        });
        mockAuthMiddleware.mockImplementation(() => (req: any, res: any, next: (err?: Error) => void) => {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return next(new Error('No token provided'));
            }
            try {
                const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                req.context.user = payload;
                if (payload.role !== 'admin') {
                    return next(new Error('Insufficient permissions'));
                }
                next();
            } catch (error) {
                next(new Error('Invalid token'));
            }
        });
    });

    test('[test 1] handles successful login with valid credentials', async () => {
        const app = createApp();
        const response = await mockRequest(app, 'POST', '/login', {
            email: 'john@tenant1.com',
            password: 'pass123',
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('token');
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

    test('[test 7] creates user with valid admin token', async () => {
        const mockUser = { id: 'user1', name: 'Jane Doe', email: 'jane@tenant1.com', tenantId: 'tenant1' };
        mockCreateUser.mockResolvedValue({ user: mockUser });

        const app = createApp();
        const response = await mockRequest(app, 'POST', '/users', {
            name: 'Jane Doe',
            email: 'jane@tenant1.com',
        }, 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6ImFkbWluIn0.signature');
        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            user: { id: 'user1', name: 'Jane Doe', email: 'jane@tenant1.com', tenantId: 'tenant1' },
        });
        expect(mockTenantMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthMiddleware).toHaveBeenCalledTimes(1);
        expect(mockCreateUser).toHaveBeenCalledTimes(1);
    });

    test('[test 8] rejects non-POST requests to /inventory', async () => {
        const app = createApp();
        const response = await mockRequest(app, 'GET', '/inventory', {}, 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6ImFkbWluIn0.signature');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Not found' });
        expect(mockTenantMiddleware).not.toHaveBeenCalled();
        expect(mockAuthMiddleware).not.toHaveBeenCalled();
        expect(mockCreateTodoItem).not.toHaveBeenCalled();
    });

    test('[test 9] rejects /users request without authorization', async () => {
        const app = createApp();
        mockTenantMiddleware.mockImplementationOnce((req: any, res: any, next: (err?: Error) => void) => {
            next(new Error('No token provided'));
        });
        const response = await mockRequest(app, 'POST', '/users', {
            name: 'John Doe',
            email: 'john@tenant1.com',
        });
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'No token provided' });
        expect(mockTenantMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthMiddleware).not.toHaveBeenCalled();
        expect(mockCreateUser).not.toHaveBeenCalled();
    });

    // Add remaining tests from t28 similarly, renaming inventory to todo where needed
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