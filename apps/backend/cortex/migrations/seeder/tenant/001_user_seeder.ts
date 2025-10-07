// cortex/migrations/seeder/tenant/001_user_seeder.ts

import { query, tenantStorage } from '../../../db/db';

/**
 * Seeds the users table in a tenant database with initial data.
 */
export class UsersSeeder {
    constructor(private readonly dbName: string) {}

    async up(): Promise<void> {
        console.log(`Seeding users table in ${this.dbName}`);
        try {
            const users = [
                {
                    username: 'admin_user',
                    email: 'admin@example.com',
                    password_hash: '$2b$10$examplehash1', // Example bcrypt hash
                    mobile: '1234567890',
                    status: 'active',
                    tenant_id: 'default',
                    role: 'admin',
                },
                {
                    username: 'john_doe',
                    email: 'john.doe@example.com',
                    password_hash: '$2b$10$examplehash2',
                    mobile: '0987654321',
                    status: 'active',
                    tenant_id: 'default',
                    role: 'user',
                },
                {
                    username: 'jane_smith',
                    email: 'jane.smith@example.com',
                    password_hash: '$2b$10$examplehash3',
                    mobile: '5555555555',
                    status: 'inactive',
                    tenant_id: 'default',
                    role: 'user',
                },
            ];

            for (const user of users) {
                await tenantStorage.run(this.dbName, () =>
                    query(
                        `
                        INSERT INTO users (username, email, password_hash, mobile, status, tenant_id, role, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                        `,
                        [
                            user.username,
                            user.email,
                            user.password_hash,
                            user.mobile,
                            user.status,
                            user.tenant_id,
                            user.role,
                        ]
                    )
                );
                console.log(`Seeded user: ${user.username} in ${this.dbName}`);
            }
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error seeding users table in ${this.dbName}: ${error.message}`);
            throw error;
        }
    }

    async down(): Promise<void> {
        console.log(`Rolling back users table seed in ${this.dbName}`);
        try {
            await tenantStorage.run(this.dbName, () =>
                query(`DELETE FROM users WHERE email IN (?, ?, ?)`, [
                    'admin@example.com',
                    'john.doe@example.com',
                    'jane.smith@example.com',
                ])
            );
            console.log(`Rolled back users seed in ${this.dbName}`);
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error rolling back users table seed in ${this.dbName}: ${error.message}`);
            throw error;
        }
    }
}

export default UsersSeeder;