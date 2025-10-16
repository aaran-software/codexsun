// File: todos-routes.ts

import {createHttpRouter} from "../routes/chttpx";
import {RequestContext} from "../routes/middleware";
import {TodosController as ctr} from "./todos-controller";

export function createTodosRouter() {
    const {routeRequest, Route} = createHttpRouter();

    Route("GET", "/api/todos", async (ctx: RequestContext) => ctr.GetAll(ctx));
    Route("POST", "/api/todos", async (ctx: RequestContext) => ctr.Create(ctx));
    Route("GET", "/api/todos/:id", async (ctx: RequestContext) => ctr.GetById(ctx));
    Route("PUT", "/api/todos/:id", async (ctx: RequestContext) => ctr.Update(ctx));
    Route("DELETE", "/api/todos/:id", async (ctx: RequestContext) => ctr.DeleteById(ctx));

    return {routeRequest, Route};
}