// /cortex/core/auth/auth-middleware.ts
import { RequestContext } from '../../routes/middleware';
import { HttpError, handleError } from '../error/error-handler';
import { PermissionCheck, User } from '../app.types';
import { getUserById } from '../../user/user-repos';

export function authMiddleware(ctx: RequestContext) {
    if (!ctx.userId) {
        throw new HttpError('User id not authenticated', 401, 'auth-middleware', 'authMiddleware');
    }
    if (!ctx.tenantId) {
        throw new HttpError('Tenant context required', 400, 'auth-middleware', 'authMiddleware');
    }
}

export function permissionMiddleware(permission: PermissionCheck) {
    return async (ctx: RequestContext): Promise<void> => {
        if (!permission?.requiredRole) {
            throw new HttpError('Permission configuration error', 400, 'auth-middleware', 'permissionMiddleware');
        }
        if (!ctx.userId) {
            throw new HttpError('User id not authenticated', 401, 'auth-middleware', 'permissionMiddleware');
        }

        try {
            const userId = parseInt(ctx.userId, 10);
            if (isNaN(userId)) {
                throw new HttpError('Invalid user ID', 400, 'auth-middleware', 'permissionMiddleware');
            }
            const user = await getUserById(userId, ctx.tenantId);
            if (!user) {
                throw new HttpError('User not found', 404, 'auth-middleware', 'permissionMiddleware');
            }
            if (permission.requiredRole && user.role_name !== permission.requiredRole) {
                throw new HttpError('Insufficient permissions', 403, 'auth-middleware', 'permissionMiddleware');
            }
        } catch (err) {
            // Ensure err is an HttpError
            throw err instanceof HttpError ? err : handleError(new Error('Unexpected error'), 'auth-middleware', 'permissionMiddleware');
        }
    };
}


export async function tokenMiddleware(ctx: RequestContext): Promise<void> {
    const authHeader = ctx.headers?.['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new HttpError('Authorization header missing or invalid', 401, 'auth-middleware', 'tokenMiddleware');
    }
}