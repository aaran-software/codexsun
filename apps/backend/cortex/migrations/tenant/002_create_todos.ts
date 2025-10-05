// E:\Workspace\codexsun\apps\backend\cortex\migrations\002_create_todos.ts

import { BaseMigration } from '../../db/migration/base-migration';

export class CreateTodosMigration extends BaseMigration {
    async up(): Promise<void> {
        await this.schema.create('todos', (table) => {
            table.id();
            table.string('slug').unique();
            table.string('title');
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