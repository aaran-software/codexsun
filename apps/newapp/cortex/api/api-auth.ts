// cortex/api/api-auth.ts
import express, { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { withTenantContext, query } from '../db/db';
import { verifyUserPassword, getUserByEmail } from '../user';
import { User } from '../db/db-types';

const JWT_SECRET = 'your_jwt_secret_key'; // In production, use environment variable

export interface AuthRequest extends Request {
    user?: { id: number; tenantId: string };
}

export function createAuthRouter(): Router {
    const router = express.Router();

    // Login endpoint
    router.post('/login', async (req: Request, res: Response) => {
        const tenantId = req.get('X-Tenant-Id');
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID is required' });

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        try {
            const user = await withTenantContext(tenantId, tenantDatabases.find(t => t.tenantId === tenantId)?.database || '', async () => {
                const user = await getUserByEmail(email, tenantId);
                if (!user) throw new Error('Invalid credentials');
                const isValid = await verifyUserPassword(user.id!, password, tenantId);
                if (!isValid) throw new Error('Invalid credentials');
                return user;
            });

            const token = jwt.sign({ id: user.id, tenantId }, JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ token });
        } catch (error) {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });

    return router;
}

// JWT middleware
export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
    const tenantId = req.get('X-Tenant-Id');
    if (!tenantId) return res.status(400).json({ error: 'Tenant ID is required' });

    const authHeader = req.get('Authorization');
    if (!authHeader) return res.status(401).json({ error: 'Authorization token required' });

    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number; tenantId: string };
        if (decoded.tenantId !== tenantId) {
            return res.status(403).json({ error: 'Tenant ID mismatch' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// Tenant database mapping (in production, use config or database)
const tenantDatabases = [
    { tenantId: 'tenant1', database: 'tenant_1' },
    { tenantId: 'tenant2', database: 'tenant_2' },
];