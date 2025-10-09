import { IncomingMessage, ServerResponse } from "node:http";
import { createHttpRouter } from "./chttpx";
import { Logger } from "../logger/logger";

export function createRouter(routers: { routeRequest: (req: IncomingMessage, res: ServerResponse) => Promise<void>; Route: (method: string, path: string, handler: (req: IncomingMessage, res: ServerResponse) => Promise<void> | void) => void; }[]) {
    const { routeRequest: localRouteRequest, Route } = createHttpRouter();
    const logger = new Logger();

    async function routeRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
        let handled = false;

        // Try local routes first
        try {
            await localRouteRequest(req, res);
            handled = true;
            return;
        } catch (err) {
            // Continue to delegated routers if local route not found
        }

        // Try delegated routers
        for (const router of routers) {
            try {
                await router.routeRequest(req, res);
                handled = true;
                return;
            } catch (err) {
                // Continue to next router if this one doesn't handle the route
            }
        }

        // No route found in any router
        if (!handled) {
            logger.warn("No matching route found in any router", { method: req.method, url: req.url });
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("404 Not Found");
        }
    }

    // Example routes for ERP-like functionality
    Route("GET", "/", (req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "Server is running" }));
    });

    Route("GET", "/hz", (req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "healthy is running" }));
    });

    return { routeRequest, Route };
}
