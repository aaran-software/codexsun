// cortex/migrations/master/006_create_users_sessions_table.ts

import {BaseMigration} from '../../db/migration/base-migration';

export class CreateUserSessionsTable extends BaseMigration {
    async up(): Promise<void> {

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
        await this.schema.dropTable('user_sessions');
        console.log('Dropped users table');
    }
}

export default CreateUserSessionsTable;