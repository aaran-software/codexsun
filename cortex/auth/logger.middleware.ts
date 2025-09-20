import { CRequest, CResponse } from "../http/chttpx";
import { IMiddleware } from "./auth.interface";

export class LoggerMiddleware implements IMiddleware {
    handle(req: CRequest, res: CResponse, next: () => void) {
        const start = Date.now();
        const { method, url } = req;

        res.on("finish", () => {
            const duration = Date.now() - start;
            console.info(`📥 ${method} ${url} → ${res.statusCode} (${duration}ms)`);
        });

        next();
    }
}
