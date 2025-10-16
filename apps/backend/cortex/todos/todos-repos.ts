// cortex/todos/todos-repos.ts

import {query} from '../db/db';
import {Todo} from './todos-model';

export async function createTodo(input: Todo, tenantId: string, userId: string): Promise<Todo> {
    try {
        const result = await query<Todo>(
            `INSERT INTO todos (text, completed, category, due_date, priority, position, user_id, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                input.text,
                input.completed,
                input.category,
                input.due_date,
                input.priority,
                input.position,
                userId
            ],
            tenantId
        );
        console.log("Insert result:", result);
        return {
            id: result.insertId as number,
            ...input,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    } catch (error) {
        console.error("Error in createTodo:", error);
        throw error;
    }
}

export async function getTodos(tenantId: string, userId: string): Promise<Todo[]> {  // Changed from getTodosByUser

    const queryString = `SELECT *
                         FROM todos
                         WHERE user_id = ?
                         ORDER BY created_at DESC`

    // console.log(queryString)


    const result = await query<Todo>(
        queryString,
        [userId],
        tenantId
    );

    return result.rows;
}

export async function getTodoById(id: number, tenantId: string): Promise<Todo | null> {
    const result = await query<Todo>(
        `SELECT id,
                text,
                completed,
                category,
                due_date,
                priority,
                position,
                created_at,
                updated_at,
                user_id
         FROM todos
         WHERE id = ?
           AND user_id = ?`,
        [id, tenantId],
        tenantId
    );

    return result.rows[0] || null;
}

export async function updateTodo(
    id: number,
    updates: Partial<Todo>,
    tenantId: string
): Promise<Todo | null> {
    const updateFields: string[] = [];
    const params: any[] = [];

    if (updates.text !== undefined) {
        updateFields.push('text = ?');
        params.push(updates.text);
    }
    if (updates.completed !== undefined) {
        updateFields.push('completed = ?');
        params.push(updates.completed);
    }
    if (updates.category !== undefined) {
        updateFields.push('category = ?');
        params.push(updates.category);
    }
    if (updates.due_date !== undefined) {
        updateFields.push('due_date = ?');
        params.push(updates.due_date);
    }
    if (updates.priority !== undefined) {
        updateFields.push('priority = ?');
        params.push(updates.priority);
    }
    if (updates.position !== undefined) {
        updateFields.push('position = ?');
        params.push(updates.position);
    }

    if (updateFields.length === 0) {
        throw new Error('No fields provided for update');
    }

    params.push(id, tenantId);

    const updateQuery = `
        UPDATE todos
        SET ${updateFields.join(', ')},
            updated_at = NOW()
        WHERE id = ?
          AND user_id = ?
    `;

    const updateResult = await query<Todo>(updateQuery, params, tenantId);

    if (updateResult.rowCount === 0) {
        return null;
    }

    return getTodoById(id, tenantId);
}

export async function deleteTodo(id: number, tenantId: string): Promise<boolean> {
    const result = await query<Todo>(
        'DELETE FROM todos WHERE id = ? AND user_id = ?',
        [id, tenantId],
        tenantId
    );
    return result.rowCount > 0;
}