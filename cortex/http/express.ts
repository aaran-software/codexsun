import express, {
    Application,
    Request,
    Response,
    NextFunction,
    Router
} from "express";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

export type ExpressApp = Application;
export type ExpressRequest = Request;
export type ExpressResponse = Response;
export type ExpressNext = NextFunction;
export type ExpressRouter = Router;

export function createExpress(): ExpressApp {
    const app = express();

    /** 🔧 Security & performance middleware */
    app.use(helmet());
    app.use(cors());
    app.use(compression());
    app.use(morgan("dev"));
    app.use(cookieParser());

    /** 🔒 Rate limiting (global) */
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per window
        standardHeaders: true, // add RateLimit-* headers
        legacyHeaders: false, // disable deprecated headers
        message: { error: "Too many requests, please try again later." }
    });
    app.use(limiter);

    /** 🔧 Body parsing (optimized for bulk records) */
    app.use(express.json({ limit: "100mb" }));
    app.use(express.urlencoded({ extended: true, limit: "100mb" }));

    /** 🔧 Welcome route */
    app.get("/", (_req: Request, res: Response) => {
        res.json({ message: "welcome" });
    });

    /** 🔧 Health check route */
    app.get("/hz", (_req: Request, res: Response) => {
        res.json({ status: "ok" });
    });

    /** 🔧 Centralized error handling */
    app.use(
        (err: any, _req: Request, res: Response, _next: NextFunction) => {
            console.error("❌ Express Error:", err);
            res.status(err.status || 500).json({
                error: err.message || "Internal Server Error"
            });
        }
    );

    return app;
}
