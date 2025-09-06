// apps/app-test.ts
// App-level test runner (exports default). Loads env and runs the tenant suite.

import "dotenv/config";
import { tenantE2E } from "./cxsun/tenant/tenant.e2e.test";
import { resolveLogger } from "../base/bootstrap";
import {test_db_to_tenant} from "./cxsun/tenant/test_db_to_tenant";
import {test_tenant_repo} from "./cxsun/tenant/test_tenant_repo";
import {test_drop_test_rows} from "./cxsun/tenant/test_drop_test_rows";
import {test_tenant_routes} from "./cxsun/tenant/test_tenant_routes";

export default async function runAppTests() {
    const logger = await resolveLogger();
    logger.info("[runner] starting tenant suite");

    // await tenantE2E();

    await (async () => {
        console.log("[runner] starting tenant suite");
        try {
            // await test_db_to_tenant();  // connectivity + sanity
            // await test_tenant_repo();
            await test_tenant_routes();// CRUD + pagination + cleanup
            // await test_drop_test_rows();
            console.log("[runner] all done 🙏");
            process.exit(0);
        } catch (err) {
            console.error("[runner] test failed ❌");
            console.error(err);
            process.exit(1);
        }
    })();

    logger.info("[runner] all done 🙏");
}
