import { RequestContext, PermissionCheck } from '../app.types';
import { handleError } from '../error/error-handler';

export function authMiddleware(permission: PermissionCheck) {
    return async (req: { context: RequestContext }, res: any, next: (error?: Error) => void): Promise<void> => {
        try {
            const { user, tenant } = req.context;
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
            await handleError(error instanceof Error ? error : new Error('Unknown error'), req.context.tenant?.id);
            next(error instanceof Error ? error : new Error('Unknown error'));
        }
    };
}