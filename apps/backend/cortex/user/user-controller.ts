import { Logger } from "../logger/logger";
import * as userService from "./user-service";
import { RequestContext } from "../routes/middleware";

export class UserController {
    private static logger = new Logger();

    static async GetUsers(ctx: RequestContext): Promise<any> {
        if (!ctx.tenantId) {
            this.logger.warn("Missing x-tenant-id header", { method: ctx.method, url: ctx.url });
            throw new Error("x-tenant-id header is required");
        }
        this.logger.info("Fetching all users", { method: ctx.method, url: ctx.url, tenantId: ctx.tenantId });
        const users = await userService.getUsersService(ctx.tenantId);
        return { users };
    }

    static async CreateUser(ctx: RequestContext): Promise<any> {
        if (!ctx.tenantId) {
            this.logger.warn("Missing x-tenant-id header", { method: ctx.method, url: ctx.url });
            throw new Error("x-tenant-id header is required");
        }

        const newUser = ctx.body;
        if (!newUser?.username || !newUser?.email || !newUser?.password) {
            this.logger.warn("Invalid user data", { method: ctx.method, url: ctx.url, tenantId: ctx.tenantId });
            throw new Error("Username, email, and password are required");
        }
        const user = await userService.createUserService({ ...newUser, tenant_id: ctx.tenantId });
        this.logger.info("User created", { method: ctx.method, url: ctx.url, tenantId: ctx.tenantId, userId: user.id });
        return { message: "User created", user };
    }

    static async GetUserById(ctx: RequestContext): Promise<any> {
        if (!ctx.tenantId) {
            this.logger.warn("Missing x-tenant-id header", { method: ctx.method, url: ctx.url });
            throw new Error("x-tenant-id header is required");
        }
        const id = this.extractIdFromPath(ctx.pathname);
        const user = await userService.getUserByIdService(parseInt(id), ctx.tenantId);
        if (!user) {
            this.logger.warn("User not found", { method: ctx.method, url: ctx.url, id, tenantId: ctx.tenantId });
            throw new Error("User not found");
        }
        this.logger.info("Fetching user by ID", { method: ctx.method, url: ctx.url, id, tenantId: ctx.tenantId });
        return { user };
    }

    static async UpdateUser(ctx: RequestContext): Promise<any> {
        if (!ctx.tenantId) {
            this.logger.warn("Missing x-tenant-id header", { method: ctx.method, url: ctx.url });
            throw new Error("x-tenant-id header is required");
        }
        const id = this.extractIdFromPath(ctx.pathname);
        const updates = ctx.body;
        if (!updates?.username && !updates?.email && !updates?.password && !updates?.mobile && !updates?.status && !updates?.role_id && !updates?.email_verified) {
            this.logger.warn("No valid fields provided for update", { method: ctx.method, url: ctx.url, id, tenantId: ctx.tenantId });
            throw new Error("At least one field (username, email, password, mobile, status, role_id, email_verified) must be provided");
        }
        const user = await userService.updateUserService(parseInt(id), updates, ctx.tenantId);
        if (!user) {
            this.logger.warn("User not found for update", { method: ctx.method, url: ctx.url, id, tenantId: ctx.tenantId });
            throw new Error("User not found");
        }
        this.logger.info("User updated", { method: ctx.method, url: ctx.url, id, tenantId: ctx.tenantId, userId: user.id });
        return { message: "User updated", user };
    }

    static async DeleteUser(ctx: RequestContext): Promise<any> {
        if (!ctx.tenantId) {
            this.logger.warn("Missing x-tenant-id header", { method: ctx.method, url: ctx.url });
            throw new Error("x-tenant-id header is required");
        }
        const id = this.extractIdFromPath(ctx.pathname);
        const success = await userService.deleteUserService(parseInt(id), ctx.tenantId);
        if (!success) {
            this.logger.warn("User not found for deletion", { method: ctx.method, url: ctx.url, id, tenantId: ctx.tenantId });
            throw new Error("User not found");
        }
        this.logger.info("User deleted", { method: ctx.method, url: ctx.url, id, tenantId: ctx.tenantId });
        return { message: "User deleted" };
    }

    static extractIdFromPath(pathname: string): string {
        const segments = pathname.split("/");
        return segments[segments.length - 1];
    }
}