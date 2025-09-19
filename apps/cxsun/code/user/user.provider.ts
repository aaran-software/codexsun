// apps/cxsun/code/user/user.provider.ts

import type { Application } from "@codexsun/cortex/core/application";
import { UserRepository } from "./user.repos";
import { UserService } from "./user.service";
import { registerUserRoutes } from "./user.routes";

export class UserProvider {
    name = "UserProvider";

    async register(app: Application) {
        app.logger.info(`[${this.name}] Registering services.`);

        // ✅ Register repo with real Database
        app.container.register("UserRepository", {
            useFactory: (c) => new UserRepository(c.resolve("Database")),
        });

        // ✅ Register service with repo instance
        app.container.register("UserService", {
            useFactory: (c) => new UserService(c.resolve("UserRepository")),
        });

        // ✅ Register routes
        registerUserRoutes(app);

        // ✅ Track provider
        app.registerProvider(this.name);
        app.logger.info(`[${this.name}] User module registration complete`);
    }

    async boot(app: Application) {
        app.logger.info(`[${this.name}] Boot complete`);
    }
}

export default UserProvider;
