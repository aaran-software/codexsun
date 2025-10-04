import { BaseMigration } from '../../migration/base-migration';

export default class Migration extends BaseMigration {

    async up(): Promise<void> {
        await this.schema.create('users', (table) => {
            table.id();
            table.string('username');
            table.string('email').unique();
            table.string('password_hash');
            table.string('mobile');
            table.string('status');
            table.string('tenant_id');
            table.string('role');
            table.timestamps();
        });
    }

    async down(): Promise<void> {
        await this.schema.dropTable('users');
    }
}