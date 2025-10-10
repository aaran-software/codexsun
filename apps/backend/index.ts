// File: index.ts
// Location: src/index.ts
// Description: Entry point. Sets up the HTTP server and uses Middleware to process requests before passing to the main router.

import { createServer, Server, IncomingMessage, ServerResponse } from "node:http";
import { applyCorsMiddleware } from "./cortex/routes/chttpx";
import { App } from "./cortex/app";
import { Logger } from "./cortex/logger/logger";
import { Middleware } from "./cortex/routes/middleware";

export async function startServer(): Promise<void> {
    const app = new App();
    await app.initializeDatabase();
    const { settings, router } = app.getDependencies();
    const logger = new Logger();
    const middleware = new Middleware();

    const server: Server = createServer((req: IncomingMessage, res: ServerResponse) => {
        applyCorsMiddleware(req, res, () => {
            middleware.processRequest(req, res, async (ctx) => {
                return await router.routeRequest(ctx);
            });
        });
    });

    try {
        server.listen(settings.APP_PORT, settings.APP_HOST, () => {
            logger.info(`Server running at http://${settings.APP_HOST}:${settings.APP_PORT}`, {
                host: settings.APP_HOST,
                port: settings.APP_PORT,
            });
        });
    } catch (err) {
        logger.error("Failed to start server", {
            error: err instanceof Error ? err.message : String(err),
        });
        process.exit(1);
    }

    setupShutdownHandlers(server, logger);
}

function setupShutdownHandlers(server: Server, logger: Logger): void {
    const shutdown = async () => {
        try {
            logger.info("Received shutdown signal. Closing server...");
            await new Promise<void>((resolve, reject) => {
                server.close((err) => {
                    if (err) {
                        logger.error("Error during server shutdown", { error: err.message });
                        reject(err);
                        return;
                    }
                    logger.info("Server closed successfully");
                    resolve();
                });
            });
            process.exit(0);
        } catch (err) {
            logger.error("Error during shutdown process", {
                error: err instanceof Error ? err.message : String(err),
            });
            process.exit(1);
        }
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    process.on("uncaughtException", (err) => {
        logger.error("Uncaught exception", { error: err.message, stack: err.stack });
    });
    process.on("unhandledRejection", (reason, promise) => {
        logger.error("Unhandled promise rejection", {
            error: String(reason),
            promise: String(promise),
        });
    });
}

startServer().catch((err: Error) => {
    const logger = new Logger();
    logger.error("Bootstrap failed", { error: err.message });
    process.exit(1);
});