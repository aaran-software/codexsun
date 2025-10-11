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
    userId: string;
}

export class Middleware {
    private logger = new Logger();

    async processRequest(req: IncomingMessage, res: ServerResponse, next: (ctx: RequestContext) => Promise<any>): Promise<void> {
        const startTime = Date.now();
        const ctx = createRequestContext(req);
        await parseBodyIfNeeded(req, ctx);
        normalizeUrl(ctx);

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
        userId: typeof req.headers["x-user-id"] === "string" ? req.headers["x-user-id"] : "",
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

// /routes/middleware.ts
export function normalizeUrl(ctx: RequestContext): void {
    ctx.url = ctx.url.replace(/\/+$/, ''); // Remove trailing slashes
}