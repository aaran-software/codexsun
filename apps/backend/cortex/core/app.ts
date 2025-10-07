// /cortex/core/app.ts
// Expert mode: Moved rateLimiter instance outside handler for shared store; fixed route to /todo; default tenant context for login; consistent error handling; tests pass with rate limit trigger.

import { login } from './auth/login-controller';
import { createUser } from './user/user-controller';
import { createTodoItem } from './todo/todo-controller';
import { tenantMiddleware } from './tenant/tenant-middleware';
import { authMiddleware } from './auth/auth-middleware';
import { rateLimiter } from './auth/rate-limiter';
import { handleError } from './error/error-handler';

const loginRateLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });

export function createApp() {
    return async (req: any, res: any) => {
        try {
            req.context = req.context || {};
            req.ip = req.ip || '127.0.0.1';
            req.version = 'v1';

            if (req.method === 'POST' && req.url === '/login') {
                await new Promise<void>((resolve, reject) => {
                    loginRateLimiter(req, res, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
                const result = await login(req);
                return res.status(200).json(result);
            }

            if (req.method !== 'POST') {
                return res.status(404).json({ error: 'Not found' });
            }

            await new Promise<void>((resolve, reject) => {
                tenantMiddleware(req, res, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            if (req.url === '/users') {
                await new Promise<void>((resolve, reject) => {
                    authMiddleware({ requiredRole: 'admin' })(req, res, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
                const result = await createUser(req);
                return res.status(201).json(result);
            }

            if (req.url === '/todo') {
                await new Promise<void>((resolve, reject) => {
                    authMiddleware({ requiredRole: 'admin' })(req, res, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
                const result = await createTodoItem(req);
                return res.status(201).json(result);
            }

            return res.status(404).json({ error: 'Not found' });
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            await handleError(err, req.context.tenant?.id, req.version);
            res.status(err.message === 'Too many requests' ? 429 : 401).json({ error: err.message });
        }
    };
}