// cortex/todos/todos-service.ts
import * as todosRepo from './todos-repos';
import {Todo, TodoInput} from './todos-model';
import {setTenantContext} from '../db/db';

export async function createTodoService(input: TodoInput, tenantId: string): Promise<Todo> {
    if (!tenantId) {
        throw new Error('Tenant ID is required');
    }
    setTenantContext(tenantId); // Use tenantId to resolve tenant database
    try {
        return await todosRepo.createTodo(input, tenantId);
    } finally {
        // Context cleanup handled by AsyncLocalStorage
    }
}

export async function getService(tenantId: string, userId: string): Promise<Todo[]> {
    return await todosRepo.getTodos(tenantId,userId);
}

export async function getTodoByIdService(id: number, tenantId: string): Promise<Todo | null> {
    if (!tenantId) {
        throw new Error('Tenant ID is required');
    }
    setTenantContext(tenantId);
    return await todosRepo.getTodoById(id, tenantId);
}

export async function updateTodoService(id: number, updates: Partial<TodoInput>, tenantId: string): Promise<Todo | null> {
    if (!tenantId) {
        throw new Error('Tenant ID is required');
    }
    if (Object.keys(updates).length === 0) {
        throw new Error('At least one field must be provided for update');
    }
    setTenantContext(tenantId);
    return await todosRepo.updateTodo(id, updates, tenantId);
}

export async function deleteTodoService(id: number, tenantId: string): Promise<boolean> {
    if (!tenantId) {
        throw new Error('Tenant ID is required');
    }
    setTenantContext(tenantId);
    return await todosRepo.deleteTodo(id, tenantId);
}