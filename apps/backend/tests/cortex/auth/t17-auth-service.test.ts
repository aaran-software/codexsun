import { authenticateUser } from '../../../cortex/core/auth/auth-service';
import { Tenant } from '../../../cortex/core/app.types';

describe('[3.] Authentication with Tenant Context', () => {
    test('[test 1] authenticates user in tenant-specific DB', async () => {
        const tenant: Tenant = { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' };
        const credentials = { email: 'john@tenant1.com', password: 'pass123' };
        const user = await authenticateUser(credentials, tenant);
        expect(user).toEqual({ id: 'user1', tenantId: 'tenant1', role: 'admin', token: expect.any(String) });
        expect(user.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });

    test('[test 2] rejects invalid password in tenant DB', async () => {
        const tenant: Tenant = { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' };
        const credentials = { email: 'john@tenant1.com', password: 'wrongpass' };
        await expect(authenticateUser(credentials, tenant)).rejects.toThrow('Invalid credentials');
    });
});