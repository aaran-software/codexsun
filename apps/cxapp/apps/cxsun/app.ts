// apps/cxsun/app.ts

import type { Application } from "../../cortex/core/application";
import { AppLoader } from "../../cortex/core/app-loader";

// -----------------------------------------------------------------------------
// Define the CxSun module
// -----------------------------------------------------------------------------
export const CxSunModule = {
    name: "CxSun",
    version: "1.0.0",

    async init(app: Application) {
        app.logger.info("[CxSun] Module initializing...");

        // ✅ Example: register a greeting service
        app.container.register("greetingService", {
            useValue: { hello: () => "Hello from CxSun!" },
        });

        // -------------------------------------------------------------------------
        // Provider auto-loading
        // OLD: manual imports
        // NEW: scan apps/*/core/** for *.provider.ts and load automatically
        // -------------------------------------------------------------------------
        await AppLoader.loadProviders(app, `${__dirname}`);

        // ✅ Custom routes
        app.router.register("GET", "/cxsun", (_req, res) => {
            const service = app.container.resolve<any>("greetingService");
            res.json({ greeting: service.hello() });
        });

        app.router.register("GET", "/cxsun/hello", (_req, res) => {
            res.json({ message: "Hello from CxSun module!" });
        });

        // ✅ Example middleware
        app.router.use((req, _res, next) => {
            app.logger.info(`[CxSun] Request: ${req.method} ${req.url}`);
            next();
        });

        // ✅ Example event listener
        app.events.on("user:created", (payload) => {
            app.logger.info(`[CxSun] Event user:created →`, payload);
        });

        app.logger.info("[CxSun] Module initialized.");
    },

    async start(app: Application) {
        app.logger.info("[CxSun] Module started.");
    },

    async stop(app: Application) {
        app.logger.info("[CxSun] Module stopped.");
    },
};

export default CxSunModule;
