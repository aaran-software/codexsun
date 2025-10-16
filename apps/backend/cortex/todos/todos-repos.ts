// File: cortex/todos/todos-repository.ts
// Description: Repository for todo database operations
import { query } from '../db/db';
import { Todo } from './todos-model';

export class TodoRepository {
    static async getTodos(tenantId: string, userId: string): Promise<Todo[]> {
        const result = await query<Todo>(
            'SELECT * FROM todos WHERE user_id = ? ORDER BY position, created_at',
            [userId],
            tenantId
        );
        return result.rows;
    }

    static async getTodoById(tenantId: string, id: number, userId: string): Promise<Todo | null> {
        const result = await query<Todo>(
            'SELECT * FROM todos WHERE id = ? AND user_id = ?',
            [id, userId],
            tenantId
        );
        return result.rows[0] || null;
    }

    static async createTodo(tenantId: string, todo: Todo): Promise<Todo> {
        const insertResult = await query<Todo>(
            `INSERT INTO todos (text, completed, category, due_date, priority, user_id, created_at, updated_at, position)
             VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)`,
            [
                todo.text,
                todo.completed,
                todo.category,
                todo.due_date,
                todo.priority,
                todo.user_id,
                todo.position || 0
            ],
            tenantId
        );

        // Retrieve the inserted todo using LAST_INSERT_ID()
        const selectResult = await query<Todo>(
            `SELECT * FROM todos WHERE id = LAST_INSERT_ID() AND user_id = ?`,
            [todo.user_id],
            tenantId
        );
        return selectResult.rows[0];
    }

    static async updateTodo(tenantId: string, id: number, todo: Partial<Todo>, userId: string): Promise<Todo | null> {
        const updates: string[] = [];
        const values: any[] = [];

        if (todo.text !== undefined) {
            updates.push('text = ?');
            values.push(todo.text);
        }
        if (todo.completed !== undefined) {
            updates.push('completed = ?');
            values.push(todo.completed);
        }
        if (todo.category !== undefined) {
            updates.push('category = ?');
            values.push(todo.category);
        }
        if (todo.due_date !== undefined) {
            updates.push('due_date = ?');
            values.push(todo.due_date);
        }
        if (todo.priority !== undefined) {
            updates.push('priority = ?');
            values.push(todo.priority);
        }
        if (todo.position !== undefined) {
            updates.push('position = ?');
            values.push(todo.position);
        }

        if (updates.length === 0) {
            return null;
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id, userId);

        // Execute UPDATE
        await query(
            `UPDATE todos SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
            values,
            tenantId
        );

        // Retrieve the updated todo
        const selectResult = await query<Todo>(
            `SELECT * FROM todos WHERE id = ? AND user_id = ?`,
            [id, userId],
            tenantId
        );
        return selectResult.rows[0] || null;
    }

    static async deleteTodo(tenantId: string, id: number, userId: string): Promise<boolean> {
        const result = await query(
            'DELETE FROM todos WHERE id = ? AND user_id = ?',
            [id, userId],
            tenantId
        );
        return result.rowCount > 0;
    }
}