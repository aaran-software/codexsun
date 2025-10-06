import { getDbConfig } from "../../../../cortex/config/db-config";
import { Connection } from "../../../../cortex/db/connection";
import { query } from "../../../../cortex/db/mdb";
import { masterMigrate } from "../../../../cortex/db/migration/master/master-migrate";
import { masterSeed } from "../../../../cortex/db/migration/master/master-seeder";
import { resetMasterSeed } from "../../../../cortex/db/migration/master/master-seeder";

jest.setTimeout(30000);

const MASTER_DB_NAME = "master_db";

interface TenantRow {
    tenant_id: string;
    db_host: string;
    db_port: string;
    db_user: string;
    db_pass: string | null;
    db_name: string;
    db_ssl: string | null;
    created_at: string;
    updated_at: string;
}

interface TenantUserRow {
    email: string;
    tenant_id: string;
    created_at: string;
    updated_at: string;
}

describe("Seeder Comparison: Real DB Data Assert", () => {
    let config: ReturnType<typeof getDbConfig>;

    beforeAll(async () => {
        process.env.MASTER_DB_NAME = MASTER_DB_NAME;
        process.env.DB_NAME = "";
        config = getDbConfig();
        await Connection.initialize({ ...config, database: '' });
        // Run migrations to create tables
        await query(`DROP TABLE IF EXISTS migrations`, [], MASTER_DB_NAME).catch(() => {});
        await masterMigrate();
        // Seed the database
        await masterSeed();
        // Re-init connection for tests
        await Connection.initialize({ ...config, database: MASTER_DB_NAME });
    });

    afterAll(async () => {
        await resetMasterSeed();
        try {
            await Connection.getInstance().close();
        } catch {}
    });

    it("seeds tenants table with default tenant", async () => {
        const tenants = await query<TenantRow>("SELECT * FROM tenants WHERE tenant_id = 'default'", [], MASTER_DB_NAME);
        expect(tenants.rows.length).toBe(1);
        const row = tenants.rows[0];
        expect(row.tenant_id).toBe('default');
        expect(row.db_host).toBe(process.env.DB_HOST || 'localhost');
        expect(row.db_port).toBe(process.env.DB_PORT || '3306');
        expect(row.db_user).toBe(process.env.DB_USER || 'root');
        expect(row.db_pass).toBe(process.env.DB_PASS || '');
        expect(row.db_name).toBe(process.env.DEFAULT_TENANT_DB || 'tenant_db');
        expect(row.db_ssl).toBe(process.env.DB_SSL || 'false');
        expect(row.created_at).toBeDefined();
        expect(row.updated_at).toBeDefined();
    });

    it("seeds tenant_users table with default users", async () => {
        const users = await query<TenantUserRow>("SELECT * FROM tenant_users WHERE tenant_id = 'default' ORDER BY email", [], MASTER_DB_NAME);
        expect(users.rows.length).toBe(2);
        expect(users.rows[0].email).toBe('admin@default.com');
        expect(users.rows[0].tenant_id).toBe('default');
        expect(users.rows[0].created_at).toBeDefined();
        expect(users.rows[0].updated_at).toBeDefined();
        expect(users.rows[1].email).toBe('user@default.com');
        expect(users.rows[1].tenant_id).toBe('default');
        expect(users.rows[1].created_at).toBeDefined();
        expect(users.rows[1].updated_at).toBeDefined();
    });
});