import { createUser, getUser } from '../../cortex/core/user-service';
import { Tenant } from '../../cortex/core/tenant.types';

describe('[5.] User Service', () => {
    test('[test 1] creates user in tenant DB', async () => {
        const tenant: Tenant = { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' };
        const userData = { name: 'John Doe', email: 'john@tenant1.com', tenantId: 'tenant1' };
        const user = await createUser(userData, tenant);
        expect(user).toMatchObject(userData);
    });

    test('[test 2] fetches user from tenant DB', async () => {
        const tenant: Tenant = { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' };
        const user = await getUser('user1', tenant);
        expect(user).toMatchObject({ id: 'user1', tenantId: 'tenant1' });
    });

    test('[test 3] rejects user creation for wrong tenant', async () => {
        const tenant: Tenant = { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' };
        const userData = { name: 'John Doe', email: 'john@tenant1.com', tenantId: 'tenant2' };
        await expect(createUser(userData, tenant)).rejects.toThrow('Tenant mismatch');
    });
});