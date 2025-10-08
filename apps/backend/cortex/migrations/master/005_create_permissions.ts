import { BaseMigration } from '../../db/migration/base-migration';

export class CreatePermissionsMigration extends BaseMigration {
    async up(): Promise<void> {
        await this.schema.create('permissions', (table) => {
            table.id();
            table.string('name').notNull();
            table.string('tenant_id').notNull();
            table.integer('user_id').notNull();
            table.integer('role_id').notNull();
            table.string('active').null();
            table.timestamps();

            table.foreignKey('tenant_id').reference('tenant_id').onTable('tenants').onDelete('CASCADE').build();
            table.foreignKey('user_id').reference('id').onTable('users').onDelete('CASCADE').build();
            table.foreignKey('role_id').reference('id').onTable('roles').onDelete('CASCADE').build();
        });
        console.log('Created permissions table');
    }

    async down(): Promise<void> {
        await this.schema.dropTable('permissions');
        console.log('Dropped permissions table');
    }
}

export default CreatePermissionsMigration;