// cortex/migrations/seeder/tenant/002_todos_seeder.ts

import { query, withTransaction } from '../../../db/db';

/**
 * Seeds the todos table in a tenant database with initial data.
 */
export class TodosSeeder {
    // Check if a todo exists by text
    private async todoExists(text: string, tenantId: string): Promise<boolean> {
        const result = await query<{ text: string }>(
            `SELECT text FROM todos WHERE text = ? AND tenant_id = ?`,
            [text, tenantId],
            tenantId
        );
        return result.rows.length > 0;
    }

    // Insert a todo
    private async insertTodo(
        text: string,
        completed: boolean,
        category: string,
        due_date: string | null,
        priority: string,
        tenant_id: string,
        position: number | null,
        tenantId: string
    ): Promise<void> {
        await query(
            `
                INSERT INTO todos (text, completed, category, due_date, priority, tenant_id, position, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `,
            [text, completed, category, due_date, priority, tenant_id, position],
            tenantId
        );
        console.log(`Seeded todo: ${text} for tenant '${tenantId}'`);
    }

    async up(tenantId: string = 'default'): Promise<void> {
        console.log(`Seeding todos table for tenant '${tenantId}'`);
        try {
            const todos = [
                {
                    text: 'Finish project documentation',
                    completed: false,
                    category: 'Work',
                    due_date: '2025-10-15',
                    priority: 'high',
                    tenant_id: tenantId,
                    position: 1,
                },
                {
                    text: 'Buy groceries',
                    completed: false,
                    category: 'Personal',
                    due_date: '2025-10-11',
                    priority: 'medium',
                    tenant_id: tenantId,
                    position: 2,
                },
                {
                    text: 'Schedule dentist appointment',
                    completed: true,
                    category: 'Health',
                    due_date: '2025-09-30',
                    priority: 'low',
                    tenant_id: tenantId,
                    position: 3,
                },
            ];

            await withTransaction(async (client) => {
                for (const todo of todos) {
                    if (await this.todoExists(todo.text, tenantId)) {
                        console.log(`Todo '${todo.text}' already exists for tenant '${tenantId}', skipping insertion`);
                        continue;
                    }
                    await this.insertTodo(
                        todo.text,
                        todo.completed,
                        todo.category,
                        todo.due_date,
                        todo.priority,
                        todo.tenant_id,
                        todo.position,
                        tenantId
                    );
                }
            }, tenantId);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error seeding todos table for tenant '${tenantId}': ${error.message}`);
            throw error;
        }
    }

    async down(tenantId: string = 'default'): Promise<void> {
        console.log(`Rolling back todos table seed for tenant '${tenantId}'`);
        try {
            await withTransaction(async (client) => {
                await client.query(
                    `DELETE FROM todos WHERE text IN (?, ?, ?) AND tenant_id = ?`,
                    [
                        'Finish project documentation',
                        'Buy groceries',
                        'Schedule dentist appointment',
                        tenantId,
                    ]
                );
            }, tenantId);
            console.log(`Rolled back todos seed for tenant '${tenantId}'`);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error rolling back todos table seed for tenant '${tenantId}': ${error.message}`);
            throw error;
        }
    }
}

export default TodosSeeder;