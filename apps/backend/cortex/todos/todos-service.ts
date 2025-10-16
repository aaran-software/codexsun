// File: cortex/todos/todos-service.ts
// Description: Service layer for todo business logic
import { TodoRepository } from './todos-repos';
import { Todo } from './todos-model';

export class TodoService {
    static async getTodos(tenantId: string, userId: string): Promise<Todo[]> {
        return await TodoRepository.getTodos(tenantId, userId);
    }

    static async getTodoById(tenantId: string, id: number, userId: string): Promise<Todo> {
        const todo = await TodoRepository.getTodoById(tenantId, id, userId);
        if (!todo) {
            throw new Error(`Todo with ID ${id} not found`);
        }
        return todo;
    }

    static async createTodo(tenantId: string, todo: Todo): Promise<Todo> {
        if (!todo.text || !todo.user_id) {
            throw new Error('Todo text and user_id are required');
        }
        return await TodoRepository.createTodo(tenantId, {
            ...todo,
            completed: todo.completed ?? false,
            priority: todo.priority ?? 'medium',
            position: todo.position ?? 0
        });
    }

    static async updateTodo(tenantId: string, id: number, todo: Partial<Todo>, userId: string): Promise<Todo> {
        if (!Object.keys(todo).length) {
            throw new Error('No updates provided');
        }
        if (todo.priority && !['low', 'medium', 'high'].includes(todo.priority)) {
            throw new Error('Invalid priority value');
        }
        const updatedTodo = await TodoRepository.updateTodo(tenantId, id, todo, userId);
        if (!updatedTodo) {
            throw new Error(`Todo with ID ${id} not found`);
        }
        return updatedTodo;
    }

    static async deleteTodo(tenantId: string, id: number, userId: string): Promise<void> {
        const deleted = await TodoRepository.deleteTodo(tenantId, id, userId);
        if (!deleted) {
            throw new Error(`Todo with ID ${id} not found`);
        }
    }
}