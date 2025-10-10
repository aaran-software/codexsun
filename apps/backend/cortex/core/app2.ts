import { login, logout } from './auth/login-controller';
import { tenantMiddleware } from './tenant/tenant-middleware';
import { authMiddleware } from './auth/auth-middleware';
import { rateLimiter } from './auth/rate-limiter';
import { handleError } from './error/error-handler';
import { RequestContext } from './app.types';
import { Router, Request, Response, NextFunction } from 'express';
// import userRoutes from '../user/user-routes';

// Extend Express Request to include context, ip, and version
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
    const router = Router();

    // Ensure context and ip are set for all routes
    router.use((req: CustomRequest, res: Response, next: NextFunction) => {
        req.context = req.context || { ip: req.ip || '127.0.0.1' };
        req.version = req.version || 'v1';
        next();
    });

    // Handle /app route without tenant/auth middleware
    router.get('/app', (req: CustomRequest, res: Response) => {
        res.status(200).json({ status: 'Main is running' });
    });

    // Mount user routes
    router.use(userRoutes);

    // Handle /login
    router.post('/login', async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            await loginRateLimiter(req, res, (err) => {
                if (err) throw err;
            });
            const result = await login(req);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    });

    // Handle /logout
    router.post('/logout', async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(400).json({ error: 'Token required' });
            }
            await logout(token);
            res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
            next(error);
        }
    });

    // Handle errors
    router.use((error: Error, req: CustomRequest, res: Response, next: NextFunction) => {
        const err = error instanceof Error ? error : new Error('Unknown error');
        handleError(err, req.context.tenant?.id, req.version).then(() => {
            res.status(err.message === 'Too many requests' ? 429 : 401).json({ error: err.message });
        });
    });

    return router;
}