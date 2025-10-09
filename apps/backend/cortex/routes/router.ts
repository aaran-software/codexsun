import { IncomingMessage, ServerResponse } from "node:http";
import { createHttpRouter } from "./chttpx";

export function createRouter(routers: { routeRequest: (req: IncomingMessage, res: ServerResponse) => Promise<void>; addRoute: (method: string, path: string, handler: (req: IncomingMessage, res: ServerResponse) => Promise<void> | void) => void; }[]) {
    const { routeRequest: localRouteRequest, addRoute } = createHttpRouter();

    async function routeRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
        try {
            await localRouteRequest(req, res);
            return;
        } catch (err) {
            // Try delegated routers
            for (const router of routers) {
                try {
                    await router.routeRequest(req, res);
                    return;
                } catch (err) {
                    // Continue to next router if this one doesn't handle the route
                }
            }

            // No route found
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("404 Not Found");
        }
    }

    // Example routes for ERP-like functionality
    addRoute("GET", "/", (req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "Server is running" }));
    });

    addRoute("GET", "/hz", (req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "healthy is running" }));
    });

    return { routeRequest, addRoute };
}