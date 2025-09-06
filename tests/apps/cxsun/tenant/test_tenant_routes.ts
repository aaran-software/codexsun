// tests/apps/cxsun/tenant/test_tenant_routes.ts
import { createServer, Server } from "node:http";
import { tenantRoutes } from "../../../../apps/cxsun/src/tenant/code/tenant.routes";

type Json = any;
type NodeHandler = (req: any, res: any) => void | Promise<void>;

interface RouteSpec {
    method: string;
    path: string;
    handler: NodeHandler;
    regex: RegExp;
    keys: string[];
}

/** Escape a single literal character for regex */
function esc(ch: string): string {
    return /[\\.^$+*?|()[\]{}]/.test(ch) ? `\\${ch}` : ch;
}

/**
 * Convert "/api/tenants/:id/edit" into a regex and param keys.
 * We *do not* pre-escape then replace; we scan char-by-char to avoid
 * escaping ":" or introducing stray parentheses.
 */
function pathToRegex(path: string): { regex: RegExp; keys: string[] } {
    const keys: string[] = [];
    let re = "^";
    for (let i = 0; i < path.length; i++) {
        const ch = path[i];
        if (ch === ":") {
            // parse param name
            let j = i + 1;
            let name = "";
            while (j < path.length && /[A-Za-z0-9_]/.test(path[j])) {
                name += path[j++];
            }
            if (!name) {
                // treat lone ':' literally
                re += esc(":");
            } else {
                keys.push(name);
                re += "([^/]+)";
                i = j - 1; // advance
            }
        } else {
            re += esc(ch);
        }
    }
    re += "$";
    return { regex: new RegExp(re), keys };
}

function extractSpecFromArray(entry: any[]): RouteSpec | null {
    let method = "GET";
    let path = "";
    let handler: any = null;

    if (entry.length >= 3 && typeof entry[0] === "string" && typeof entry[1] === "string" && typeof entry[2] === "function") {
        method = entry[0].toUpperCase();
        path = entry[1];
        handler = entry[2];
    } else if (entry.length >= 2 && typeof entry[0] === "string" && typeof entry[1] === "function") {
        path = entry[0];
        handler = entry[1];
    } else {
        // fallback: last function, first string
        const hIdx = entry.findIndex((x) => typeof x === "function");
        const pIdx = entry.findIndex((x) => typeof x === "string");
        if (hIdx >= 0 && pIdx >= 0) {
            handler = entry[hIdx];
            path = entry[pIdx];
            const mIdx = entry.findIndex((x) => typeof x === "string" && /^(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)$/i.test(x));
            if (mIdx >= 0) method = String(entry[mIdx]).toUpperCase();
        }
    }

    if (typeof handler !== "function" || !path) return null;
    const { regex, keys } = pathToRegex(path);
    return { method, path, handler, regex, keys };
}

function extractSpecFromObject(entry: any): RouteSpec | null {
    const handler: any = entry.handler ?? entry.handle ?? entry.fn ?? entry.cb;
    const path: any = entry.path ?? entry.route ?? entry.url;
    const method: string = String((entry.method ?? entry.verb ?? "GET")).toUpperCase();
    if (typeof handler !== "function" || typeof path !== "string") return null;
    const { regex, keys } = pathToRegex(path);
    return { method, path, handler, regex, keys };
}

