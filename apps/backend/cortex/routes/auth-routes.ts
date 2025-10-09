import { IncomingMessage, ServerResponse } from "node:http";
import { createHttpRouter } from "./chttpx";
import { Logger } from "../logger/logger";

// Dummy user for testing purposes
const DUMMY_USER = {
    username: "admin@example.com",
    password: "admin123",
    id: "admin",
};

// Simulated token for testing
const DUMMY_TOKEN = "dummy-jwt-token-1234567890";

export function createAuthRouter() {
    const { routeRequest, Route } = createHttpRouter();
    const logger = new Logger();

    // Login route
    Route("POST", "/api/login", async (req: IncomingMessage, res: ServerResponse) => {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            try {
                const credentials = JSON.parse(body);
                const { username, password } = credentials;

                if (!username || !password) {
                    logger.warn("Login attempt with missing credentials", {
                        method: req.method,
                        url: req.url,
                    });
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Username and password are required" }));
                    return;
                }

                // Simulate authentication check
                if (username === DUMMY_USER.username && password === DUMMY_USER.password) {
                    logger.info("Successful login", {
                        method: req.method,
                        url: req.url,
                        username,
                    });
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(
                        JSON.stringify({
                            message: "Login successful",
                            token: DUMMY_TOKEN,
                            user: {
                                id: DUMMY_USER.id,
                                username: DUMMY_USER.username,
                            },
                        })
                    );
                } else {
                    logger.warn("Failed login attempt", {
                        method: req.method,
                        url: req.url,
                        username,
                    });
                    res.writeHead(401, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Invalid credentials" }));
                }
            } catch (err) {
                logger.error("Error parsing login request", {
                    method: req.method,
                    url: req.url,
                    error: err instanceof Error ? err.message : String(err),
                });
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Invalid JSON" }));
            }
        });
    });

    // Logout route
    Route("POST", "/api/auth/logout", async (req: IncomingMessage, res: ServerResponse) => {
        // For demo purposes, simply return a success response
        // In a real app, you might invalidate the token on the server
        logger.info("Logout request", {
            method: req.method,
            url: req.url,
        });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Logout successful" }));
    });

    // Optional: Token validation route for testing
    Route("GET", "/api/auth/verify", async (req: IncomingMessage, res: ServerResponse) => {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader === `Bearer ${DUMMY_TOKEN}`) {
            logger.info("Token verification successful", {
                method: req.method,
                url: req.url,
            });
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
                JSON.stringify({
                    message: "Token is valid",
                    user: {
                        id: DUMMY_USER.id,
                        username: DUMMY_USER.username,
                    },
                })
            );
        } else {
            logger.warn("Invalid or missing token", {
                method: req.method,
                url: req.url,
            });
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Invalid or missing token" }));
        }
    });

    return { routeRequest, Route };
}