// File: cortex/todos/todos-routes.ts
// Description: Todo management routes for ERP system
import { createHttpRouter } from '../routes/chttpx';
import { RequestContext } from '../routes/middleware';
import { TodoController } from './todos-controller';

export function createTodosRouter() {
    const { routeRequest, Route } = createHttpRouter();

    Route("GET", "/api/todos", async (ctx: RequestContext) => TodoController.GetTodos(ctx));
    Route("POST", "/api/todos", async (ctx: RequestContext) => TodoController.CreateTodo(ctx));
    Route("GET", "/api/todos/:id", async (ctx: RequestContext) => TodoController.GetTodoById(ctx));
    Route("PUT", "/api/todos/:id", async (ctx: RequestContext) => TodoController.UpdateTodo(ctx));
    Route("DELETE", "/api/todos/:id", async (ctx: RequestContext) => TodoController.DeleteTodo(ctx));
    Route("POST", "/api/todos/order", async (ctx: RequestContext) => TodoController.UpdateTodoOrder(ctx));

    return { routeRequest, Route };
}