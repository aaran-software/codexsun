import jwt from "jsonwebtoken";
import type { Application } from "@codexsun/cortex/core/application";
import type { CRequest, CResponse } from "@codexsun/cortex/http/chttpx";
import type { AuthService } from "./auth.service";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_EXPIRY = "1h";

export class AuthController {
private service: AuthService;

    constructor(app: Application) {
        this.service = app.container.resolve<AuthService>("AuthService");
    }

    // POST /login
    login = async (req: CRequest, res: CResponse): Promise<void> => {
        const { email, password } = req.body;

        const user = await this.service.validateCredentials(email, password);

        if (!user) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: JWT_EXPIRY,
        });

        // Strip password before returning
        const { password: _pw, ...safeUser } = user as any;

        res.json({ token, user: safeUser });
    };

    // POST /logout
    logout = async (_req: CRequest, res: CResponse): Promise<void> => {
        res.json({ message: "Logout successful" });
    };
}
