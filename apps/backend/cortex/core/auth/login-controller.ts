import { resolveTenant } from '../tenant/tenant-resolver';
import { authenticateUser } from './auth-service';
import { LoginResponse, Credentials } from '../app.types';
import { handleError } from '../error/error-handler';
import * as jwt from 'jsonwebtoken';

// In-memory token blacklist (replace with Redis in production)
const tokenBlacklist = new Set<string>();

export async function login(req: { body: Credentials }): Promise<LoginResponse> {
    try {
        const tenant = await resolveTenant(req);
        const user = await authenticateUser(req.body, tenant);
        const decoded = jwt.verify(user.token, process.env.APP_KEY || 'default-secret-please-replace') as jwt.JwtPayload;

        // Check if token is expired or blacklisted
        if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
            throw new Error('Token is expired');
        }
        if (tokenBlacklist.has(user.token)) {
            throw new Error('Token is blacklisted');
        }

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

export function isTokenBlacklisted(token: string): boolean {
    return tokenBlacklist.has(token);
}