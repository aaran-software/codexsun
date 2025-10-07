import { resolveTenant } from '../tenant/tenant-resolver';
import { authenticateUser } from './auth-service';
import { LoginResponse, Credentials } from '../app.types';
import { handleError } from '../error/error-handler';
import * as jwt from 'jsonwebtoken';

// In-memory token blacklist (use Redis in production)
const tokenBlacklist = new Set<string>();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-please-replace';

/**
 * Handles user login with tenant resolution and token validation
 * @param req Request containing user credentials
 * @returns LoginResponse with user and tenant data
 */
export async function login(req: { body: Credentials }): Promise<LoginResponse> {
    try {
        if (!req.body.email || !req.body.password) {
            throw new Error('Email and password are required');
        }

        const tenant = await resolveTenant(req);
        const user = await authenticateUser(req.body, tenant);

        // Validate JWT token
        const decoded = jwt.verify(user.token, JWT_SECRET) as jwt.JwtPayload;
        if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
            throw new Error('Token expired');
        }
        if (tokenBlacklist.has(user.token)) {
            throw new Error('Token blacklisted');
        }

        return { user, tenant };
    } catch (error) {
        await handleError(error instanceof Error ? error : new Error('Authentication failed'));
        throw error;
    }
}

/**
 * Logs out user by blacklisting their token
 * @param token JWT token to blacklist
 */
export async function logout(token: string): Promise<void> {
    if (!token) {
        throw new Error('Token required');
    }
    tokenBlacklist.add(token);
}

/**
 * Checks if token is blacklisted
 * @param token JWT token to check
 * @returns Boolean indicating if token is blacklisted
 */
export function isTokenBlacklisted(token: string): boolean {
    return tokenBlacklist.has(token);
}