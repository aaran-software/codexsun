import {Credentials, JwtPayload, Tenant, User} from '../app.types';
import {query} from '../../db/db';
import {blockJwt, generateJwt, verifyJwt} from '../secret/jwt-service';
import {comparePassword} from '../secret/crypt-service';
import {logQuery} from '../../config/logger';
import {getMasterDbConfig} from '../../config/db-config';
import {resolveTenant} from "../tenant/tenant-resolver";

export async function authenticateUser(credentials: Credentials): Promise<{ user: User, tenant: Tenant }> {
    const {email, password} = credentials;
    const dbConfig = getMasterDbConfig();

    try {
        // Query users in master_db
        const start = Date.now();
        const result = await query<{
            id: string;
            username: string;
            email: string;
            role_id: string;
            role_name: string;
            password_hash: string;
        }>(
            `SELECT u.id, u.username, u.email, u.role_id, r.name as role_name, u.password_hash
             FROM users u
                      INNER JOIN roles r ON u.role_id = r.id
             WHERE u.email = ?`,
            [email],
            dbConfig.database // Use master_db
        );

        logQuery('end', {
            sql: 'SELECT u.id, u.username, u.email, u.role_id, r.name, u.password_hash FROM users ...',
            params: ['[REDACTED]'], // Avoid logging sensitive data
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
        const isValid = await comparePassword(password, user.password_hash) as boolean;
        if (!isValid) {
            throw new Error('Invalid credentials: Incorrect password');
        }

        // Resolve tenant
        const tenant = await resolveTenant({body: {email, password}});

        // Generate JWT
        const token = await generateJwt({
            id: user.id,
            tenantId: tenant.id,
            role: user.role_name,
        });

        const userData: User = {
            id: user.id,
            username: user.username,
            email: user.email,
            tenantId: tenant.id,
            role: user.role_name,
            token,
        };

        return {user: userData, tenant};

    } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown authentication error';
        logQuery('error', {
            sql: 'SELECT u.id, u.username, u.email, u.role_id, r.name, u.password_hash FROM users ...',
            params: ['[REDACTED]'], // Avoid logging sensitive data
            db: dbConfig.database || 'unknown',
            error: errMsg,
        });
        throw new Error(`Authentication failed for ${email}: ${errMsg}`);
    }
}

export async function logoutUser(token: string): Promise<void> {
    try {
        // Block the token by setting expires_at to NOW()
        await blockJwt(token);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown logout error';
        logQuery('error', {
            sql: 'UPDATE user_sessions SET expires_at = NOW() WHERE token = ?',
            params: ['[REDACTED]'],
            db: 'master_db',
            error: errMsg,
        });
        throw new Error(`Logout failed: ${errMsg}`);
    }
}

export async function verifyUserToken(token: string): Promise<JwtPayload> {
    try {
        return await verifyJwt(token);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown token verification error';
        logQuery('error', {
            sql: 'SELECT expires_at, token FROM user_sessions WHERE user_id = ? AND token = ?',
            params: ['[REDACTED]'],
            db: 'master_db',
            error: errMsg,
        });
        throw new Error(`Token verification failed: ${errMsg}`);
    }
}