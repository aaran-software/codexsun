import { AuthRepository } from "./auth.repos";
import { APP } from "@codexsun/cortex/core/application";

export class AuthService {
    private repo: AuthRepository;

    constructor(repo: AuthRepository) {
        this.repo = repo;
    }

    async validateCredentials(username: string, password: string): Promise<boolean> {
        try {
            const user = await this.repo.findByEmail(username);
            if (!user) {
                APP.logger.warn("[AuthService] No user found for:", username);
                return false;
            }
            APP.logger.debug("[AuthService] User:", { email: user.email, password: user.password, status: user.status });
            const isPasswordValid = user.password === password;
            const isStatusValid = user.status === "active";
            APP.logger.debug("[AuthService] Password valid:", isPasswordValid, "Status valid:", isStatusValid);
            return isPasswordValid && isStatusValid;
        } catch (error) {
            APP.logger.error("[AuthService] DB error:", error);
            return false;
        }
    }

}

