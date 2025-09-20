import { CRequest, CResponse } from "../http/chttpx";

export class ErrorMiddleware {
    handle(err: any, req: CRequest, res: CResponse, next: () => void) {
        if (res.headersSent) return next();

        const status: number = err?.status || 500;
        const message: string =
            typeof err?.message === "string"
                ? err.message
                : "Internal Server Error";

        console.error("❌ Global ErrorMiddleware:", {
            method: req.method,
            url: req.url,
            status,
            error: err,
        });

        res.status(status).json({
            error: {
                message,
                status,
                timestamp: new Date().toISOString(),
                path: req.url,
            },
        });
    }
}
