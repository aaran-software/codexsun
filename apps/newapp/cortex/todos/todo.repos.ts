// cortex/todos/todo.repos.ts

import { query, withTransaction } from '../db/db';
import { QueryResult } from '../db/db-types';
import { Todo } from './todo.model';

export async function createTodo(todo: Todo): Promise<QueryResult<Todo>> {
    const { text, completed, category, due_date, priority, tenant_id, position } = todo;
    return query<Todo>(
        'INSERT INTO todos (text, completed, category, due_date, priority, tenant_id, position) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [text, completed ? 1 : 0, category, due_date, priority, tenant_id, position]
    );
}

export async function getTodos(tenantId: string): Promise<Todo[]> {
    const result = await query<any>(
        'SELECT * FROM todos WHERE tenant_id = ? ORDER BY position ASC',
        [tenantId]
    );
    return result.rows.map((r: any) => ({
        ...r,
        completed: !!r.completed,
        due_date: r.due_date,
        created_at: r.created_at
    }));
}

export async function getTodoById(id: number, tenantId: string): Promise<Todo | null> {
    const result = await query<any>(
        'SELECT * FROM todos WHERE id = ? AND tenant_id = ?',
        [id, tenantId]
    );
    const r = result.rows[0];
    return r ? { ...r, completed: !!r.completed } : null;
}

export async function updateTodo(id: number, updates: Partial<Todo>): Promise<QueryResult<Todo>> {
    const { text, completed, category, due_date, priority, position } = updates;
    const updatesStr: string[] = [];
    const params: any[] = [];

    if (text !== undefined) {
        updatesStr.push('text = ?');
        params.push(text);
    }
    if (completed !== undefined) {
        updatesStr.push('completed = ?');
        params.push(completed ? 1 : 0);
    }
    if (category !== undefined) {
        updatesStr.push('category = ?');
        params.push(category);
    }
    if (due_date !== undefined) {
        updatesStr.push('due_date = ?');
        params.push(due_date);
    }
    if (priority !== undefined) {
        updatesStr.push('priority = ?');
        params.push(priority);
    }
    if (position !== undefined) {
        updatesStr.push('position = ?');
        params.push(position);
    }

    if (updatesStr.length === 0) {
        throw new Error('No fields provided for update');
    }

    params.push(id, updates.tenant_id);
    const sql = `UPDATE todos SET ${updatesStr.join(', ')} WHERE id = ? AND tenant_id = ?`;
    return query<Todo>(sql, params);
}

export async function deleteTodo(id: number, tenantId: string): Promise<QueryResult<Todo>> {
    return query<Todo>('DELETE FROM todos WHERE id = ? AND tenant_id = ?', [id, tenantId]);
}

export async function getMaxPosition(tenantId: string): Promise<number> {
    const result = await query<{ max: number | null }>('SELECT MAX(position) as max FROM todos WHERE tenant_id = ?', [tenantId]);
    return result.rows[0]?.max || 0;
}

export async function updatePositions(tenantId: string, positions: { id: number; position: number }[]): Promise<void> {
    await withTransaction(async (client) => {
        for (const { id, position } of positions) {
            await client.query('UPDATE todos SET position = ? WHERE id = ? AND tenant_id = ?', [position, id, tenantId]);
        }
    });
}