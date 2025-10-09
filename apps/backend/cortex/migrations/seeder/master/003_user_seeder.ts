import { query } from '../../../db/mdb';
import { generateHash } from '../../../core/secret/crypt-service';

export class UsersSeeder {
    private readonly MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

    // Check if a user exists by email
    private async userExists(email: string): Promise<boolean> {
        const result = await query<{ email: string }>(
            `SELECT email FROM users WHERE email = ?`,
            [email],
            this.MASTER_DB
        );
        return result.rows.length > 0;
    }

    // Get role_id by role name
    private async getRoleId(roleName: string): Promise<string> {
        const result = await query<{ id: string }>(
            `SELECT id FROM roles WHERE name = ?`,
            [roleName],
            this.MASTER_DB
        );
        if (result.rows.length === 0) {
            throw new Error(`Role ${roleName} not found`);
        }
        return result.rows[0].id;
    }

    // Insert a user
    private async insertUser(
        username: string,
        email: string,
        password: string,
        mobile: string,
        roleId: string,
        status: string
    ): Promise<void> {
        const passwordHash = await generateHash(password);
        await query(
            `INSERT INTO users (username, email, password_hash, mobile, role_id, email_verified, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [username, email, passwordHash, mobile, roleId, 'verified', status],
            this.MASTER_DB
        );
        console.log(`Seeded user: ${username}`);
    }

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
                    status: 'active',
                },
                {
                    username: 'john_doe',
                    email: 'john.doe@example.com',
                    password: 'john123',
                    mobile: '0987654321',
                    role_name: 'user',
                    status: 'active',
                },
                {
                    username: 'jane_smith',
                    email: 'jane.smith@example.com',
                    password: 'jane123',
                    mobile: '5555555555',
                    role_name: 'user',
                    status: 'inactive',
                },
            ];

            for (const user of users) {
                if (await this.userExists(user.email)) {
                    console.log(`User with email ${user.email} already exists, skipping insertion`);
                    continue;
                }
                const roleId = await this.getRoleId(user.role_name);
                await this.insertUser(
                    user.username,
                    user.email,
                    user.password,
                    user.mobile,
                    roleId,
                    user.status
                );
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