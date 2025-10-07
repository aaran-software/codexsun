import { Tenant, UserData, StoredUser, DbConnection } from '../app.types';
import { getTenantDbConnection } from '../../db/db-context-switcher';

// Query user from tenant DB by id or email
async function queryUser(connection: DbConnection, id?: string, email?: string): Promise<any> {
    const queryStr = id
        ? 'SELECT id, username AS name, email, tenant_id AS tenantId FROM users WHERE id = ?'
        : 'SELECT id, username AS name, email, tenant_id AS tenantId FROM users WHERE email = ?';
    const param = id || email;
    const result = await connection.query(queryStr, [param]);
    return result.rows[0] || null;
}

// Create user in tenant DB
async function createUserInDb(connection: DbConnection, userData: UserData): Promise<StoredUser> {
    const { name, email, tenantId } = userData;
    const result = await connection.query(
        `INSERT INTO users (id, username, email, tenant_id, created_at, updated_at)
         VALUES (UUID(), ?, ?, ?, NOW(), NOW())`,
        [name, email, tenantId]
    );
    const insertedId = result.insertId || (await queryUser(connection, undefined, email)).id;
    return { id: insertedId, name, email, tenantId };
}

export async function createUser(userData: UserData, tenant: Tenant, apiVersion: string): Promise<StoredUser> {
    const { tenantId } = userData;

    if (tenantId !== tenant.id) {
        throw new Error('Tenant mismatch');
    }

    const connection = await getTenantDbConnection(tenant);
    try {
        const existingUser = await queryUser(connection, undefined, userData.email);

        if (existingUser) {
            throw new Error('User already exists');
        }

        const user = await createUserInDb(connection, userData);
        return user;
    } finally {
        await connection.release();
    }
}

export async function getUser(id: string, tenant: Tenant): Promise<StoredUser> {
    const connection = await getTenantDbConnection(tenant);
    try {
        const user = await queryUser(connection, id);

        if (!user || user.tenantId !== tenant.id) {
            throw new Error('User not found');
        }

        return user;
    } finally {
        await connection.release();
    }
}