// cortex/migrations/tenant/003_create_contacts.ts

import { BaseMigration } from '../../db/migration/base-migration';

export class CreateContactsMigration extends BaseMigration {
    async up(): Promise<void> {
        await this.schema.create('contacts', (table) => {
            table.id();
            table.string('name').notNull();
            table.string('phone').null();
            table.string('email').null();
            table.string('user_id').null();
            table.timestamps();
        });
        console.log('Created contacts table');
    }

    async down(): Promise<void> {
        await this.schema.dropTable('contacts');
        console.log('Dropped contacts table');
    }
}

export default CreateContactsMigration;
