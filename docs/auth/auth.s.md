// apps/cxsun/core/auth/auth.service.ts
import { AuthRepository } from "./auth.repos";
import type { User } from "../user/user.model";

export class AuthService {
private repo: AuthRepository;

    constructor(repo: AuthRepository) {
        this.repo = repo;
    }

    async validateCredentials(email: string, password: string): Promise<User | null> {
        const user = await this.repo.findByEmail(email);
        if (!user) return null;

        // TODO: use bcrypt here instead of plain comparison
        if (user.password === password && user.status === "active") {
            return user;
        }
        return null;
    }
}
