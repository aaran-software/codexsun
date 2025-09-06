// apps/cxsun/src/tenant/code/tenant.service.ts

import type { Tenant, TenantID } from "./tenant.model";
import type { ListResult } from "./tenant.repo";
import { DbTenantRepo } from "./tenant.repo";

/**
 * Toggle service-level logs with SERVICE_TENANT_DEBUG=1
 */
const DEBUG = String(process.env.SERVICE_TENANT_DEBUG ?? "").trim() === "1";
const log = (...args: any[]) => { if (DEBUG) console.log("[tenant.service]", ...args); };

/**
 * Public input shape for listing tenants
 */
export interface TenantListInput {
    cursor?: string;
    limit?: number;
}

/**
 * Public output for single-tenant fetch
 */
export interface TenantGetResult {
    ok: true;
    item: Tenant | null;
}

/**
 * Service orchestrates business logic on top of the repo.
 * Keep it thin for now: only list + index (get).
 */
export class TenantService {
    constructor(private readonly repo = new DbTenantRepo()) {}

    /**
     * List tenants with cursor pagination.
     * Clamps limit safely; keeps DTO identical to repo ListResult<Tenant>.
     */
    async list(input: TenantListInput = {}): Promise<ListResult<Tenant>> {
        const limit = clampLimit(input.limit);
        log("list()", { cursor: input.cursor, limit });

        // Delegate to repo
        const res = await this.repo.list({ cursor: input.cursor, limit });

        // Optionally transform/augment here if needed
        log("list() ->", { count: res.count, nextCursor: res.nextCursor });
        return res;
    }

    /**
     * Get a single tenant by id.
     * Returns { ok: true, item: Tenant | null } — no throw for not-found.
     */
    async index(id: TenantID): Promise<TenantGetResult> {
        if (!id || typeof id !== "string") {
            throw new Error("tenant.service.index: 'id' must be a non-empty string");
        }
        log("index()", { id });

        const item = await this.repo.get(id);
        log("index() ->", { found: !!item });
        return { ok: true, item };
    }
}

/* --------------------------------- helpers -------------------------------- */

function clampLimit(n?: number) {
    const v = Number.isFinite(n as any) ? Number(n) : 50;
    return Math.max(1, Math.min(200, Math.floor(v)));
}

/* ------------------------------ singleton export --------------------------- */
/**
 * Most callers can import the ready-to-use singleton service.
 * For tests, prefer constructing your own instance for isolation.
 */
export const tenantService = new TenantService();
export default tenantService;
