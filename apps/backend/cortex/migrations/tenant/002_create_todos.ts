// cortex/migrations/tenant/002_create_todos.ts

import { BaseMigration } from '../../db/migration/base-migration';

export class CreateTodosMigration extends BaseMigration {
    async up(): Promise<void> {
        await this.schema.create('todos', (table) => {
            table.id();
            table.string('text').notNull();
            table.boolean('completed').default(false);
            table.string('category').notNull();
            table.string('due_date').null();
            table.string('priority').default('low');
            table.string('user_id').notNull();
            table.integer('position').null();
            table.timestamps();
        });
        console.log('Created todos table');
    }

    async down(): Promise<void> {
        await this.schema.dropTable('todos');
        console.log('Dropped todos table');
    }
}

export default CreateTodosMigration;
