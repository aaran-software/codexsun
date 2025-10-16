// cortex/todos/todos-service.ts
import * as todosRepo from './todos-repos';
import {Todo} from './todos-model';

export async function createTodoService(input: Todo, tenantId: string, userId: string): Promise<Todo> {
    if (!input.text || input.completed === undefined || !input.category || !input.priority || !userId) {
        throw new Error("Missing required fields");
    }
    return await todosRepo.createTodo(input, tenantId, userId);
}

export async function getService(tenantId: string, userId: string): Promise<Todo[]> {
    return await todosRepo.getTodos(tenantId, userId);
}

export async function getTodoByIdService(id: number, tenantId: string): Promise<Todo | null> {
    if (!tenantId) {
        throw new Error('Tenant ID is required');
    }
    return await todosRepo.getTodoById(id, tenantId);
}

export async function updateTodoService(id: number, updates: Partial<Todo>, tenantId: string): Promise<Todo | null> {
    if (!tenantId) {
        throw new Error('Tenant ID is required');
    }
    if (Object.keys(updates).length === 0) {
        throw new Error('At least one field must be provided for update');
    }
    return await todosRepo.updateTodo(id, updates, tenantId);
}

export async function deleteTodoService(id: number, tenantId: string): Promise<boolean> {
    if (!tenantId) {
        throw new Error('Tenant ID is required');
    }
    return await todosRepo.deleteTodo(id, tenantId);
}