import * as jwt from 'jsonwebtoken';
import { Tenant, User, RequestContext } from '../app.types';
import { handleError } from '../error/error-handler';
import { query, tenantStorage } from '../../db/db';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-please-replace';

/**
 * Middleware to verify JWT token and set tenant and user in request context.
 * Queries the master database for tenant details and stores the tenant DB name in AsyncLocalStorage.
 * @param req Request with authorization header and context
 * @param res Response object (unused)
 * @param next Callback to pass control to the next middleware
 */
export async function tenantMiddleware(
    req: { headers: { authorization?: string }; context: RequestContext },
    res: any,
    next: (error?: Error) => void
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

        const tenantRes = await query<{
            tenant_id: string;
            db_host: string;
            db_port: string;
            db_user: string;
            db_pass: string | null;
            db_name: string;
            db_ssl: string | null;
        }>(
            'SELECT tenant_id, db_host, db_port, db_user, db_pass, db_name, db_ssl FROM tenants WHERE tenant_id = ?',
            [payload.tenantId]
        );

        if (tenantRes.rows.length === 0) {
            throw new Error(`Tenant not found for ID: ${payload.tenantId}`);
        }

        const { tenant_id, db_host, db_port, db_user, db_pass, db_name, db_ssl } = tenantRes.rows[0];

        if (!db_host || !db_port || !db_user || !db_name) {
            throw new Error(`Incomplete tenant configuration for ID: ${tenant_id}`);
        }

        const protocol = 'mariadb';
        const sslParam = db_ssl === 'true' ? '?ssl=true' : '';
        const passPart = db_pass ? `:${encodeURIComponent(db_pass)}` : '';
        const dbConnection = `${protocol}://${db_user}${passPart}@${db_host}:${db_port}/${db_name}${sslParam}`;

        const tenant: Tenant = { id: tenant_id, dbConnection };
        const user: User = { id: payload.id, tenantId: payload.tenantId, role: payload.role, token };

        req.context = { tenant, user };
        tenantStorage.enterWith(db_name);
        next();
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        await handleError(err);
        next(err);
    }
}