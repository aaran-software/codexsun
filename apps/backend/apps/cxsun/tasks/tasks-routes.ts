// File: cortex/tasks/tasks-routes.ts
// Description: Task management routes for service center in ERP system
import { createHttpRouter } from '../routes/chttpx';
import { RequestContext } from '../routes/middleware';
import { TaskController } from './tasks-controller';

export function createTasksRouter() {
    const { routeRequest, Route } = createHttpRouter();

    Route("GET", "/api/tasks", async (ctx: RequestContext) => TaskController.GetTasks(ctx));
    Route("POST", "/api/tasks", async (ctx: RequestContext) => TaskController.CreateTask(ctx));
    Route("GET", "/api/tasks/:id", async (ctx: RequestContext) => TaskController.GetTaskById(ctx));
    Route("PUT", "/api/tasks/:id", async (ctx: RequestContext) => TaskController.UpdateTask(ctx));
    Route("DELETE", "/api/tasks/:id", async (ctx: RequestContext) => TaskController.DeleteTask(ctx));
    Route("POST", "/api/tasks/order", async (ctx: RequestContext) => TaskController.UpdateTaskOrder(ctx));
    Route("GET", "/api/tasks/performance", async (ctx: RequestContext) => TaskController.GetTaskPerformance(ctx));
    Route("GET", "/api/tasks/customer/:customerId", async (ctx: RequestContext) => {
        const tenantId = ctx.tenantId;
        if (!ctx.params || !ctx.params.customerId) {
            return {
                status: 400,
                body: { error: 'Missing or invalid customer ID' }
            };
        }
        const customerId = parseInt(ctx.params.customerId);
        if (isNaN(customerId)) {
            return {
                status: 400,
                body: { error: 'Invalid customer ID' }
            };
        }
        try {
            const tasks = await CustomerService.getTasksByCustomer(tenantId, customerId);
            return {
                status: 200,
                body: tasks
            };
        } catch (error) {
            return {
                status: 404,
                body: { error: (error as Error).message }
            };
        }
    });

    return { routeRequest, Route };
}