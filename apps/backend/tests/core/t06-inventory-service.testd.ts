
import { createInventoryItem, getInventoryItem } from '../../cortex/core/inventory-service';
import { Tenant } from '../../cortex/core/tenant.types';

describe('[6.] Inventory Service', () => {
    test('[test 1] creates inventory item in tenant DB', async () => {
        const tenant: Tenant = { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' };
        const itemData = { name: 'Widget', quantity: 100, tenantId: 'tenant1' };
        const item = await createInventoryItem(itemData, tenant);
        expect(item).toMatchObject(itemData);
    });

    test('[test 2] fetches inventory item from tenant DB', async () => {
        const tenant: Tenant = { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' };
        const item = await getInventoryItem('item1', tenant);
        expect(item).toMatchObject({ id: 'item1', tenantId: 'tenant1' });
    });

    test('[test 3] rejects inventory item creation for wrong tenant', async () => {
        const tenant: Tenant = { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' };
        const itemData = { name: 'Widget', quantity: 100, tenantId: 'tenant2' };
        await expect(createInventoryItem(itemData, tenant)).rejects.toThrow('Tenant mismatch');
    });
});