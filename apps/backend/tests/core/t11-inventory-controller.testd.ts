import { createInventoryItem } from '../../cortex/core/inventory-controller';
import { RequestContext, Tenant, User, InventoryItemData } from '../../cortex/core/tenant.types';

describe('[11.] Inventory Controller', () => {
    test('[test 1] creates inventory item and returns item data', async () => {
        const req = {
            body: { name: 'Widget', quantity: 100 },
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'admin1', tenantId: 'tenant1', role: 'admin', token: 'mocked.token' },
            } as RequestContext,
        };
        const response = await createInventoryItem(req);
        expect(response).toEqual({
            item: { id: 'item1', name: 'Widget', quantity: 100, tenantId: 'tenant1' },
        });
    });

    test('[test 2] rejects inventory item creation for missing tenant context', async () => {
        const req = {
            body: { name: 'Widget', quantity: 100 },
            context: {} as RequestContext,
        };
        await expect(createInventoryItem(req)).rejects.toThrow('Tenant context required');
    });

    test('[test 3] rejects inventory item creation for non-admin user', async () => {
        const req = {
            body: { name: 'Widget', quantity: 100 },
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'user1', tenantId: 'tenant1', role: 'user', token: 'mocked.token' },
            } as RequestContext,
        };
        await expect(createInventoryItem(req)).rejects.toThrow('Admin role required');
    });
});