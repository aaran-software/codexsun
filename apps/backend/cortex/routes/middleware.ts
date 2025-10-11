// File: middleware.ts
// Location: src/middleware.ts
// Description: Centralized request/response handling. Parses request body/query, resolves or validates tenantId, creates RequestContext, formats responses, and logs details.

import {IncomingMessage, ServerResponse} from "node:http";
import {Logger} from "../logger/logger";
import {URL} from "node:url";

export interface RequestContext {
    method: string;
    url: string;
    pathname: string;
    query: URLSearchParams;
    body?: any;
    headers: Record<string, string | string[] | undefined>;
    tenantId: string;
}

export class Middleware {
    private logger = new Logger();

    async processRequest(req: IncomingMessage, res: ServerResponse, next: (ctx: RequestContext) => Promise<any>): Promise<void> {
        const startTime = Date.now();
        const ctx = createRequestContext(req);
        await parseBodyIfNeeded(req, ctx);

        // Resolve or validate tenantId
        // try {
        //     if (ctx.method === "POST" && ctx.pathname === "/login") {
        //         ctx.tenantId = await resolveTenantIdForLogin(ctx);
        //     } else {
        //         await validateTenantId(ctx);
        //     }
        // } catch (err) {
        //     const error = err instanceof Error ? err.message : String(err);
        //     this.logger.error("Tenant resolution/validation failed", { error, method: ctx.method, url: ctx.url });
        //     const status = error.includes("Valid email is required") || error.includes("x-tenant-id header is required") || error.includes("Invalid tenant ID") ? 400 : 401;
        //     sendResponse(res, status, { error: { message: error, code: status } }, startTime, ctx, this.logger);
        //     return;
        // }

        // // Validate x-tenant-id header
        // if (ctx.method === "POST" && ctx.pathname === "/login") {
        //     return;
        // } else if (!ctx.tenantId || ctx.tenantId.trim() === "") {
        //     this.logger.warn("Missing or empty x-tenant-id header", {method: ctx.method, url: ctx.url});
        //     throw new Error("x-tenant-id header is required and must be non-empty");
        // }

        this.logger.info("Request", {method: ctx.method, url: ctx.url, tenantId: ctx.tenantId});

        try {
            const result = await next(ctx);
            sendResponse(res, 200, result, startTime, ctx, this.logger);
        } catch (err) {
            const error = err instanceof Error ? err.message : String(err);
            this.logger.error("Handler error", {error, method: ctx.method, url: ctx.url, tenantId: ctx.tenantId});
            const status = error === "Route not found" ? 404 : error === "Invalid JSON" ? 400 : 500;
            sendResponse(res, status, {error: {message: error, code: status}}, startTime, ctx, this.logger);
        }
    }
}

function createRequestContext(req: IncomingMessage): RequestContext {
    const parsedUrl = new URL(req.url || "", `http://${req.headers.host}`);
    return {
        method: req.method || "",
        url: req.url || "",
        pathname: parsedUrl.pathname,
        query: parsedUrl.searchParams,
        headers: req.headers,
        body: null,
        tenantId: typeof req.headers["x-tenant-id"] === "string" ? req.headers["x-tenant-id"] : "",
    };
}

async function parseBodyIfNeeded(req: IncomingMessage, ctx: RequestContext): Promise<void> {
    if (["POST", "PUT"].includes(req.method || "")) {
        ctx.body = await new Promise((resolve, reject) => {
            let body = "";
            req.on("data", (chunk) => (body += chunk.toString()));
            req.on("end", () => {
                try {
                    resolve(body ? JSON.parse(body) : {});
                } catch (err) {
                    reject(new Error("Invalid JSON"));
                }
            });
        });
    }
}

// async function resolveTenantIdForLogin(ctx: RequestContext): Promise<string> {
//     if (!ctx.body?.email) {
//         throw new Error("Valid email is required for login");
//     }
//     const tenant = await resolveTenant({body: ctx.body});
//     return tenant.id;
// }
//
// async function validateTenantId(ctx: RequestContext): Promise<void> {
//     if (!ctx.tenantId || ctx.tenantId.trim() === "") {
//         throw new Error("x-tenant-id header is required and must be non-empty");
//     }
//     const dbConfig = getMasterDbConfig();
//     const tenantRes = await query<{ tenant_id: string }>(
//         'SELECT tenant_id FROM tenants WHERE tenant_id = ?',
//         [ctx.tenantId],
//         dbConfig.database
//     );
//     if (tenantRes.rows.length === 0) {
//         throw new Error(`Invalid tenant ID: ${ctx.tenantId}`);
//     }
// }

function sendResponse(res: ServerResponse, status: number, data: any, startTime: number, ctx: RequestContext, logger: Logger): void {
    res.writeHead(status, {"Content-Type": "application/json"});
    const content = JSON.stringify(data);
    res.end(content);
    logger.info("Response", {
        method: ctx.method,
        url: ctx.url,
        statusCode: status,
        responseTimeMs: Date.now() - startTime,
        tenantId: ctx.tenantId,
        content,
    });
}