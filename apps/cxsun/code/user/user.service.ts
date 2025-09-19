// apps/cxsun/code/user/user.service.ts

import type { User } from "./user.model";
import { UserRepository } from "./user.repos";

export class UserService {
    private repo: UserRepository;

    constructor(repo: UserRepository) {
        this.repo = repo;
    }

    async getAllUsers(): Promise<User[]> {
        return this.repo.findAll();
    }

    async getUser(id: number): Promise<User | null> {
        return this.repo.findById(id);
    }

    async createUser(name: string, email: string, password: string): Promise<User> {
        return this.repo.create({ name, email, password, status: "active" });
    }

    async updateUser(id: number, data: Partial<Omit<User, "id">>): Promise<User | null> {
        return this.repo.update(id, data);
    }

    async patchUser(id: number, updates: Partial<User>): Promise<User | null> {
        return this.repo.patchUser(id, updates);
    }

    async deleteUser(id: number): Promise<boolean> {
        return this.repo.delete(id);
    }
}
