import type { User } from "./user.repos";
import { UserRepository } from "./user.repos";

export class UserService {
  private repo: UserRepository;

  constructor(repo: UserRepository) {
    this.repo = repo;
  }

  async getAllUsers(): Promise<User[]> {
    return this.repo.getAllUsers();
  }

  async getUser(id: number): Promise<User | null> {
    return this.repo.getUser(id);
  }

  async createUser(name: string, email: string, password: string): Promise<User> {
    return this.repo.createUser(name, email, password);
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | null> {

      const existing = await this.repo.getUser(id);
      if (!existing) return null;

      const updated = { ...existing, ...data };

    return this.repo.updateUser(id, data);
  }

  async patchUser(id: number, updates: Partial<User>): Promise<User | null> {
    return this.repo.patchUser(id, updates);
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.repo.deleteUser(id);
  }
}