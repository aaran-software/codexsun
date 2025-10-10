// File: todos-routes.ts
// Location: src/todos-routes.ts
// Description: New file for task management (e.g., GET /todos, POST /todos). Simulates a basic ERP task module.

import { createHttpRouter } from "../routes/chttpx";
import { Logger } from "../logger/logger";
import { RequestContext } from "../routes/middleware";

// Mock todos data for simulation
let todos: any[] = [];

export function createTodosRouter() {
    const { routeRequest, Route } = createHttpRouter();
    const logger = new Logger();

    Route("GET", "/todos", async (ctx: RequestContext) => {
        return handleGetTodos(ctx, logger);
    });

    Route("POST", "/todos", async (ctx: RequestContext) => {
        return handleCreateTodo(ctx, logger);
    });

    return { routeRequest, Route };
}

function handleGetTodos(ctx: RequestContext, logger: Logger): any {
    logger.info("Fetching todos", { method: ctx.method, url: ctx.url });
    return { todos };
}

function handleCreateTodo(ctx: RequestContext, logger: Logger): any {
    const newTodo = ctx.body;
    if (!newTodo || !newTodo.task) {
        throw new Error("Invalid todo data");
    }
    todos.push(newTodo);
    logger.info("Todo created", { method: ctx.method, url: ctx.url, todo: newTodo });
    return { message: "Todo created", todo: newTodo };
}