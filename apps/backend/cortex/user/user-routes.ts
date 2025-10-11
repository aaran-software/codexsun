// File: user-routes.ts
// Location: src/user-routes.ts
// Description: User management routes for ERP system (GET /api/users, POST /api/users, GET /api/users/:id, PUT /api/users/:id, DELETE /api/users/:id).

import { createHttpRouter } from "../routes/chttpx";
import { RequestContext } from "../routes/middleware";
import { UserController } from "./user-controller";

export function createUserRouter() {
    const { routeRequest, Route } = createHttpRouter();

    Route("GET", "/api/users", async (ctx: RequestContext) => UserController.GetUsers(ctx));
    Route("POST", "/api/users", async (ctx: RequestContext) => UserController.CreateUser(ctx));
    Route("GET", "/api/users/:id", async (ctx: RequestContext) => UserController.GetUserById(ctx));
    Route("PUT", "/api/users/:id", async (ctx: RequestContext) => UserController.UpdateUser(ctx));
    Route("DELETE", "/api/users/:id", async (ctx: RequestContext) => UserController.DeleteUser(ctx));

    return { routeRequest, Route };
}