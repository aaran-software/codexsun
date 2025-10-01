import express, { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { withTenantContext, query } from '../db/db';
import { verifyUserPassword, getUserByEmail } from '../user';
import { User } from '../db/db-types';

const JWT_SECRET = 'your_jwt_secret_key'; // In production, use environment variable

export interface AuthRequest extends Request {
    user?: { id: number; tenantId: string };
}

// Tenant database mapping (in production, use config or database)
const tenantDatabases = [
    { tenantId: 'tenant1', database: 'tenant_1' },
    { tenantId: 'tenant2', database: 'tenant_2' },
];

const getTenantDatabase = (tenantId: string): string => {
    const tenant = tenantDatabases.find(t => t.tenantId === tenantId);
    if (!tenant) {
        throw new Error('Tenant not found');
    }
    return tenant.database;
};

async function isTokenRevoked(token: string, tenantId: string): Promise<boolean> {
    return withTenantContext(tenantId, getTenantDatabase(tenantId), async () => {
        const result = await query<{ count: number }>(
            'SELECT COUNT(*) as count FROM revoked_tokens WHERE token = ? AND tenant_id = ?',
            [token, tenantId]
        );
        return result.rows[0].count > 0;
    });
}

export function createAuthRouter(): Router {
    const router = express.Router();

    // Login endpoint
    router.post('/login', async (req: Request, res: Response) => {
        const tenantId = req.get('X-Tenant-Id');
        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is required' });
        }

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        try {
            // Check tenant validity before proceeding
            const tenantDb = getTenantDatabase(tenantId);
            const user = await withTenantContext(tenantId, tenantDb, async () => {
                const user = await getUserByEmail(email, tenantId);
                if (!user) throw new Error('Invalid credentials');
                const isValid = await verifyUserPassword(user.id!, password, tenantId);
                if (!isValid) throw new Error('Invalid credentials');
                return user;
            });

            const token = jwt.sign({ id: user.id, tenantId }, JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ token });
        } catch (error: any) {
            if (error.message === 'Tenant not found') {
                return res.status(400).json({ error: 'Tenant not found' });
            }
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });

    // Logout endpoint
    router.post('/logout', authenticateJWT, async (req: AuthRequest, res: Response) => {
        const tenantId = req.get('X-Tenant-Id')!;
        const authHeader = req.get('Authorization')!;
        const token = authHeader.replace('Bearer ', '');

        try {
            // Decode token to get expiry
            const decoded = jwt.decode(token) as { exp: number } | null;
            if (!decoded || !decoded.exp) {
                throw new Error('Invalid token');
            }
            const expiryDate = new Date(decoded.exp * 1000);
            const expiry = expiryDate.toISOString().slice(0, 19).replace('T', ' ');

            await withTenantContext(tenantId, getTenantDatabase(tenantId), async () => {
                await query(
                    'INSERT INTO revoked_tokens (token, expiry, tenant_id) VALUES (?, ?, ?)',
                    [token, expiry, tenantId]
                );
            });

            res.status(200).json({ message: 'Logged out successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
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

        // Check if token is revoked
        isTokenRevoked(token, tenantId).then(isRevoked => {
            if (isRevoked) {
                return res.status(401).json({ error: 'Token has been revoked' });
            }
            req.user = decoded;
            next();
        }).catch(error => {
            res.status(500).json({ error: 'Error checking token revocation' });
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
