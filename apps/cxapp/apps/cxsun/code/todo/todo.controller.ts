import type { Application } from "../../../../cortex/core/application";
import type { CRequest, CResponse } from "../../../../cortex/http/chttpx";
import type { TodoService } from "./todo.service";
import type { Todo } from "./todo.model";

export class TodoController {
  private service: TodoService;

  constructor(app: Application) {
    this.service = app.container.resolve<TodoService>("TodoService");
    console.log("[TodoController] Resolved TodoService =", this.service);
  }

  // GET /todos?user_id=<user_id>&page=<page>&limit=<limit>
  getAll = async (req: CRequest, res: CResponse): Promise<void> => {
    const userId = Number(req.query?.user_id);
    const page = Number(req.query?.page) || 1;
    const limit = Number(req.query?.limit) || 100;
    if (isNaN(userId) || page < 1 || limit < 1) {
      res.status(400).json({ error: "Missing or invalid parameters (user_id, page, limit)" });
      return;
    }
    const { todos, total } = await this.service.getAllForUser(userId, page, limit);
    console.log("[TodoController.getAll] Response data:", { todos, total, page, limit });
    res.json({ todos, total, page, limit });
  };

  // GET /todos/:id?user_id=<user_id>
  getById = async (req: CRequest, res: CResponse): Promise<void> => {
    const userId = Number(req.query?.user_id);
    const id = Number(req.params?.id);
    if (isNaN(userId) || isNaN(id)) {
      res.status(400).json({ error: "Invalid user_id or todo id" });
      return;
    }

    const todo = await this.service.getTodo(userId, id);
    if (!todo) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }

    res.json(todo);
  };

  // POST /todos
  create = async (req: CRequest, res: CResponse): Promise<void> => {
    const { user_id, text, category, dueDate, priority, completed } = (req.body ?? {}) as {
      user_id?: number;
      text?: string;
      category?: string;
      dueDate?: string | null;
      priority?: string;
      completed?: boolean;
    };

    if (!user_id || !text || !category || !priority) {
      res.status(400).json({ error: "Missing required fields (user_id, text, category, priority)" });
      return;
    }

    const validPriorities = ['low', 'medium', 'high'] as const;
    if (!validPriorities.includes(priority as any)) {
      res.status(400).json({ error: "Priority must be 'low', 'medium', or 'high'" });
      return;
    }

    const todo = await this.service.createTodo(user_id, {
      text,
      category,
      due_date: dueDate ? new Date(dueDate) : null,
      priority: priority as 'low' | 'medium' | 'high',
      completed: completed ?? false,
    });
    res.status(201).json(todo);
  };

  // PUT /todos/:id
  update = async (req: CRequest, res: CResponse): Promise<void> => {
    const userId = Number(req.body?.user_id);
    const id = Number(req.params?.id);
    const { text, category, dueDate, priority, completed } = (req.body ?? {}) as {
      text?: string;
      category?: string;
      dueDate?: string | null;
      priority?: string;
      completed?: boolean;
    };

    if (isNaN(userId) || isNaN(id)) {
      res.status(400).json({ error: "Invalid user_id or todo id" });
      return;
    }

    if (!text || !category || !priority) {
      res.status(400).json({ error: "Missing required fields (text, category, priority)" });
      return;
    }

    const validPriorities = ['low', 'medium', 'high'] as const;
    if (!validPriorities.includes(priority as any)) {
      res.status(400).json({ error: "Priority must be 'low', 'medium', or 'high'" });
      return;
    }

    const updated = await this.service.updateTodo(userId, id, {
      text,
      category,
      due_date: dueDate ? new Date(dueDate) : null,
      priority: priority as 'low' | 'medium' | 'high',
      completed: completed ?? false,
    });

    if (!updated) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }

    res.json(updated);
  };

  // PATCH /todos/:id
  patch = async (req: CRequest, res: CResponse): Promise<void> => {
    const userId = Number(req.body?.user_id);
    const id = Number(req.params?.id);
    const { text, category, dueDate, priority, completed } = (req.body ?? {}) as {
      text?: string;
      category?: string;
      dueDate?: string | null;
      priority?: string;
      completed?: boolean;
    };

    if (isNaN(userId) || isNaN(id)) {
      res.status(400).json({ error: "Invalid user_id or todo id" });
      return;
    }

    if (priority) {
      const validPriorities = ['low', 'medium', 'high'] as const;
      if (!validPriorities.includes(priority as any)) {
        res.status(400).json({ error: "Priority must be 'low', 'medium', or 'high'" });
        return;
      }
    }

    const updates: Partial<Omit<Todo, "id" | "user_id" | "created_at" | "updated_at" | "order_position">> = {
      text,
      category,
      due_date: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
      priority: priority as 'low' | 'medium' | 'high' | undefined,
      completed,
    };

    const todo = await this.service.patchTodo(userId, id, updates);
    if (!todo) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }

    res.status(200).json(todo);
  };

  // DELETE /todos/:id?user_id=<user_id>
  delete = async (req: CRequest, res: CResponse): Promise<void> => {
    const userId = Number(req.query?.user_id);
    const id = Number(req.params?.id);
    if (isNaN(userId) || isNaN(id)) {
      res.status(400).json({ error: "Invalid user_id or todo id" });
      return;
    }

    const success = await this.service.deleteTodo(userId, id);
    if (!success) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }

    res.status(204).send();
  };

  // POST /todos/order?user_id=<user_id>
  reorder = async (req: CRequest, res: CResponse): Promise<void> => {
    const userId = Number(req.query?.user_id);
    const { order } = (req.body ?? {}) as { order?: number[] };
    if (isNaN(userId) || !Array.isArray(order) || order.length === 0) {
      res.status(400).json({ error: "Invalid user_id or order array" });
      return;
    }

    await this.service.reorderTodos(userId, order);
    res.status(200).json({ message: "Order updated successfully" });
  };
}