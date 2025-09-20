import { CRequest, CResponse } from "../http/chttpx";
import { IMiddleware } from "./auth.interface";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export class JwtAuthMiddleware implements IMiddleware {
    handle(req: CRequest, res: CResponse, next: () => void) {
        const header = req.headers["authorization"];
        if (!header || !header.startsWith("Bearer ")) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const token = header.split(" ")[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            (req as any).user = decoded;
            next();
        } catch (err) {
            res.status(401).json({ error: "Invalid or expired token" });
        }
    }
}
