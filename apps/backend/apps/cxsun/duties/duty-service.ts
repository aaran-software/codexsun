// File: cortex/tasks/tasks-service.ts
// Description: Service layer for task business logic in service center
import { DutyRepository } from './tasks-repos';
import { CustomerRepository } from '../customers/customers-repos';
import { Duty } from './tasks-model';

export class DutyService {
    static async getDutys(tenantId: string, userId: string): Promise<Duty[]> {
        return await DutyRepository.getDutys(tenantId, userId);
    }

    static async getDutyById(tenantId: string, id: number, userId: string): Promise<Duty> {
        const task = await DutyRepository.getDutyById(tenantId, id, userId);
        if (!task) {
            throw new Error(`Duty with ID ${id} not found`);
        }
        return task;
    }

    static async createDuty(tenantId: string, task: Duty): Promise<Duty> {
        if (!task.description || !task.created_by || !task.assigned_to || !task.customer_id) {
            throw new Error('Duty description, created_by, assigned_to, and customer_id are required');
        }
        const customer = await CustomerRepository.getCustomerById(tenantId, task.customer_id);
        if (!customer) {
            throw new Error(`Customer with ID ${task.customer_id} not found`);
        }
        return await DutyRepository.createDuty(tenantId, {
            ...task,
            status: task.status ?? 'pending',
            priority: task.priority ?? 'medium',
            position: task.position ?? 0
        });
    }

    static async updateDuty(tenantId: string, id: number, task: Partial<Duty>, userId: string): Promise<Duty> {
        if (!Object.keys(task).length) {
            throw new Error('No updates provided');
        }
        if (task.priority && !['low', 'medium', 'high'].includes(task.priority)) {
            throw new Error('Invalid priority value');
        }
        if (task.status && !['pending', 'in_progress', 'completed'].includes(task.status)) {
            throw new Error('Invalid status value');
        }
        if (task.customer_id) {
            const customer = await CustomerRepository.getCustomerById(tenantId, task.customer_id);
            if (!customer) {
                throw new Error(`Customer with ID ${task.customer_id} not found`);
            }
        }
        if (task.status === 'completed' && !task.completed_at) {
            task.completed_at = new Date().toISOString();
        }
        const updatedDuty = await DutyRepository.updateDuty(tenantId, id, task, userId);
        if (!updatedDuty) {
            throw new Error(`Duty with ID ${id} not found`);
        }
        return updatedDuty;
    }

    static async deleteDuty(tenantId: string, id: number, userId: string): Promise<void> {
        const deleted = await DutyRepository.deleteDuty(tenantId, id, userId);
        if (!deleted) {
            throw new Error(`Duty with ID ${id} not found`);
        }
    }

    static async updateDutyOrder(tenantId: string, orderedIds: number[], userId: string): Promise<void> {
        if (!orderedIds.length) {
            throw new Error('No task IDs provided for reordering');
        }
        await DutyRepository.updateDutyOrder(tenantId, orderedIds, userId);
    }

    static async getDutyPerformance(tenantId: string, userId: string): Promise<any[]> {
        const tasks = await this.getDutys(tenantId, userId);
        return tasks.map(task => {
            if (task.status !== 'completed' || !task.completed_at || !task.due_date) {
                return { ...task, performance: 'N/A' };
            }
            const due = new Date(task.due_date);
            const completed = new Date(task.completed_at);
            const delay = Math.max(0, (completed.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
            return { ...task, performance: delay > 0 ? `Delayed by ${delay} days` : 'On time' };
        });
    }
}