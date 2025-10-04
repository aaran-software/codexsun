import { BaseMigration } from '../../migration/base-migration';

export default class Migration extends BaseMigration {

    async up(): Promise<void> {
        await this.schema.create('tenants', (table) => {
            table.id();
            table.string('tenant').unique();
            table.timestamps();
        });
    }

    async down(): Promise<void> {
        await this.schema.dropTable('tenants');
    }
}