// File: app.ts
// Location: src/app.ts
// Description: Dependency container. Instantiates routers (auth, user, todos), the main router, and initializes the database.

import { getSettings } from "./config/get-settings";
import { createRouter } from "./routes/router";
import { createWebRouter } from "./routes/sys-router";
import { createUserRouter } from "./user/user-routes";
import { createAuthRouter } from "./core/auth/auth-routes";
import { createTodosRouter } from "./todos/todos-routes";
import { Logger } from "./logger/logger";
import { Connection } from "./db/connection";
import { RequestContext } from "./routes/middleware";
import {createContactsRouter} from "../apps/cxsun/contacts/contact-routes";

interface Dependencies {
    settings: ReturnType<typeof getSettings>;
    router: ReturnType<typeof createRouter>;
    WebRouter: ReturnType<typeof createWebRouter>;
    userRouter: ReturnType<typeof createUserRouter>;
    authRouter: ReturnType<typeof createAuthRouter>;
    todosRouter: ReturnType<typeof createTodosRouter>;
    contactRouter: ReturnType<typeof createContactsRouter>;
}

export class App {
    private dependencies: Dependencies;

    constructor() {
        this.dependencies = this.initializeDependencies();
    }

    private initializeDependencies(): Dependencies {
        const settings = getSettings();
        const WebRouter = createWebRouter();
        const authRouter = createAuthRouter();
        const userRouter = createUserRouter();
        const todosRouter = createTodosRouter();
        const contactRouter = createContactsRouter();
        const router = createRouter([WebRouter,authRouter, userRouter, todosRouter,contactRouter]);
        return { settings, router,WebRouter, userRouter, authRouter, todosRouter,contactRouter };
    }

    async initializeDatabase(): Promise<void> {
        const logger = new Logger();
        const settings = this.dependencies.settings;
        logger.info("Initializing database connection...");
        const dbConfig = {
            host: settings.DB_HOST,
            port: settings.DB_PORT,
            user: settings.DB_USER,
            password: settings.DB_PASS,
            database: settings.TENANCY ? settings.MASTER_DB : settings.DB_NAME,
            ssl: settings.DB_SSL,
            driver: settings.DB_DRIVER,
            connectionLimit: process.env.NODE_ENV === "production" ? 50 : 10,
            acquireTimeout: 30000,
            idleTimeout: 60000,
        };
        await Connection.initialize(dbConfig);
        logger.info("Database connection initialized.");
    }

    getDependencies(): Dependencies {
        return this.dependencies;
    }
}