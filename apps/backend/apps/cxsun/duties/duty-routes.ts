// File: cortex/tasks/tasks-routes.ts
// Description: Duty management routes for service center in ERP system
import { createHttpRouter } from '../routes/chttpx';
import { RequestContext } from '../routes/middleware';
import { DutyController } from './tasks-controller';

export function createDutysRouter() {
    const { routeRequest, Route } = createHttpRouter();

    Route("GET", "/api/tasks", async (ctx: RequestContext) => DutyController.GetDutys(ctx));
    Route("POST", "/api/tasks", async (ctx: RequestContext) => DutyController.CreateDuty(ctx));
    Route("GET", "/api/tasks/:id", async (ctx: RequestContext) => DutyController.GetDutyById(ctx));
    Route("PUT", "/api/tasks/:id", async (ctx: RequestContext) => DutyController.UpdateDuty(ctx));
    Route("DELETE", "/api/tasks/:id", async (ctx: RequestContext) => DutyController.DeleteDuty(ctx));
    Route("POST", "/api/tasks/order", async (ctx: RequestContext) => DutyController.UpdateDutyOrder(ctx));
    Route("GET", "/api/tasks/performance", async (ctx: RequestContext) => DutyController.GetDutyPerformance(ctx));
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
            const tasks = await CustomerService.getDutysByCustomer(tenantId, customerId);
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