import { AuthRepository } from "./auth.repos";
import { APP } from "@codexsun/cortex/core/application";

export class AuthService {
    private repo: AuthRepository;

    constructor(repo: AuthRepository) {
        this.repo = repo;
    }

    async validateCredentials(username: string, password: string): Promise<boolean> {
        const user = await this.repo.findByEmail(username);
        if (!user) {
            return false;
        }

        APP.logger.debug("[AuthService.validateCredentials] stored password=", user.password, " input=", password);

        return user.password === password && user.status === "active";
    }

}
