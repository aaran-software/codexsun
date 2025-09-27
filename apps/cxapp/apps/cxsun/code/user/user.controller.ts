// apps/cxsun/core/user/user.controller.ts

import type { Application } from "../../../../cortex/core/application";
import type { CRequest, CResponse } from "../../../../cortex/http/chttpx";
import type { UserService } from "./user.service";

export class UserController {
    private service: UserService;

    constructor(app: Application) {
        this.service = app.container.resolve<UserService>("UserService");
        console.log("[UserController] Resolved UserService =", this.service);
    }

    // GET /users
    getAll = async (_req: CRequest, res: CResponse): Promise<void> => {
        const users = await this.service.getAllUsers();
        res.json(users);
    };

    // GET /users/:id
    getById = async (req: CRequest, res: CResponse): Promise<void> => {
        const id = Number(req.params?.id);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid user id" });
            return;
        }

        const user = await this.service.getUser(id);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json(user);
    };

    // POST /users
    create = async (req: CRequest, res: CResponse): Promise<void> => {
        const { name, email, password } = (req.body ?? {}) as {
            name?: string;
            email?: string;
            password?: string;
        };

        if (!name || !email || !password) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        const user = await this.service.createUser(name, email, password);
        res.status(201).json(user);
    };

    // PUT /users/:id
    update = async (req: CRequest, res: CResponse): Promise<void> => {
        const id = Number(req.params?.id);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid user id" });
            return;
        }

        const updated = await this.service.updateUser(id, req.body ?? {});
        if (!updated) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json(updated);
    };

    // PATCH /users/:id
    patch = async (req: CRequest, res: CResponse): Promise<void> => {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid ID" });
            return;
        }

        const updates = req.body ?? {};
        const user = await this.service.patchUser(id, updates);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.status(200).json(user);
    };

    // DELETE /users/:id
    delete = async (req: CRequest, res: CResponse): Promise<void> => {
        const id = Number(req.params?.id);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid user id" });
            return;
        }

        const success = await this.service.deleteUser(id);
        if (!success) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.status(204).send();
    };
}
