import { Router } from "../../../../../cortex/http/route";
import { TenantController } from "./tenant.controller";
import type { IncomingMessage, ServerResponse } from "node:http";
import { URL } from "node:url";

/** Small CORS helper */
function setCors(res: ServerResponse) {
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("access-control-allow-methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("access-control-allow-headers", "content-type,x-http-method-override");
}

async function readBody(req: IncomingMessage): Promise<any> {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
    const raw = Buffer.concat(chunks).toString("utf8").trim();
    if (!raw) return undefined;
    const ctype = String(req.headers["content-type"] || "").toLowerCase();
    if (ctype.includes("application/json")) return JSON.parse(raw);
    if (ctype.includes("application/x-www-form-urlencoded")) {
        const p = new URLSearchParams(raw);
        const obj: Record<string, string> = {};
        p.forEach((v, k) => (obj[k] = v));
        return obj;
    }
    try { return JSON.parse(raw); } catch { return { _raw: raw }; }
}

function toHttpRequest(req: IncomingMessage): any {
    const url = new URL(req.url || "/", "http://localhost");
    const query: Record<string, string | string[]> = {};
    url.searchParams.forEach((v, k) => {
        if (k in query) query[k] = Array.isArray(query[k]) ? [...(query[k] as string[]), v] : [query[k] as string, v];
        else query[k] = v;
    });

    // method override
    const override = (req.headers["x-http-method-override"] as string) || (typeof query._method === "string" ? query._method : "");
    const method = (override || req.method || "GET").toUpperCase();

    return {
        method,
        path: url.pathname,
        query,
        headers: req.headers ?? Object.create(null),
        body: undefined,
        files: undefined,
        raw: req,
    };
}

function writeJson(res: ServerResponse, payload: unknown, status = 200) {
    const body = JSON.stringify(payload ?? null);
    res.statusCode = status;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("content-length", Buffer.byteLength(body));
    setCors(res);
    res.end(body);
}

function writeError(res: ServerResponse, err: any) {
    const status = Number(err?.statusCode ?? 500);
    writeJson(res, { ok: false, error: "INTERNAL", message: err?.message ?? "Server error" }, status);
}

function optionsAny(): (req: any, res: ServerResponse) => void {
    return (_req, res) => {
        setCors(res);
        res.statusCode = 204;
        res.end();
    };
}

function withHandler(fn: (httpReq: any) => any | Promise<any>) {
    return async (req: IncomingMessage, res: ServerResponse) => {
        // CORS preflight
        if (req.method?.toUpperCase() === "OPTIONS") return optionsAny()({}, res);

        try {
            const httpReq = toHttpRequest(req);
            if (["POST","PUT","PATCH","DELETE"].includes(httpReq.method)) {
                httpReq.body = await readBody(req);
            }
            const data = await fn(httpReq);
            writeJson(res, data, 200);
        } catch (err: any) {
            writeError(res, err);
        }
    };
}

function withParam(name: string, fn: (httpReq: any) => any | Promise<any>) {
    return async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method?.toUpperCase() === "OPTIONS") return optionsAny()({}, res);

        try {
            const httpReq = toHttpRequest(req);
            const parts = httpReq.path.split("/").filter(Boolean);
            const id = parts[parts.length - 1];
            httpReq.params = { ...(httpReq.params || {}), [name]: id };
            if (["POST","PUT","PATCH","DELETE"].includes(httpReq.method)) {
                httpReq.body = await readBody(req);
            }
            const data = await fn(httpReq);
            writeJson(res, data, 200);
        } catch (err: any) {
            writeError(res, err);
        }
    };
}

export function tenantRoutes() {
    const route = new Router();
    const ctx = new TenantController();

    // CORS preflight for the collection + detail
    route.options("/api/tenants", optionsAny());
    route.options("/api/tenants/:id", optionsAny());

    // Health
    route.get("/api/tenants/hz", (req: any, res: any) => {
        setCors(res);
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, scope: "tenants", time: new Date().toISOString() }));
    });

    // CRUD
    route.get("/api/tenants", withHandler(ctx.index.bind(ctx))).named("tenants:index");
    route.post("/api/tenants", withHandler(ctx.store.bind(ctx))).named("tenants:store");

    route.get("/api/tenants/:id", withParam("id", ctx.edit.bind(ctx))).named("tenants:show");
    route.put("/api/tenants/:id", withParam("id", ctx.update.bind(ctx))).named("tenants:update");
    route.delete("/api/tenants/:id", withParam("id", ctx.delete.bind(ctx))).named("tenants:delete");

    // Optional…
    route.get("/api/tenants/create", withHandler(ctx.create.bind(ctx))).named("tenants:create");
    route.get("/api/tenants/:id/edit", withParam("id", ctx.edit.bind(ctx))).named("tenants:edit");
    route.get("/api/tenants/:id/print", withParam("id", ctx.print.bind(ctx))).named("tenants:print");
    route.post("/api/tenants/upload", withHandler(ctx.upload.bind(ctx))).named("tenants:upload");
    route.get("/api/tenants/:id/download", withParam("id", ctx.download.bind(ctx))).named("tenants:download");

    return route.all();
}
