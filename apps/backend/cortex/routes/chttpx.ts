// File: chttpx.ts
// Location: src/chttpx.ts
// Description: Core router logic. Defines createHttpRouter to register and match routes, applies CORS, using RequestContext.

import cors from "cors";
import { IncomingMessage, ServerResponse } from "node:http";
import { Logger } from "../logger/logger";
import { RequestContext } from "./middleware";

interface Route {
    method: string;
    path: string;
    handler: (ctx: RequestContext) => Promise<any>;
}

export function createHttpRouter() {
    const routes: Route[] = [];
    const logger = new Logger();

    function addRoute(method: string, path: string, handler: Route["handler"]) {
        routes.push({ method, path, handler });
    }

    async function routeRequest(ctx: RequestContext): Promise<any> {
        const route = findMatchingRoute(routes, ctx);
        if (route) {
            return await route.handler(ctx);
        }
        throw new Error("Route not found");
    }

    return { routeRequest, Route: addRoute };
}

function findMatchingRoute(routes: Route[], ctx: RequestContext): Route | undefined {
    return routes.find((r) => {
        const routeSegments = r.path.split("/");
        const pathSegments = ctx.pathname.split("/");
        if (r.method !== ctx.method || routeSegments.length !== pathSegments.length) {
            return false;
        }
        for (let i = 0; i < routeSegments.length; i++) {
            if (routeSegments[i].startsWith(":")) continue;
            if (routeSegments[i] !== pathSegments[i]) return false;
        }
        return true;
    });
}

export function applyCorsMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void): void {
    const corsMiddleware = cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "x-tenant-id", "x-user-id"],
        credentials: true,
        maxAge: 86400,
    });
    corsMiddleware(req, res, next);
}