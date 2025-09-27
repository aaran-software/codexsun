import { CRequest, CResponse } from "./chttpx";
import { parse } from "url";

export type Middleware = (req: CRequest, res: CResponse, next: () => void) => void | Promise<void>;

export interface RouteDefinition {
    method: string;
    path: string;
    handler: (req: CRequest, res: CResponse) => void | Promise<void>;
    regex: RegExp;
    paramNames: string[];
}

export class CoreRouter {
    private routes: RouteDefinition[] = [];
    private middlewares: Middleware[] = [];
    private logger: { info: Function; warn: Function; error: Function };

    constructor(logger?: { info: Function; warn: Function; error: Function }) {
        this.logger = logger || console;
    }

    register(method: string, path: string, handler: RouteDefinition["handler"]) {
        const m = method.toUpperCase();
        if (this.routes.some((r) => r.method === m && r.path === path)) return;

        const paramNames: string[] = [];
        const regex = new RegExp(
            "^" +
            path.replace(/:([^/]+)/g, (_: string, key: string) => {
                paramNames.push(key);
                return "([^/]+)";
            }) +
            "$"
        );

        this.routes.push({ method: m, path, handler, regex, paramNames });
    }

    use(middleware: Middleware) {
        this.middlewares.push(middleware);
    }

    getRoutes(): RouteDefinition[] {
        return this.routes;
    }

    printRoutes(): { method: string; path: string }[] {
        if (this.routes.length === 0) {
            this.logger.warn("⚠️ No routes registered.");
            return [];
        }
        this.logger.info("📌 Registered routes:");
        this.routes.forEach((r) => {
            this.logger.info(` → [${r.method}] ${r.path}`);
        });
        return this.routes.map((r) => ({ method: r.method, path: r.path }));
    }

    async handle(req: CRequest, res: CResponse): Promise<boolean> {
        const method = req.method?.toUpperCase() || "GET";
        const urlPath = parse(req.url || "/").pathname || "/";

        let matched: RouteDefinition | undefined;
        let params: Record<string, string> = {};

        for (const r of this.routes) {
            const match = r.regex.exec(urlPath);
            if (r.method === method && match) {
                matched = r;
                r.paramNames.forEach((name, idx) => {
                    params[name] = match[idx + 1];
                });
                break;
            }
        }

        req.params = params;
        if (req.parseQuery) req.parseQuery();
        if (req.parseBody) await req.parseBody();

        const runMiddlewares = async (i: number): Promise<void> => {
            if (i < this.middlewares.length) {
                await Promise.resolve(
                    this.middlewares[i](req, res, () => runMiddlewares(i + 1))
                );
            } else if (matched) {
                await Promise.resolve(matched.handler(req, res));
            }
        };

        if (matched) {
            await runMiddlewares(0);
            return true;
        }

        return false;
    }
}
