// File: cortex/todos/todos-repository.ts
// Description: Repository for todo database operations
import { query, withTransaction } from '../db/db';
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
        return await withTransaction(async (client) => {
            const insertResult = await client.query(
                `INSERT INTO todos (text, completed, category, due_date, priority, user_id, created_at, updated_at, position)
                 VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)`,
                [
                    todo.text,
                    todo.completed ? 1 : 0,
                    todo.category,
                    todo.due_date,
                    todo.priority,
                    todo.user_id,
                    todo.position || 0
                ]
            );

            const insertId = insertResult.insertId;
            if (!insertId) {
                throw new Error('Failed to retrieve inserted todo ID');
            }

            const selectResult = await client.query<Todo>(
                `SELECT * FROM todos WHERE id = ? AND user_id = ?`,
                [insertId, todo.user_id],
                tenantId
            );

            const newTodo = selectResult.rows[0];
            if (!newTodo) {
                throw new Error('Inserted todo not found');
            }
            return {
                ...newTodo,
                completed: !!newTodo.completed
            };
        }, tenantId);
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
            values.push(todo.completed ? 1 : 0);
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

        return await withTransaction(async (client) => {
            await client.query(
                `UPDATE todos SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
                values
            );

            const selectResult = await client.query<Todo>(
                `SELECT * FROM todos WHERE id = ? AND user_id = ?`,
                [id, userId]
            );
            const updatedTodo = selectResult.rows[0] || null;
            if (updatedTodo) {
                updatedTodo.completed = !!updatedTodo.completed;
            }
            return updatedTodo;
        }, tenantId);
    }

    static async deleteTodo(tenantId: string, id: number, userId: string): Promise<boolean> {
        return await withTransaction(async (client) => {
            const result = await client.query(
                'DELETE FROM todos WHERE id = ? AND user_id = ?',
                [id, userId]
            );
            return result.rowCount > 0;
        }, tenantId);
    }

    static async updateTodoOrder(tenantId: string, orderedIds: number[], userId: string): Promise<void> {
        return await withTransaction(async (client) => {
            for (let position = 1; position <= orderedIds.length; position++) {
                const id = orderedIds[position - 1];
                await client.query(
                    'UPDATE todos SET position = ? WHERE id = ? AND user_id = ?',
                    [position, id, userId]
                );
            }
        }, tenantId);
    }
}