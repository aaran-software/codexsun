// File: cortex/tasks/tasks-controller.ts
// Description: Controller for handling task HTTP requests in service center
import { RequestContext } from '../routes/middleware';
import { TaskService } from './tasks-service';
import { Task } from './tasks-model';

export class TaskController {
    static async GetTasks(ctx: RequestContext) {
        const tenantId = ctx.tenantId;
        const userId = ctx.userId;
        const tasks = await TaskService.getTasks(tenantId, userId);
        return {
            status: 200,
            body: tasks
        };
    }

    static async GetTaskById(ctx: RequestContext) {
        const tenantId = ctx.tenantId;
        const userId = ctx.userId;

        if (!ctx.params || !ctx.params.id) {
            return {
                status: 400,
                body: { error: 'Missing or invalid task ID' }
            };
        }

        const id = parseInt(ctx.params.id);
        if (isNaN(id)) {
            return {
                status: 400,
                body: { error: 'Invalid task ID' }
            };
        }
        try {
            const task = await TaskService.getTaskById(tenantId, id, userId);
            return {
                status: 200,
                body: task
            };
        } catch (error) {
            return {
                status: 404,
                body: { error: (error as Error).message }
            };
        }
    }

    static async CreateTask(ctx: RequestContext) {
        const tenantId = ctx.tenantId;
        const userId = ctx.userId;
        try {
            const task = await TaskService.createTask(tenantId, {
                ...ctx.body,
                created_by: userId
            });
            return {
                status: 201,
                body: task
            };
        } catch (error) {
            return {
                status: 400,
                body: { error: (error as Error).message }
            };
        }
    }

    static async UpdateTask(ctx: RequestContext) {
        const tenantId = ctx.tenantId;
        const userId = ctx.userId;

        if (!ctx.params || !ctx.params.id) {
            return {
                status: 400,
                body: { error: 'Missing or invalid task ID' }
            };
        }

        const id = parseInt(ctx.params.id);
        if (isNaN(id)) {
            return {
                status: 400,
                body: { error: 'Invalid task ID' }
            };
        }
        try {
            const task = await TaskService.updateTask(tenantId, id, ctx.body, userId);
            return {
                status: 200,
                body: task
            };
        } catch (error) {
            const message = (error as Error).message;
            return {
                status: message === 'No updates provided' ? 400 : 404,
                body: { error: message }
            };
        }
    }

    static async DeleteTask(ctx: RequestContext) {
        const tenantId = ctx.tenantId;
        const userId = ctx.userId;

        if (!ctx.params || !ctx.params.id) {
            return {
                status: 400,
                body: { error: 'Missing or invalid task ID' }
            };
        }

        const id = parseInt(ctx.params.id);
        if (isNaN(id)) {
            return {
                status: 400,
                body: { error: 'Invalid task ID' }
            };
        }
        try {
            await TaskService.deleteTask(tenantId, id, userId);
            return {
                status: 200,
                body: { message: `Task with ID ${id} deleted successfully` }
            };
        } catch (error) {
            return {
                status: 404,
                body: { error: (error as Error).message }
            };
        }
    }

    static async UpdateTaskOrder(ctx: RequestContext) {
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
            await TaskService.updateTaskOrder(tenantId, orderedIds, userId);
            return {
                status: 200,
                body: { message: 'Task order updated successfully' }
            };
        } catch (error) {
            return {
                status: 400,
                body: { error: (error as Error).message }
            };
        }
    }

    static async GetTaskPerformance(ctx: RequestContext) {
        const tenantId = ctx.tenantId;
        const userId = ctx.userId;
        const performance = await TaskService.getTaskPerformance(tenantId, userId);
        return {
            status: 200,
            body: performance
        };
    }
}