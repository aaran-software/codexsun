import { IncomingMessage, ServerResponse } from "node:http";

interface Route {
    method: string;
    path: string;
    handler: (req: IncomingMessage, res: ServerResponse) => Promise<void> | void;
}

export function createHttpRouter() {
    const routes: Route[] = [];

    function addRoute(method: string, path: string, handler: Route["handler"]) {
        routes.push({ method, path, handler });
    }

    async function routeRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const { method, url } = req;

        const route = routes.find(
            (r) => r.method === method && r.path === url
        );

        if (route) {
            await route.handler(req, res);
        } else {
            throw new Error("Route not found");
        }
    }

    return { routeRequest, addRoute };
}