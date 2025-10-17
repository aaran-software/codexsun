// File: cortex/tasks/tasks-controller.ts
// Description: Controller for handling task HTTP requests in service center
import { RequestContext } from '../routes/middleware';
import { DutyService } from './tasks-service';
import { Duty } from './tasks-model';

export class DutyController {
    static async GetDutys(ctx: RequestContext) {
        const tenantId = ctx.tenantId;
        const userId = ctx.userId;
        const tasks = await DutyService.getDutys(tenantId, userId);
        return {
            status: 200,
            body: tasks
        };
    }

    static async GetDutyById(ctx: RequestContext) {
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
            const task = await DutyService.getDutyById(tenantId, id, userId);
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

    static async CreateDuty(ctx: RequestContext) {
        const tenantId = ctx.tenantId;
        const userId = ctx.userId;
        try {
            const task = await DutyService.createDuty(tenantId, {
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

    static async UpdateDuty(ctx: RequestContext) {
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
            const task = await DutyService.updateDuty(tenantId, id, ctx.body, userId);
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

    static async DeleteDuty(ctx: RequestContext) {
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
            await DutyService.deleteDuty(tenantId, id, userId);
            return {
                status: 200,
                body: { message: `Duty with ID ${id} deleted successfully` }
            };
        } catch (error) {
            return {
                status: 404,
                body: { error: (error as Error).message }
            };
        }
    }

    static async UpdateDutyOrder(ctx: RequestContext) {
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
            await DutyService.updateDutyOrder(tenantId, orderedIds, userId);
            return {
                status: 200,
                body: { message: 'Duty order updated successfully' }
            };
        } catch (error) {
            return {
                status: 400,
                body: { error: (error as Error).message }
            };
        }
    }

    static async GetDutyPerformance(ctx: RequestContext) {
        const tenantId = ctx.tenantId;
        const userId = ctx.userId;
        const performance = await DutyService.getDutyPerformance(tenantId, userId);
        return {
            status: 200,
            body: performance
        };
    }
}