// apps/cxsun/core/auth/auth.controller.ts

import type { Application } from "@codexsun/cortex/core/application";
import type { CRequest, CResponse } from "@codexsun/cortex/http/chttpx";
import type { AuthService } from "./auth.service";

export class AuthController {
    private service: AuthService;

    constructor(app: Application) {
        this.service = app.container.resolve<AuthService>("AuthService");
        console.log("[AuthController] Resolved AuthService =", this.service);
    }

    // POST /login
    login = async (req: CRequest, res: CResponse): Promise<void> => {
        console.log("[AuthController.login] Body:", req.body); // Add this
        const { username, password } = req.body;
        const valid = await this.service.validateCredentials(username, password);
        if (!valid) {
            console.log("[AuthController.login] Validation failed for username:", username); // Add this
            res.status(401).json({ message: "Invalid username or password" });
            return;
        }
        res.json({ message: "Login successful" });
    };


    // POST /logout
    logout = async (_req: CRequest, res: CResponse): Promise<void> => {
        res.json({ message: "Logout successful" });
    };
}
