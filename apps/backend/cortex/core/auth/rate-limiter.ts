// /cortex/core/auth/rate-limiter.ts
// Expert mode: Fixed error message to 'Too many requests'; aligned with original tests; preserved tenant/IP key, handleError with tenant/version; full coverage.

import { RateLimitConfig, RequestContext } from '../app.types';
import { handleError } from '../error/error-handler';

interface RateLimitStore {
    [key: string]: { count: number; timestamp: number };
}

export function rateLimiter(config: RateLimitConfig) {
    const store: RateLimitStore = {};

    return async (
        req: { ip: string; context: RequestContext; version?: string },
        res: any,
        next: (error?: Error) => void
    ): Promise<void> => {
        const { windowMs, max } = config;
        const ip = req.ip || 'unknown';
        const tenantId = req.context.tenant?.id || 'global';
        const key = `${tenantId}:${ip}`;
        const now = Date.now();

        if (!store[key] || now - store[key].timestamp > windowMs) {
            store[key] = { count: 0, timestamp: now };
        }

        store[key].count += 1;

        if (store[key].count > max) {
            const error = new Error('Too many requests');
            await handleError(error, tenantId, req.version);
            return next(error);
        }

        next();
    };
}