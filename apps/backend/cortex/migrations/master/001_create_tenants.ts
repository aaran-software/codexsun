// \cortex\migrations\001_create_tenants.ts

import { BaseMigration } from '../../db/migration/base-migration';

export class CreateTenantsMigration extends BaseMigration {
    async up(): Promise<void> {
        await this.schema.create('tenants', (table) => {
            table.id();
            table.string('tenant_id').unique().notNull();
            table.string('db_host');
            table.string('db_port');
            table.string('db_user');
            table.string('db_pass').null();
            table.string('db_name');
            table.string('db_ssl').null();
            table.timestamps();
        });
        console.log('Created tenants table');
    }

    async down(): Promise<void> {
        await this.schema.dropTable('tenants');
        console.log('Dropped tenants table');
    }
}

export default CreateTenantsMigration;