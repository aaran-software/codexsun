import { resolveTenant } from '../tenant/tenant-resolver';
import { authenticateUser } from './auth-service';
import { LoginResponse, Credentials } from '../app.types';
import { handleError } from '../error/error-handler';

// In-memory token blacklist (replace with Redis in production)
const tokenBlacklist = new Set<string>();

export async function login(req: { body: Credentials }): Promise<LoginResponse> {
    try {
        const tenant = await resolveTenant(req);
        const user = await authenticateUser(req.body, tenant);
        return { user, tenant };
    } catch (error) {
        await handleError(error instanceof Error ? error : new Error('Unknown error'), undefined);
        throw error;
    }
}

export async function logout(token: string): Promise<void> {
    if (!token) {
        throw new Error('No token provided');
    }
    tokenBlacklist.add(token);
}