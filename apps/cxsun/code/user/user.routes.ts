// apps/cxsun/core/user/user.routes.ts

import type { Application } from "@codexsun/cortex/core/application";
import { UserController } from "./user.controller";

export function registerUserRoutes(app: Application) {
    const controller = new UserController(app);

    app.router.register("GET", "/users", controller.getAll);
    app.router.register("GET", "/users/:id", controller.getById);
    app.router.register("POST", "/users", controller.create);
    app.router.register("PUT", "/users/:id", controller.update);
    app.router.register("PATCH", "/users/:id", controller.patch);
    app.router.register("DELETE", "/users/:id", controller.delete);
}

// import type { Application } from "@codexsun/cortex/core/application";
// import { UserController } from "./user.controller";
// import { AuthMiddleware } from "../auth/auth.middleware";
//
// export function registerUserRoutes(app: Application) {
//     const controller = new UserController(app);
//     const auth = new AuthMiddleware();
//
//     // Protect all user routes
//     app.router.register("get", "/users", auth.basicAuth, controller.getAll);
//     app.router.register("get", "/users/:id", auth.basicAuth, controller.getById);
//     app.router.register("post", "/users", auth.basicAuth, controller.create);
//     app.router.register("put", "/users/:id", auth.basicAuth, controller.update);
//     app.router.register("patch", "/users/:id", auth.basicAuth, controller.patch);
//     app.router.register("delete", "/users/:id", auth.basicAuth, controller.delete);
// }
