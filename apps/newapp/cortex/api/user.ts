// cortex/api/user.ts
import express, { Router, Request, Response } from 'express';
import { withTenantContext } from '../db';
import { createUser, getUserById, getUserByEmail, updateUser, deleteUser, verifyUserPassword } from '../user';
import { User, QueryResult } from '../types';
import { authenticateJWT, AuthRequest } from './auth';

// Tenant database mapping (in production, use config or database)
const tenantDatabases = [
    { tenantId: 'tenant1', database: 'tenant_1' },
    { tenantId: 'tenant2', database: 'tenant_2' },
];

export function createUserRouter(): Router {
    const router = express.Router();

    // Apply JWT middleware to all routes
    router.use(authenticateJWT);

    // Create a user
    router.post('/', async (req: AuthRequest, res: Response) => {
        const tenantId = req.get('X-Tenant-Id');
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID is required' });

        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        try {
            const result = await withTenantContext(tenantId, tenantDatabases.find(t => t.tenantId === tenantId)?.database || '', async () => {
                const createResult = await createUser({ username, email, password, tenantId });
                const user = await getUserById(Number(createResult.insertId), tenantId);
                return user;
            });
            if (!result) throw new Error('User creation failed');
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    });

    // Get a user by ID
    router.get('/:id', async (req: AuthRequest, res: Response) => {
        const tenantId = req.get('X-Tenant-Id');
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID is required' });

        try {
            const user = await withTenantContext(tenantId, tenantDatabases.find(t => t.tenantId === tenantId)?.database || '', async () => {
                return getUserById(Number(req.params.id), tenantId);
            });
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.status(200).json(user);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    });

    // Get a user by email
    router.get('/email/:email', async (req: AuthRequest, res: Response) => {
        const tenantId = req.get('X-Tenant-Id');
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID is required' });

        try {
            const user = await withTenantContext(tenantId, tenantDatabases.find(t => t.tenantId === tenantId)?.database || '', async () => {
                return getUserByEmail(req.params.email, tenantId);
            });
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.status(200).json(user);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    });

    // Update a user
    router.put('/:id', async (req: AuthRequest, res: Response) => {
        const tenantId = req.get('X-Tenant-Id');
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID is required' });

        const { username, email, password } = req.body;
        if (!username && !email && !password) {
            return res.status(400).json({ error: 'At least one field (username, email, password) is required' });
        }

        try {
            const result = await withTenantContext(tenantId, tenantDatabases.find(t => t.tenantId === tenantId)?.database || '', async () => {
                const updateResult = await updateUser(Number(req.params.id), { username, email, password, tenantId });
                if (updateResult.rowCount === 0) throw new Error('User not found');
                const user = await getUserById(Number(req.params.id), tenantId);
                return user;
            });
            if (!result) throw new Error('User update failed');
            res.status(200).json(result);
        } catch (error) {
            res.status(error.message === 'User not found' ? 404 : 400).json({ error: (error as Error).message });
        }
    });

    // Delete a user
    router.delete('/:id', async (req: AuthRequest, res: Response) => {
        const tenantId = req.get('X-Tenant-Id');
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID is required' });

        try {
            const result = await withTenantContext(tenantId, tenantDatabases.find(t => t.tenantId === tenantId)?.database || '', async () => {
                return deleteUser(Number(req.params.id), tenantId);
            });
            if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    });

    // Verify a user’s password
    router.post('/verify', async (req: AuthRequest, res: Response) => {
        const tenantId = req.get('X-Tenant-Id');
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID is required' });

        const { id, password } = req.body;
        if (!id || !password) {
            return res.status(400).json({ error: 'User ID and password are required' });
        }

        try {
            const isValid = await withTenantContext(tenantId, tenantDatabases.find(t => t.tenantId === tenantId)?.database || '', async () => {
                return verifyUserPassword(Number(id), password, tenantId);
            });
            res.status(200).json({ isValid });
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    });

    return router;
}