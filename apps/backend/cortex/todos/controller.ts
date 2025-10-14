// cortex/todos/controller.ts
import { RequestContext } from "../routes/middleware";
import { Logger } from "../logger/logger";
import { authMiddleware } from "../core/auth/auth-middleware";

abstract class BaseController {
    protected static logger = new Logger();

    /**
     * Validates tenantId and user authentication, throws error if missing
     */
    protected static async validateAuthContext(ctx: RequestContext): Promise<{ tenantId: string; userId: string }> {
        await authMiddleware(ctx);

        const tenantId = ctx.tenantId;
        if (!tenantId) {
            this.logger.warn("Missing x-tenant-id header", {
                method: ctx.method,
                url: ctx.url
            });
            throw new Error("x-tenant-id header is required");
        }

        const userId = ctx.userId;
        if (!userId) {
            this.logger.warn("Missing user authentication", {
                method: ctx.method,
                url: ctx.url,
                tenantId
            });
            throw new Error("User authentication required");
        }

        return { tenantId, userId };
    }

    /**
     * Extracts ID from path and validates it is a number
     */
    protected static extractAndValidateId(pathname: string): number {
        const idStr = this.extractIdFromPath(pathname);
        const id = parseInt(idStr, 10);

        if (isNaN(id) || id <= 0) {
            throw new Error(`Invalid ID: ${idStr}`);
        }

        return id;
    }

    /**
     * Generic handler for not found scenarios
     */
    protected static handleNotFound(ctx: RequestContext, id: number | string, operation: string, entityName = "Item"): never {
        this.logger.warn(`${operation} - ${entityName} not found`, {
            method: ctx.method,
            url: ctx.url,
            id,
            tenantId: ctx.tenantId
        });
        throw new Error(`${entityName} not found`);
    }

    /**
     * Logs successful operation
     */
    protected static logSuccess(ctx: RequestContext, operation: string, id?: number): void {
        this.logger.info(`${operation} successful`, {
            method: ctx.method,
            url: ctx.url,
            ...(id && { id }),
            tenantId: ctx.tenantId
        });
    }

    /**
     * Validates update input has at least one field
     */
    protected static validateUpdateInput(updates: any): void {
        if (Object.keys(updates).length === 0) {
            throw new Error("At least one field must be provided for update");
        }
    }

    protected static extractIdFromPath(pathname: string): string {
        const segments = pathname.split("/");
        return segments[segments.length - 1];
    }
}

export { BaseController };