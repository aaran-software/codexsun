import type { CRequest, CResponse, CNext } from "@codexsun/cortex/http/chttpx";
import { AuthService } from "./auth.service";

export class AuthMiddleware {
    private service: AuthService;

    constructor() {
        this.service = new AuthService();
    }

    basicAuth = (req: CRequest, res: CResponse, next: CNext): void => {
        const authHeader = req.headers["authorization"];

        if (!authHeader || !authHeader.startsWith("Basic ")) {
            res.setHeader("WWW-Authenticate", 'Basic realm="Restricted"');
            res.status(401).send("Authentication required");
            return;
        }

        // Decode base64 "username:password"
        const base64Credentials = authHeader.split(" ")[1];
        const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
        const [username, password] = credentials.split(":");

        const valid = this.service.validateCredentials(username, password);
        if (!valid) {
            res.status(403).send("Forbidden: Invalid credentials");
            return;
        }

        // ✅ Continue
        next();
    };
}
