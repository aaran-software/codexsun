import { Tenant, TenantUser } from './tenant.types';
import { mockMasterDb, mockTenantLookup } from './mock-master-db';

export async function resolveTenant(req: { body: { email: string; password: string } }): Promise<Tenant> {
    const { email } = req.body;

    if (!email) {
        throw new Error('Email is required');
    }

    const users = await mockMasterDb.query('SELECT * FROM tenant_users WHERE email = ?', [email]);

    if (users.length === 0) {
        throw new Error('Email not associated with any tenant');
    }

    if (users.length > 1) {
        throw new Error('Multiple tenants found for email');
    }

    const tenantId = users[0].tenantId;
    const tenant = await mockTenantLookup(tenantId);

    if (!tenant) {
        throw new Error('Tenant not found');
    }

    return tenant;
}