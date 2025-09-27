import type { Database } from "../../../../cortex/core/application";
import { APP } from "../../../../cortex/core/application";
import type { User } from "../user/user.model";

export class AuthRepository {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    /**
     * Find a user by email/username.
     * Returns null if not found.
     */
    async findByEmail(email: string): Promise<User | null> {
        APP.logger.debug("[AuthRepository.findByEmail] email=", email);

        const result = await this.db.query<User>(
            "SELECT id, name, email, password, status, created_at, updated_at FROM users WHERE email = ? LIMIT 1",
            [email]
        );

        return result.rows[0] ? this.normalize(result.rows[0]) : null;
    }

    /**
     * Normalize DB row into User object
     */
    private normalize(row: any): User {
        return {
            id: row.id,
            name: row.name,
            email: row.email,
            password: row.password,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }
}
