// cortex/user.ts
import * as bcrypt from 'bcrypt';
import { query, withTransaction } from './db';
import { QueryResult, User } from './types';

const SALT_ROUNDS = 10;

export async function createUser(user: User): Promise<QueryResult<User>> {
    const { username, email, password, tenantId } = user;
    const passwordHash = password ? await bcrypt.hash(password, SALT_ROUNDS) : '';
    return query<User>(
        'INSERT INTO users (username, email, password_hash, tenant_id) VALUES (?, ?, ?, ?)',
        [username, email, passwordHash, tenantId]
    );
}

export async function getUserById(id: number, tenantId: string): Promise<User | null> {
    const result = await query<User>('SELECT * FROM users WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    return result.rows.length > 0 ? result.rows[0] : null;
}

export async function getUserByEmail(email: string, tenantId: string): Promise<User | null> {
    const result = await query<User>('SELECT * FROM users WHERE email = ? AND tenant_id = ?', [email, tenantId]);
    return result.rows.length > 0 ? result.rows[0] : null;
}

export async function updateUser(id: number, user: Partial<User> & { tenantId: string }): Promise<QueryResult<User>> {
    const { username, email, password, tenantId } = user;
    const updates: string[] = [];
    const params: any[] = [];

    if (username) {
        updates.push('username = ?');
        params.push(username);
    }
    if (email) {
        updates.push('email = ?');
        params.push(email);
    }
    if (password) {
        updates.push('password_hash = ?');
        params.push(await bcrypt.hash(password, SALT_ROUNDS));
    }

    if (updates.length === 0) {
        throw new Error('No fields provided for update');
    }

    params.push(id, tenantId);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`;
    return query<User>(sql, params);
}

export async function deleteUser(id: number, tenantId: string): Promise<QueryResult<User>> {
    return query<User>('DELETE FROM users WHERE id = ? AND tenant_id = ?', [id, tenantId]);
}

export async function verifyUserPassword(id: number, password: string, tenantId: string): Promise<boolean> {
    const user = await getUserById(id, tenantId);
    if (!user || !user.password_hash) return false;
    return bcrypt.compare(password, user.password_hash);
}