// apps/cxsun/code/session/session.provider.ts

import type { Application } from "@codexsun/cortex/core/application";
import { SessionRepository } from "./session.repos";
import { SessionService } from "./session.service";

export class SessionProvider {
    name = "SessionProvider";

    async register(app: Application) {
        app.logger.info(`[${this.name}] Registering services.`);

        // Register SessionRepository with Database
        app.container.register("SessionRepository", {
            useFactory: (c) => new SessionRepository(c.resolve("Database")),
        });

        // Register SessionService with repo
        app.container.register("SessionService", {
            useFactory: (c) => new SessionService(c.resolve("SessionRepository")),
        });

        // Track provider
        app.registerProvider(this.name);
        app.logger.info(`[${this.name}] Session module registration complete`);
    }

    async boot(app: Application) {
        app.logger.info(`[${this.name}] Boot complete`);
    }
}

export default SessionProvider;