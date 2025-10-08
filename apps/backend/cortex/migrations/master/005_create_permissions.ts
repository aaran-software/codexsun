// cortex/migrations/master/005_create_permissions.ts

import { BaseMigration } from '../../db/migration/base-migration';

export class CreateUsersMigration extends BaseMigration {
    async up(): Promise<void> {
        await this.schema.create('permissions', (table) => {
            table.id();
            table.string('name').unique().notNull();
            table.integer('tenant_id').notNull();
            table.integer('user_id').notNull();
            table.integer('role_id').notNull();
            table.string('active').null();
            table.timestamps();
        });
        console.log('Created permissions table');
    }

    async down(): Promise<void> {
        await this.schema.dropTable('permissions');
        console.log('Dropped permissions table');
    }
}

export default CreateUsersMigration;