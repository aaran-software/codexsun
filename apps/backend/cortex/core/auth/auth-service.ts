import { Credentials, User } from '../app.types';
import { query } from '../../db/db';
import { generateJwt } from '../secret/jwt-service';
import { decodePassword } from '../secret/crypt-service';

export async function authenticateUser(credentials: Credentials): Promise<User> {
    const { email, password } = credentials;

    try {
        const result = await query<{
            id: string;
            email: string;
            tenant_id: string;
            role_id: string;
            role_name: string;
        }>(
            `SELECT u.id, u.email, u.tenant_id, u.role_id, r.name as role_name
             FROM users u
                      LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.email = ?`,
            [email]
        );

        const user = result.rows[0];
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password using crypt-service
        const isValid = await decodePassword(password, email);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        const token = await generateJwt({
            id: user.id,
            tenantId: user.tenant_id,
            role: user.role_name || 'viewer'
        });

        return {
            id: user.id,
            tenantId: user.tenant_id,
            role: user.role_name || 'viewer',
            token
        };
    } catch (error) {
        throw error instanceof Error ? error : new Error('Authentication failed');
    }
}