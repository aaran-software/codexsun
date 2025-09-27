// cortex/auth/error.middleware.ts
import { CRequest, CResponse, CNext } from "../http/chttpx";

export class ErrorMiddleware {
  handle(err: any, req: CRequest, res: CResponse, next: CNext) {
    console.error(`❌ Error on ${req.method} ${req.url}:`, err);
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error"
    });
    next();  // Optional, to continue if needed
  }
}