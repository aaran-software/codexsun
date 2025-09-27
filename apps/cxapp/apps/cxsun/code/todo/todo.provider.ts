// apps/cxsun/code/todo/todo.provider.ts

import type { Application } from "../../../../cortex/core/application";
import { TodoRepository } from "./todo.repos";
import { TodoService } from "./todo.service";
import { registerTodoRoutes } from "./todo.routes";

export class TodoProvider {
  name = "TodoProvider";

  async register(app: Application) {
    app.logger.info(`[${this.name}] Registering services.`);

    // Register repo with real Database
    app.container.register("TodoRepository", {
      useFactory: (c) => new TodoRepository(c.resolve("Database")),
    });

    // Register service with repo instance
    app.container.register("TodoService", {
      useFactory: (c) => new TodoService(c.resolve("TodoRepository")),
    });

    // Register routes
    registerTodoRoutes(app);

    // Track provider
    app.registerProvider(this.name);
    app.logger.info(`[${this.name}] Todo module registration complete`);
  }

  async boot(app: Application) {
    app.logger.info(`[${this.name}] Boot complete`);
  }
}

export default TodoProvider;