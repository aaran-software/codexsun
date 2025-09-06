// apps/cxsun/src/tenant/code/tenant.controller.ts
import type { ListOptions } from "./tenant.repo";
import { DbTenantRepo } from "./tenant.repo";
import { TenantService } from "./tenant.service";

export class TenantController {
    private readonly svc: TenantService;

    constructor(svc?: TenantService) {
        this.svc = svc ?? new TenantService(new DbTenantRepo());
    }

    // GET /api/tenants
    async index(req: any) {
        const q = req?.query ?? {};
        const limit = Math.max(1, Math.min(100, Number(q.limit ?? 20)));
        const cursor = typeof q.cursor === "string" ? q.cursor : undefined;

        const opts: ListOptions = { limit, cursor };
        const out = await this.svc.list(opts);
        return out; // { ok, count, items, nextCursor? }
    }

    // GET /api/tenants/create (meta, if needed)
    async create(_req: any) {
        return { ok: true, meta: { allowed: true } };
    }

    // GET /api/tenants/:id & /api/tenants/:id/edit
    async edit(req: any) {
        const id = req?.params?.id;
        if (!id) return { ok: false, error: "BAD_REQUEST", message: "id required" };
        const t = await this.svc.get(id);
        if (!t) return { ok: false, error: "NOT_FOUND" };
        return { ok: true, item: t };
    }

    // PUT /api/tenants/:id
    async update(req: any) {
        const id = req?.params?.id;
        if (!id) return { ok: false, error: "BAD_REQUEST", message: "id required" };
        const body = req?.body ?? {};
        const up = await this.svc.update(id, { name: body.name });
        if (!up) return { ok: false, error: "NOT_FOUND" };
        return { ok: true, item: up };
    }

    // POST /api/tenants
    async store(req: any) {
        const body = req?.body ?? {};
        if (!body?.name) return { ok: false, error: "BAD_REQUEST", message: "name required" };
        const t = await this.svc.create({ name: body.name });
        return { ok: true, item: t };
    }

    // DELETE /api/tenants/:id
    async delete(req: any) {
        const id = req?.params?.id;
        if (!id) return { ok: false, error: "BAD_REQUEST", message: "id required" };
        const ok = await this.svc.remove(id);
        return { ok };
    }

    // Optional utilities used by routes
    async print(_req: any) {
        return { ok: true };
    }
    async upload(_req: any) {
        return { ok: true };
    }
    async download(_req: any) {
        return { ok: true };
    }
}
