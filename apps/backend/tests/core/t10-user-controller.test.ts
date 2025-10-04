import { createUser } from '../../cortex/core/user-controller';
import { RequestContext, Tenant, User, UserData } from '../../cortex/core/tenant.types';

describe('[10.] User Controller', () => {
    test('[test 1] creates user and returns user data', async () => {
        const req = {
            body: { name: 'John Doe', email: 'john@tenant1.com' },
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'admin1', tenantId: 'tenant1', role: 'admin', token: 'mocked.token' },
            } as RequestContext,
        };
        const response = await createUser(req);
        expect(response).toEqual({
            user: { id: 'user1', name: 'John Doe', email: 'john@tenant1.com', tenantId: 'tenant1' },
        });
    });

    test('[test 2] rejects user creation for missing tenant context', async () => {
        const req = {
            body: { name: 'John Doe', email: 'john@tenant1.com' },
            context: {} as RequestContext,
        };
        await expect(createUser(req)).rejects.toThrow('Tenant context required');
    });

    test('[test 3] rejects user creation for non-admin user', async () => {
        const req = {
            body: { name: 'John Doe', email: 'john@tenant1.com' },
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'user1', tenantId: 'tenant1', role: 'user', token: 'mocked.token' },
            } as RequestContext,
        };
        await expect(createUser(req)).rejects.toThrow('Admin role required');
    });
});