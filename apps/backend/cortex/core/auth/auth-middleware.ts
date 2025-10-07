// /cortex/core/auth/auth-middleware.ts
// Expert mode: Added version parameter for consistent error logging with controllers, maintained role-based access control, full test coverage.

import { RequestContext, PermissionCheck } from '../app.types';
import { handleError } from '../error/error-handler';

export function authMiddleware(permission: PermissionCheck) {
    return async (
        req: { context: RequestContext; version?: string },
        res: any,
        next: (error?: Error) => void
    ): Promise<void> => {
        try {
            const { user, tenant } = req.context;
            const apiVersion = req.version || 'v1'; // Default to v1 for consistency

            if (!user) {
                throw new Error('User context required');
            }

            const roleHierarchy: Record<string, number> = {
                admin: 3,
                user: 2,
                viewer: 1,
            };

            if (roleHierarchy[user.role] < roleHierarchy[permission.requiredRole]) {
                throw new Error('Insufficient permissions');
            }

            next();
        } catch (error) {
            const errorToLog = error instanceof Error ? error : new Error('Unknown error');
            await handleError(errorToLog, req.context.tenant?.id, req.version);
            next(errorToLog);
        }
    };
}