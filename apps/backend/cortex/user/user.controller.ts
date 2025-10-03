import { Request, Response } from 'express';
import * as userService from './user.service';
import { withTenantContext } from '../db/db';
import { User } from './user.model';

const tenantDatabases = [
    { tenantId: 'tenant1', database: 'tenant_1' },
    { tenantId: 'tenant2', database: 'tenant_2' },
];

export class UserController {
    static async create(req: Request, res: Response) {
        const tenantId = req.get('X-Tenant-Id');
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID is required' });

        const { username, email, password, mobile, status, role } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        try {
            const user = await withTenantContext(tenantId, tenantDatabases.find(t => t.tenantId === tenantId)?.database || '', async () => {
                return userService.createUserService({ username, email, password, mobile, status, role, tenant_id: tenantId });
            });
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    static async getAll(req: Request, res: Response) {
        const tenantId = req.get('X-Tenant-Id');
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID is required' });

        try {
            const users = await withTenantContext(tenantId, tenantDatabases.find(t => t.tenantId === tenantId)?.database || '', async () => {
                return userService.getUsersService(tenantId);
            });
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    static async getById(req: Request, res: Response) {
        const tenantId = req.get('X-Tenant-Id');
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID is required' });

        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid user ID' });

        try {
            const user = await withTenantContext(tenantId, tenantDatabases.find(t => t.tenantId === tenantId)?.database || '', async () => {
                return userService.getUserByIdService(id, tenantId);
            });
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(user);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    static async update(req: Request, res: Response) {
        const tenantId = req.get('X-Tenant-Id');
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID is required' });

        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid user ID' });

        const updates = req.body;

        try {
            const updated = await withTenantContext(tenantId, tenantDatabases.find(t => t.tenantId === tenantId)?.database || '', async () => {
                return userService.updateUserService(id, updates, tenantId);
            });
            if (!updated) return res.status(404).json({ error: 'User not found' });
            res.json(updated);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    static async delete(req: Request, res: Response) {
        const tenantId = req.get('X-Tenant-Id');
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID is required' });

        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid user ID' });

        try {
            const success = await withTenantContext(tenantId, tenantDatabases.find(t => t.tenantId === tenantId)?.database || '', async () => {
                return userService.deleteUserService(id, tenantId);
            });
            if (!success) return res.status(404).json({ error: 'User not found' });
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }
}