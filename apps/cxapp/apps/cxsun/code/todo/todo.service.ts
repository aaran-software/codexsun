import type { Todo } from "./todo.model";
import { TodoRepository } from "./todo.repos";

export class TodoService {
  private repo: TodoRepository;

  constructor(repo: TodoRepository) {
    this.repo = repo;
  }

  async getAllForUser(userId: number, page: number, limit: number): Promise<{ todos: Todo[], total: number }> {
    return this.repo.findAllForUser(userId, page, limit);
  }

  async getTodo(userId: number, id: number): Promise<Todo | null> {
    return this.repo.findByIdForUser(id, userId);
  }

  async createTodo(userId: number, data: Omit<Todo, "id" | "user_id" | "created_at" | "updated_at" | "order_position">): Promise<Todo> {
    return this.repo.create({
      user_id: userId,
      text: data.text,
      completed: data.completed ?? false,
      category: data.category,
      due_date: data.due_date ?? null,
      priority: data.priority,
    });
  }

  async updateTodo(userId: number, id: number, data: Omit<Todo, "id" | "user_id" | "created_at" | "updated_at" | "order_position">): Promise<Todo | null> {
    return this.repo.update(id, userId, {
      text: data.text,
      completed: data.completed ?? false,
      category: data.category,
      due_date: data.due_date ?? null,
      priority: data.priority,
    });
  }

  async patchTodo(userId: number, id: number, updates: Partial<Omit<Todo, "id" | "user_id" | "created_at" | "updated_at" | "order_position">>): Promise<Todo | null> {
    return this.repo.patchTodo(id, userId, updates);
  }

  async deleteTodo(userId: number, id: number): Promise<boolean> {
    return this.repo.delete(id, userId);
  }

  async reorderTodos(userId: number, order: number[]): Promise<void> {
    return this.repo.reorderTodos(userId, order);
  }
}