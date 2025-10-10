import { IncomingMessage, ServerResponse } from "node:http";
import { Logger } from "../logger/logger";
import * as userService from "./user.service";
import { User } from "./user.model";
import { URL } from "node:url";

export class UserController {
    private static logger = new Logger();

    static async create(req: IncomingMessage, res: ServerResponse) {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", async () => {
            try {
                const userData = JSON.parse(body);

                if (!userData.tenant_id) {
                    throw new Error("Tenant ID is required");
                }

                const response = await userService.createUserService(userData);
                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                    id: response.id,
                    username: response.username,
                    email: response.email,
                    mobile: response.mobile,
                    status: response.status,
                    role_id: response.role_id,
                    email_verified: response.email_verified,
                    created_at: response.created_at,
                    updated_at: response.updated_at
                }));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.error("Error creating user", { error: errorMessage });
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: errorMessage }));
            }
        });
    }

    static async getAll(req: IncomingMessage, res: ServerResponse) {
        try {
            const parsedUrl = new URL(req.url || '', `http://${req.headers.host}`);
            const tenantId = parsedUrl.searchParams.get('tenant_id') || '';
            if (!tenantId) {
                throw new Error("Tenant ID is required");
            }
            const users = await userService.getUsersService(tenantId);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(users.map(user => ({
                id: user.id,
                username: user.username,
                email: user.email,
                mobile: user.mobile,
                status: user.status,
                role_id: user.role_id,
                email_verified: user.email_verified,
                created_at: user.created_at,
                updated_at: user.updated_at
            }))));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error("Error fetching users", { error: errorMessage });
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: errorMessage }));
        }
    }

    static async getById(req: IncomingMessage, res: ServerResponse) {
        try {
            const id = parseInt(req.url?.split("/")[3] || "0", 10);
            const tenantId = req.url?.split("tenant_id=")[1] || "";
            if (!id || !tenantId) {
                throw new Error("User ID and Tenant ID are required");
            }
            const user = await userService.getUserByIdService(id, tenantId);
            if (!user) {
                res.writeHead(404, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "User not found" }));
                return;
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
                id: user.id,
                username: user.username,
                email: user.email,
                mobile: user.mobile,
                status: user.status,
                role_id: user.role_id,
                email_verified: user.email_verified,
                created_at: user.created_at,
                updated_at: user.updated_at
            }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error("Error fetching user by id", { error: errorMessage });
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: errorMessage }));
        }
    }

    static async update(req: IncomingMessage, res: ServerResponse) {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", async () => {
            try {
                const id = parseInt(req.url?.split("/")[3] || "0", 10);
                const tenantId = req.url?.split("tenant_id=")[1] || "";
                const updates = JSON.parse(body);
                if (!id || !tenantId) {
                    throw new Error("User ID and Tenant ID are required");
                }
                const updatedUser = await userService.updateUserService(id, updates, tenantId);
                if (!updatedUser) {
                    res.writeHead(404, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "User not found or update failed" }));
                    return;
                }
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                    id: updatedUser.id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    mobile: updatedUser.mobile,
                    status: updatedUser.status,
                    role_id: updatedUser.role_id,
                    email_verified: updatedUser.email_verified,
                    created_at: updatedUser.created_at,
                    updated_at: updatedUser.updated_at
                }));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.error("Error updating user", { error: errorMessage });
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: errorMessage }));
            }
        });
    }

    static async delete(req: IncomingMessage, res: ServerResponse) {
        try {
            const id = parseInt(req.url?.split("/")[3] || "0", 10);
            const tenantId = req.url?.split("tenant_id=")[1] || "";
            if (!id || !tenantId) {
                throw new Error("User ID and Tenant ID are required");
            }
            const deleted = await userService.deleteUserService(id, tenantId);
            if (!deleted) {
                res.writeHead(404, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "User not found or deletion failed" }));
                return;
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "User deleted successfully" }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error("Error deleting user", { error: errorMessage });
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: errorMessage }));
        }
    }
}