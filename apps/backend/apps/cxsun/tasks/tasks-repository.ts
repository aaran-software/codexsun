// File: cortex/tasks/tasks-repository.ts
// Description: Repository for task database operations
import { query, withTransaction } from '../db/db';
import { Task } from './tasks-model';

export class TaskRepository {
    static async getTasks(tenantId: string, userId: string): Promise<Task[]> {
        const result = await query<Task>(
            'SELECT * FROM tasks WHERE created_by = ? OR assigned_to = ? ORDER BY position, created_at',
            [userId, userId],
            tenantId
        );
        return result.rows;
    }

    static async getTaskById(tenantId: string, id: number, userId: string): Promise<Task | null> {
        const result = await query<Task>(
            'SELECT * FROM tasks WHERE id = ? AND (created_by = ? OR assigned_to = ?)',
            [id, userId, userId],
            tenantId
        );
        return result.rows[0] || null;
    }

    static async createTask(tenantId: string, task: Task): Promise<Task> {
        return await withTransaction(async (client) => {
            const insertResult = await client.query(
                `INSERT INTO tasks (description, status, priority, due_date, created_by, assigned_to, customer_id, completed_at, created_at, updated_at, position)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)`,
                [
                    task.description,
                    task.status,
                    task.priority,
                    task.due_date,
                    task.created_by,
                    task.assigned_to,
                    task.customer_id,
                    task.completed_at,
                    task.position || 0
                ]
            );

            const insertId = insertResult.insertId;
            if (!insertId) {
                throw new Error('Failed to retrieve inserted task ID');
            }

            const selectResult = await client.query<Task>(
                `SELECT * FROM tasks WHERE id = ? AND (created_by = ? OR assigned_to = ?)`,
                [insertId, task.created_by, task.assigned_to],
                tenantId
            );

            const newTask = selectResult.rows[0];
            if (!newTask) {
                throw new Error('Inserted task not found');
            }
            return newTask;
        }, tenantId);
    }

    static async updateTask(tenantId: string, id: number, task: Partial<Task>, userId: string): Promise<Task | null> {
        const updates: string[] = [];
        const values: any[] = [];

        if (task.description !== undefined) {
            updates.push('description = ?');
            values.push(task.description);
        }
        if (task.status !== undefined) {
            updates.push('status = ?');
            values.push(task.status);
        }
        if (task.priority !== undefined) {
            updates.push('priority = ?');
            values.push(task.priority);
        }
        if (task.due_date !== undefined) {
            updates.push('due_date = ?');
            values.push(task.due_date);
        }
        if (task.assigned_to !== undefined) {
            updates.push('assigned_to = ?');
            values.push(task.assigned_to);
        }
        if (task.customer_id !== undefined) {
            updates.push('customer_id = ?');
            values.push(task.customer_id);
        }
        if (task.completed_at !== undefined) {
            updates.push('completed_at = ?');
            values.push(task.completed_at);
        }
        if (task.position !== undefined) {
            updates.push('position = ?');
            values.push(task.position);
        }

        if (updates.length === 0) {
            return null;
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id, userId, userId);

        return await withTransaction(async (client) => {
            await client.query(
                `UPDATE tasks SET ${updates.join(', ')} WHERE id = ? AND (created_by = ? OR assigned_to = ?)`,
                values
            );

            const selectResult = await client.query<Task>(
                `SELECT * FROM tasks WHERE id = ? AND (created_by = ? OR assigned_to = ?)`,
                [id, userId, userId]
            );
            return selectResult.rows[0] || null;
        }, tenantId);
    }

    static async deleteTask(tenantId: string, id: number, userId: string): Promise<boolean> {
        return await withTransaction(async (client) => {
            const result = await client.query(
                'DELETE FROM tasks WHERE id = ? AND (created_by = ? OR assigned_to = ?)',
                [id, userId, userId]
            );
            return result.rowCount > 0;
        }, tenantId);
    }

    static async updateTaskOrder(tenantId: string, orderedIds: number[], userId: string): Promise<void> {
        return await withTransaction(async (client) => {
            for (let position = 1; position <= orderedIds.length; position++) {
                const id = orderedIds[position - 1];
                await client.query(
                    'UPDATE tasks SET position = ? WHERE id = ? AND (created_by = ? OR assigned_to = ?)',
                    [position, id, userId, userId]
                );
            }
        }, tenantId);
    }
}