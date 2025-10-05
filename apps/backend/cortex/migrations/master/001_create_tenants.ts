// E:\Workspace\codexsun\apps\backend\cortex\database\migrations\001_create_users.ts

import { BaseMigration } from '../../db/migration/base-migration';

export class CreateUsersMigration extends BaseMigration {
    async up(): Promise<void> {
        await this.schema.create('tenants', (table) => {
            table.id();
            table.string('tenant_id');
            table.string('db_host');
            table.string('db_port');
            table.string('db_user');
            table.string('db_pass');
            table.string('db_name');
            table.string('db_ssl');
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