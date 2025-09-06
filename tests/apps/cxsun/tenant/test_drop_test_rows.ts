// tests/apps/cxsun/tenant/test_drop_test_rows.ts
import { mdb } from "../../../../cortex/database/db";

/**
 * Deletes any tenant rows created by tests (name LIKE 'Repo Test %')
 * and asserts that none remain. Prints before/after counts.
 */
export async function test_drop_test_rows(): Promise<void> {
    const before = await mdb.fetchOne<{ n: number }>(
        `SELECT COUNT(*) AS n FROM tenants WHERE name LIKE 'Repo Test %'`
    );
    const beforeCount = Number(before?.n ?? 0);
    console.log(`[drop] test rows before: ${beforeCount}`);

    // Delete all matching rows
    await mdb.query(`DELETE FROM tenants WHERE name LIKE 'Repo Test %'`);

    const after = await mdb.fetchOne<{ n: number }>(
        `SELECT COUNT(*) AS n FROM tenants WHERE name LIKE 'Repo Test %'`
    );
    const afterCount = Number(after?.n ?? 0);
    console.log(`[drop] test rows after:  ${afterCount}`);

    if (afterCount !== 0) {
        throw new Error(`❌ drop test failed: expected 0 leftover rows, found ${afterCount}`);
    }

    console.log("✅ drop test passed (no leftover test rows)");
}
