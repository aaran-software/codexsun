import * as userRepo from './user.repos';
import { User } from './user.model';
import { hashPassword } from '../utils/bcrypt';

export async function createUserService(user: Omit<User, 'id' | 'created_at' | 'password_hash'> & { password: string }): Promise<User> {
    const password_hash = await hashPassword(user.password);
    const fullUser: User = {
        ...user,
        password_hash,
        status: user.status || 'active',
        role: user.role || 'user',
        mobile: user.mobile || null,
    };
    delete (fullUser as any).password; // Remove plain password
    const result = await userRepo.createUser(fullUser);
    const created = await userRepo.getUserById(result.insertId!, user.tenant_id);
    if (!created) throw new Error('User creation failed');
    return created;
}

export async function getUsersService(tenantId: string): Promise<User[]> {
    return userRepo.getUsers(tenantId);
}

export async function getUserByIdService(id: number, tenantId: string): Promise<User | null> {
    return userRepo.getUserById(id, tenantId);
}

export async function getUserByEmailService(email: string, tenantId: string): Promise<User | null> {
    return userRepo.getUserByEmail(email, tenantId);
}

export async function updateUserService(id: number, updates: Partial<User> & { password?: string }, tenantId: string): Promise<User | null> {
    if (updates.password) {
        updates.password_hash = await hashPassword(updates.password);
        delete updates.password;
    }
    updates.tenant_id = tenantId;
    const result = await userRepo.updateUser(id, updates, tenantId);
    if (result.rowCount === 0) return null;
    return userRepo.getUserById(id, tenantId);
}

export async function deleteUserService(id: number, tenantId: string): Promise<boolean> {
    const result = await userRepo.deleteUser(id, tenantId);
    return result.rowCount > 0;
}