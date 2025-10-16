// File: cortex/todos/todos-controller.ts
// Description: Controller for handling todo HTTP requests
import { RequestContext } from '../routes/middleware';
import { TodoService } from './todos-service';
import { Todo } from './todos-model';

export class TodoController {
    static async GetTodos(ctx: RequestContext) {
        const tenantId = ctx.tenantId;
        const userId = ctx.userId;
        const todos = await TodoService.getTodos(tenantId, userId);
        return {
            status: 200,
            body: todos
        };
    }

    static async GetTodoById(ctx: RequestContext) {
        const tenantId = ctx.tenantId;
        const userId = ctx.userId;

        if (!ctx.params || !ctx.params.id) {
            return {
                status: 400,
                body: { error: 'Missing or invalid todo ID' }
            };
        }

        const id = parseInt(ctx.params.id);
        if (isNaN(id)) {
            return {
                status: 400,
                body: { error: 'Invalid todo ID' }
            };
        }
        try {
            const todo = await TodoService.getTodoById(tenantId, id, userId);
            return {
                status: 200,
                body: todo
            };
        } catch (error) {
            return {
                status: 404,
                body: { error: (error as Error).message }
            };
        }
    }

    static async CreateTodo(ctx: RequestContext) {
        const tenantId = ctx.tenantId;
        const userId = ctx.userId;
        try {
            const todo = await TodoService.createTodo(tenantId, {
                ...ctx.body,
                user_id: userId
            });
            return {
                status: 201,
                body: todo
            };
        } catch (error) {
            return {
                status: 400,
                body: { error: (error as Error).message }
            };
        }
    }

    static async UpdateTodo(ctx: RequestContext) {
        const tenantId = ctx.tenantId;
        const userId = ctx.userId;

        if (!ctx.params || !ctx.params.id) {
            return {
                status: 400,
                body: { error: 'Missing or invalid todo ID' }
            };
        }

        const id = parseInt(ctx.params.id);
        if (isNaN(id)) {
            return {
                status: 400,
                body: { error: 'Invalid todo ID' }
            };
        }
        try {
            const todo = await TodoService.updateTodo(tenantId, id, ctx.body, userId);
            return {
                status: 200,
                body: todo
            };
        } catch (error) {
            const message = (error as Error).message;
            return {
                status: message === 'No updates provided' ? 400 : 404,
                body: { error: message }
            };
        }
    }

    static async DeleteTodo(ctx: RequestContext) {
        const tenantId = ctx.tenantId;
        const userId = ctx.userId;

        if (!ctx.params || !ctx.params.id) {
            return {
                status: 400,
                body: { error: 'Missing or invalid todo ID' }
            };
        }

        const id = parseInt(ctx.params.id);
        if (isNaN(id)) {
            return {
                status: 400,
                body: { error: 'Invalid todo ID' }
            };
        }
        try {
            await TodoService.deleteTodo(tenantId, id, userId);
            return {
                status: 200,
                body: { message: `Todo with ID ${id} deleted successfully` }
            };
        } catch (error) {
            return {
                status: 404,
                body: { error: (error as Error).message }
            };
        }
    }

    static async UpdateTodoOrder(ctx: RequestContext) {
        const tenantId = ctx.tenantId;
        const userId = ctx.userId;
        const { orderedIds } = ctx.body;

        if (!Array.isArray(orderedIds) || orderedIds.some(id => !Number.isInteger(id))) {
            return {
                status: 400,
                body: { error: 'Invalid or missing orderedIds' }
            };
        }

        try {
            await TodoService.updateTodoOrder(tenantId, orderedIds, userId);
            return {
                status: 200,
                body: { message: 'Todo order updated successfully' }
            };
        } catch (error) {
            return {
                status: 400,
                body: { error: (error as Error).message }
            };
        }
    }
}