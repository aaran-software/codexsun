// \cortex\database\001_create_users.ts

import { BaseMigration } from '../../db/migration/base-migration';

export class CreateUsersMigration extends BaseMigration {
    async up(): Promise<void> {
        await this.schema.create('users', (table) => {
            table.id();
            table.string('username');
            table.string('email').unique();
            table.string('password_hash');
            table.string('mobile').null();
            table.string('status').null();
            table.string('tenant_id');
            table.string('role').null();
            table.timestamps();
        });
        console.log('Created users table');
    }

    async down(): Promise<void> {
        await this.schema.dropTable('users');
        console.log('Dropped users table');
    }
}

export default CreateUsersMigration;