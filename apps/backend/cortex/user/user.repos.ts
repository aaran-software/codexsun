import { query } from '../db/mdb';
import { QueryResult } from '../db/db-types';
import { User } from './user.model';

export async function createUser(user: User): Promise<QueryResult<User>> {
    const { username, email, password_hash, mobile, status, role_id, email_verified } = user;
    return query<User>(
        'INSERT INTO users (username, email, password_hash, mobile, status, role_id, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, email, password_hash, mobile, status, role_id, email_verified]
    );
}

export async function getUsers(tenantId: string): Promise<User[]> {
    const result = await query<any>(
        'SELECT u.id, u.username, u.email, u.mobile, u.status, u.role_id, u.email_verified, u.created_at ' +
        'FROM users u ' +
        'JOIN tenant_users tu ON u.id = tu.user_id ' +
        'WHERE tu.tenant_id = ? ORDER BY u.created_at DESC',
        [tenantId]
    );
    return result.rows.map((r: any) => ({
        id: r.id,
        username: r.username,
        email: r.email,
        mobile: r.mobile || null,
        status: r.status,
        role_id: r.role_id,
        email_verified: r.email_verified || null,
        created_at: r.created_at,
    }));
}

export async function getUserById(id: number, tenantId: string): Promise<User | null> {
    const result = await query<any>(
        'SELECT u.id, u.username, u.email, u.mobile, u.status, u.role_id, u.email_verified, u.created_at ' +
        'FROM users u ' +
        'JOIN tenant_users tu ON u.id = tu.user_id ' +
        'WHERE u.id = ? AND tu.tenant_id = ?',
        [id, tenantId]
    );
    const r = result.rows[0];
    return r ? {
        id: r.id,
        username: r.username,
        email: r.email,
        mobile: r.mobile || null,
        status: r.status,
        role_id: r.role_id,
        email_verified: r.email_verified || null,
        created_at: r.created_at
    } : null;
}

export async function getUserByEmail(email: string, tenantId: string): Promise<User | null> {
    const result = await query<any>(
        'SELECT u.id, u.username, u.email, u.mobile, u.status, u.role_id, u.email_verified, u.created_at ' +
        'FROM users u ' +
        'JOIN tenant_users tu ON u.id = tu.user_id ' +
        'WHERE u.email = ? AND tu.tenant_id = ?',
        [email, tenantId]
    );
    const r = result.rows[0];
    return r ? {
        id: r.id,
        username: r.username,
        email: r.email,
        mobile: r.mobile || null,
        status: r.status,
        role_id: r.role_id,
        email_verified: r.email_verified || null,
        created_at: r.created_at
    } : null;
}

export async function updateUser(id: number, updates: Partial<User>, tenantId: string): Promise<QueryResult<User>> {
    const { username, email, password_hash, mobile, status, role_id, email_verified } = updates;
    const updatesStr: string[] = [];
    const params: any[] = [];

    if (username !== undefined) {
        updatesStr.push('username = ?');
        params.push(username);
    }
    if (email !== undefined) {
        updatesStr.push('email = ?');
        params.push(email);
    }
    if (password_hash !== undefined) {
        updatesStr.push('password_hash = ?');
        params.push(password_hash);
    }
    if (mobile !== undefined) {
        updatesStr.push('mobile = ?');
        params.push(mobile);
    }
    if (status !== undefined) {
        updatesStr.push('status = ?');
        params.push(status);
    }
    if (role_id !== undefined) {
        updatesStr.push('role_id = ?');
        params.push(role_id);
    }
    if (email_verified !== undefined) {
        updatesStr.push('email_verified = ?');
        params.push(email_verified);
    }

    if (updatesStr.length === 0) {
        throw new Error('No fields provided for update');
    }

    params.push(id);
    const sql = `UPDATE users u ` +
        `JOIN tenant_users tu ON u.id = tu.user_id ` +
        `SET ${updatesStr.join(', ')} ` +
        `WHERE u.id = ? AND tu.tenant_id = ?`;
    params.push(tenantId);
    return query<User>(sql, params);
}

export async function deleteUser(id: number, tenantId: string): Promise<QueryResult<User>> {
    return query<User>(
        'DELETE u FROM users u ' +
        'JOIN tenant_users tu ON u.id = tu.user_id ' +
        'WHERE u.id = ? AND tu.tenant_id = ?',
        [id, tenantId]
    );
}