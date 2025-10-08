import { query } from '../../../db/mdb';
import { generateJwt } from '../../../core/secret/jwt-service';

export class UserSessionsSeeder {
    private readonly MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

    async up(): Promise<void> {
        console.log('Seeding user_sessions table');
        try {
            const users = [
                { email: 'admin@example.com', tenant_id: 'default', role: 'admin' },
                { email: 'john.doe@example.com', tenant_id: 'default', role: 'user' },
            ];

            for (const user of users) {
                // Get user_id from users table
                const userResult = await query<{ id: string }>(
                    `SELECT id FROM users WHERE email = ?`,
                    [user.email],
                    this.MASTER_DB
                );
                if (userResult.rows.length === 0) {
                    throw new Error(`User with email ${user.email} not found`);
                }
                const user_id = userResult.rows[0].id;

                // Generate JWT (stores in user_sessions automatically)
                const token = await generateJwt({
                    id: user_id,
                    tenantId: user.tenant_id,
                    role: user.role,
                });

                console.log(`Seeded user_session for user: ${user.email}`);
            }
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error seeding user_sessions table: ${error.message}`);
            throw error;
        }
    }

    async down(): Promise<void> {
        console.log('Rolling back user_sessions table seed');
        try {
            await query(
                `DELETE FROM user_sessions WHERE user_id IN (
                    SELECT id FROM users WHERE email IN (?, ?)
                )`,
                ['admin@example.com', 'john.doe@example.com'],
                this.MASTER_DB
            );
            console.log('Rolled back user_sessions seed');
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error rolling back user_sessions table seed: ${error.message}`);
            throw error;
        }
    }
}

export default UserSessionsSeeder;