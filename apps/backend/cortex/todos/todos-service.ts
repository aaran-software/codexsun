// import * as to from './todos.repos';
// import { query } from '../db/mdb';
// import { User } from './user.model';
// import { comparePassword, generateHash } from '../core/secret/crypt-service';
//
// export async function createUserService(user: Omit<User, 'id' | 'created_at' | 'updated_at' | 'password_hash'> & { password: string, tenant_id: string }): Promise<User> {
//     const password_hash = await generateHash(user.password);
//     const fullUser: User = {
//         ...user,
//         password_hash,
//         status: user.status || 'active',
//         role_id: user.role_id || 1, // Default to role_id 1 (e.g., 'user' role)
//         mobile: user.mobile || null,
//         email_verified: user.email_verified || null,
//     };
//     delete (fullUser as any).password; // Remove plain password
//     delete (fullUser as any).tenant_id; // Remove tenant_id as it's not in User model
//     const result = await userRepo.createUser(fullUser);
//     // Associate user with tenant in tenant_users table
//     await query(
//         'INSERT INTO tenant_users (user_id, tenant_id) VALUES (?, ?)',
//         [result.insertId, user.tenant_id]
//     );
//     const created = await userRepo.getUserById(result.insertId!, user.tenant_id);
//     if (!created) throw new Error('User creation failed');
//     return created;
// }
//
// export async function getUsersService(tenantId: string): Promise<User[]> {
//     return userRepo.getUsers(tenantId);
// }
//
// export async function getUserByIdService(id: number, tenantId: string): Promise<User | null> {
//     return userRepo.getUserById(id, tenantId);
// }
//
// export async function getUserByEmailService(email: string, tenantId: string): Promise<User | null> {
//     return userRepo.getUserByEmail(email, tenantId);
// }
//
// export async function updateUserService(id: number, updates: Partial<User> & { password?: string }, tenantId: string): Promise<User | null> {
//     if (updates.password) {
//         updates.password_hash = await generateHash(updates.password);
//         delete updates.password;
//     }
//     const result = await userRepo.updateUser(id, updates, tenantId);
//     if (result.rowCount === 0) return null;
//     return userRepo.getUserById(id, tenantId);
// }
//
// export async function deleteUserService(id: number, tenantId: string): Promise<boolean> {
//     const result = await userRepo.deleteUser(id, tenantId);
//     return result.rowCount > 0;
// }