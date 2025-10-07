import { createApp } from '../../../cortex/core/app';
import { Connection } from '../../../cortex/db/connection';
import { tenantStorage, query } from '../../../cortex/db/db';
import * as jwt from 'jsonwebtoken';
import { rateLimiter } from '../../../cortex/core/auth/rate-limiter';

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

describe('[API] Endpoint Tests', () => {
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
        // Reset rate limiter to ensure test isolation
        const freshRateLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });
        jest.spyOn(require('../../../cortex/core/auth/rate-limiter'), 'rateLimiter').mockReturnValue(freshRateLimiter);
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

    test('[test 1] POST /login succeeds with valid credentials', async () => {
        const app = createApp();
        mockLogin.mockResolvedValue({
            user: { id: 'user1', tenantId: 'tenant1', role: 'admin', token: 'mock-token' },
            tenant: { id: 'tenant1', dbConnection: `mariadb://localhost:3306/${TEST_DB}` },
        });
        const response = await mockRequest(app, 'POST', '/login', {
            email: 'john@tenant1.com',
            password: 'pass123',
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            user: { id: 'user1', tenantId: 'tenant1', role: 'admin', token: 'mock-token' },
            tenant: { id: 'tenant1', dbConnection: expect.any(String) },
        });
        expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    test('[test 2] POST /login fails with invalid credentials', async () => {
        const app = createApp();
        mockLogin.mockRejectedValue(new Error('Invalid credentials'));
        const response = await mockRequest(app, 'POST', '/login', {
            email: 'john@tenant1.com',
            password: 'wrongpass',
        });
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Invalid credentials' });
        expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    test('[test 3] POST /login fails with unknown email', async () => {
        const app = createApp();
        mockLogin.mockRejectedValue(
            new Error('Tenant resolution failed for email unknown@domain.com: No tenant associated with email: unknown@domain.com')
        );
        const response = await mockRequest(app, 'POST', '/login', {
            email: 'unknown@domain.com',
            password: 'pass123',
        });
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            error: 'Tenant resolution failed for email unknown@domain.com: No tenant associated with email: unknown@domain.com',
        });
        expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    test('[test 4] POST /login fails when rate limit exceeded', async () => {
        let callCount = 0;
        const rateLimiterMock = async (req: any, res: any, next: (err?: Error) => void): Promise<void> => {
            callCount++;
            if (callCount <= 5) {
                next();
            } else {
                next(new Error('Too many requests'));
            }
        };
        const app = createApp(rateLimiterMock);
        mockLogin.mockResolvedValue({
            user: { id: 'user1', tenantId: 'tenant1', role: 'admin', token: 'mock-token' },
            tenant: { id: 'tenant1', dbConnection: `mariadb://localhost:3306/${TEST_DB}` },
        });
        const loginPayload = { email: 'john@tenant1.com', password: 'pass123' };

        // Make 5 successful requests
        for (let i = 0; i < 5; i++) {
            const response = await mockRequest(app, 'POST', '/login', loginPayload, undefined, '127.0.0.1');
            expect(response.status).toBe(200); // Verify each request succeeds
        }

        // 6th request should trigger rate limit
        const response = await mockRequest(app, 'POST', '/login', loginPayload, undefined, '127.0.0.1');
        expect(response.status).toBe(429);
        expect(response.body).toEqual({ error: 'Too many requests' });
        expect(mockLogin).toHaveBeenCalledTimes(5);
    });


    test('[test 5] POST /login handles database connection error', async () => {
        // Use no-op rate limiter to bypass rate limit interference
        const noOpRateLimiter = async (req: any, res: any, next: (err?: Error) => void): Promise<void> => {
            next();
        };
        const app = createApp(noOpRateLimiter);
        mockLogin.mockRejectedValue(new Error('Database connection failed'));
        const response = await mockRequest(app, 'POST', '/login', {
            email: 'john@tenant1.com',
            password: 'pass123',
        });
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Database connection failed' });
        expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    test('[test 6] POST /users creates user with valid admin token', async () => {
        const app = createApp();
        mockCreateUser.mockResolvedValue({ id: 'user2', name: 'John Doe', email: 'john@tenant1.com' });
        const response = await mockRequest(app, 'POST', '/users', {
            name: 'John Doe',
            email: 'john@tenant1.com',
        }, 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6ImFkbWluIn0.signature');
        expect(response.status).toBe(201);
        expect(response.body).toEqual({ id: 'user2', name: 'John Doe', email: 'john@tenant1.com' });
        expect(mockTenantMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthMiddleware).toHaveBeenCalledTimes(1);
        expect(mockCreateUser).toHaveBeenCalledTimes(1);
    });

    test('[test 7] POST /todo creates todo with valid admin token', async () => {
        const app = createApp();
        mockCreateTodoItem.mockResolvedValue({ id: 'todo1', slug: 'new-todo', title: 'New Todo' });
        const response = await mockRequest(app, 'POST', '/todo', {
            slug: 'new-todo',
            title: 'New Todo',
        }, 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6ImFkbWluIn0.signature');
        expect(response.status).toBe(201);
        expect(response.body).toEqual({ id: 'todo1', slug: 'new-todo', title: 'New Todo' });
        expect(mockTenantMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthMiddleware).toHaveBeenCalledTimes(1);
        expect(mockCreateTodoItem).toHaveBeenCalledTimes(1);
    });

    test('[test 8] POST /users fails without authorization', async () => {
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

    test('[test 9] POST /todo fails with invalid token', async () => {
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

    test('[test 10] POST /users fails with insufficient permissions', async () => {
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

    test('[test 11] GET /login returns 404 for non-POST requests', async () => {
        const app = createApp();
        const response = await mockRequest(app, 'GET', '/login', {});
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Not found' });
        expect(mockLogin).not.toHaveBeenCalled();
    });

    test('[test 12] POST /unknown returns 404 for unknown routes', async () => {
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