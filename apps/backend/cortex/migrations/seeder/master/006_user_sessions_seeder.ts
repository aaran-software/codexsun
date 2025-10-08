import { query } from '../../../db/mdb';
import { generateJwt } from '../../../core/secret/jwt-service';

export class UserSessionsSeeder {
    private readonly MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

    private async getUserId(email: string): Promise<string> {
        const result = await query<{ id: string }>(
            `SELECT id FROM users WHERE email = ?`,
            [email],
            this.MASTER_DB
        );
        if (result.rows.length === 0) {
            throw new Error(`User with email ${email} not found`);
        }
        return result.rows[0].id;
    }

    private async sessionExists(userId: string): Promise<boolean> {
        const result = await query<{ user_id: string }>(
            `SELECT user_id FROM user_sessions WHERE user_id = ?`,
            [userId],
            this.MASTER_DB
        );
        return result.rows.length > 0;
    }

    private async insertUserSession(userId: string, tenantId: string, role: string): Promise<void> {
        await generateJwt({
            id: userId,
            tenantId: tenantId,
            role: role,
        });
        console.log(`Seeded user_session for user: ${userId}`);
    }

    async up(): Promise<void> {
        console.log('Seeding user_sessions table');
        try {
            const users = [
                { email: 'admin@example.com', tenant_id: 'default', role: 'admin' },
                { email: 'john.doe@example.com', tenant_id: 'default', role: 'user' },
            ];

            for (const user of users) {
                const userId = await this.getUserId(user.email);
                if (await this.sessionExists(userId)) {
                    console.log(`Session for user ${user.email} already exists, skipping insertion`);
                    continue;
                }
                await this.insertUserSession(userId, user.tenant_id, user.role);
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