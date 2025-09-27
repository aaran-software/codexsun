import type { Database } from "../../../../cortex/core/application";
import { APP } from "../../../../cortex/core/application";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

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
      created_at: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
      updated_at: row.updated_at instanceof Date ? row.updated_at : new Date(row.updated_at),
    };
  }

  // Fetch all users
  async getAllUsers(): Promise<User[]> {
    APP.logger.debug("[UserRepository.getAllUsers] Fetching all users");

    const result = await this.db.query<User>(
      `SELECT * FROM users`
    );

    return result.rows.map((r) => this.normalize(r));
  }

  // Fetch single user by id
  async getUser(id: number): Promise<User | null> {
    APP.logger.debug(`[UserRepository.getUser] id=${id}`);

    const result = await this.db.query<User>(
      `SELECT * FROM users WHERE id = ?`,
      [id]
    );

    return result.rows[0] ? this.normalize(result.rows[0]) : null;
  }

  // Create new user
  async createUser(name: string, email: string, password: string): Promise<User> {
    APP.logger.debug("[UserRepository.createUser] data=", { name, email });

    return this.db.withTransaction(async (q) => {
      const result = await q<User>(
        `INSERT INTO users (name, email, password)
         VALUES (?, ?, ?)
         RETURNING *`,
        [name, email, password]
      );

      APP.logger.info("[UserRepository.createUser] User created, id=", result.rows[0]?.id);
      return this.normalize(result.rows[0]);
    });
  }

  // Full update user
  async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
    APP.logger.debug(`[UserRepository.updateUser] id=${id}, updates=`, updates);

    return this.db.withTransaction(async (q) => {
      const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at');
      if (fields.length === 0) {
        return await this.getUser(id);
      }

      const setClause = fields.map((f) => `${f} = ?`).join(", ");
      const values = fields.map((f) => (updates as any)[f]);
      values.push(id);

      const result = await q<User>(
        `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        APP.logger.warn(`[UserRepository.updateUser] No user found id=${id}`);
        return null;
      }

      APP.logger.info(`[UserRepository.updateUser] User updated, id=${id}`);
      return this.normalize(result.rows[0]);
    });
  }

  // Partial update user
  async patchUser(id: number, updates: Partial<User>): Promise<User | null> {
    APP.logger.debug(`[UserRepository.patchUser] id=${id}, updates=`, updates);

    return this.db.withTransaction(async (q) => {
      const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at');
      if (fields.length === 0) {
        return await this.getUser(id);
      }

      const setClause = fields.map((f) => `${f} = ?`).join(", ");
      const values = fields.map((f) => (updates as any)[f]);
      values.push(id);

      const result = await q<User>(
        `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        APP.logger.warn(`[UserRepository.patchUser] No user found id=${id}`);
        return null;
      }

      APP.logger.info(`[UserRepository.patchUser] User patched, id=${id}`);
      return this.normalize(result.rows[0]);
    });
  }

  // Delete user
  async deleteUser(id: number): Promise<boolean> {
    APP.logger.debug(`[UserRepository.deleteUser] id=${id}`);

    return this.db.withTransaction(async (q) => {
      const result = await q(
        `DELETE FROM users WHERE id = ?`,
        [id]
      );

      const success = (result.affectedRows ?? 0) > 0;
      if (success) {
        APP.logger.info(`[UserRepository.deleteUser] id=${id} deleted=${success}`);
        return true;
      } else {
        APP.logger.warn(`[UserRepository.deleteUser] No user found id=${id}`);
        return false;
      }
    });
  }
}