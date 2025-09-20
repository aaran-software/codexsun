// cortex/core/application.ts

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------
import { Container } from "./container";
import { Config } from "./config";
import { ModuleManager } from "./modules";
import { Logger } from "./logger";
import { EventBus } from "./events";
import { PluginManager } from "./plugins";
import { Lifecycle } from "./lifecycle";
import { CHttp, CRequest, CResponse } from "../http/chttpx"; // ✅ use centralized HTTP wrapper
import { registerTemplateRoutes } from "@codexsun/cortex/templates";
import { registerRoutesExplorer } from "@codexsun/cortex/templates/routes-explorer";
import { registerSystemEndpoints } from "@codexsun/cortex/templates/system";

// ✅ DB + migration helpers
import * as Db from "../db/db";
import * as Migrate from "../db/migrate";
import {JwtAuthMiddleware} from "@codexsun/cortex/auth/auth.middleware";
import {ErrorMiddleware} from "@codexsun/cortex/auth/error.middleware";
import {LoggerMiddleware} from "@codexsun/cortex/auth/logger.middleware";

// -----------------------------------------------------------------------------
// Database type
// -----------------------------------------------------------------------------
export interface Database {
    query<T = any>(text: string, params?: any[]): Promise<Db.DbQueryResult<T>>;
    withTransaction<T>(
        fn: (
            q: <R = any>(
                text: string,
                params?: any[]
            ) => Promise<Db.DbQueryResult<R>>
        ) => Promise<T>
    ): Promise<T>;
    healthCheck(): Promise<void>;
}

// -----------------------------------------------------------------------------
// Application Class
// -----------------------------------------------------------------------------
export class Application {
    public readonly container: Container;
    public readonly config: Config;
    public readonly modules: ModuleManager;
    public readonly logger: Logger;
    public readonly events: EventBus;
    public readonly plugins: PluginManager;
    public readonly lifecycle: Lifecycle;

    public readonly http: CHttp; // ✅ wrap Express + Router
    public readonly router = CHttp.router; // ✅ custom router

    public name: string | undefined;
    public version: string | undefined;
    private started = false;

    constructor(opts?: { name?: string; version?: string }) {
        this.name = opts?.name ?? "codexsun";
        this.version = opts?.version ?? "1.0.0";

        this.container = new Container();
        this.config = new Config();
        this.modules = new ModuleManager(this);
        this.logger = new Logger();
        this.events = new EventBus();
        this.plugins = new PluginManager(this);
        this.lifecycle = new Lifecycle();

        this.http = new CHttp(); // ✅ boot express app with core router
    }

    // ---------------------------------------------------------------------------
    // Database connection + migrations
    // ---------------------------------------------------------------------------
    private async connectDatabase() {
        this.logger.info("Checking database connectivity...");

        const { init } = await import("../db/connection");
        await init();

        await Db.healthCheck();
        this.logger.info("Database connection OK.");

        const database: Database = {
            query: Db.query,
            withTransaction: Db.withTransaction,
            healthCheck: Db.healthCheck,
        };

        this.container.register("Database", { useValue: database });

        if (typeof (Migrate as any).migrate === "function") {
            this.logger.info("Running migrations...");
            await (Migrate as any).migrate();
            this.logger.info("Migrations complete.");
        }
    }

    private providers: string[] = []; // ✅ Track loaded providers

    // ---------------------------------------------------------------------------
    // Provider tracking
    // ---------------------------------------------------------------------------
    registerProvider(name: string) {
        if (!this.providers.includes(name)) {
            this.providers.push(name);
            this.logger.info(`[Application] Provider registered: ${name}`);
        }
    }

    getProviders() {
        return this.providers;
    }

    // ---------------------------------------------------------------------------
    // Init lifecycle
    // ---------------------------------------------------------------------------
    async init() {
        this.logger.info("Initializing application...");

        await this.config.load();
        await this.plugins.init();
        await this.connectDatabase();

        // ✅ global CORS middleware
        this.router.use((req: CRequest, res: CResponse, next) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader(
                "Access-Control-Allow-Methods",
                "GET,POST,PUT,DELETE,OPTIONS"
            );
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

            if (req.method === "OPTIONS") {
                res.writeHead(204);
                res.end();
                return;
            }
            next();
        });

        // // 📝 Logger middleware
        // const loggerMiddleware = new LoggerMiddleware();
        // this.router.use((req, res, next) => loggerMiddleware.handle(req, res, next));
        //
        // // 🔒 JWT auth
        // const jwtMiddleware = new JwtAuthMiddleware();
        // this.router.use((req, res, next) => jwtMiddleware.handle(req, res, next));
        //
        // // 🚨 Error handler wrapper
        // const errorMiddleware = new ErrorMiddleware();
        // this.router.use(async (req, res, next) => {
        //     try {
        //         await next();
        //     } catch (err) {
        //         errorMiddleware.handle(err, req, res, next);
        //     }
        // });

        // ✅ built-in routes
        registerTemplateRoutes(this);
        registerRoutesExplorer(this);
        registerSystemEndpoints(this);

        // -------------------------------------------------------------------------
        // NEW: Debug endpoints
        // -------------------------------------------------------------------------
        this.router.register("GET", "/routes", (_req, res) => {
            res.json(this.router.printRoutes());
        });

        this.router.register("GET", "/info", (_req, res) => {
            res.json({
                name: this.name,
                version: this.version,
                providers: this.getProviders(),
                routes: this.router.getRoutes().map((r) => ({
                    method: r.method,
                    path: r.path,
                })),
            });
        });

        await this.modules.init();
        await this.lifecycle.runInit(this);

        this.logger.info("Initialization complete.");
    }
    // ---------------------------------------------------------------------------
    // Start lifecycle
    // ---------------------------------------------------------------------------
    async start() {
        if (this.started) return;
        this.started = true;

        this.logger.info("Starting application...");
        this.router.printRoutes(); // ✅ log all routes at startup

        await this.lifecycle.runStart(this);
        this.logger.info("Application started successfully.");
    }

    // ---------------------------------------------------------------------------
    // Stop lifecycle
    // ---------------------------------------------------------------------------
    async stop() {
        this.logger.info("Stopping application...");
        await this.lifecycle.runStop(this);
        this.logger.info("Application stopped.");
    }

    // ---------------------------------------------------------------------------
    // Request handler
    // ---------------------------------------------------------------------------
    handle(req: CRequest, res: CResponse): boolean | Promise<boolean> {
        // ✅ attach scoped DI container to request
        (req as any).container = this.container.createScope();

        return this.router.handle(req, res);
    }

    // ---------------------------------------------------------------------------
    // Print summary
    // ---------------------------------------------------------------------------
    printSummary() {
        if (typeof this.container.list === "function") {
            const services = this.container.list();
            this.logger.info("[Application] Registered services:");
            services.forEach((s: any) => this.logger.info(`  - ${s}`));
        }

        if (typeof this.router.getRoutes === "function") {
            const routes = this.router.getRoutes();
            this.logger.info("[Application] Registered routes:");
            routes.forEach((r: { method: string; path: string }) =>
                this.logger.info(`  [${r.method}] ${r.path}`)
            );
        }
    }
}

// -----------------------------------------------------------------------------
// Export singleton
// -----------------------------------------------------------------------------
export const APP = new Application();
