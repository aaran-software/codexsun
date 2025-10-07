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

import { tenantMiddleware } from '../../../cortex/core/tenant/tenant-middleware';
import { authMiddleware } from '../../../cortex/core/auth/auth-middleware';
import { createUser } from '../../../cortex/core/user/user-controller';
import { createTodoItem } from '../../../cortex/core/todo/todo-controller';

const mockTenantMiddleware = tenantMiddleware as jest.Mock;
const mockAuthMiddleware = authMiddleware as jest.Mock;
const mockCreateUser = createUser as jest.Mock;
const mockCreateTodoItem = createTodoItem as jest.Mock;

describe('[23.] App Tests', () => {
    let connection: Connection;

    beforeAll(async () => {
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
                req.context.tenant = { id: payload.tenantId || 'tenant1', dbConnection: `mariadb://localhost:3306/${TEST_DB}` };
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
                req.context.user = { id: payload.id, tenantId: payload.tenantId, role: payload.role, token };
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
        expect(response.body).toEqual({ error: 'tenant is not defined' });
    });

    test('[test 3] rejects login with unknown email', async () => {
        const app = createApp();
        const response = await mockRequest(app, 'POST', '/login', {
            email: 'unknown@domain.com',
            password: 'pass123',
        });
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'tenant is not defined' });
    });

    test('[test 4] rejects login when rate limit is exceeded', async () => {
        const app = createApp();
        const loginPayload = { email: 'john@tenant1.com', password: 'pass123' };

        for (let i = 0; i < 5; i++) {
            await mockRequest(app, 'POST', '/login', loginPayload, undefined, '127.0.0.1');
        }

        const response = await mockRequest(app, 'POST', '/login', loginPayload, undefined, '127.0.0.1');
        expect(response.status).toBe(429);
        expect(response.body).toEqual({ error: 'Too many requests' });
    });

    test('[test 5] handles unexpected error during login', async () => {
        const app = createApp();
        const dbContextSwitcher = require('../../../cortex/db/db-context-switcher');
        const originalGetTenantDbConnection = dbContextSwitcher.getTenantDbConnection;
        dbContextSwitcher.getTenantDbConnection = jest.fn().mockRejectedValue(new Error('tenant is not defined'));

        const response = await mockRequest(app, 'POST', '/login', {
            email: 'john@tenant1.com',
            password: 'pass123',
        });

        dbContextSwitcher.getTenantDbConnection = originalGetTenantDbConnection;
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: expect.stringContaining('tenant is not defined') });
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

    test('[test 8] creates todo item with valid admin token', async () => {
        const mockItem = { slug: 'new-todo', title: 'New Todo', tenantId: 'tenant1' };
        mockCreateTodoItem.mockResolvedValue({ item: mockItem });

        const app = createApp();
        const response = await mockRequest(app, 'POST', '/todo', {
            slug: 'new-todo',
            title: 'New Todo',
        }, 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6ImFkbWluIn0.signature');
        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            item: { slug: 'new-todo', title: 'New Todo', tenantId: 'tenant1' },
        });
        expect(mockTenantMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthMiddleware).toHaveBeenCalledTimes(1);
        expect(mockCreateTodoItem).toHaveBeenCalledTimes(1);
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

    test('[test 10] rejects /todo request without authorization', async () => {
        const app = createApp();
        mockTenantMiddleware.mockImplementationOnce((req: any, res: any, next: (err?: Error) => void) => {
            next(new Error('No token provided'));
        });
        const response = await mockRequest(app, 'POST', '/todo', {
            slug: 'new-todo',
            title: 'New Todo',
        });
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'No token provided' });
        expect(mockTenantMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthMiddleware).not.toHaveBeenCalled();
        expect(mockCreateTodoItem).not.toHaveBeenCalled();
    });

    test('[test 11] rejects /users request with invalid token', async () => {
        const app = createApp();
        mockTenantMiddleware.mockImplementationOnce((req: any, res: any, next: (err?: Error) => void) => {
            next(new Error('Invalid token'));
        });
        const response = await mockRequest(app, 'POST', '/users', {
            name: 'John Doe',
            email: 'john@tenant1.com',
        }, 'invalid.token');
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Invalid token' });
        expect(mockTenantMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthMiddleware).not.toHaveBeenCalled();
        expect(mockCreateUser).not.toHaveBeenCalled();
    });

    test('[test 12] rejects /todo request with invalid token', async () => {
        const app = createApp();
        mockTenantMiddleware.mockImplementationOnce((req: any, res: any, next: (err?: Error) => void) => {
            next(new Error('Invalid token'));
        });
        const response = await mockRequest(app, 'POST', '/todo', {
            slug: 'new-todo',
            title: 'New Todo',
        }, 'invalid.token');
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Invalid token' });
        expect(mockTenantMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthMiddleware).not.toHaveBeenCalled();
        expect(mockCreateTodoItem).not.toHaveBeenCalled();
    });

    test('[test 13] rejects /users request with invalid tenant', async () => {
        const app = createApp();
        mockTenantMiddleware.mockImplementationOnce((req: any, res: any, next: (err?: Error) => void) => {
            next(new Error('Invalid tenant'));
        });
        const response = await mockRequest(app, 'POST', '/users', {
            name: 'John Doe',
            email: 'john@tenant1.com',
        }, 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJpbnZhbGlkIiwicm9sZSI6ImFkbWluIn0.signature');
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Invalid tenant' });
        expect(mockTenantMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthMiddleware).not.toHaveBeenCalled();
        expect(mockCreateUser).not.toHaveBeenCalled();
    });

    test('[test 14] rejects /todo request with insufficient permissions', async () => {
        const app = createApp();
        mockAuthMiddleware.mockImplementationOnce(() => (req: any, res: any, next: (err?: Error) => void) => {
            next(new Error('Insufficient permissions'));
        });
        const response = await mockRequest(app, 'POST', '/todo', {
            slug: 'new-todo',
            title: 'New Todo',
        }, 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6InVzZXIifQ.signature');
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Insufficient permissions' });
        expect(mockTenantMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthMiddleware).toHaveBeenCalledTimes(1);
        expect(mockCreateTodoItem).not.toHaveBeenCalled();
    });

    test('[test 15] rejects /users request with insufficient permissions', async () => {
        const app = createApp();
        mockAuthMiddleware.mockImplementationOnce(() => (req: any, res: any, next: (err?: Error) => void) => {
            next(new Error('Insufficient permissions'));
        });
        const response = await mockRequest(app, 'POST', '/users', {
            name: 'John Doe',
            email: 'john@tenant1.com',
        }, 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6InVzZXIifQ.signature');
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Insufficient permissions' });
        expect(mockTenantMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthMiddleware).toHaveBeenCalledTimes(1);
        expect(mockCreateUser).not.toHaveBeenCalled();
    });

    test('[test 16] rejects non-POST requests to /users', async () => {
        const app = createApp();
        const response = await mockRequest(app, 'GET', '/users', {}, 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6ImFkbWluIn0.signature');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Not found' });
        expect(mockTenantMiddleware).not.toHaveBeenCalled();
        expect(mockAuthMiddleware).not.toHaveBeenCalled();
        expect(mockCreateUser).not.toHaveBeenCalled();
    });

    test('[test 17] rejects non-POST requests to /todo', async () => {
        const app = createApp();
        const response = await mockRequest(app, 'GET', '/todo', {}, 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6ImFkbWluIn0.signature');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Not found' });
        expect(mockTenantMiddleware).not.toHaveBeenCalled();
        expect(mockAuthMiddleware).not.toHaveBeenCalled();
        expect(mockCreateTodoItem).not.toHaveBeenCalled();
    });

    test('[test 18] handles service error in user creation', async () => {
        mockCreateUser.mockRejectedValue(new Error('User creation failed'));
        const app = createApp();
        const response = await mockRequest(app, 'POST', '/users', {
            name: 'John Doe',
            email: 'john@tenant1.com',
        }, 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6ImFkbWluIn0.signature');
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'User creation failed' });
        expect(mockTenantMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthMiddleware).toHaveBeenCalledTimes(1);
        expect(mockCreateUser).toHaveBeenCalledTimes(1);
    });

    test('[test 19] handles service error in todo creation', async () => {
        mockCreateTodoItem.mockRejectedValue(new Error('Todo creation failed'));
        const app = createApp();
        const response = await mockRequest(app, 'POST', '/todo', {
            slug: 'new-todo',
            title: 'New Todo',
        }, 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6ImFkbWluIn0.signature');
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Todo creation failed' });
        expect(mockTenantMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthMiddleware).toHaveBeenCalledTimes(1);
        expect(mockCreateTodoItem).toHaveBeenCalledTimes(1);
    });

    test('[test 20] rejects unknown routes', async () => {
        const app = createApp();
        const response = await mockRequest(app, 'POST', '/unknown', {}, 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6ImFkbWluIn0.signature');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Not found' });
        expect(mockTenantMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthMiddleware).not.toHaveBeenCalled();
        expect(mockCreateUser).not.toHaveBeenCalled();
        expect(mockCreateTodoItem).not.toHaveBeenCalled();
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