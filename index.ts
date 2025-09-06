import "dotenv/config";
import path from "node:path";
import { createLogger } from "./cortex/log/logger";
import { bootAll } from "./cortex/http/serve_all";
import { RouteRegistery } from "./cortex/http/route_registery";
import { createSessionMiddleware } from "./cortex/http/middleware/session";
import { tenantMiddleware } from "./cortex/http/middleware/tenant";
import { dbContextMiddleware } from "./cortex/http/middleware/db_context";
import { registerAppsAndRoutes } from "./cortex/main";


const logger = createLogger({
    file: {
        path:
            process.env.LOG_FILE_PATH ||
            path.resolve(process.cwd(), "storage", "framework", "log.txt"),
        append: true,
        format: process.env.LOG_FILE_FORMAT === "json" ? "json" : "text",
    },
});


// Central route registry used by all providers
const registry = new RouteRegistery();


async function main() {
    try {
// Initialize DB and register ALL routes (built-in + dynamic apps)
        await registerAppsAndRoutes(registry);


// Boot servers
        await bootAll({
            providers: [() => registry.collect()],
            host: process.env.APP_HOST || process.env.HOST || "0.0.0.0",
            httpPort: parseInt(process.env.APP_PORT || process.env.PORT || "3000", 10),
            httpsPort: process.env.HTTPS_PORT
                ? parseInt(process.env.HTTPS_PORT, 10)
                : undefined,
            cors: true,
            logger,
            middlewares: [
                createSessionMiddleware({
                    signKey: process.env.APP_KEY,
                    ttlSeconds: 60 * 60 * 2,
                }),
                tenantMiddleware(),
                dbContextMiddleware(),
            ],
        });
    } catch (err: any) {
        logger.fatal("❌ Server startup failed", {
            error: err?.message || String(err),
        });
        process.exit(1);
    }
}


// Hardening
process.on("unhandledRejection", (err: any) =>
    logger.error("unhandledRejection", { error: (err as any)?.message || String(err) }),
);
process.on("uncaughtException", (err: any) =>
    logger.fatal("uncaughtException", { error: (err as any)?.message || String(err) }),
);


void main();