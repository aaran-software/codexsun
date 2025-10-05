import { createApp } from '../../cortex/core/app';
import { LoginResponse } from '../../cortex/core/tenant.types';

jest.mock('../../cortex/core/login-controller');
jest.mock('../../cortex/core/rate-limiter');

import { login } from '../../cortex/core/login-controller';
import { rateLimiter } from '../../cortex/core/rate-limiter';

const mockLogin = login as jest.Mock;
const mockRateLimiter = rateLimiter as jest.Mock;

describe('[9.] Express App', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLogin.mockImplementation(() =>
            Promise.resolve({
                user: { id: 'user1', tenantId: 'tenant1', role: 'admin', token: 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6ImFkbWluIn0.signature' },
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
            })
        );
        mockRateLimiter.mockImplementation(() => (req: any, res: any, next: (err?: Error) => void) => next());
    });

    test('[test 1] handles login request and returns user and tenant data', async () => {
        const app = createApp();
        const response = await mockRequest(app, 'POST', '/login', {
            email: 'john@tenant1.com',
            password: 'pass123',
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            user: { id: 'user1', tenantId: 'tenant1', role: 'admin', token: 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6ImFkbWluIn0.signature' },
            tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
        });
        expect(response.body.user.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
        expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    test('[test 2] rejects login with invalid credentials', async () => {
        mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
        const app = createApp();
        const response = await mockRequest(app, 'POST', '/login', {
            email: 'john@tenant1.com',
            password: 'wrongpass',
        });
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Invalid credentials' });
        expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    test('[test 3] rejects login with unknown email', async () => {
        mockLogin.mockRejectedValueOnce(new Error('Email not associated with any tenant'));
        const app = createApp();
        const response = await mockRequest(app, 'POST', '/login', {
            email: 'unknown@domain.com',
            password: 'pass123',
        });
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Email not associated with any tenant' });
        expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    test('[test 4] rejects login when rate limit is exceeded', async () => {
        let requestCount = 0;
        mockRateLimiter.mockImplementation(() => (req: any, res: any, next: (err?: Error) => void) => {
            requestCount++;
            if (requestCount > 5) {
                return next(new Error('Too many requests, please try again later'));
            }
            next();
        });
        const app = createApp();
        const loginPayload = { email: 'john@tenant1.com', password: 'pass123' };

        for (let i = 0; i < 5; i++) {
            await mockRequest(app, 'POST', '/login', loginPayload, undefined, '127.0.0.1');
        }

        const response = await mockRequest(app, 'POST', '/login', loginPayload, undefined, '127.0.0.1');
        expect(response.status).toBe(429);
        expect(response.body).toEqual({ error: 'Too many requests, please try again later' });
        expect(mockRateLimiter).toHaveBeenCalledTimes(6);
    });

    test('[test 5] handles unexpected error during login', async () => {
        mockLogin.mockRejectedValueOnce(new Error('Database connection failed'));
        const app = createApp();
        const response = await mockRequest(app, 'POST', '/login', {
            email: 'john@tenant1.com',
            password: 'pass123',
        });
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Database connection failed' });
        expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    test('[test 6] rejects non-POST login requests', async () => {
        const app = createApp();
        const response = await mockRequest(app, 'GET', '/login', {});
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Not found' });
        expect(mockLogin).not.toHaveBeenCalled();
        expect(mockRateLimiter).not.toHaveBeenCalled();
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