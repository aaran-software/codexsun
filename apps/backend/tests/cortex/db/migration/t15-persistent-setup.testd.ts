import { getDbConfig } from "../../../../cortex/config/db-config";
import { Connection } from "../../../../cortex/db/connection";
import { query } from "../../../../cortex/db/mdb";
import { masterMigrate } from "../../../../cortex/db/migration/master/master-migrate";
import { masterSeed } from "../../../../cortex/db/migration/master/master-seeder";
import { healthCheck } from "../../../../cortex/db/mdb";

jest.setTimeout(30000);

const MASTER_DB_NAME = "master_db";

interface TenantCountRow {
    count: number;
}

interface TenantRow {
    tenant_id: string;
}

interface UserRow {
    email: string;
    tenant_id: string;
}

describe("Persistent DB Setup: Create/Keep Master Tables & Data", () => {
    let config: ReturnType<typeof getDbConfig>;

    beforeAll(async () => {
        process.env.MASTER_DB_NAME = MASTER_DB_NAME;
        process.env.DB_NAME = "";
        config = getDbConfig();
        console.log('Starting setup for persistent master_db');
        await Connection.initialize({...config, database: ''});
        // Ensure master_db exists
        const dbCheck = await query(`SHOW DATABASES LIKE ?`, [MASTER_DB_NAME], '').catch(() => ({ rowCount: 0 }));
        if (dbCheck.rowCount === 0) {
            console.log(`Creating master database: ${MASTER_DB_NAME}`);
            await query(`CREATE DATABASE \`${MASTER_DB_NAME}\``, [], '');
        }
        // Ensure connection to master_db
        await Connection.initialize({...config, database: MASTER_DB_NAME});
        // Clear existing data to force fresh migrations and seeding
        console.log('Clearing existing tables to ensure fresh setup');
        await query(`DROP TABLE IF EXISTS tenant_users`, [], MASTER_DB_NAME).catch(() => {});
        await query(`DROP TABLE IF EXISTS tenants`, [], MASTER_DB_NAME).catch(() => {});
        await query(`DROP TABLE IF EXISTS migrations`, [], MASTER_DB_NAME).catch(() => {});
        // Run migrations
        console.log('Running migrations to create tables');
        await masterMigrate();
        // Run seeding
        console.log('Running seeder to populate data');
        await masterSeed();
        // Re-init connection for tests
        await Connection.initialize({...config, database: MASTER_DB_NAME});
    });

    it("verifies master_db setup and health", async () => {
        const healthy = await healthCheck(MASTER_DB_NAME);
        expect(healthy).toBe(true);
        const tables = await query<{ [key: string]: string }>(`SHOW TABLES`, [], MASTER_DB_NAME);
        expect(tables.rows.length).toBeGreaterThanOrEqual(3); // migrations, tenants, tenant_users
        console.log('Tables found:', tables.rows.map((row) => row[`Tables_in_${MASTER_DB_NAME}`]));
        const tenants = await query<TenantRow>(`SELECT * FROM tenants WHERE tenant_id = 'default'`, [], MASTER_DB_NAME);
        console.log('Tenants found:', tenants.rows);
        expect(tenants.rows.length).toBe(1);
        expect(tenants.rows[0].tenant_id).toBe('default');
        const users = await query<UserRow>(`SELECT * FROM tenant_users WHERE tenant_id = 'default' ORDER BY email`, [], MASTER_DB_NAME);
        console.log('Users found:', users.rows);
        expect(users.rows.length).toBe(2);
        expect(users.rows[0].email).toBe('admin@default.com');
        expect(users.rows[1].email).toBe('user@default.com');
    });

    afterAll(async () => {
        try {
            await Connection.getInstance().close();
            console.log('Test connection closed');
        } catch {}
    });
});