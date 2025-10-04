import { createApp } from '../../cortex/core/app';
import { LoginResponse } from '../../cortex/core/tenant.types';

describe('[9.] Express App', () => {
    test('[test 1] handles login request and returns user and tenant data', async () => {
        const app = createApp();
        const response = await mockRequest(app, 'POST', '/login', {
            email: 'john@tenant1.com',
            password: 'pass123',
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            user: { id: 'user1', tenantId: 'tenant1', role: 'admin', token: expect.any(String) },
            tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
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
        expect(response.body).toEqual({ error: 'Email not associated with any tenant' });
    });
});

// Mock request helper for testing Express app
async function mockRequest(app: any, method: string, url: string, body: any): Promise<any> {
    return new Promise((resolve) => {
        const req = { method, url, body, headers: {}, context: {} };
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