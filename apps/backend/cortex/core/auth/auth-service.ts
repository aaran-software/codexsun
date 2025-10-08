import { Credentials, User, Tenant, DbConnection } from '../app.types';
import { getTenantDbConnection } from '../../db/db-context-switcher';
import { generateJwt } from '../secret/jwt-service';
import { hashAndCompare } from '../secret/crypt-service';
import { logQuery } from '../../config/logger';

export async function authenticateUser(credentials: Credentials, tenant: Tenant): Promise<User> {
    const { email, password } = credentials;

    let connection: DbConnection | null = null;
    try {
        // Establish tenant-specific database connection
        connection = await getTenantDbConnection(tenant);

        // Query user with password_hash and role
        const start = Date.now();
        const result = await connection.query<{
            id: string;
            email: string;
            tenant_id: string;
            role_id: string;
            role_name: string;
            password_hash: string;
        }>(
            `SELECT u.id, u.email, u.tenant_id, u.role_id, r.name as role_name, u.password_hash
             FROM users u
                      INNER JOIN roles r ON u.role_id = r.id
             WHERE u.email = ? AND u.tenant_id = ?`,
            [email, tenant.id]
        );
        logQuery('end', {
            sql: 'SELECT u.id, u.email, u.tenant_id, u.role_id, r.name, u.password_hash FROM users ...',
            params: [email, tenant.id],
            db: connection.database,
            duration: Date.now() - start,
        });

        const user = result.rows[0];
        if (!user) {
            throw new Error('Invalid credentials: User not found or tenant mismatch');
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

        // Generate JWT
        const token = await generateJwt({
            id: user.id,
            tenantId: user.tenant_id,
            role: user.role_name,
        });

        return {
            id: user.id,
            tenantId: user.tenant_id,
            role: user.role_name,
            token,
        };
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown authentication error';
        logQuery('error', {
            sql: 'SELECT u.id, u.email, u.tenant_id, u.role_id, r.name, u.password_hash FROM users ...',
            params: [email, tenant.id],
            db: connection?.database || 'unknown',
            error: errMsg,
        });
        throw new Error(`Authentication failed for ${email}: ${errMsg}`);
    } finally {
        if (connection) {
            await connection.release();
        }
    }
}