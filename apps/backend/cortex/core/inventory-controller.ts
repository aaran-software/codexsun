import { RequestContext, InventoryItemData, InventoryResponse } from './tenant.types';
import { createInventoryItem as createInventoryItemService } from './inventory-service';
import { handleError } from './error-handler';

export async function createInventoryItem(req: { body: InventoryItemData; context: RequestContext }): Promise<InventoryResponse> {
    try {
        const { tenant, user } = req.context;
        if (!tenant) {
            throw new Error('Tenant context required');
        }
        if (!user || user.role !== 'admin') {
            throw new Error('Admin role required');
        }

        const itemData = { ...req.body, tenantId: tenant.id };
        const newItem = await createInventoryItemService(itemData, tenant);
        return { item: newItem };
    } catch (error) {
        await handleError(error instanceof Error ? error : new Error('Unknown error'), req.context.tenant?.id);
        throw error;
    }
}