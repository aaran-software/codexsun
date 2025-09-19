import http, {IncomingMessage, ServerResponse} from "http";
import {
    createExpress,
    ExpressApp,
    ExpressRouter,
    ExpressRequest,
    ExpressResponse,
    ExpressNext,
} from "./express";
import {CoreRouter} from "./core-router"; // <-- your custom router

// Public wrapper types
export type CHttpApp = ExpressApp;
export type CRouter = ExpressRouter;
export type CRequest = ExpressRequest & {
    params?: Record<string, string>;
    query?: Record<string, any>;
    body?: any;
    parseQuery?: () => void;
    parseBody?: () => Promise<void>;
};
export type CResponse = ExpressResponse;
export type CNext = ExpressNext;

export class CHttp {
    private readonly app: CHttpApp;
    private static coreRouter = new CoreRouter();

    constructor() {
        this.app = createExpress();

        // Bridge: send all requests through core router first
        this.app.use(async (req: CRequest, res: CResponse, next: CNext) => {
            const handled = await CHttp.coreRouter.handle(req, res);
            if (!handled) next();
        });
    }

    /** Return underlying express app */
    get rawApp(): CHttpApp {
        return this.app;
    }

    /** Expose express Router factory */
    static Router(): CRouter {
        return require("express").Router();
    }

    /** Expose custom core router for registration */
    static get router(): CoreRouter {
        return CHttp.coreRouter;
    }

    /** Mount middleware or routes directly on express */
    use(...args: any[]) {
        this.app.use(...args);
    }

    /** Bind express app to a port */
    listen(port: number, callback?: () => void) {
        return this.app.listen(port, callback);
    }

    /**
     * Create an HTTP server wrapper compatible with index.ts
     * Allows: CHttp.createServer(APP.handle)
     */
    static createServer(
        handler?: (req: IncomingMessage, res: ServerResponse) => void
    ) {
        const instance = new CHttp();

        if (handler) {
            instance.app.use((req, res, next) => {
                let ended = false;

                const wrappedRes = new Proxy(res, {
                    get(target, prop, receiver) {
                        if (prop === "end") ended = true;
                        return Reflect.get(target, prop, receiver);
                    },
                });

                handler(req, wrappedRes as unknown as ServerResponse);

                if (!ended) next();
            });
        }

        return http.createServer(instance.app);
    }
}
