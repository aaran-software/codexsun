import { createApp } from '../../cortex/core/app';
import { LoginResponse, UserResponse, InventoryResponse } from '../../cortex/core/tenant.types';

describe('[13.] Express App Protected Endpoints', () => {
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
    });

    test('[test 2] rejects user creation with non-admin role', async () => {
        const app = createApp();
        const response = await mockRequest(app, 'POST', '/users', {
            name: 'John Doe',
            email: 'john@tenant1.com',
        }, 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6InVzZXIifQ.signature');
        expect(response.status).toBe(403);
        expect(response.body).toEqual({ error: 'Insufficient permissions' });
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
    });

    test('[test 4] rejects inventory item creation with non-admin role', async () => {
        const app = createApp();
        const response = await mockRequest(app, 'POST', '/inventory', {
            name: 'Widget',
            quantity: 100,
        }, 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6InVzZXIifQ.signature');
        expect(response.status).toBe(403);
        expect(response.body).toEqual({ error: 'Insufficient permissions' });
    });
});

// Mock request helper for testing Express app
async function mockRequest(app: any, method: string, url: string, body: any, auth?: string): Promise<any> {
    return new Promise((resolve) => {
        const req = { method, url, body, headers: { authorization: auth ? `Bearer ${auth}` : undefined }, context: {} };
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