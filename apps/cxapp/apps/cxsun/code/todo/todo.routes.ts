// apps/cxsun/code/todo/todo.routes.ts

import type { Application } from "../../../../cortex/core/application";
import { TodoController } from "./todo.controller";

export function registerTodoRoutes(app: Application) {
  const controller = new TodoController(app);

  // Unprotected routes
  app.router.register("GET", "/todos", controller.getAll);
  app.router.register("GET", "/todos/:id", controller.getById);
  app.router.register("POST", "/todos", controller.create);
  app.router.register("PUT", "/todos/:id", controller.update);
  app.router.register("PATCH", "/todos/:id", controller.patch);
  app.router.register("DELETE", "/todos/:id", controller.delete);
  app.router.register("POST", "/todos/order", controller.reorder);
}