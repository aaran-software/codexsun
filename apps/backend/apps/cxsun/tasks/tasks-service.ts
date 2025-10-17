// File: cortex/tasks/tasks-service.ts
// Description: Service layer for task business logic in service center
import { TaskRepository } from './tasks-repos';
import { CustomerRepository } from '../customers/customers-repos';
import { Task } from './tasks-model';

export class TaskService {
    static async getTasks(tenantId: string, userId: string): Promise<Task[]> {
        return await TaskRepository.getTasks(tenantId, userId);
    }

    static async getTaskById(tenantId: string, id: number, userId: string): Promise<Task> {
        const task = await TaskRepository.getTaskById(tenantId, id, userId);
        if (!task) {
            throw new Error(`Task with ID ${id} not found`);
        }
        return task;
    }

    static async createTask(tenantId: string, task: Task): Promise<Task> {
        if (!task.description || !task.created_by || !task.assigned_to || !task.customer_id) {
            throw new Error('Task description, created_by, assigned_to, and customer_id are required');
        }
        const customer = await CustomerRepository.getCustomerById(tenantId, task.customer_id);
        if (!customer) {
            throw new Error(`Customer with ID ${task.customer_id} not found`);
        }
        return await TaskRepository.createTask(tenantId, {
            ...task,
            status: task.status ?? 'pending',
            priority: task.priority ?? 'medium',
            position: task.position ?? 0
        });
    }

    static async updateTask(tenantId: string, id: number, task: Partial<Task>, userId: string): Promise<Task> {
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
        const updatedTask = await TaskRepository.updateTask(tenantId, id, task, userId);
        if (!updatedTask) {
            throw new Error(`Task with ID ${id} not found`);
        }
        return updatedTask;
    }

    static async deleteTask(tenantId: string, id: number, userId: string): Promise<void> {
        const deleted = await TaskRepository.deleteTask(tenantId, id, userId);
        if (!deleted) {
            throw new Error(`Task with ID ${id} not found`);
        }
    }

    static async updateTaskOrder(tenantId: string, orderedIds: number[], userId: string): Promise<void> {
        if (!orderedIds.length) {
            throw new Error('No task IDs provided for reordering');
        }
        await TaskRepository.updateTaskOrder(tenantId, orderedIds, userId);
    }

    static async getTaskPerformance(tenantId: string, userId: string): Promise<any[]> {
        const tasks = await this.getTasks(tenantId, userId);
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