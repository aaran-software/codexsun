import { createHttpRouter } from "./chttpx";

export function createUserRouter() {
    const { routeRequest, addRoute } = createHttpRouter();

    // Example user routes for ERP-like functionality
    addRoute("GET", "/api/users", (req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ users: [], message: "List of users" }));
    });

    addRoute("GET", "/api/bob", (req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ users: [], message: "List of bob" }));
    });

    addRoute("POST", "/api/users", async (req, res) => {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });
        req.on("end", () => {
            try {
                const userData = JSON.parse(body);
                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "User created", user: userData }));
            } catch (err) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Invalid JSON" }));
            }
        });
    });

    return { routeRequest, addRoute };
}