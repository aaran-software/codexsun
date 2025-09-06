// tests/apps/cxsun/tenant/test_tenant_repo.ts
import { DbTenantRepo } from "../../../../apps/cxsun/src/tenant/code/tenant.repo";
import { mdb } from "../../../../cortex/database/db";

export async function test_tenant_repo(): Promise<void> {
    const repo = new DbTenantRepo();

    // Cleanup any previous test rows (idempotent)
    await cleanupTestRows();

    // Initial list
    const first = await repo.list({ limit: 50 });
    console.log("[repo] initial.count:", first.count);
    console.table(first.items.slice(0, 5));

    // Create
    const name1 = `Repo Test ${Math.random().toString(36).slice(2, 8)}`;
    const created = await repo.create({ name: name1 } as any);
    if (!created?.id) throw new Error("❌ create() did not return an id");
    console.log("[repo] created:", created);

    try {
        // Get
        const got = await repo.get(created.id);
        if (!got) throw new Error("❌ get() returned null for created id");
        if (got.name !== name1) throw new Error(`❌ get().name mismatch: ${got.name} !== ${name1}`);

        // List again (should grow)
        const second = await repo.list({ limit: 200 });
        if (!(second.count >= first.count + 1)) {
            throw new Error(`❌ list() didn't grow: ${second.count} vs ${first.count}+1`);
        }

        // Update
        const name2 = `${name1} (updated)`;
        const updated = await repo.update(created.id, { name: name2 });
        if (!updated) throw new Error("❌ update() returned null");
        if (updated.name !== name2) throw new Error(`❌ update().name mismatch: ${updated.name} !== ${name2}`);
        console.log("[repo] updated:", updated);

        // Pagination check (create two extras and paginate 2-by-2)
        const extra1 = await repo.create({ name: `Repo Test A ${rand3()}` } as any);
        const extra2 = await repo.create({ name: `Repo Test B ${rand3()}` } as any);

        const page1 = await repo.list({ limit: 2 });
        console.log("[repo] page1.count:", page1.count, "nextCursor:", page1.nextCursor);
        console.table(page1.items);
        if (page1.count !== 2) throw new Error("❌ expected page1.count === 2");

        const page2 = await repo.list({ limit: 2, cursor: page1.nextCursor });
        console.log("[repo] page2.count:", page2.count, "nextCursor:", page2.nextCursor);
        console.table(page2.items);

        // Cleanup the extras
        await repo.remove(extra1.id);
        await repo.remove(extra2.id);

        // Remove the originally created row
        const removed = await repo.remove(created.id);
        if (!removed) throw new Error("❌ remove() returned false for created id");

        // Ensure it is gone
        const gone = await repo.get(created.id);
        if (gone !== null) throw new Error("❌ get() should return null after remove");

        console.log("✅ tenant.repo test passed");
    } finally {
        // Always clean up leftover test rows
        await cleanupTestRows();
    }
}

function rand3() {
    return Math.random().toString(36).slice(2, 5);
}

async function cleanupTestRows() {
    await mdb.query(`DELETE FROM tenants WHERE name LIKE 'Repo Test %'`);
}
