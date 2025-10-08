// cortex/migrations/master/002_create_roles.ts

import { BaseMigration } from '../../db/migration/base-migration';

export class CreateRolesMigration extends BaseMigration {
    async up(): Promise<void> {
        await this.schema.create('roles', (table) => {
            table.id();
            table.string('name').unique().notNull();
            table.string('active').null();
            table.timestamps();
        });
        console.log('Created roles table');
    }

    async down(): Promise<void> {
        await this.schema.dropTable('roles');
        console.log('Dropped roles table');
    }
}

export default CreateRolesMigration;