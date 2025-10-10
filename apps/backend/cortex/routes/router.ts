// File: router.ts
// Location: src/router.ts
// Description: Main router. Aggregates sub-routers and delegates requests to them, falling back to 404 if no route matches.

import { Logger } from "../logger/logger";
import { RequestContext } from "./middleware";

interface SubRouter {
    routeRequest: (ctx: RequestContext) => Promise<any>;
    Route: (method: string, path: string, handler: (ctx: RequestContext) => Promise<any>) => void;
}

export function createRouter(routers: SubRouter[]) {
    const logger = new Logger();

    async function routeRequest(ctx: RequestContext): Promise<any> {
        for (const router of routers) {
            try {
                return await router.routeRequest(ctx);
            } catch (err) {
                if (err instanceof Error && err.message !== "Route not found") {
                    throw err;
                }
            }
        }
        logger.warn("No matching route found in any router", { method: ctx.method, url: ctx.url });
        throw new Error("Route not found");
    }

    function Route(method: string, path: string, handler: (ctx: RequestContext) => Promise<any>) {
        // Local routes can be added here if needed
    }

    return { routeRequest, Route };
}