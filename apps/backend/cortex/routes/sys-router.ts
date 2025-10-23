// File: sys-routes.ts
// Location: src/routes/sys-routes.ts
// Description: System routes for task management and static assets in Cortex ERP Backend.

import { createHttpRouter } from "./chttpx";
import { Logger } from "../logger/logger";
import { RequestContext } from "./middleware";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {healthCheck} from "../db/mdb";
import {getMasterDbConfig} from "../config/db-config";

const dbConfig = getMasterDbConfig();


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

            logger.info(faviconPath);

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

// Database Connectivity Health check route
    Route("GET", "/hz/mdb", async (ctx: RequestContext) => {
        logger.info("Served Database health check", { method: ctx.method, url: ctx.url, tenantId: ctx.tenantId });

        try {
            const isHealthy = await healthCheck();

            if (isHealthy) {
                return {
                    status: 'OK',
                    message: 'Database connection successful',
                    database: dbConfig.database || 'master_db',
                    timestamp: new Date().toISOString(),
                    healthy: true
                };
            } else {
                return {
                    status: 'ERROR',
                    message: 'Database connection failed',
                    database: dbConfig.database || 'master_db',
                    timestamp: new Date().toISOString(),
                    healthy: false
                };
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            logger.error("Database health check failed", { error: errorMsg, tenantId: ctx.tenantId });
            return {
                message: `Database Unhealthy ${new Date().toISOString()}`,
                status: 'ERROR',
                database: dbConfig.database || 'master_db',
                error: errorMsg,
                timestamp: new Date().toISOString()
            };
        }
    });

    return { routeRequest, Route };
}