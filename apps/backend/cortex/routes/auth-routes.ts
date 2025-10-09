import { IncomingMessage, ServerResponse } from "node:http";
import { createHttpRouter } from "./chttpx";
import { Logger } from "../logger/logger";
import { login, logout, isTokenValid } from "../core/auth/login-controller";
import { verifyJwt } from "../core/secret/jwt-service";

export function createAuthRouter() {
    const { routeRequest, Route } = createHttpRouter();
    const logger = new Logger();

    // Login route
    Route("POST", "/login", async (req: IncomingMessage, res: ServerResponse) => {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", async () => {
            try {
                const credentials = JSON.parse(body);
                const response = await login({ body: credentials });

                logger.info("Successful login", {
                    method: req.method,
                    url: req.url,
                    email: credentials.email,
                });
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(
                    JSON.stringify({
                        user: {
                            id: response.user.id,
                            username: response.user.username,
                            email: response.user.email,
                            tenantId: response.user.tenantId,
                            role: response.user.role,
                            token: response.user.token,
                        },
                        tenant: {
                            id: response.tenant.id,
                            dbConnection: response.tenant.dbConnection,
                        },
                    })
                );
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                logger.error("Error during login", {
                    method: req.method,
                    url: req.url,
                    error: errorMessage,
                });

                if (
                    errorMessage.includes("Invalid credentials") ||
                    errorMessage.includes("No tenant associated") ||
                    errorMessage.includes("Tenant not found")
                ) {
                    res.writeHead(401, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Invalid credentials" }));
                } else if (
                    errorMessage.includes("Email and password are required") ||
                    errorMessage.includes("Valid email is required") ||
                    errorMessage.includes("Multiple tenants found") ||
                    errorMessage.includes("Incomplete tenant configuration")
                ) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: errorMessage }));
                } else {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Invalid JSON" }));
                }
            }
        });
    });

    // Logout route
    Route("POST", "/logout", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                logger.warn("Logout attempt with missing token", {
                    method: req.method,
                    url: req.url,
                });
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Token required" }));
                return;
            }

            const token = authHeader.replace("Bearer ", "");
            await logout(token);

            logger.info("Logout request", {
                method: req.method,
                url: req.url,
            });
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Logged out successfully" }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            logger.error("Error during logout", {
                method: req.method,
                url: req.url,
                error: errorMessage,
            });
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: errorMessage }));
        }
    });

    // Token validation route
    Route("GET", "/api/auth/verify", async (req: IncomingMessage, res: ServerResponse) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            logger.warn("Invalid or missing token", {
                method: req.method,
                url: req.url,
            });
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Invalid or missing token" }));
            return;
        }

        const token = authHeader.replace("Bearer ", "");
        try {
            const isValid = await isTokenValid(token);
            if (!isValid) {
                throw new Error("Invalid or expired token");
            }

            const payload = await verifyJwt(token);
            logger.info("Token verification successful", {
                method: req.method,
                url: req.url,
            });
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
                JSON.stringify({
                    message: "Token is valid",
                    user: {
                        id: payload.id,
                        username: "admin_user",
                        tenantId: payload.tenantId,
                        role: payload.role,
                    },
                })
            );
        } catch (err) {
            logger.warn("Token verification failed", {
                method: req.method,
                url: req.url,
                error: err instanceof Error ? err.message : String(err),
            });
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Invalid or expired token" }));
        }
    });

    return { routeRequest, Route };
}