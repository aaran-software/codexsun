import { login } from './login-controller';
import { createUser } from './user-controller';
import { createInventoryItem } from './inventory-controller';
import { tenantMiddleware } from './tenant-middleware';
import { authMiddleware } from './auth-middleware';
import { rateLimiter } from './rate-limiter';
import { handleError } from './error-handler';

export function createApp() {
    return async (req: any, res: any) => {
        try {
            req.context = req.context || {};
            req.ip = req.ip || '127.0.0.1';

            if (req.method === 'POST' && req.url === '/login') {
                const rateLimitErr = await new Promise<Error | undefined>((resolve) => {
                    rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 })(req, res, (err) => resolve(err));
                });
                if (rateLimitErr) {
                    return res.status(429).json({ error: rateLimitErr.message });
                }
                const result = await login(req);
                return res.status(200).json(result);
            }

            const tenantErr = await new Promise<Error | undefined>((resolve) => {
                tenantMiddleware(req, res, (err) => resolve(err));
            });
            if (tenantErr) {
                return res.status(401).json({ error: tenantErr.message });
            }

            if (req.method === 'POST' && req.url === '/users') {
                const authErr = await new Promise<Error | undefined>((resolve) => {
                    authMiddleware({ requiredRole: 'admin' })(req, res, (err) => resolve(err));
                });
                if (authErr) {
                    return res.status(403).json({ error: authErr.message });
                }
                const result = await createUser(req);
                return res.status(201).json(result);
            }

            if (req.method === 'POST' && req.url === '/inventory') {
                const authErr = await new Promise<Error | undefined>((resolve) => {
                    authMiddleware({ requiredRole: 'admin' })(req, res, (err) => resolve(err));
                });
                if (authErr) {
                    return res.status(403).json({ error: authErr.message });
                }
                const result = await createInventoryItem(req);
                return res.status(201).json(result);
            }

            return res.status(404).json({ error: 'Not found' });
        } catch (error) {
            await handleError(error instanceof Error ? error : new Error('Unknown error'), undefined);
            res.status(401).json({ error: (error instanceof Error ? error : new Error('Unknown error')).message });
        }
    };
}