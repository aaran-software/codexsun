import {login, logout} from './auth/login-controller';
import { createUser } from './user/user-controller';
import { createTodoItem } from './todo/todo-controller';
import { tenantMiddleware } from './tenant/tenant-middleware';
import { authMiddleware } from './auth/auth-middleware';
import { rateLimiter } from './auth/rate-limiter';
import { handleError } from './error/error-handler';
import { RequestContext } from './app.types';
import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include context and ip
interface CustomRequest extends Request {
    context: RequestContext;
    ip: string;
    version?: string;
}

const defaultLoginRateLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });

export function createApp(
    loginRateLimiter: (
        req: CustomRequest,
        res: Response,
        next: (error?: Error) => void
    ) => Promise<void> = defaultLoginRateLimiter
) {
    return async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            // Ensure context and ip are set
            req.context = req.context || { ip: req.ip || '127.0.0.1' };
            req.version = req.version || 'v1';

            // Handle /app route without tenant/auth middleware
            if (req.url === '/app') {
                return res.status(200).json({ status: 'App is running' });
            }

            // Simple route for /api/users without tenantMiddleware
            if (req.url === '/api/users' && req.method === 'GET') {
                return res.status(200).json({ status: 'user is running' });
            }

            // Simple route for /api/todos without tenantMiddleware
            if (req.url === '/api/todos' && req.method === 'GET') {
                return res.status(200).json({ status: 'todos is running' });
            }

            if (req.method === 'POST' && req.url === '/login') {
                await loginRateLimiter(req, res, (err) => {
                    if (err) throw err;
                });
                const result = await login(req);
                return res.status(200).json(result);
            }

            if (req.method === 'POST' && req.url === '/logout') {
                const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
                if (!token) {
                    return res.status(400).json({ error: 'Token required' });
                }
                await logout(token);
                return res.status(200).json({ message: 'Logged out successfully' });
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
                return res.status(200).json({ status: 'user is running' });
            }

            if (req.url === '/todos') {
                return res.status(200).json({ status: 'todos is running' });
            }

            return res.status(404).json({ error: 'Not found' });
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            await handleError(err, req.context.tenant?.id, req.version);
            res.status(err.message === 'Too many requests' ? 429 : 401).json({ error: err.message });
        }
    };
}