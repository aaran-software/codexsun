import { Credentials, User, Tenant } from '../app.types';
import { query } from '../../db/db';
import { generateJwt } from '../secret/jwt-service';
import { hashAndCompare } from '../secret/crypt-service';
import { logQuery } from '../../config/logger';
import { getDbConfig } from '../../config/db-config';

export async function authenticateUser(credentials: Credentials, tenant: Tenant): Promise<User> {
    const { email, password } = credentials;
    const dbConfig = getDbConfig();

    try {
        // Query users in master_db
        const start = Date.now();
        const result = await query<{
            id: string;
            email: string;
            role_id: string;
            role_name: string;
            password_hash: string;
        }>(
            `SELECT u.id, u.email, u.role_id, r.name as role_name, u.password_hash
             FROM users u
                      INNER JOIN roles r ON u.role_id = r.id
             WHERE u.email = ?`,
            [email],
            dbConfig.database // Use master_db
        );
        logQuery('end', {
            sql: 'SELECT u.id, u.email, u.role_id, r.name, u.password_hash FROM users ...',
            params: [email],
            db: dbConfig.database,
            duration: Date.now() - start,
        });

        const user = result.rows[0];
        if (!user) {
            throw new Error('Invalid credentials: User not found');
        }

        // Verify role exists
        if (!user.role_name) {
            throw new Error('Invalid user configuration: Role not found');
        }

        // Verify password using hashAndCompare
        const isValid = await hashAndCompare(password, user.password_hash) as boolean;
        if (!isValid) {
            throw new Error('Invalid credentials: Incorrect password');
        }

        // Generate JWT with tenant.id from resolved tenant
        const token = await generateJwt({
            id: user.id,
            tenantId: tenant.id,
            role: user.role_name,
        });

        return {
            id: user.id,
            tenantId: tenant.id,
            role: user.role_name,
            token,
        };
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown authentication error';
        logQuery('error', {
            sql: 'SELECT u.id, u.email, u.role_id, r.name, u.password_hash FROM users ...',
            params: [email],
            db: dbConfig.database || 'unknown',
            error: errMsg,
        });
        throw new Error(`Authentication failed for ${email}: ${errMsg}`);
    }
}