// File: apps/cxsun/contacts/contact-controller.ts

import { RequestContext } from '../../../cortex/routes/middleware';
import { ContactService } from './contact-service';

export class ContactController {

    static async GetAll(ctx: RequestContext) {
        const tenantId = ctx.tenantId;
        const contact = await ContactService.getAll(tenantId);
        return {
            status: 200,
            body: contact
        };
    }

    static async GetById(ctx: RequestContext) {
        const tenantId = ctx.tenantId;
        if (!ctx.params || !ctx.params.id) {
            return {
                status: 400,
                body: { error: 'Missing or invalid customer ID' }
            };
        }

        const id = parseInt(ctx.params.id);
        if (isNaN(id)) {
            return {
                status: 400,
                body: { error: 'Invalid customer ID' }
            };
        }
        try {
            const customer = await ContactService.getById(tenantId, id);
            return {
                status: 200,
                body: customer
            };
        } catch (error) {
            return {
                status: 404,
                body: { error: (error as Error).message }
            };
        }
    }

    static async Create(ctx: RequestContext) {
        const tenantId = ctx.tenantId;
        try {
            const customer = await ContactService.create(tenantId, ctx.body);
            return {
                status: 201,
                body: customer
            };
        } catch (error) {
            return {
                status: 400,
                body: { error: (error as Error).message }
            };
        }
    }

    static async Update(ctx: RequestContext) {
        const tenantId = ctx.tenantId;
        if (!ctx.params || !ctx.params.id) {
            return {
                status: 400,
                body: { error: 'Missing or invalid customer ID' }
            };
        }

        const id = parseInt(ctx.params.id);
        if (isNaN(id)) {
            return {
                status: 400,
                body: { error: 'Invalid customer ID' }
            };
        }
        try {
            const customer = await ContactService.update(tenantId, id, ctx.body);
            return {
                status: 200,
                body: customer
            };
        } catch (error) {
            const message = (error as Error).message;
            return {
                status: message === 'No updates provided' ? 400 : 404,
                body: { error: message }
            };
        }
    }

    static async Delete(ctx: RequestContext) {
        const tenantId = ctx.tenantId;
        if (!ctx.params || !ctx.params.id) {
            return {
                status: 400,
                body: { error: 'Missing or invalid customer ID' }
            };
        }

        const id = parseInt(ctx.params.id);
        if (isNaN(id)) {
            return {
                status: 400,
                body: { error: 'Invalid customer ID' }
            };
        }
        try {
            await ContactService.delete(tenantId, id);
            return {
                status: 200,
                body: { message: `Contact with ID ${id} deleted successfully` }
            };
        } catch (error) {
            return {
                status: 400,
                body: { error: (error as Error).message }
            };
        }
    }
}