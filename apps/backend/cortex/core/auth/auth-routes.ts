// File: auth-routes.ts
// Location: src/auth-routes.ts
// Description: Authentication routes (POST /login, POST /logout, GET /api/auth/verify). Uses RequestContext and focuses on business logic.

import {createHttpRouter} from "../../routes/chttpx";
import {Logger} from "../../logger/logger";
import {RequestContext} from "../../routes/middleware";
import {authenticateUser, logoutUser, verifyUserToken} from "./auth-service";

export function createAuthRouter() {
    const {routeRequest, Route} = createHttpRouter();
    const logger = new Logger();

    Route("POST", "/login", async (ctx: RequestContext) => handleLogin(ctx, logger));
    Route("POST", "/logout", async (ctx: RequestContext) => handleLogout(ctx, logger));
    Route("GET", "/api/auth/verify", async (ctx: RequestContext) => handleTokenVerify(ctx, logger));

    return {routeRequest, Route};
}

async function handleLogin(ctx: RequestContext, logger: Logger): Promise<any> {
    try {
        const credentials = ctx.body;
        if (!credentials?.email || !credentials?.password) {
            new Error("Email and password are required");
        }
        const {user, tenant} = await authenticateUser(credentials);

        logger.info("Successful login", {method: ctx.method, url: ctx.url, email: credentials.email});
        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                tenantId: user.tenantId,
                role: user.role,
                token: user.token,
            },
            tenant: {
                id: tenant.id,
            },
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.error("Error during login", {method: ctx.method, url: ctx.url, error: errorMessage});
        if (
            errorMessage.includes("Invalid credentials") ||
            errorMessage.includes("No tenant associated") ||
            errorMessage.includes("Tenant not found")
        ) {
            throw new Error("Invalid credentials");
        }
        throw new Error(errorMessage);
    }
}

async function handleLogout(ctx: RequestContext, logger: Logger): Promise<any> {
    const authHeader = ctx.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        logger.warn("Logout attempt with missing token", {method: ctx.method, url: ctx.url});
        throw new Error("Token required");
    }
    const token = authHeader.replace("Bearer ", "");
    await logoutUser(token); // Use logoutUser to block the token
    logger.info("Logout request", {method: ctx.method, url: ctx.url});
    return {message: "Logged out successfully"};
}

async function handleTokenVerify(ctx: RequestContext, logger: Logger): Promise<any> {
    const authHeader = ctx.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        logger.warn("Invalid or missing token", {method: ctx.method, url: ctx.url});
        throw new Error("Invalid or missing token");
    }
    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyUserToken(token); // Use verifyUserToken
    logger.info("Token verification successful", {method: ctx.method, url: ctx.url});
    return {
        message: "Token is valid",
        user: {
            id: payload.id,
            tenantId: payload.tenantId,
            role: payload.role,
        },
    };
}