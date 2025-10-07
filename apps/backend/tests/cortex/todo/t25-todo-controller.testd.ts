import { createTodoItem } from '../../../cortex/core/todo/todo-controller';
import { RequestContext, TodoItemData } from '../../../cortex/core/app.types';
import { logError } from '../../../cortex/config/logger';
import { createTodoItem as createTodoItemService } from '../../../cortex/core/todo/todo-service';

// Mock logger to prevent actual logging during tests
jest.mock('../../../cortex/config/logger', () => ({
    logError: jest.fn(),
}));

// Mock todo-service to control createTodoItem behavior
jest.mock('../../../cortex/core/todo/todo-service', () => ({
    createTodoItem: jest.fn(),
}));

describe('[25.] Todo Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('[test 1] creates todo item and returns item data for v1', async () => {
        const mockItem = { slug: 'new-todo', title: 'New Todo', tenantId: 'tenant1' };
        (createTodoItemService as jest.Mock).mockResolvedValue(mockItem);

        const req = {
            body: { slug: 'new-todo', title: 'New Todo' } as Omit<TodoItemData, 'tenantId'>,
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'admin1', tenantId: 'tenant1', role: 'admin', token: 'mocked.token' },
            } as RequestContext,
            version: 'v1',
        };

        const response = await createTodoItem(req);
        expect(response).toEqual({ item: mockItem });
        expect(createTodoItemService).toHaveBeenCalledWith(
            { slug: 'new-todo', title: 'New Todo', tenantId: 'tenant1' },
            req.context.tenant,
            'v1'
        );
        expect(logError).not.toHaveBeenCalled();
    });

    test('[test 2] creates todo item and returns item data for v2', async () => {
        const mockItem = { slug: 'new-todo', title: 'New Todo', tenantId: 'tenant1' };
        (createTodoItemService as jest.Mock).mockResolvedValue(mockItem);

        const req = {
            body: { slug: 'new-todo', title: 'New Todo' } as Omit<TodoItemData, 'tenantId'>,
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'admin1', tenantId: 'tenant1', role: 'admin', token: 'mocked.token' },
            } as RequestContext,
            version: 'v2',
        };

        const response = await createTodoItem(req);
        expect(response).toEqual({ item: mockItem });
        expect(createTodoItemService).toHaveBeenCalledWith(
            { slug: 'new-todo', title: 'New Todo', tenantId: 'tenant1' },
            req.context.tenant,
            'v2'
        );
        expect(logError).not.toHaveBeenCalled();
    });

    test('[test 3] creates todo item with default version when version is undefined', async () => {
        const mockItem = { slug: 'new-todo', title: 'New Todo', tenantId: 'tenant1' };
        (createTodoItemService as jest.Mock).mockResolvedValue(mockItem);

        const req = {
            body: { slug: 'new-todo', title: 'New Todo' } as Omit<TodoItemData, 'tenantId'>,
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'admin1', tenantId: 'tenant1', role: 'admin', token: 'mocked.token' },
            } as RequestContext,
            // version is undefined
        };

        const response = await createTodoItem(req);
        expect(response).toEqual({ item: mockItem });
        expect(createTodoItemService).toHaveBeenCalledWith(
            { slug: 'new-todo', title: 'New Todo', tenantId: 'tenant1' },
            req.context.tenant,
            'v1' // Default version
        );
        expect(logError).not.toHaveBeenCalled();
    });

    test('[test 4] rejects todo item creation for missing tenant context', async () => {
        const req = {
            body: { slug: 'new-todo', title: 'New Todo' } as Omit<TodoItemData, 'tenantId'>,
            context: {} as RequestContext,
            version: 'v1',
        };

        await expect(createTodoItem(req)).rejects.toThrow('Tenant context required');
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Tenant context required',
            tenantId: 'unknown',
            version: 'v1',
        }));
        expect(createTodoItemService).not.toHaveBeenCalled();
    });

    test('[test 5] rejects todo item creation for missing user context', async () => {
        const req = {
            body: { slug: 'new-todo', title: 'New Todo' } as Omit<TodoItemData, 'tenantId'>,
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: undefined,
            } as RequestContext,
            version: 'v1',
        };

        await expect(createTodoItem(req)).rejects.toThrow('Admin role required');
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Admin role required',
            tenantId: 'tenant1',
            version: 'v1',
        }));
        expect(createTodoItemService).not.toHaveBeenCalled();
    });

    test('[test 6] rejects todo item creation for non-admin user', async () => {
        const req = {
            body: { slug: 'new-todo', title: 'New Todo' } as Omit<TodoItemData, 'tenantId'>,
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'user1', tenantId: 'tenant1', role: 'user', token: 'mocked.token' },
            } as RequestContext,
            version: 'v1',
        };

        await expect(createTodoItem(req)).rejects.toThrow('Admin role required');
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Admin role required',
            tenantId: 'tenant1',
            version: 'v1',
        }));
        expect(createTodoItemService).not.toHaveBeenCalled();
    });

    test('[test 7] handles tenant mismatch error from createTodoItemService', async () => {
        const error = new Error('Tenant mismatch');
        (createTodoItemService as jest.Mock).mockRejectedValue(error);

        const req = {
            body: { slug: 'new-todo', title: 'New Todo' } as Omit<TodoItemData, 'tenantId'>,
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'admin1', tenantId: 'tenant1', role: 'admin', token: 'mocked.token' },
            } as RequestContext,
            version: 'v1',
        };

        await expect(createTodoItem(req)).rejects.toThrow('Tenant mismatch');
        expect(createTodoItemService).toHaveBeenCalledWith(
            { slug: 'new-todo', title: 'New Todo', tenantId: 'tenant1' },
            req.context.tenant,
            'v1'
        );
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Tenant mismatch',
            tenantId: 'tenant1',
            version: 'v1',
        }));
    });

    test('[test 8] handles duplicate slug error from createTodoItemService', async () => {
        const error = new Error('Duplicate entry');
        (createTodoItemService as jest.Mock).mockRejectedValue(error);

        const req = {
            body: { slug: 'widget-123', title: 'Widget' } as Omit<TodoItemData, 'tenantId'>,
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'admin1', tenantId: 'tenant1', role: 'admin', token: 'mocked.token' },
            } as RequestContext,
            version: 'v1',
        };

        await expect(createTodoItem(req)).rejects.toThrow('Duplicate entry');
        expect(createTodoItemService).toHaveBeenCalledWith(
            { slug: 'widget-123', title: 'Widget', tenantId: 'tenant1' },
            req.context.tenant,
            'v1'
        );
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Duplicate entry',
            tenantId: 'tenant1',
            version: 'v1',
        }));
    });

    test('[test 9] handles unexpected error from createTodoItemService', async () => {
        const error = new Error('Unexpected database error');
        (createTodoItemService as jest.Mock).mockRejectedValue(error);

        const req = {
            body: { slug: 'new-todo', title: 'New Todo' } as Omit<TodoItemData, 'tenantId'>,
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'admin1', tenantId: 'tenant1', role: 'admin', token: 'mocked.token' },
            } as RequestContext,
            version: 'v1',
        };

        await expect(createTodoItem(req)).rejects.toThrow('Unexpected database error');
        expect(createTodoItemService).toHaveBeenCalledWith(
            { slug: 'new-todo', title: 'New Todo', tenantId: 'tenant1' },
            req.context.tenant,
            'v1'
        );
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Unexpected database error',
            tenantId: 'tenant1',
            version: 'v1',
        }));
    });

    test('[test 10] handles non-Error object thrown from createTodoItemService', async () => {
        const error = 'Non-Error object error';
        (createTodoItemService as jest.Mock).mockRejectedValue(error);

        const req = {
            body: { slug: 'new-todo', title: 'New Todo' } as Omit<TodoItemData, 'tenantId'>,
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'admin1', tenantId: 'tenant1', role: 'admin', token: 'mocked.token' },
            } as RequestContext,
            version: 'v1',
        };

        await expect(createTodoItem(req)).rejects.toThrow('Unknown error');
        expect(createTodoItemService).toHaveBeenCalledWith(
            { slug: 'new-todo', title: 'New Todo', tenantId: 'tenant1' },
            req.context.tenant,
            'v1'
        );
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Unknown error',
            tenantId: 'tenant1',
            version: 'v1',
        }));
    });
});