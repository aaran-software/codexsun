// apps/cxsun/code/user/user.repos.ts

import type { User } from "./user.model";
import type { Database } from "@codexsun/cortex/core/application";
import { APP } from "@codexsun/cortex/core/application"; // centralized logger

export class UserRepository {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    // Normalize DB row → User
    private normalize(row: any): User {
        return {
            id: typeof row.id === "bigint" ? Number(row.id) : row.id,
            name: row.name,
            email: row.email,
            password: row.password,
            status: row.status,
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

    // Fetch all users
    async findAll(): Promise<User[]> {
        APP.logger.debug("[UserRepository.findAll] Fetching all users");

        const result = await this.db.query<User>(
            "SELECT * FROM users ORDER BY id ASC"
        );

        return result.rows.length
            ? result.rows.map((r) => this.normalize(r))
            : [];
    }

    // Fetch single user
    async findById(id: number): Promise<User | null> {
        APP.logger.debug("[UserRepository.findById] id=", id);

        const result = await this.db.query<User>(
            "SELECT * FROM users WHERE id = ?",
            [id]
        );

        return result.rows[0] ? this.normalize(result.rows[0]) : null;
    }

    // Create new user
    async create(
        data: Omit<User, "id" | "created_at" | "updated_at">
    ): Promise<User> {
        APP.logger.debug("[UserRepository.create] data=", data);

        // Try RETURNING *
        const result = await this.db.query<User>(
            `INSERT INTO users (name, email, password, status)
             VALUES (?, ?, ?, ?)
                 RETURNING *`,
            [data.name, data.email, data.password, data.status ?? "active"]
        );

        if (result.rows && result.rows.length > 0) {
            APP.logger.info("[UserRepository.create] Inserted via RETURNING *");
            return this.normalize(result.rows[0]);
        }

        // Fallback: use insertId
        const newId = result.insertId;
        if (!newId) {
            APP.logger.error("[UserRepository.create] Failed to retrieve insertId or rows");
            throw new Error("Failed to create user");
        }

        APP.logger.info(`[UserRepository.create] Inserted user id=${newId}`);
        return (await this.findById(newId))!;
    }

    // Update user
    async update(
        id: number,
        data: Partial<Omit<User, "id">>
    ): Promise<User | null> {
        APP.logger.debug("[UserRepository.update] id=", id, "data=", data);

        const fields: string[] = [];
        const values: any[] = [];

        for (const [key, value] of Object.entries(data)) {
            if (value === undefined) continue;
            fields.push(`${key} = ?`);
            values.push(value);
        }

        if (fields.length === 0) {
            APP.logger.warn(
                `[UserRepository.update] No fields to update for user id=${id}`
            );
            return this.findById(id);
        }

        // add updated_at
        fields.push("updated_at = NOW()");
        values.push(id);

        const result = await this.db.query<User>(
            `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
            values
        );

        if ((result.affectedRows ?? 0) === 0) {
            APP.logger.warn(`[UserRepository.update] No user found id=${id}`);
            return null;
        }

        return this.findById(id);
    }

    async patchUser(id: number, updates: Partial<User>): Promise<User | null> {
        const fields = Object.keys(updates);
        if (fields.length === 0) return this.findById(id);

        const setClause = fields.map((f) => `${f} = ?`).join(", ");
        const values = fields.map((f) => (updates as any)[f]);
        values.push(id);

        const sql = `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        const result: any = await this.db.query(sql, values);

        if (result.affectedRows === 0) return null;
        return this.findById(id); // ✅ guaranteed to return User | null
    }

    // Delete user
    async delete(id: number): Promise<boolean> {
        APP.logger.debug("[UserRepository.delete] id=", id);

        const result = await this.db.query(
            "DELETE FROM users WHERE id = ?",
            [id]
        );

        const success = (result.affectedRows ?? 0) > 0;
        APP.logger.info(`[UserRepository.delete] id=${id} deleted=${success}`);
        return success;
    }
}
