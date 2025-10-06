// \cortex\migrations\002_tenant_users.ts

import { BaseMigration } from '../../db/migration/base-migration';

export class CreateTenantUsersMigration extends BaseMigration {
    async up(): Promise<void> {
        await this.schema.create('tenant_users', (table) => {
            table.id();
            table.string('email', 255).unique().notNull();
            table.string('tenant_id', 50).notNull();
            table.timestamps();

            // Foreign key constraint linking to tenants table
            table.foreignKey('tenant_id').reference('tenant_id').onTable('tenants').withType('VARCHAR(50)').onDelete('CASCADE');
        });
        console.log('Created tenant_users table');
    }

    async down(): Promise<void> {
        await this.schema.dropTable('tenant_users');
        console.log('Dropped tenant_users table');
    }
}

export default CreateTenantUsersMigration;