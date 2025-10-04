import { Tenant, InventoryItemData, StoredInventoryItem, DbConnection } from './tenant.types';
import { getTenantDbConnection } from './db-context-switcher';

// Mock DB query for inventory item (replace with actual DB query in production)
const mockItemQuery = async (connection: DbConnection, id?: string): Promise<any> => {
    const mockItems: StoredInventoryItem[] = [
        { id: 'item1', name: 'Widget', quantity: 100, tenantId: 'tenant1' },
    ];
    if (id) {
        return mockItems.find(item => item.id === id) || null;
    }
    return null;
};

// Mock item creation (replace with actual DB insert in production)
const mockCreateItem = async (connection: DbConnection, itemData: InventoryItemData): Promise<StoredInventoryItem> => {
    const { name, quantity, tenantId } = itemData;
    return { id: 'item1', name, quantity, tenantId };
};

export async function createInventoryItem(itemData: InventoryItemData, tenant: Tenant): Promise<StoredInventoryItem> {
    const { tenantId } = itemData;

    if (tenantId !== tenant.id) {
        throw new Error('Tenant mismatch');
    }

    const connection = await getTenantDbConnection(tenant);
    const item = await mockCreateItem(connection, itemData);
    return item;
}

export async function getInventoryItem(id: string, tenant: Tenant): Promise<StoredInventoryItem> {
    const connection = await getTenantDbConnection(tenant);
    const item = await mockItemQuery(connection, id);

    if (!item || item.tenantId !== tenant.id) {
        throw new Error('Inventory item not found');
    }

    return item;
}