// tests/apps/cxsun/tenant/test_db_to_tenant.ts
import { mdb } from "../../../../cortex/database/db";

type TenantRow = { id: string; name: string; updated_at?: any };

async function listTables(): Promise<string[]> {
    // SQLite (newer)
    try {
        const rows = await mdb.fetchAll<{ name: string }>(`PRAGMA table_list`);
        if (rows?.length) return rows.map((r) => r.name).sort();
    } catch {}
    // SQLite (classic)
    try {
        const rows = await mdb.fetchAll<{ name: string }>(
            `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
        );
        if (rows?.length) return rows.map((r) => r.name).sort();
    } catch {}
    // MySQL / MariaDB
    try {
        const rows = await mdb.fetchAll<{ table_name: string }>(
            `SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()`
        );
        if (rows?.length) return rows.map((r) => r.table_name).sort();
    } catch {}
    // Postgres
    try {
        const rows = await mdb.fetchAll<{ tablename: string }>(
            `SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema')`
        );
        if (rows?.length) return rows.map((r) => r.tablename).sort();
    } catch {}
    return [];
}

export async function test_db_to_tenant(): Promise<void> {
    const ok = await mdb.healthz();
    if (!ok) throw new Error("❌ mdb.healthz() failed (shared DB not reachable)");

    const tables = await listTables();
    console.log("[test] tables:", tables);
    if (!tables.includes("tenants")) {
        throw new Error("❌ 'tenants' table not found after bootstrap");
    }

    const countRow = await mdb.fetchOne<{ n: number }>(`SELECT COUNT(*) AS n FROM tenants`);
    const count = Number(countRow?.n ?? 0);
    if (!(count >= 1)) throw new Error(`❌ expected at least 1 tenant, found count=${count}`);

    const def = await mdb.fetchOne<TenantRow>(`SELECT id, name, updated_at FROM tenants WHERE id = ?`, [
        "tenant_default",
    ]);
    if (!def) throw new Error("❌ default tenant 'tenant_default' not found");

    const sample = await mdb.fetchAll<TenantRow>(
        `
            SELECT id, name, updated_at
            FROM tenants
            ORDER BY updated_at ASC, id ASC
                LIMIT 5
        `
    );
    console.log("[test] tenants.count:", count);
    console.table(sample);
    console.log("✅ Tenant DB connectivity test passed");
}
