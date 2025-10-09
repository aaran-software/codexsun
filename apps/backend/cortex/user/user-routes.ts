import { IncomingMessage, ServerResponse } from "node:http";
import { createHttpRouter } from "../routes/chttpx";
import { UserController } from "./user.controller";

export function createUserRouter() {
    const { routeRequest, Route } = createHttpRouter();

    // Get all users
    Route("GET", "/api/users", async (req: IncomingMessage, res: ServerResponse) => {
        await UserController.getAll(req, res);
    });

    // Get user by ID
    Route("GET", "/api/users/:id", async (req: IncomingMessage, res: ServerResponse) => {
        await UserController.getById(req, res);
    });

    // Create a new user
    Route("POST", "/api/users", async (req: IncomingMessage, res: ServerResponse) => {
        await UserController.create(req, res);
    });

    // Update a user
    Route("PUT", "/api/users/:id", async (req: IncomingMessage, res: ServerResponse) => {
        await UserController.update(req, res);
    });

    // Delete a user
    Route("DELETE", "/api/users/:id", async (req: IncomingMessage, res: ServerResponse) => {
        await UserController.delete(req, res);
    });

    return { routeRequest, Route };
}