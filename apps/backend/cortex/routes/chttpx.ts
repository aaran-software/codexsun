import { IncomingMessage, ServerResponse, OutgoingHttpHeaders } from "node:http";
import { Logger } from "../logger/logger";

interface Route {
    method: string;
    path: string;
    handler: (req: IncomingMessage, res: ServerResponse) => Promise<void> | void;
}

export function createHttpRouter() {
    const routes: Route[] = [];
    const logger = new Logger();

    function addRoute(method: string, path: string, handler: Route["handler"]) {
        routes.push({
            method,
            path,
            handler: async (req: IncomingMessage, res: ServerResponse) => {
                const startTime = Date.now();
                logger.info("Request ", {
                    method: req.method,
                    url: req.url,
                });

                // Capture response details
                let responseContent: string | null = null;
                let statusCode: number | null = null;

                const originalWriteHead = res.writeHead;
                res.writeHead = function (code: number, headers?: OutgoingHttpHeaders) {
                    statusCode = code;
                    return originalWriteHead.call(res, code, headers);
                };

                const originalEnd = res.end;
                res.end = function (chunk?: any, encoding?: string, callback?: () => void) {
                    if (chunk) {
                        responseContent = chunk.toString();
                    }
                    logger.info("Response ", {
                        method: req.method,
                        url: req.url,
                        statusCode,
                        responseTimeMs: Date.now() - startTime,
                        content: responseContent ? JSON.stringify(JSON.parse(responseContent)) : undefined,
                    });
                    return originalEnd.call(res, chunk, encoding, callback);
                };

                try {
                    await handler(req, res);
                } catch (err) {
                    logger.error("Error in route handler", {
                        method: req.method,
                        url: req.url,
                        error: (err instanceof Error) ? err.message : String(err),
                    });
                    throw err;
                }
            },
        });
    }

    async function routeRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const { method, url } = req;
        const route = routes.find((r) => r.method === method && r.path === url);

        if (route) {
            await route.handler(req, res);
        } else {
            throw new Error("Route not found");
        }
    }

    return { routeRequest, Route: addRoute };
}