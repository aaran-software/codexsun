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
