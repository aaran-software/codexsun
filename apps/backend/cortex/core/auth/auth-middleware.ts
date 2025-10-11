// /cortex/core/auth/auth-middleware.ts
// Expert mode: Added version parameter for consistent error logging with controllers, maintained role-based access control, full test coverage.

import { RequestContext, PermissionCheck, JwtPayload } from '../app.types';
import { handleError } from '../error/error-handler';
import { verifyUserToken } from '../core/auth/auth-service';
import { query } from '../../db/mdb';
import { getMasterDbConfig } from '../../config/db-config';

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

export function verifyTokenMiddleware() {
    return async (
        req: { context: RequestContext; version?: string },
        res: any,
        next: (error?: Error) => void
    ): Promise<void> => {
        try {
            const authHeader = req.context.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new Error('Invalid or missing token');
            }
            const token = authHeader.replace('Bearer ', '');
            const payload: JwtPayload = await verifyUserToken(token);

            // Fetch tenant details (assuming tenant data is needed)
            const dbConfig = getMasterDbConfig();
            const tenantResult = await query<{ id: string; dbConnection: string }>(
                'SELECT id, db_connection AS dbConnection FROM tenants WHERE id = ?',
                [payload.tenantId],
                dbConfig.database
            );

            if (!tenantResult.rows[0]) {
                throw new Error('Tenant not found');
            }

            // Set context
            req.context.user = {
                id: payload.id,
                tenantId: payload.tenantId,
                role: payload.role,
            };
            req.context.tenantId = payload.tenantId;
            req.context.tenant = {
                id: tenantResult.rows[0].id,
                dbConnection: tenantResult.rows[0].dbConnection,
            };

            next();
        } catch (error) {
            const errorToLog = error instanceof Error ? error : new Error('Unknown error');
            await handleError(errorToLog, req.context.tenantId, req.version);
            next(errorToLog);
        }
    };
}