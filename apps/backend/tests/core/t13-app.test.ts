import { createApp } from '../../cortex/core/app';
import { LoginResponse, UserResponse, InventoryResponse } from '../../cortex/core/tenant.types';

jest.mock('../../cortex/core/tenant-middleware');
jest.mock('../../cortex/core/auth-middleware');
jest.mock('../../cortex/core/user-controller');
jest.mock('../../cortex/core/inventory-controller');
jest.mock('../../cortex/core/login-controller');

import { tenantMiddleware } from '../../cortex/core/tenant-middleware';
import { authMiddleware } from '../../cortex/core/auth-middleware';
import { createUser } from '../../cortex/core/user-controller';
import { createInventoryItem } from '../../cortex/core/inventory-controller';
import { login } from '../../cortex/core/login-controller';

const mockTenantMiddleware = tenantMiddleware as jest.Mock;
const mockAuthMiddleware = authMiddleware as jest.Mock;
const mockCreateUser = createUser as jest.Mock;
const mockCreateInventoryItem = createInventoryItem as jest.Mock;
const mockLogin = login as jest.Mock;

describe('[13.] Express App Protected Endpoints', () => {
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
                req.context.tenantId = payload.tenantId || 'tenant1';
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
        mockCreateUser.mockImplementation((req: any) =>
            Promise.resolve({
                user: { id: 'user1', name: req.body.name, email: req.body.email, tenantId: req.context.tenantId },
            })
        );
        mockCreateInventoryItem.mockImplementation((req: any) =>
            Promise.resolve({
                item: { id: 'item1', name: req.body.name, quantity: req.body.quantity, tenantId: req.context.tenantId },
            })
        );
        mockLogin.mockImplementation(() =>
            Promise.resolve({
                user: { id: 'user1', tenantId: 'tenant1', role: 'admin', token: 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6ImFkbWluIn0.signature' },
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
            })
        );
    });

    test('[test 1] creates user with admin role', async () => {
        const app = createApp();
        const response = await mockRequest(app, 'POST', '/users', {
            name: 'John Doe',
            email: 'john@tenant1.com',
        }, 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6ImFkbWluIn0.signature');
        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            user: { id: 'user1', name: 'John Doe', email: 'john@tenant1.com', tenantId: 'tenant1' },
        });
        expect(mockTenantMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthMiddleware).toHaveBeenCalledTimes(1);
        expect(mockCreateUser).toHaveBeenCalledTimes(1);
    });

    test('[test 2] rejects user creation with non-admin role', async () => {
        const app = createApp();
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

    test('[test 3] creates inventory item with admin role', async () => {
        const app = createApp();
        const response = await mockRequest(app, 'POST', '/inventory', {
            name: 'Widget',
            quantity: 100,
        }, 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6ImFkbWluIn0.signature');
        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            item: { id: 'item1', name: 'Widget', quantity: 100, tenantId: 'tenant1' },
        });
        expect(mockTenantMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthMiddleware).toHaveBeenCalledTimes(1);
        expect(mockCreateInventoryItem).toHaveBeenCalledTimes(1);
    });

    test('[test 4] rejects inventory item creation with non-admin role', async () => {
        const app = createApp();
        const response = await mockRequest(app, 'POST', '/inventory', {
            name: 'Widget',
            quantity: 100,
        }, 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6InVzZXIifQ.signature');
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Insufficient permissions' });
        expect(mockTenantMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthMiddleware).toHaveBeenCalledTimes(1);
        expect(mockCreateInventoryItem).not.toHaveBeenCalled();
    });

    test('[test 5] rejects request with invalid tenant', async () => {
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

    test('[test 6] rejects non-POST requests to /users', async () => {
        const app = createApp();
        const response = await mockRequest(app, 'GET', '/users', {}, 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6ImFkbWluIn0.signature');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Not found' });
        expect(mockTenantMiddleware).not.toHaveBeenCalled();
        expect(mockAuthMiddleware).not.toHaveBeenCalled();
        expect(mockCreateUser).not.toHaveBeenCalled();
    });

    test('[test 7] login and create user in sequence', async () => {
        const app = createApp();
        const loginResponse = await mockRequest(app, 'POST', '/login', {
            email: 'john@tenant1.com',
            password: 'pass123',
        });
        expect(loginResponse.status).toBe(200);
        const token = loginResponse.body.user.token;
        const userResponse = await mockRequest(app, 'POST', '/users', {
            name: 'Jane Doe',
            email: 'jane@tenant1.com',
        }, token);
        expect(userResponse.status).toBe(201);
        expect(userResponse.body).toEqual({
            user: { id: 'user1', name: 'Jane Doe', email: 'jane@tenant1.com', tenantId: 'tenant1' },
        });
        expect(mockLogin).toHaveBeenCalledTimes(1);
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
        expect(mockCreateInventoryItem).not.toHaveBeenCalled();
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