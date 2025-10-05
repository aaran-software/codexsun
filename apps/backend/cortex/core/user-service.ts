import { Tenant, UserData, StoredUser, DbConnection } from './tenant/tenant.types';
import { getTenantDbConnection } from './db-context-switcher';

// Mock DB query for user (replace with actual DB query in production)
const mockUserQuery = async (connection: DbConnection, id?: string, email?: string): Promise<any> => {
    const mockUsers: StoredUser[] = [
        { id: 'user1', name: 'Existing User', email: 'existing@tenant1.com', tenantId: 'tenant1' },
    ];
    if (id) {
        return mockUsers.find(user => user.id === id) || null;
    }
    if (email) {
        return mockUsers.find(user => user.email === email) || null;
    }
    return null;
};

// Mock user creation (replace with actual DB insert in production)
const mockCreateUser = async (connection: DbConnection, userData: UserData): Promise<StoredUser> => {
    const { name, email, tenantId } = userData;
    return { id: 'user1', name, email, tenantId };
};

export async function createUser(userData: UserData, tenant: Tenant): Promise<StoredUser> {
    const { tenantId } = userData;

    if (tenantId !== tenant.id) {
        throw new Error('Tenant mismatch');
    }

    const connection = await getTenantDbConnection(tenant);
    const existingUser = await mockUserQuery(connection, undefined, userData.email);

    if (existingUser) {
        throw new Error('User already exists');
    }

    const user = await mockCreateUser(connection, userData);
    return user;
}

export async function getUser(id: string, tenant: Tenant): Promise<StoredUser> {
    const connection = await getTenantDbConnection(tenant);
    const user = await mockUserQuery(connection, id);

    if (!user || user.tenantId !== tenant.id) {
        throw new Error('User not found');
    }

    return user;
}