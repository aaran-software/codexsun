// File: user-routes.ts
// Location: src/user-routes.ts
// Description: User management routes for ERP system (GET /api/users, POST /api/users, GET /api/users/:id, PUT /api/users/:id, DELETE /api/users/:id).
// Uses dummy data for simulation and RequestContext with tenantId from x-tenant-id header.

import { createHttpRouter } from "../routes/chttpx";
import { Logger } from "../logger/logger";
import { RequestContext } from "../routes/middleware";

// Mock user data for simulation
let users: any[] = [
    { id: 1, username: "john_doe", email: "john@example.com", role: "admin", tenantId: "default" },
    { id: 2, username: "jane_smith", email: "jane@example.com", role: "user", tenantId: "default" },
    { id: 3, username: "bob_jones", email: "bob@example.com", role: "manager", tenantId: "tenant_2" },
];

export function createUserRouter() {
    const { routeRequest, Route } = createHttpRouter();
    const logger = new Logger();

    Route("GET", "/api/users", async (ctx: RequestContext) => handleGetUsers(ctx, logger));
    Route("POST", "/api/users", async (ctx: RequestContext) => handleCreateUser(ctx, logger));
    Route("GET", "/api/users/:id", async (ctx: RequestContext) => handleGetUserById(ctx, logger));
    Route("PUT", "/api/users/:id", async (ctx: RequestContext) => handleUpdateUser(ctx, logger));
    Route("DELETE", "/api/users/:id", async (ctx: RequestContext) => handleDeleteUser(ctx, logger));

    return { routeRequest, Route };
}

function handleGetUsers(ctx: RequestContext, logger: Logger): any {
    if (!ctx.tenantId) {
        logger.warn("Missing x-tenant-id header", { method: ctx.method, url: ctx.url });
        throw new Error("x-tenant-id header is required");
    }
    logger.info("Fetching all users", { method: ctx.method, url: ctx.url, tenantId: ctx.tenantId });
    const filteredUsers = users.filter(user => user.tenantId === ctx.tenantId);
    return { users: filteredUsers };
}

function handleCreateUser(ctx: RequestContext, logger: Logger): any {
    if (!ctx.tenantId) {
        logger.warn("Missing x-tenant-id header", { method: ctx.method, url: ctx.url });
        throw new Error("x-tenant-id header is required");
    }

    const newUser = ctx.body;
    if (!newUser?.username || !newUser?.email || !newUser?.role) {
        logger.warn("Invalid user data", { method: ctx.method, url: ctx.url, tenantId: ctx.tenantId });
        throw new Error("Username, email, and role are required");
    }
    const user = { id: users.length + 1, ...newUser, tenantId: ctx.tenantId };
    users.push(user);
    logger.info("User created", { method: ctx.method, url: ctx.url, tenantId: ctx.tenantId, user });
    return { message: "User created", user };
}

function handleGetUserById(ctx: RequestContext, logger: Logger): any {
    if (!ctx.tenantId) {
        logger.warn("Missing x-tenant-id header", { method: ctx.method, url: ctx.url });
        throw new Error("x-tenant-id header is required");
    }
    const id = extractIdFromPath(ctx.pathname);
    const user = users.find(u => u.id === parseInt(id) && u.tenantId === ctx.tenantId);
    if (!user) {
        logger.warn("User not found", { method: ctx.method, url: ctx.url, id, tenantId: ctx.tenantId });
        throw new Error("User not found");
    }
    logger.info("Fetching user by ID", { method: ctx.method, url: ctx.url, id, tenantId: ctx.tenantId });
    return { user };
}

function handleUpdateUser(ctx: RequestContext, logger: Logger): any {
    if (!ctx.tenantId) {
        logger.warn("Missing x-tenant-id header", { method: ctx.method, url: ctx.url });
        throw new Error("x-tenant-id header is required");
    }
    const id = extractIdFromPath(ctx.pathname);
    const userIndex = users.findIndex(u => u.id === parseInt(id) && u.tenantId === ctx.tenantId);
    if (userIndex === -1) {
        logger.warn("User not found for update", { method: ctx.method, url: ctx.url, id, tenantId: ctx.tenantId });
        throw new Error("User not found");
    }
    const updatedData = ctx.body;
    if (!updatedData?.username && !updatedData?.email && !updatedData?.role) {
        logger.warn("No valid fields provided for update", { method: ctx.method, url: ctx.url, id, tenantId: ctx.tenantId });
        throw new Error("At least one field (username, email, role) must be provided");
    }
    users[userIndex] = { ...users[userIndex], ...updatedData, id: parseInt(id), tenantId: ctx.tenantId };
    logger.info("User updated", { method: ctx.method, url: ctx.url, id, tenantId: ctx.tenantId, user: users[userIndex] });
    return { message: "User updated", user: users[userIndex] };
}

function handleDeleteUser(ctx: RequestContext, logger: Logger): any {
    if (!ctx.tenantId) {
        logger.warn("Missing x-tenant-id header", { method: ctx.method, url: ctx.url });
        throw new Error("x-tenant-id header is required");
    }
    const id = extractIdFromPath(ctx.pathname);
    const userIndex = users.findIndex(u => u.id === parseInt(id) && u.tenantId === ctx.tenantId);
    if (userIndex === -1) {
        logger.warn("User not found for deletion", { method: ctx.method, url: ctx.url, id, tenantId: ctx.tenantId });
        throw new Error("User not found");
    }
    const deletedUser = users.splice(userIndex, 1)[0];
    logger.info("User deleted", { method: ctx.method, url: ctx.url, id, tenantId: ctx.tenantId });
    return { message: "User deleted", user: deletedUser };
}

function extractIdFromPath(pathname: string): string {
    const segments = pathname.split("/");
    return segments[segments.length - 1];
}