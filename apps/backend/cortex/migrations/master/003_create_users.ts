// cortex/migrations/master/003_create_users.ts

import {BaseMigration} from '../../db/migration/base-migration';

export class CreateUsersMigration extends BaseMigration {
    async up(): Promise<void> {
        await this.schema.create('users', (table) => {
            table.id();
            table.string('username').notNull();
            table.string('email').unique();
            table.string('password_hash').notNull();
            table.string('mobile').null();
            table.integer('role_id').null();
            table.string('email_verified').null();
            table.string('active').null();
            table.timestamps();

            table.foreignKey('role_id').reference('id').onTable('roles').onDelete('CASCADE').build();
        });
        console.log('Created users table');

        // Create user_sessions table
        await this.schema.create('user_sessions', (table) => {
            table.id();
            table.integer('user_id').notNull();
            table.text('token').notNull();
            table.datetime('expires_at').notNull();
            table.datetime('created_at').notNull();
            table.foreignKey('user_id').reference('id').onTable('users').onDelete('CASCADE').build();
        });

        console.log('Created users session table');

    }

    async down(): Promise<void> {
        await this.schema.dropTable('users');
        console.log('Dropped users table');
    }
}

export default CreateUsersMigration;