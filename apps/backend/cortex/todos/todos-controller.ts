// cortex/todos/todos-controller.ts

import {RequestContext} from "../routes/middleware";
import * as todosService from "./todos-service";
import {BaseController} from "./controller";


export class TodosController extends BaseController {


    static async GetAll(ctx: RequestContext): Promise<any> {
        const {tenantId, userId} = await this.validateAuthContext(ctx);

        this.logger.info("Fetching all todos", {
            method: ctx.method,
            url: ctx.url,
            tenantId,
            userId
        });
        const todos = await todosService.getService(tenantId , userId);
        return {todos, count: todos.length};
    }

    static async Create(ctx: RequestContext): Promise<any> {
        const {tenantId, userId} = await this.validateAuthContext(ctx);
        const input = ctx.body;


        this.logger.info("Creating todo", {
            method: ctx.method,
            url: ctx.url,
            tenantId,
            userId
        });

        const todo = await todosService.createTodoService(input, tenantId);

        this.logSuccess(ctx, "Todo created", todo.id);
        return {message: "Todo created", todo};
    }

    static async GetById(ctx: RequestContext): Promise<any> {
        const {tenantId, userId} = await this.validateAuthContext(ctx);
        const id = this.extractAndValidateId(ctx.pathname);

        this.logger.info("Fetching todo by ID", {
            method: ctx.method,
            url: ctx.url,
            id,
            tenantId,
            userId
        });

        const todo = await todosService.getTodoByIdService(id, tenantId);

        if (!todo) {
            this.handleNotFound(ctx, id, "Get todo by ID", "Todo");
        }

        this.logSuccess(ctx, "Todo fetched", id);
        return {todo};
    }

    static async Update(ctx: RequestContext): Promise<any> {
        const {tenantId, userId} = await this.validateAuthContext(ctx);
        const id = this.extractAndValidateId(ctx.pathname);
        const updates = ctx.body;

        this.validateUpdateInput(updates);

        this.logger.info("Updating todo", {
            method: ctx.method,
            url: ctx.url,
            id,
            tenantId,
            userId
        });

        const todo = await todosService.updateTodoService(id, updates, tenantId);

        if (!todo) {
            this.handleNotFound(ctx, id, "Update todo", "Todo");
        }

        this.logSuccess(ctx, "Todo updated", id);
        return {message: "Todo updated", todo};
    }

    static async DeleteById(ctx: RequestContext): Promise<any> {
        const {tenantId, userId} = await this.validateAuthContext(ctx);
        const id = this.extractAndValidateId(ctx.pathname);

        this.logger.info("Deleting todo", {
            method: ctx.method,
            url: ctx.url,
            id,
            tenantId,
            userId
        });

        const success = await todosService.deleteTodoService(id, tenantId);

        if (!success) {
            this.handleNotFound(ctx, id, "Delete todo", "Todo");
        }

        this.logSuccess(ctx, "Todo deleted", id);
        return {message: "Todo deleted"};
    }

}