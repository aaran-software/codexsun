import { resolveTenant } from '../../cortex/core/tenant-resolver';
import { Tenant } from '../../cortex/core/tenant.types';

describe('[1.] Tenant Resolver with Email', () => {
    test('[test 1] resolves tenantId from email in master DB', async () => {
        const req = { body: { email: 'john@tenant1.com', password: 'pass123' } };
        const tenant = await resolveTenant(req);
        expect(tenant).toEqual({ id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' });
    });

    test('[test 2] throws error for email not found in master DB', async () => {
        const req = { body: { email: 'unknown@domain.com', password: 'pass123' } };
        await expect(resolveTenant(req)).rejects.toThrow('Email not associated with any tenant');
    });

    test('[test 3] throws error for email associated with multiple tenants', async () => {
        const req = { body: { email: 'shared@domain.com', password: 'pass123' } };
        await expect(resolveTenant(req)).rejects.toThrow('Multiple tenants found for email');
    });
});