// apps/cxsun/code/session/session.service.ts

import type { Session } from "./session.model";
import { SessionRepository } from "./session.repos";
import { APP } from "@codexsun/cortex/core/application";

export class SessionService {
    private repo: SessionRepository;

    constructor(repo: SessionRepository) {
        this.repo = repo;
    }

    async createSession(userId: number, token: string, expiresAt: Date): Promise<Session> {
        APP.logger.debug("[SessionService.createSession] userId=", userId);
        return this.repo.create({ user_id: userId, token, expires_at: expiresAt, revoked: false });
    }

    async getSessionByToken(token: string): Promise<Session | null> {
        APP.logger.debug("[SessionService.getSessionByToken] token=", token);
        return this.repo.findByToken(token);
    }

    async revokeSession(token: string): Promise<boolean> {
        APP.logger.debug("[SessionService.revokeSession] token=", token);
        return this.repo.revokeByToken(token);
    }

    async cleanupSessions(): Promise<number> {
        APP.logger.debug("[SessionService.cleanupSessions] Starting cleanup");
        return this.repo.cleanup();
    }
}