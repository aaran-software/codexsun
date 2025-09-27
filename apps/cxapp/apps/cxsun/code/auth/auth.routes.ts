// apps/cxsun/code/auth/auth.routes.ts

import type { Application } from "../../../../cortex/core/application";
import { AuthController } from "./auth.controller";

export function registerAuthRoutes(app: Application) {
    const controller = new AuthController(app);

    // Auth endpoints
    app.router.register("post", "/login", controller.login);
    app.router.register("post", "/logout", controller.logout);
}
