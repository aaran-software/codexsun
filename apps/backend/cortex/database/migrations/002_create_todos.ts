import { BaseMigration } from '../../migration/base-migration';

export default class Migration extends BaseMigration {

    async up(): Promise<void> {
        await this.schema.create('todos', (table) => {
            table.id();
            table.string('slug').unique();
            table.string('title');
            table.timestamps();
        });
    }

    async down(): Promise<void> {
        await this.schema.dropTable('todos');
    }
}