// apps/cxsun/src/tenant/code/tenant.repo.ts

import { mdb } from "../../../../../cortex/database/db";
import type { Tenant, TenantID } from "./tenant.model";

export interface ListOptions {
    cursor?: string;
    limit: number;
}

export interface ListResult<T> {
    ok: true;
    count: number;
    items: T[];
    nextCursor?: string;
}

export interface TenantRepo {
    list(opts: ListOptions): Promise<ListResult<Tenant>>;
    get(id: TenantID): Promise<Tenant | null>;
    create(data: Omit<Tenant, "id" | "createdAt" | "updatedAt">): Promise<Tenant>;
    update(id: TenantID, data: Partial<Omit<Tenant, "id" | "createdAt" | "updatedAt">>): Promise<Tenant | null>;
    remove(id: TenantID): Promise<boolean>;
}

/* ----------------------------------------------------------------------------------------------
 * DB-backed implementation (shared master DB -> "tenants" table)
 * Notes:
 *  - Schema has ONLY `updated_at`; no `created_at`. We map createdAt := updatedAt.
 *  - Required NOT NULL cols: driver, db_name. We take sensible defaults from env or fallbacks.
 * --------------------------------------------------------------------------------------------*/
export class DbTenantRepo implements TenantRepo {
    private defaultDriver(): string {
        const v = (process.env.DB_DRIVER ?? "").trim();
        return v || "sqlite";
    }
    private defaultDbName(): string {
        const v = (process.env.DB_NAME ?? "").trim();
        return v || "codexsun_db";
    }
    private defaultSsl(): number {
        return (process.env.DB_SSL ?? "").trim() === "true" ? 1 : 0;
    }

    private toTenant(row: any): Tenant {
        const u = row?.updated_at ?? row?.updatedAt;
        const updatedAt = u instanceof Date ? u.toISOString() : String(u ?? "");
        // createdAt isn't stored; mirror updatedAt to satisfy the model shape
        return {
            id: row.id,
            name: row.name,
            createdAt: updatedAt,
            updatedAt,
        };
    }

    async list(opts: ListOptions): Promise<ListResult<Tenant>> {
        const limit = clampLimit(opts.limit);
        const params: unknown[] = [];

        let where = "";
        if (opts.cursor) {
            const cur = await mdb.fetchOne<{ updated_at: any; id: string }>(
                `SELECT updated_at, id FROM tenants WHERE id = ?`,
                [opts.cursor]
            );
            if (cur) {
                where = `WHERE (updated_at > ? OR (updated_at = ? AND id > ?))`;
                params.push(cur.updated_at, cur.updated_at, cur.id);
            }
        }

        const rows = await mdb.fetchAll<any>(
            `
                SELECT id, name, updated_at
                FROM tenants
                         ${where}
                ORDER BY updated_at ASC, id ASC
                    LIMIT ${limit}
            `,
            params
        );

        const items = rows.map((r) => this.toTenant(r));
        const nextCursor = items.length === limit ? items[items.length - 1]?.id : undefined;
        return { ok: true, count: items.length, items, nextCursor };
    }

    async get(id: TenantID): Promise<Tenant | null> {
        const row = await mdb.fetchOne<any>(
            `SELECT id, name, updated_at
             FROM tenants
             WHERE id = ?`,
            [id]
        );
        return row ? this.toTenant(row) : null;
    }

    async create(data: Omit<Tenant, "id" | "createdAt" | "updatedAt">): Promise<Tenant> {
        const id = genId();
        const driver = this.defaultDriver();
        const dbName = this.defaultDbName();
        const ssl = this.defaultSsl();

        await mdb.query(
            `INSERT INTO tenants (id, name, driver, db_name, ssl, is_active, updated_at)
             VALUES (?, ?, ?, ?, ?, 1, datetime('now'))`,
            [id, data.name, driver, dbName, ssl]
        );

        const row = await mdb.fetchOne<any>(
            `SELECT id, name, updated_at FROM tenants WHERE id = ?`,
            [id]
        );
        if (!row) throw new Error("create() succeeded but row not found");
        return this.toTenant(row);
    }

    async update(id: TenantID, data: Partial<Omit<Tenant, "id" | "createdAt" | "updatedAt">>): Promise<Tenant | null> {
        if (data.name != null) {
            await mdb.query(
                `UPDATE tenants
                 SET name = ?, updated_at = datetime('now')
                 WHERE id = ?`,
                [data.name, id]
            );
        } else {
            await mdb.query(
                `UPDATE tenants
                 SET updated_at = datetime('now')
                 WHERE id = ?`,
                [id]
            );
        }

        const row = await mdb.fetchOne<any>(
            `SELECT id, name, updated_at FROM tenants WHERE id = ?`,
            [id]
        );
        return row ? this.toTenant(row) : null;
    }

    async remove(id: TenantID): Promise<boolean> {
        const before = await mdb.fetchOne<{ n: number }>(
            `SELECT COUNT(*) AS n FROM tenants WHERE id = ?`,
            [id]
        );
        if (Number(before?.n ?? 0) === 0) return false;

        await mdb.query(`DELETE FROM tenants WHERE id = ?`, [id]);

        const after = await mdb.fetchOne<{ n: number }>(
            `SELECT COUNT(*) AS n FROM tenants WHERE id = ?`,
            [id]
        );
        return Number(after?.n ?? 0) === 0;
    }
}

/* utils */
function genId(): string {
    const ts = Date.now().toString(36);
    const rnd = Math.random().toString(36).slice(2, 10);
    return `${ts}${rnd}`;
}
function clampLimit(n?: number) {
    const v = Number.isFinite(n as any) ? Number(n) : 50;
    return Math.max(1, Math.min(200, Math.floor(v)));
}
