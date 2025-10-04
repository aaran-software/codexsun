import { login } from '../../cortex/core/login-controller';
import { Tenant } from '../../cortex/core/tenant.types';

describe('[7.] Login Controller', () => {
    test('[test 1] logs in user and returns tenant and user data', async () => {
        const req = { body: { email: 'john@tenant1.com', password: 'pass123' } };
        const response = await login(req);
        expect(response).toEqual({
            user: { id: 'user1', tenantId: 'tenant1', role: 'admin', token: expect.any(String) },
            tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
        });
        expect(response.user.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });

    test('[test 2] rejects invalid credentials', async () => {
        const req = { body: { email: 'john@tenant1.com', password: 'wrongpass' } };
        await expect(login(req)).rejects.toThrow('Invalid credentials');
    });

    test('[test 3] rejects unknown email', async () => {
        const req = { body: { email: 'unknown@domain.com', password: 'pass123' } };
        await expect(login(req)).rejects.toThrow('Email not associated with any tenant');
    });
});