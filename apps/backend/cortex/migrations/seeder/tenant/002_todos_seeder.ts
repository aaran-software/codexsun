// cortex/migrations/seeder/tenant/002_todos_seeder.ts

import { query, tenantStorage } from '../../../db/db';

/**
 * Seeds the todos table in a tenant database with initial data.
 */
export class TodosSeeder {
    constructor(private readonly dbName: string) {}

    async up(): Promise<void> {
        console.log(`Seeding todos table in ${this.dbName}`);
        try {
            const todos = [
                {
                    text: 'Finish project documentation',
                    completed: false,
                    category: 'Work',
                    due_date: '2025-10-15',
                    priority: 'high',
                    tenant_id: 'tenant_001',
                    position: 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    text: 'Buy groceries',
                    completed: false,
                    category: 'Personal',
                    due_date: '2025-10-11',
                    priority: 'medium',
                    tenant_id: 'tenant_001',
                    position: 2,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    text: 'Schedule dentist appointment',
                    completed: true,
                    category: 'Health',
                    due_date: '2025-09-30',
                    priority: 'low',
                    tenant_id: 'tenant_001',
                    position: 3,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ];

            for (const todo of todos) {
                await tenantStorage.run(this.dbName, () =>
                    query(`
                        INSERT INTO todos (text, completed, category, due_date, priority, tenant_id, position, created_at, updated_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                        [
                            todo.text,
                            todo.completed ?? false,
                            todo.category,
                            todo.due_date ?? null,
                            todo.priority ?? 'medium',
                            todo.tenant_id,
                            todo.position ?? null
                        ]
                    )
                );
                console.log(`Seeded todo: ${todo.text} in ${this.dbName}`);
            }
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error seeding todos table in ${this.dbName}: ${error.message}`);
            throw error;
        }
    }

    async down(): Promise<void> {
        console.log(`Rolling back todos table seed in ${this.dbName}`);
        try {
            await tenantStorage.run(this.dbName, () =>
                query(`DELETE FROM todos WHERE slug IN (?, ?, ?, ?, ?)`, [
                    'todo-1',
                    'todo-2',
                    'todo-3',
                    'todo-4',
                    'todo-5',
                ])
            );
            console.log(`Rolled back todos seed in ${this.dbName}`);
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error rolling back todos table seed in ${this.dbName}: ${error.message}`);
            throw error;
        }
    }
}

export default TodosSeeder;