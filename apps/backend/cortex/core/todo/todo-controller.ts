// /cortex/core/todo/todo-controller.ts
// Expert mode: Added version support, fixed req.body type to Omit<TodoItemData, 'tenantId'>, updated error handling with version context.

import { RequestContext, TodoItemData, TodoResponse } from '../app.types';
import { createTodoItem as createTodoItemService } from './todo-service';
import { handleError } from '../error/error-handler';

export async function createTodoItem(
    req: { body: Omit<TodoItemData, 'tenantId'>; context: RequestContext; version?: string },
): Promise<TodoResponse> {
    try {
        const { tenant, user } = req.context;
        const apiVersion = req.version || 'v1';

        if (!tenant) {
            throw new Error('Tenant context required');
        }
        if (!user || user.role !== 'admin') {
            throw new Error('Admin role required');
        }

        const itemData = { ...req.body, tenantId: tenant.id };
        const newItem = await createTodoItemService(itemData, tenant, apiVersion);
        return { item: newItem };
    } catch (error) {
        const errorToLog = error instanceof Error ? error : new Error('Unknown error');
        await handleError(errorToLog, req.context.tenant?.id, req.version);
        throw errorToLog;
    }
}