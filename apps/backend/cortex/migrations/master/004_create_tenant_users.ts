// cortex/migrations/master/004_create_tenant_users.ts

import { BaseMigration } from '../../db/migration/base-migration';

export class CreateTenantUsersMigration extends BaseMigration {
    async up(): Promise<void> {
        await this.schema.create('tenant_users', (table) => {
            table.id();
            table.string('user_id', 255).unique().notNull();
            table.string('tenant_id', 50).notNull();
            table.foreignKey('tenant_id').reference('tenant_id').onTable('tenants').onDelete('CASCADE').build();
            table.foreignKey('user_id').reference('id').onTable('users').onDelete('CASCADE').build();
            table.timestamps();
        });
        console.log('Created tenant_users table');
    }

    async down(): Promise<void> {
        await this.schema.dropTable('tenant_users');
        console.log('Dropped tenant_users table');
    }
}

export default CreateTenantUsersMigration;