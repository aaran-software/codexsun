// cortex/todos/todo.controller.ts

import {Request, Response} from 'express';
import * as todoService from './todo.service';
import {withTenantContext} from '../db/db';
import {Todo} from './todo.model';

// Tenant database mapping (in production, use config or database)
const tenantDatabases = [
    {tenantId: 'tenant1', database: 'tenant_1'},
    {tenantId: 'tenant2', database: 'tenant_2'},
];

export class TodoController {
    static async create(req: Request, res: Response) {
        const tenantId = req.get('X-Tenant-Id');
        if (!tenantId) return res.status(400).json({error: 'Tenant ID is required'});

        const {text, category, due_date, priority} = req.body;
        if (!text || !category || !priority) {
            return res.status(400).json({error: 'Text, category, and priority are required'});
        }

        try {
            const todo = await withTenantContext(tenantId, tenantDatabases.find(t => t.tenantId === tenantId)?.database || '', async () => {
                return todoService.createTodoService({text, category, due_date, priority, tenant_id: tenantId});
            });
            res.status(201).json(todo);
        } catch (error) {
            res.status(400).json({error: (error as Error).message});
        }
    }

    static async getAll(req: Request, res: Response) {
        const tenantId = req.get('X-Tenant-Id');
        if (!tenantId) return res.status(400).json({error: 'Tenant ID is required'});

        try {
            const todos = await withTenantContext(tenantId, tenantDatabases.find(t => t.tenantId === tenantId)?.database || '', async () => {
                return todoService.getTodosService(tenantId);
            });
            res.json(todos);
        } catch (error) {
            res.status(500).json({error: (error as Error).message});
        }
    }

    static async getById(req: Request, res: Response) {
        const tenantId = req.get('X-Tenant-Id');
        if (!tenantId) return res.status(400).json({error: 'Tenant ID is required'});

        const id = Number(req.params.id);

        try {
            const todo = await withTenantContext(tenantId, tenantDatabases.find(t => t.tenantId === tenantId)?.database || '', async () => {
                return todoService.getTodoByIdService(id, tenantId);
            });
            if (!todo) return res.status(404).json({error: 'Todo not found'});
            res.json(todo);
        } catch (error) {
            res.status(500).json({error: (error as Error).message});
        }
    }

    static async update(req: Request, res: Response) {
        const tenantId = req.get('X-Tenant-Id');
        if (!tenantId) return res.status(400).json({error: 'Tenant ID is required'});

        const id = Number(req.params.id);
        const updates: Partial<Todo> = req.body;

        try {
            const updated = await withTenantContext(tenantId, tenantDatabases.find(t => t.tenantId === tenantId)?.database || '', async () => {
                return todoService.updateTodoService(id, updates, tenantId);
            });
            if (!updated) return res.status(404).json({error: 'Todo not found'});
            res.json(updated);
        } catch (error) {
            res.status(400).json({error: (error as Error).message});
        }
    }

    static async delete(req: Request, res: Response) {
        const tenantId = req.get('X-Tenant-Id');
        if (!tenantId) return res.status(400).json({error: 'Tenant ID is required'});

        const id = Number(req.params.id);

        try {
            const success = await withTenantContext(tenantId, tenantDatabases.find(t => t.tenantId === tenantId)?.database || '', async () => {
                return todoService.deleteTodoService(id, tenantId);
            });
            if (!success) return res.status(404).json({error: 'Todo not found'});
            res.status(204).send();
        } catch (error) {
            res.status(400).json({error: (error as Error).message});
        }
    }

    static async updateOrder(req: Request, res: Response) {
        const tenantId = req.get('X-Tenant-Id');
        if (!tenantId) return res.status(400).json({error: 'Tenant ID is required'});

        const {orderedIds} = req.body;
        if (!Array.isArray(orderedIds)) return res.status(400).json({error: 'orderedIds must be an array'});

        try {
            await withTenantContext(tenantId, tenantDatabases.find(t => t.tenantId === tenantId)?.database || '', async () => {
                return todoService.updateOrderService(tenantId, orderedIds);
            });
            res.status(200).send();
        } catch (error) {
            res.status(400).json({error: (error as Error).message});
        }
    }

    static async toggleCompleted(req: Request, res: Response) {
        const tenantId = req.get('X-Tenant-Id');
        if (!tenantId) return res.status(400).json({error: 'Tenant ID is required'});

        const id = Number(req.params.id);

        try {
            const todo = await withTenantContext(tenantId, tenantDatabases.find(t => t.tenantId === tenantId)?.database || '', async () => {
                return todoService.getTodoByIdService(id, tenantId);
            });
            if (!todo) return res.status(404).json({error: 'Todo not found'});

            const updated = await withTenantContext(tenantId, tenantDatabases.find(t => t.tenantId === tenantId)?.database || '', async () => {
                return todoService.updateTodoService(id, {completed: !todo.completed}, tenantId);
            });
            res.json(updated);
        } catch (error) {
            res.status(400).json({error: (error as Error).message});
        }
    }
}