function buildDispatcher(routes: any): NodeHandler {
    if (typeof routes === "function") return routes as NodeHandler;

    const specs: RouteSpec[] = [];
    if (Array.isArray(routes)) {
        for (const entry of routes) {
            let spec: RouteSpec | null = null;
            if (typeof entry === "function") {
                // cannot infer method/path; skip
                continue;
            } else if (Array.isArray(entry)) {
                spec = extractSpecFromArray(entry);
            } else if (entry && typeof entry === "object") {
                spec = extractSpecFromObject(entry);
            }
            if (spec) specs.push(spec);
        }
    }
    if (specs.length === 0) throw new Error("tenantRoutes(): no routable specs could be derived.");

    return async (req, res) => {
        const reqMethod = String(req.method || "GET").toUpperCase();
        const reqUrl = String(req.url || "/").split("?")[0];

        for (const spec of specs) {
            if (res.writableEnded) break;
            if (spec.method !== reqMethod) continue;
            const m = spec.regex.exec(reqUrl);
            if (!m) continue;

            const params: Record<string, string> = {};
            spec.keys.forEach((k, i) => (params[k] = m[i + 1]));
            (req as any).params = { ...(req as any).params, ...params };

            await Promise.resolve(spec.handler(req, res));
            if (res.writableEnded) return;
        }

        if (!res.writableEnded) {
            res.statusCode = 404;
            res.setHeader("content-type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ ok: false, error: "NOT_FOUND" }));
        }
    };
}

function startServer(): Promise<{ server: Server; port: number }> {
    return new Promise((resolve, reject) => {
        try {
            const routes = tenantRoutes() as any; // function OR array of descriptors
            const handler = buildDispatcher(routes);
            const server = createServer(handler);
            server.listen(0, "127.0.0.1", () => {
                const addr = server.address();
                if (typeof addr === "object" && addr && "port" in addr) {
                    resolve({ server, port: addr.port! });
                } else {
                    reject(new Error("Failed to bind test server"));
                }
            });
        } catch (e) {
            reject(e);
        }
    });
}

async function httpGet(base: string, path: string) {
    const res = await fetch(`${base}${path}`);
    const status = res.status;
    const ctype = res.headers.get("content-type") || "";
    let json: Json = null;
    if (ctype.includes("application/json")) {
        json = await res.json().catch(() => null);
    }
    return { status, json, ctype };
}

function assert(cond: any, msg: string): asserts cond {
    if (!cond) throw new Error(msg);
}

/** Tolerant parser for list payloads */
function parseListPayload(payload: any): { items: any[]; count: number } {
    if (Array.isArray(payload)) return { items: payload, count: payload.length };
    if (payload && Array.isArray(payload.items)) {
        const count = typeof payload.count === "number" ? payload.count : payload.items.length;
        return { items: payload.items, count };
    }
    if (payload?.data && Array.isArray(payload.data.items)) {
        const count = typeof payload.data.count === "number" ? payload.data.count : payload.data.items.length;
        return { items: payload.data.items, count };
    }
    if (payload?.ok !== undefined && Array.isArray(payload.items)) {
        const count = typeof payload.count === "number" ? payload.count : payload.items.length;
        return { items: payload.items, count };
    }
    return { items: [], count: Number(payload?.count ?? 0) };
}

export async function test_tenant_routes(): Promise<void> {
    const { server, port } = await startServer();
    const base = `http://127.0.0.1:${port}`;

    try {
        // 1) Health check
        const hz = await httpGet(base, "/api/tenants/hz");
        console.log("[routes] GET /api/tenants/hz ->", hz.status, hz.json);
        assert(hz.status === 200, "❌ /api/tenants/hz: expected 200");
        assert(hz.json?.ok === true, "❌ /api/tenants/hz: expected ok=true");

        // 2) List
        const list = await httpGet(base, "/api/tenants");
        const { items, count } = parseListPayload(list.json);
        console.log("[routes] GET /api/tenants ->", list.status, { parsedCount: count, raw: list.json });
        assert(list.status === 200, "❌ /api/tenants: expected 200");
        assert(Array.isArray(items), "❌ /api/tenants: items must be array");
        assert(count >= 1 || items.length >= 1, "❌ /api/tenants: expected at least 1 tenant");

        // 3) Show default tenant
        const show = await httpGet(base, "/api/tenants/tenant_default");
        console.log("[routes] GET /api/tenants/tenant_default ->", show.status, show.json);
        assert(show.status === 200, "❌ /api/tenants/tenant_default: expected 200");
        const payload = show.json;
        assert(payload != null, "❌ /api/tenants/:id returned null/undefined");
        if (payload.ok !== undefined) {
            assert(payload.ok === true, "❌ /api/tenants/:id: expected ok=true");
            assert(payload.item && payload.item.id === "tenant_default", "❌ /api/tenants/:id: expected item.id=tenant_default");
        } else {
            assert(payload.id === "tenant_default", "❌ /api/tenants/:id: expected id=tenant_default");
        }

        console.log("✅ tenant.routes test passed");
    } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
    }
}
