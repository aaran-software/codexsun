// cortex/middleware/tenant-middleware.ts
import { Request, Response, NextFunction } from 'express';
import { withTenantContext } from '../db/db';
import { settings } from '../config/get-settings';

export async function tenantMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!settings.TENANCY) {
        return next(); // Skip tenant context if tenancy is disabled
    }

    // Extract tenant ID from request (e.g., header, query, or JWT)
    const tenantId = req.headers['x-tenant-id'] as string || req.query.tenantId as string || 'default';

    if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID is required' });
        return;
    }

    try {
        await withTenantContext(tenantId, async () => {
            next();
        });
    } catch (error) {
        res.status(500).json({ error: `Failed to set tenant context: ${(error as Error).message}` });
    }
}