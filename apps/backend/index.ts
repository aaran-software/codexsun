import { createServer, Server, IncomingMessage, ServerResponse } from "node:http";
import cors from "cors";
import { App } from "./cortex/app";
import { Logger } from "./cortex/logger/logger";

export async function server(): Promise<void> {
    // Initialize DI container
    const app = new App();
    const { settings, router } = app.getDependencies();
    const logger = new Logger();

    // CORS middleware configuration
    const corsMiddleware = cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        maxAge: 86400, // Cache preflight response for 24 hours
    });

    // Create server instance
    const server: Server = createServer((req: IncomingMessage, res: ServerResponse) => {
        // Apply CORS middleware
        corsMiddleware(req, res, () => {
            try {
                router.routeRequest(req, res).catch((err: Error) => {
                    logger.error("Error handling request", {
                        error: err.message,
                        url: req.url,
                        method: req.method,
                    });
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Internal Server Error");
                });
            } catch (err) {
                logger.error("Unexpected error in request handler", {
                    error: err instanceof Error ? err.message : String(err),
                    url: req.url,
                    method: req.method,
                });
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Internal Server Error");
            }
        });
    });

    // Start server
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

    // Graceful shutdown handling
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

    // Listen for termination signals with error handling
    process.on("SIGINT", async () => {
        try {
            await shutdown();
        } catch (err) {
            logger.error("Error handling SIGINT", {
                error: err instanceof Error ? err.message : String(err),
            });
            process.exit(1);
        }
    });

    process.on("SIGTERM", async () => {
        try {
            await shutdown();
        } catch (err) {
            logger.error("Error handling SIGTERM", {
                error: err instanceof Error ? err.message : String(err),
            });
            process.exit(1);
        }
    });

    // Handle uncaught exceptions to prevent server crash
    process.on("uncaughtException", (err) => {
        logger.error("Uncaught exception", { error: err.message, stack: err.stack });
    });

    // Handle unhandled promise rejections to prevent server crash
    process.on("unhandledRejection", (reason, promise) => {
        logger.error("Unhandled promise rejection", {
            error: String(reason),
            promise: String(promise),
        });
    });
}

// Run the bootstrap function
server().catch((err: Error) => {
    const logger = new Logger();
    logger.error("Bootstrap failed", { error: err.message });
    process.exit(1);
});