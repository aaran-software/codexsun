// File: sys-routes.ts
// Location: src/routes/sys-routes.ts
// Description: System routes for task management and static assets in Cortex ERP Backend.

import { createHttpRouter } from "./chttpx";
import { Logger } from "../logger/logger";
import { RequestContext } from "./middleware";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Mock todos data for simulation
let todos: any[] = [];

export function createWebRouter() {
    const { routeRequest, Route } = createHttpRouter();
    const logger = new Logger();

    // Welcome route
    Route("GET", "/", async (ctx: RequestContext) => {
        logger.info("Served welcome route", { method: ctx.method, url: ctx.url, tenantId: ctx.tenantId });
        return { message: "Welcome to Cortex ERP Backend" };
    });

    // Health check route
    Route("GET", "/hz", async (ctx: RequestContext) => {
        logger.info("Served health check", { method: ctx.method, url: ctx.url, tenantId: ctx.tenantId });
        return { message: `Healthy ${new Date().toISOString()}` };
    });

    // Serve favicon.ico from public folder
    Route("GET", "/favicon.ico", async (ctx: RequestContext) => {
        try {
            const faviconPath = join(__dirname, "..", "public", "favicon.ico");
            const favicon = await readFile(faviconPath);
            logger.info("Served favicon.ico", { method: ctx.method, url: ctx.url, tenantId: ctx.tenantId });
            return {
                status: 200,
                headers: { "Content-Type": "image/x-icon" },
                body: favicon,
            };
        } catch (err) {
            logger.error("Error serving favicon.ico", {
                method: ctx.method,
                url: ctx.url,
                tenantId: ctx.tenantId,
                error: err instanceof Error ? err.message : String(err),
            });
            throw new Error("Favicon not found");
        }
    });

    // // Basic task management routes
    // Route("GET", "/todos", async (ctx: RequestContext) => {
    //     logger.info("Fetched todos", { method: ctx.method, url: ctx.url, tenantId: ctx.tenantId });
    //     return { todos };
    // });
    //
    // Route("POST", "/todos", async (ctx: RequestContext) => {
    //     try {
    //         const todo = ctx.body;
    //         if (!todo || typeof todo !== "object") {
    //             throw new Error("Invalid todo data");
    //         }
    //         const newTodo = { id: todos.length + 1, ...todo, createdAt: new Date().toISOString() };
    //         todos.push(newTodo);
    //         logger.info("Created todo", { method: ctx.method, url: ctx.url, tenantId: ctx.tenantId });
    //         return { message: "Todo created", todo: newTodo };
    //     } catch (err) {
    //         logger.error("Error creating todo", {
    //             method: ctx.method,
    //             url: ctx.url,
    //             tenantId: ctx.tenantId,
    //             error: err instanceof Error ? err.message : String(err),
    //         });
    //         throw err;
    //     }
    // });

    return { routeRequest, Route };
}