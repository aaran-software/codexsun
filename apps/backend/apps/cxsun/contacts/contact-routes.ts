// File: apps/cxsun/contacts/contact-routes.ts

import { createHttpRouter } from '../../../cortex/routes/chttpx';
import { RequestContext } from '../../../cortex/routes/middleware';
import { ContactController } from './contact-controller';

export function createContactsRouter() {
    const { routeRequest, Route } = createHttpRouter();

    Route("GET", "/api/contacts", async (ctx: RequestContext) => ContactController.GetAll(ctx));
    Route("POST", "/api/contacts", async (ctx: RequestContext) => ContactController.Create(ctx));
    Route("GET", "/api/contacts/:id", async (ctx: RequestContext) => ContactController.GetById(ctx));
    Route("PUT", "/api/contacts/:id", async (ctx: RequestContext) => ContactController.Update(ctx));
    Route("DELETE", "/api/contacts/:id", async (ctx: RequestContext) => ContactController.Delete(ctx));

    return { routeRequest, Route };
}