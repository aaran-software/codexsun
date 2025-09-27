import type { Todo } from "./todo.model";
import type { Database } from "../../../../cortex/core/application";
import { APP } from "../../../../cortex/core/application";

export class TodoRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // Normalize DB row → Todo
  private normalize(row: any): Todo {
    return {
      id: typeof row.id === "bigint" ? Number(row.id) : row.id,
      user_id: typeof row.user_id === "bigint" ? Number(row.user_id) : row.user_id,
      text: row.text,
      completed: !!row.completed,
      category: row.category,
      due_date: row.due_date ? new Date(row.due_date) : null,
      priority: row.priority,
      order_position: typeof row.order_position === "bigint" ? Number(row.order_position) : row.order_position,
      created_at: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
      updated_at: row.updated_at instanceof Date ? row.updated_at : new Date(row.updated_at),
    };
  }

  // Fetch all todos for a user with pagination
  async findAllForUser(userId: number, page: number, limit: number): Promise<{ todos: Todo[], total: number }> {
    APP.logger.debug(`[TodoRepository.findAllForUser] Fetching todos for user_id=${userId}, page=${page}, limit=${limit}`);

    const offset = (page - 1) * limit;
    const [todosResult, countResult] = await Promise.all([
      this.db.query<Todo>(
        `SELECT * FROM todos WHERE user_id = ? ORDER BY order_position ASC, id ASC LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      ),
      this.db.query<{ count: bigint | number }>(
        `SELECT COUNT(*) as count FROM todos WHERE user_id = ?`,
        [userId]
      ),
    ]);

    const todos = todosResult.rows.length ? todosResult.rows.map((r) => this.normalize(r)) : [];
    const total = typeof countResult.rows[0]?.count === "bigint" ? Number(countResult.rows[0].count) : countResult.rows[0]?.count || 0;

    return { todos, total };
  }

  // Fetch single todo for a user
  async findByIdForUser(id: number, userId: number): Promise<Todo | null> {
    APP.logger.debug(`[TodoRepository.findByIdForUser] id=${id}, user_id=${userId}`);

    const result = await this.db.query<Todo>(
      `SELECT * FROM todos WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    return result.rows[0] ? this.normalize(result.rows[0]) : null;
  }

  // Create new todo for a user
  async create(data: {
    text: string;
    completed: boolean;
    category: string;
    due_date: Date | null;
    priority: 'low' | 'medium' | 'high';
    user_id: number;
  }): Promise<Todo> {
    APP.logger.debug("[TodoRepository.create] data=", data);

    return this.db.withTransaction(async (q) => {
      const maxOrderResult = await q<{ max_order: number }>(
        `SELECT COALESCE(MAX(order_position), 0) as max_order FROM todos WHERE user_id = ?`,
        [data.user_id]
      );
      const order_position = (maxOrderResult.rows[0]?.max_order || 0) + 1;

      const result = await q<Todo>(
        `INSERT INTO todos (user_id, text, completed, category, due_date, priority, order_position)
         VALUES (?, ?, ?, ?, ?, ?, ?)
             RETURNING *`,
        [
          data.user_id,
          data.text,
          data.completed,
          data.category,
          data.due_date,
          data.priority,
          order_position,
        ]
      );

      APP.logger.info("[TodoRepository.create] Todo created, id=", result.rows[0]?.id);
      return this.normalize(result.rows[0]);
    });
  }

  // Full update todo
  async update(id: number, userId: number, updates: {
    text: string;
    completed: boolean;
    category: string;
    due_date: Date | null;
    priority: 'low' | 'medium' | 'high';
  }): Promise<Todo | null> {
    APP.logger.debug(`[TodoRepository.update] id=${id}, user_id=${userId}, updates=`, updates);

    return this.db.withTransaction(async (q) => {
      const result = await q<Todo>(
        `UPDATE todos
         SET text = ?, completed = ?, category = ?, due_date = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND user_id = ?
             RETURNING *`,
        [
          updates.text,
          updates.completed,
          updates.category,
          updates.due_date,
          updates.priority,
          id,
          userId,
        ]
      );

      if (result.rows.length === 0) {
        APP.logger.warn(`[TodoRepository.update] No todo found id=${id} for user_id=${userId}`);
        return null;
      }

      APP.logger.info(`[TodoRepository.update] Todo updated, id=${id}`);
      return this.normalize(result.rows[0]);
    });
  }

  // Partial update todo
  async patchTodo(id: number, userId: number, updates: Partial<Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'order_position'>>): Promise<Todo | null> {
    APP.logger.debug(`[TodoRepository.patchTodo] id=${id}, user_id=${userId}, updates=`, updates);

    return this.db.withTransaction(async (q) => {
      const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'user_id' && k !== 'created_at' && k !== 'updated_at' && k !== 'order_position');
      if (fields.length === 0) {
        return await this.findByIdForUser(id, userId);
      }

      const setClause = fields.map((f) => `${f} = ?`).join(", ");
      const values = fields.map((f) => {
        const val = (updates as any)[f];
        return f === 'due_date' && val === null ? null : val;
      });
      values.push(id, userId);

      const result = await q<Todo>(
        `UPDATE todos SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ? RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        APP.logger.warn(`[TodoRepository.patchTodo] No todo found id=${id} for user_id=${userId}`);
        return null;
      }

      APP.logger.info(`[TodoRepository.patchTodo] Todo patched, id=${id}`);
      return this.normalize(result.rows[0]);
    });
  }

  // Delete todo
  async delete(id: number, userId: number): Promise<boolean> {
    APP.logger.debug(`[TodoRepository.delete] id=${id}, user_id=${userId}`);

    return this.db.withTransaction(async (q) => {
      const result = await q(
        `DELETE FROM todos WHERE id = ? AND user_id = ?`,
        [id, userId]
      );

      const success = (result.affectedRows ?? 0) > 0;
      if (success) {
        APP.logger.info(`[TodoRepository.delete] id=${id} deleted=${success}`);
        return true;
      } else {
        APP.logger.warn(`[TodoRepository.delete] No todo found id=${id} for user_id=${userId}`);
        return false;
      }
    });
  }

  // Reorder todos
  async reorderTodos(userId: number, order: number[]): Promise<void> {
    APP.logger.debug(`[TodoRepository.reorderTodos] user_id=${userId}, order=`, order);

    await this.db.withTransaction(async (q) => {
      const currentTodos = await q<{ id: number }>(
        `SELECT id FROM todos WHERE user_id = ?`,
        [userId]
      );
      const currentIds = currentTodos.rows.map((row: { id: number | bigint }) => typeof row.id === "bigint" ? Number(row.id) : row.id);
      if (!order.every(id => currentIds.includes(id)) || order.length !== currentIds.length) {
        throw new Error("Invalid or incomplete order array");
      }

      for (let i = 0; i < order.length; i++) {
        await q(
          `UPDATE todos SET order_position = ? WHERE id = ? AND user_id = ?`,
          [i + 1, order[i], userId]
        );
      }

      APP.logger.info(`[TodoRepository.reorderTodos] Order updated for user_id=${userId}`);
    });
  }
}