// File: todos-routes.ts
// Location: src/user-todos.ts

import { createHttpRouter } from "../routes/chttpx";
import { RequestContext } from "../routes/middleware";
import { TodosController as ctr } from "./todos-controller";

export function createTodosRouter() {
    const { routeRequest, Route } = createHttpRouter();

    Route("GET", "/api/todos", async (ctx: RequestContext) => ctr.GetAll(ctx));
    // Route("POST", "/api/users", async (ctx: RequestContext) => ctr.Create(ctx));
    // Route("GET", "/api/users/:id", async (ctx: RequestContext) => ctr.GetById(ctx));
    // Route("PUT", "/api/users/:id", async (ctx: RequestContext) => ctr.Update(ctx));
    // Route("DELETE", "/api/users/:id", async (ctx: RequestContext) => ctr.DeleteById(ctx));

    return { routeRequest, Route };
}