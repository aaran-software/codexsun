// File: user-routes.ts
// Location: src/user-routes.ts
// Description: User management routes for ERP system (GET /api/users, POST /api/users, GET /api/users/:id, PUT /api/users/:id, DELETE /api/users/:id).
// Uses dummy data for simulation and RequestContext for handling requests.

import { createHttpRouter } from "../routes/chttpx";
import { Logger } from "../logger/logger";
import { RequestContext } from "../routes/middleware";

// Mock user data for simulation
let users: any[] = [
    { id: 1, username: "sdf", email: "john@example.com", role: "admin", tenantId: "tenant_1" },
    { id: 2, username: "jansdfsde_smith", email: "jane@example.com", role: "user", tenantId: "tenant_1" },
    { id: 3, username: "fsdfa", email: "bob@example.com", role: "manager", tenantId: "tenant_2" },
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
    logger.info("Fetching all users", { method: ctx.method, url: ctx.url });
    return { users };
}

function handleCreateUser(ctx: RequestContext, logger: Logger): any {
    const newUser = ctx.body;
    if (!newUser?.username || !newUser?.email || !newUser?.role || !newUser?.tenantId) {
        logger.warn("Invalid user data", { method: ctx.method, url: ctx.url });
        throw new Error("Username, email, role, and tenantId are required");
    }
    const user = { id: users.length + 1, ...newUser };
    users.push(user);
    logger.info("User created", { method: ctx.method, url: ctx.url, user });
    return { message: "User created", user };
}

function handleGetUserById(ctx: RequestContext, logger: Logger): any {
    const id = extractIdFromPath(ctx.pathname);
    const user = users.find(u => u.id === parseInt(id));
    if (!user) {
        logger.warn("User not found", { method: ctx.method, url: ctx.url, id });
        throw new Error("User not found");
    }
    logger.info("Fetching user by ID", { method: ctx.method, url: ctx.url, id });
    return { user };
}

function handleUpdateUser(ctx: RequestContext, logger: Logger): any {
    const id = extractIdFromPath(ctx.pathname);
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) {
        logger.warn("User not found for update", { method: ctx.method, url: ctx.url, id });
        throw new Error("User not found");
    }
    const updatedData = ctx.body;
    if (!updatedData?.username && !updatedData?.email && !updatedData?.role && !updatedData?.tenantId) {
        logger.warn("No valid fields provided for update", { method: ctx.method, url: ctx.url, id });
        throw new Error("At least one field (username, email, role, tenantId) must be provided");
    }
    users[userIndex] = { ...users[userIndex], ...updatedData, id: parseInt(id) };
    logger.info("User updated", { method: ctx.method, url: ctx.url, id, user: users[userIndex] });
    return { message: "User updated", user: users[userIndex] };
}

function handleDeleteUser(ctx: RequestContext, logger: Logger): any {
    const id = extractIdFromPath(ctx.pathname);
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) {
        logger.warn("User not found for deletion", { method: ctx.method, url: ctx.url, id });
        throw new Error("User not found");
    }
    const deletedUser = users.splice(userIndex, 1)[0];
    logger.info("User deleted", { method: ctx.method, url: ctx.url, id });
    return { message: "User deleted", user: deletedUser };
}

function extractIdFromPath(pathname: string): string {
    const segments = pathname.split("/");
    return segments[segments.length - 1];
}