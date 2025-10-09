// import { query } from '../db/db';
// import { QueryResult } from '../db/db-types';
// import { User } from './user.model';
//
// export async function createUser(user: User): Promise<QueryResult<User>> {
//     const { username, email, password_hash, mobile, status, role, tenant_id } = user;
//     return query<User>(
//         'INSERT INTO users (username, email, password_hash, mobile, status, role, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
//         [username, email, password_hash, mobile, status, role, tenant_id]
//     );
// }
//
// export async function getUsers(tenantId: string): Promise<User[]> {
//     const result = await query<any>(
//         'SELECT id, username, email, mobile, status, role, tenant_id, created_at FROM users WHERE tenant_id = ? ORDER BY created_at DESC',
//         [tenantId]
//     );
//     return result.rows.map((r: any) => ({
//         id: r.id,
//         username: r.username,
//         email: r.email,
//         mobile: r.mobile || null,
//         status: r.status,
//         role: r.role,
//         tenant_id: r.tenant_id,
//         created_at: r.created_at,
//     }));
// }
//
// export async function getUserById(id: number, tenantId: string): Promise<User | null> {
//     const result = await query<any>(
//         'SELECT id, username, email, mobile, status, role, tenant_id, created_at FROM users WHERE id = ? AND tenant_id = ?',
//         [id, tenantId]
//     );
//     const r = result.rows[0];
//     return r ? { id: r.id, username: r.username, email: r.email, mobile: r.mobile || null, status: r.status, role: r.role, tenant_id: r.tenant_id, created_at: r.created_at } : null;
// }
//
// export async function getUserByEmail(email: string, tenantId: string): Promise<User | null> {
//     const result = await query<any>(
//         'SELECT id, username, email, mobile, status, role, tenant_id, created_at FROM users WHERE email = ? AND tenant_id = ?',
//         [email, tenantId]
//     );
//     const r = result.rows[0];
//     return r ? { id: r.id, username: r.username, email: r.email, mobile: r.mobile || null, status: r.status, role: r.role, tenant_id: r.tenant_id, created_at: r.created_at } : null;
// }
//
// export async function updateUser(id: number, updates: Partial<User>, tenantId: string): Promise<QueryResult<User>> {
//     const { username, email, password_hash, mobile, status, role } = updates;
//     const updatesStr: string[] = [];
//     const params: any[] = [];
//
//     if (username !== undefined) {
//         updatesStr.push('username = ?');
//         params.push(username);
//     }
//     if (email !== undefined) {
//         updatesStr.push('email = ?');
//         params.push(email);
//     }
//     if (password_hash !== undefined) {
//         updatesStr.push('password_hash = ?');
//         params.push(password_hash);
//     }
//     if (mobile !== undefined) {
//         updatesStr.push('mobile = ?');
//         params.push(mobile);
//     }
//     if (status !== undefined) {
//         updatesStr.push('status = ?');
//         params.push(status);
//     }
//     if (role !== undefined) {
//         updatesStr.push('role = ?');
//         params.push(role);
//     }
//
//     if (updatesStr.length === 0) {
//         throw new Error('No fields provided for update');
//     }
//
//     params.push(id, tenantId);
//     const sql = `UPDATE users SET ${updatesStr.join(', ')} WHERE id = ? AND tenant_id = ?`;
//     return query<User>(sql, params);
// }
//
// export async function deleteUser(id: number, tenantId: string): Promise<QueryResult<User>> {
//     return query<User>('DELETE FROM users WHERE id = ? AND tenant_id = ?', [id, tenantId]);
// }