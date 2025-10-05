import { Tenant, Credentials, User, DbConnection, JwtPayload } from './tenant/tenant.types';
import { getTenantDbConnection } from './db-context-switcher';

// Mock JWT (replace with actual JWT library like jsonwebtoken in production)
const mockJwtSign = (payload: JwtPayload): string => {
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64').replace(/[^A-Za-z0-9-_]/g, '');
    return `mocked.${encodedPayload}.signature`;
};

// Mock password hashing (replace with actual bcrypt or similar in production)
const mockComparePassword = async (password: string, hashed: string): Promise<boolean> => {
    return password === 'pass123' && hashed === 'hashed_pass123';
};

// Mock DB query for user (replace with actual DB query in production)
const mockUserQuery = async (connection: DbConnection, email: string): Promise<any> => {
    const mockUsers = [
        { id: 'user1', email: 'john@tenant1.com', tenantId: 'tenant1', password: 'hashed_pass123', role: 'admin' },
    ];
    return mockUsers.find(user => user.email === email) || null;
};

export async function authenticateUser(credentials: Credentials, tenant: Tenant): Promise<User> {
    const { email, password } = credentials;

    const connection = await getTenantDbConnection(tenant);
    const user = await mockUserQuery(connection, email);

    if (!user || user.tenantId !== tenant.id) {
        throw new Error('Invalid credentials');
    }

    const isPasswordValid = await mockComparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    const token = mockJwtSign({ id: user.id, tenantId: user.tenantId, role: user.role });

    return {
        id: user.id,
        tenantId: user.tenantId,
        role: user.role,
        token,
    };
}