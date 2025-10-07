// cortex/migrations/seeder/tenant/001_user_seeder.ts

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
                    slug: 'todo-1',
                    title: 'Complete project documentation',
                },
                {
                    slug: 'todo-2',
                    title: 'Schedule team meeting',
                },
                {
                    slug: 'todo-3',
                    title: 'Review code changes',
                },
                {
                    slug: 'todo-4',
                    title: 'Update database schema',
                },
                {
                    slug: 'todo-5',
                    title: 'Test new feature',
                },
            ];

            for (const todo of todos) {
                await tenantStorage.run(this.dbName, () =>
                    query(
                        `
                            INSERT INTO todos (slug, title, created_at, updated_at)
                            VALUES (?, ?, NOW(), NOW())
                        `,
                        [todo.slug, todo.title]
                    )
                );
                console.log(`Seeded todo: ${todo.title} in ${this.dbName}`);
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