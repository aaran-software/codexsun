import { Tenant, TenantUser } from './app.types';

export const mockMasterDb = {
    query: async (query: string, params: any[]): Promise<TenantUser[]> => {
        const mockUsers: TenantUser[] = [
            { email: 'john@tenant1.com', tenantId: 'tenant1' },
            { email: 'shared@domain.com', tenantId: 'tenant1' },
            { email: 'shared@domain.com', tenantId: 'tenant2' },
        ];
        return mockUsers.filter(user => user.email === params[0]);
    },
};

export const mockTenantLookup = async (tenantId: string): Promise<Tenant | null> => {
    const mockTenants: Tenant[] = [
        { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
    ];
    return mockTenants.find(tenant => tenant.id === tenantId) || null;
};