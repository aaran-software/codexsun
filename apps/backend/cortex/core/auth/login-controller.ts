import { resolveTenant } from '../tenant/tenant-resolver';
import { authenticateUser } from './auth-service';
import { LoginResponse, Credentials } from '../app.types';
import { handleError } from '../error/error-handler';
import {blockJwt, verifyJwt} from '../secret/jwt-service';

/**
 * Handles user login with tenant resolution
 * @param req Request containing user credentials
 * @returns LoginResponse with user and tenant data
 */
export async function login(req: { body: Credentials }): Promise<LoginResponse> {
    let tenant = null;
    try {
        if (!req.body.email || !req.body.password) {
            return Promise.reject(new Error('Email and password are required'));
        }

        tenant = await resolveTenant(req);
        const user = await authenticateUser(req.body, tenant);

        return { user, tenant };
    } catch (error) {
        await handleError(
            error instanceof Error ? error : new Error('Authentication failed'),
            tenant?.id ?? 'unknown',
            'v1'
        );
        throw error;
    }
}

/**
 * Logs out user by blocking their token via jwt-service
 * @param token JWT token to block
 */
export async function logout(token: string): Promise<void> {
    if (!token) {
        throw new Error('Token required');
    }
    await blockJwt(token);
}

/**
 * Checks if token is valid using jwt-service
 * @param token JWT token to check
 * @returns Boolean indicating if token is valid
 */
export async function isTokenValid(token: string): Promise<boolean> {
    try {
        await verifyJwt(token);
        return true;
    } catch {
        return false;
    }
}