// apps/cxsun/code/session/session.repos.ts

import type { Session } from "./session.model";
import type { Database } from "@codexsun/cortex/core/application";
import { APP } from "@codexsun/cortex/core/application";

export class SessionRepository {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    // Normalize DB row to Session
    private normalize(row: any): Session {
        return {
            id: typeof row.id === "bigint" ? Number(row.id) : row.id,
            user_id: typeof row.user_id === "bigint" ? Number(row.user_id) : row.user_id,
            token: row.token,
            expires_at:
                row.expires_at instanceof Date
                    ? row.expires_at
                    : new Date(row.expires_at),
            revoked: !!row.revoked,
            created_at:
                row.created_at instanceof Date
                    ? row.created_at
                    : new Date(row.created_at),
            updated_at:
                row.updated_at instanceof Date
                    ? row.updated_at
                    : new Date(row.updated_at),
        };
    }

    // Find session by token
    async findByToken(token: string): Promise<Session | null> {
        APP.logger.debug("[SessionRepository.findByToken] token=", token);

        const result = await this.db.query<Session>(
            "SELECT * FROM sessions WHERE token = ?",
            [token]
        );

        return result.rows[0] ? this.normalize(result.rows[0]) : null;
    }

    // Create new session
    async create(
        data: Omit<Session, "id" | "created_at" | "updated_at">
    ): Promise<Session> {
        APP.logger.debug("[SessionRepository.create] data=", data);

        const result = await this.db.query<Session>(
            `INSERT INTO sessions (user_id, token, expires_at, revoked)
             VALUES (?, ?, ?, ?)
             RETURNING *`,
            [data.user_id, data.token, data.expires_at, data.revoked ?? false]
        );

        if (result.rows && result.rows.length > 0) {
            APP.logger.info("[SessionRepository.create] Inserted via RETURNING *");
            return this.normalize(result.rows[0]);
        }

        const newId = result.insertId;
        if (!newId) {
            APP.logger.error("[SessionRepository.create] Failed to retrieve insertId or rows");
            throw new Error("Failed to create session");
        }

        APP.logger.info(`[SessionRepository.create] Inserted session id=${newId}`);
        const createdSession = await this.findById(newId);
        if (!createdSession) {
            throw new Error("Failed to retrieve created session");
        }
        return createdSession;
    }

    // Find session by id
    async findById(id: number): Promise<Session | null> {
        APP.logger.debug("[SessionRepository.findById] id=", id);

        const result = await this.db.query<Session>(
            "SELECT * FROM sessions WHERE id = ?",
            [id]
        );

        return result.rows[0] ? this.normalize(result.rows[0]) : null;
    }

    // Revoke session by token
    async revokeByToken(token: string): Promise<boolean> {
        APP.logger.debug("[SessionRepository.revokeByToken] token=", token);

        const result = await this.db.query(
            "UPDATE sessions SET revoked = TRUE, updated_at = NOW() WHERE token = ? AND revoked = FALSE",
            [token]
        );

        const success = (result.affectedRows ?? 0) > 0;
        APP.logger.info(`[SessionRepository.revokeByToken] token=${token} revoked=${success}`);
        return success;
    }

    // Cleanup expired or revoked sessions
    async cleanup(): Promise<number> {
        APP.logger.debug("[SessionRepository.cleanup] Removing expired or revoked sessions");

        const result = await this.db.query(
            "DELETE FROM sessions WHERE expires_at < NOW() OR revoked = TRUE"
        );

        const deletedCount = result.affectedRows ?? 0;
        APP.logger.info(`[SessionRepository.cleanup] Deleted ${deletedCount} sessions`);
        return deletedCount;
    }
}