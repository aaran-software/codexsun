import { query } from '../../../db/mdb';
import { hashAndCompare } from '../../../core/secret/crypt-service';

export class UsersSeeder {
    private readonly MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

    async up(): Promise<void> {
        console.log('Seeding users table in master DB');
        try {
            const users = [
                {
                    username: 'admin_user',
                    email: 'admin@example.com',
                    password: 'admin123',
                    mobile: '1234567890',
                    role_name: 'admin',
                    active: 'active',
                },
                {
                    username: 'john_doe',
                    email: 'john.doe@example.com',
                    password: 'john123',
                    mobile: '0987654321',
                    role_name: 'user',
                    active: 'active',
                },
                {
                    username: 'jane_smith',
                    email: 'jane.smith@example.com',
                    password: 'jane123',
                    mobile: '5555555555',
                    role_name: 'user',
                    active: 'inactive',
                },
            ];

            for (const user of users) {
                // Get role_id from roles table
                const roleResult = await query<{ id: string }>(
                    `SELECT id FROM roles WHERE name = ?`,
                    [user.role_name],
                    this.MASTER_DB
                );

                if (roleResult.rows.length === 0) {
                    throw new Error(`Role ${user.role_name} not found`);
                }
                const role_id = roleResult.rows[0].id;

                // Hash password using hashAndCompare
                let password_hash: string;
                try {
                    password_hash = await hashAndCompare(user.password) as string;
                } catch (hashError) {
                    throw new Error(`Failed to hash password for user ${user.email}: ${(hashError instanceof Error ? hashError.message : 'Unknown error')}`);
                }

                await query(
                    `
                        INSERT INTO users (username, email, password_hash, mobile, role_id, email_verified, active, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                    `,
                    [
                        user.username,
                        user.email,
                        password_hash,
                        user.mobile,
                        role_id,
                        'verified',
                        user.active,
                    ],
                    this.MASTER_DB
                );
                console.log(`Seeded user: ${user.username}`);
            }
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error seeding users table: ${error.message}`);
            throw error;
        }
    }

    async down(): Promise<void> {
        console.log('Rolling back users table seed');
        try {
            await query(
                `DELETE FROM users WHERE email IN (?, ?, ?)`,
                ['admin@example.com', 'john.doe@example.com', 'jane.smith@example.com'],
                this.MASTER_DB
            );
            console.log('Rolled back users seed');
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error rolling back users table seed: ${error.message}`);
            throw error;
        }
    }
}

export default UsersSeeder;