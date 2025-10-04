import { login } from './login-controller';
import { createUser } from './user-controller';
import { createInventoryItem } from './inventory-controller';
import { tenantMiddleware } from './tenant-middleware';
import { authMiddleware } from './auth-middleware';
import { handleError } from './error-handler';

export function createApp() {
    return async (req: any, res: any) => {
        try {
            if (req.method === 'POST' && req.url === '/login') {
                const result = await login(req);
                return res.status(200).json(result);
            }

            await tenantMiddleware(req, res, async (error?: Error) => {
                if (error) {
                    return res.status(401).json({ error: error.message });
                }

                if (req.method === 'POST' && req.url === '/users') {
                    await authMiddleware({ requiredRole: 'admin' })(req, res, async (error?: Error) => {
                        if (error) {
                            return res.status(403).json({ error: error.message });
                        }
                        const result = await createUser(req);
                        return res.status(201).json(result);
                    });
                }

                if (req.method === 'POST' && req.url === '/inventory') {
                    await authMiddleware({ requiredRole: 'admin' })(req, res, async (error?: Error) => {
                        if (error) {
                            return res.status(403).json({ error: error.message });
                        }
                        const result = await createInventoryItem(req);
                        return res.status(201).json(result);
                    });
                }

                return res.status(404).json({ error: 'Not found' });
            });
        } catch (error) {
            await handleError(error instanceof Error ? error : new Error('Unknown error'), undefined);
            res.status(401).json({ error: (error instanceof Error ? error : new Error('Unknown error')).message });
        }
    };
}