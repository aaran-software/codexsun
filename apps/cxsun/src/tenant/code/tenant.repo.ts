// apps/cxsun/src/tenant/code/tenant.repo.ts
import { mdb } from "../../../../../cortex/database/db";
import type { Tenant, TenantID } from "./tenant.model";

export interface ListOptions {
    cursor?: string;   // last seen id (opaque)
    limit: number;     // page size
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

type Row = {
    id: string;
    name: string;
    updated_at: string;
};

function mapRowToTenant(r: Row): Tenant {
    // We don’t have created_at in the schema; we mirror updated_at for createdAt for now.
    const iso = (s: string | null | undefined) =>
        s ? s.replace(" ", "T") + "Z" : new Date().toISOString();
    return {
        id: r.id,
        name: r.name,
        createdAt: iso(r.updated_at),
        updatedAt: iso(r.updated_at),
    };
}

export class DbTenantRepo implements TenantRepo {
    async list(opts: ListOptions): Promise<ListResult<Tenant>> {
        const limit = Math.max(1, Math.min(200, Number(opts.limit || 20)));

        // Cursor is last seen id in ascending id order.
        const params: any[] = [];
        let where = "WHERE 1=1";
        if (opts.cursor) {
            where += " AND id > ?";
            params.push(opts.cursor);
        }

        const sql = `
      SELECT id, name, updated_at
      FROM tenants
      ${where}
      ORDER BY id ASC
      LIMIT ?
    `;

        const rows = await mdb.fetchAll<Row>(sql, [...params, limit]);
        const items = rows.map(mapRowToTenant);
        const nextCursor = items.length === limit ? items[items.length - 1]!.id : undefined;

        return {
            ok: true,
            count: items.length,
            items,
            nextCursor,
        };
    }

    async get(id: TenantID): Promise<Tenant | null> {
        const row = await mdb.fetchOne<Row>(
            `SELECT id, name, updated_at FROM tenants WHERE id = ? LIMIT 1`,
            [id]
        );
        return row ? mapRowToTenant(row) : null;
    }

    async create(data: Omit<Tenant, "id" | "createdAt" | "updatedAt">): Promise<Tenant> {
        // Generate a compact id in SQL (or do it in TS if you prefer).
        const id = Math.random().toString(36).slice(2, 18);
        const nowSql = `datetime('now')`; // fine for SQLite; for other engines you can replace with NOW()
        await mdb.query(
            `INSERT INTO tenants (id, name, updated_at, is_active)
       VALUES (?, ?, ${nowSql}, 1)`,
            [id, data.name]
        );
        const t = await this.get(id);
        if (!t) throw new Error("Failed to create tenant (not found after insert)");
        return t;
    }

    async update(
        id: TenantID,
        data: Partial<Omit<Tenant, "id" | "createdAt" | "updatedAt">>
    ): Promise<Tenant | null> {
        const fields: string[] = [];
        const args: any[] = [];

        if (data.name !== undefined) {
            fields.push("name = ?");
            args.push(data.name);
        }
        // always bump updated_at
        fields.push(`updated_at = datetime('now')`);

        if (fields.length === 0) {
            return this.get(id);
        }

        await mdb.query(
            `UPDATE tenants SET ${fields.join(", ")} WHERE id = ?`,
            [...args, id]
        );
        return this.get(id);
    }

    async remove(id: TenantID): Promise<boolean> {
        const res = await mdb.query(`DELETE FROM tenants WHERE id = ?`, [id]);
        // engines return different shapes; we just check get() afterwards for safety
        const after = await this.get(id);
        return !after;
    }
}
