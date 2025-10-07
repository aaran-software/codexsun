import { Tenant, Credentials, User, DbConnection, JwtPayload } from '../app.types';
import { getTenantDbConnection } from '../../db/db-context-switcher';
import * as jwt from 'jsonwebtoken';

// Retrieve JWT_SECRET from environment (fallback for dev/testing)
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-please-replace';

// Query user from tenant DB
async function queryUser(connection: DbConnection, email: string): Promise<any> {
    const result = await connection.query(
        'SELECT id, email, password_hash, tenant_id, role FROM users WHERE email = ?',
        [email]
    );
    return result.rows[0] || null;
}

export async function authenticateUser(credentials: Credentials, tenant: Tenant): Promise<User> {
    const { email, password } = credentials;

    const connection = await getTenantDbConnection(tenant);
    try {
        const user = await queryUser(connection, email);

        if (!user || user.tenant_id !== tenant.id) {
            throw new Error('Invalid credentials');
        }

        // Temporary plain password comparison (to be replaced with bcrypt)
        if (password !== user.password_hash) {
            throw new Error('Invalid credentials');
        }

        const payload: JwtPayload = { id: user.id, tenantId: user.tenant_id, role: user.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        return {
            id: user.id,
            tenantId: user.tenant_id,
            role: user.role,
            token,
        };
    } finally {
        await connection.release();
    }
}