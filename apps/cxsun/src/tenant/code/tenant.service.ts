// apps/cxsun/src/tenant/code/tenant.service.ts
import type { Tenant, TenantID } from "./tenant.model";
import type { ListOptions, ListResult, TenantRepo } from "./tenant.repo";

export class TenantService {
    constructor(private readonly repo: TenantRepo) {}

    list(opts: ListOptions): Promise<ListResult<Tenant>> {
        return this.repo.list(opts);
    }

    get(id: TenantID): Promise<Tenant | null> {
        return this.repo.get(id);
    }

    create(data: Omit<Tenant, "id" | "createdAt" | "updatedAt">): Promise<Tenant> {
        return this.repo.create(data);
    }

    update(id: TenantID, data: Partial<Omit<Tenant, "id" | "createdAt" | "updatedAt">>) {
        return this.repo.update(id, data);
    }

    remove(id: TenantID): Promise<boolean> {
        return this.repo.remove(id);
    }
}
