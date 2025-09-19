// apps/cxsun/code/auth/auth.provider.ts

import type { Application } from "@codexsun/cortex/core/application";
import { AuthService } from "./auth.service";
import { registerAuthRoutes } from "./auth.routes";
import {AuthRepository} from "@codexsun/cxsun/code/auth/auth.repos";

export class AuthProvider {
    name = "AuthProvider";

    async register(app: Application) {
        app.logger.info(`[${this.name}] Registering services.`);

        // ✅ Register AuthRepository with real Database
        app.container.register("AuthRepository", {
            useFactory: (c) => new AuthRepository(c.resolve("Database")),
        });

        // ✅ Register AuthService with repo
        app.container.register("AuthService", {
            useFactory: (c) => new AuthService(c.resolve("AuthRepository")),
        });

        // ✅ Register routes
        registerAuthRoutes(app);

        // 🔎 Extra log for visibility
        app.logger.info(`[${this.name}] Routes registered: POST /login, POST /logout`);

        // ✅ Track provider
        app.registerProvider(this.name);
        app.logger.info(`[${this.name}] Auth module registration complete`);
    }

    async boot(app: Application) {
        app.logger.info(`[${this.name}] Boot complete`);
    }
}

export default AuthProvider;

