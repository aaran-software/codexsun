// cortex/core/tenant/tenant-middleware.ts

import { Tenant, User, RequestContext } from '../app.types';
import { handleError } from '../error/error-handler';
import { query, tenantStorage } from '../../db/db';
import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../secret/jwt-service';

interface CustomRequest extends Request {
    context: RequestContext;
    ip: string;
    version?: string;
}

export async function tenantMiddleware(
    req: CustomRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (req.url === '/app') {
            return next();
        }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const payload = await verifyJwt(token);

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

        req.context = { ...req.context, tenant, user };
        tenantStorage.enterWith(db_name);
        next();
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        await handleError(err);
        next(err);
    }
}