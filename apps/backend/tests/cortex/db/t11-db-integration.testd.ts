// E:\Workspace\codexsun\apps\backend\tests\cortex\db\t10-db-integration.test.ts
import { getSettings } from "../../../cortex/config/get-settings";
import { getDbConfig } from "../../../cortex/config/db-config";
import { logQuery, logTransaction, logHealthCheck, logConnection } from "../../../cortex/config/logger";
import { Connection } from "../../../cortex/db/connection";
import { query, withTransaction, healthCheck, tenantStorage } from "../../../cortex/db/db";
import { resolveTenant } from "../../../cortex/core/tenant/tenant-resolver";
import { DbConfig } from "../../../cortex/db/db-types";

jest.setTimeout(30000); // Global timeout increase for integration tests

const TEST_DB = "test_integration_db";
const MASTER_DB = "test_master_db";
const TENANT_DB = "test_tenant_db";

const fullSettings = {
    MASTER_DB_DRIVER: "mariadb",
    MASTER_DB_HOST: "localhost",
    MASTER_DB_PORT: "3306",

    TENANCY: "true",
    DB_DRIVER: "mariadb",
    DB_HOST: "127.0.0.1",
    DB_PORT: "3306",
    DB_USER: "root",
    DB_PASS: "Computer.1",
    DB_NAME: TEST_DB,
    DB_SSL: "false",
};

function setTestEnv(isMaster: boolean = false): void {
    Object.entries(fullSettings).forEach(([key, value]) => {
        process.env[key] = typeof value === 'string' ? value : String(value);
    });
    if (isMaster) {
        process.env.DB_NAME = MASTER_DB;
    }
}

async function runWithTenant<T = void>(db: string | null, cb: () => Promise<T>): Promise<T> {
    if (db) {
        return tenantStorage.run(db, cb);
    } else {
        return tenantStorage.run('', cb);
    }
}

describe("[1.] Integration: Config & Logger", () => {
    beforeEach(() => {
        jest.resetModules(); // Reset cached modules/settings
        process.env = { ...process.env, NODE_ENV: "test" }; // Ensure test env
        setTestEnv();
    });

    afterEach(async () => {
        try {
            await Connection.getInstance().close(); // Clean pool
        } catch {} // Ignore errors
    });

    it("[test 1] getSettings loads defaults/overrides", () => {
        process.env.APP_NAME = "TestApp";
        const settings = getSettings().;
        expect(settings.APP_NAME).toBe("TestApp");
        expect(settings.DB_DRIVER).toBe("mariadb");
        expect(settings.TENANCY).toBe(true);
    });

    it("[test 2] getDbConfig with tenancy", () => {
        const config = getDbConfig();
        expect(config.master.database).toBe(MASTER_DB);
        expect(config.driver).toBe("mariadb"); // Default assumption
    });

    it("[test 3] logger phases/metrics", () => {
        process.env.NODE_ENV = "production"; // Force logging regardless of APP_DEBUG
        const mockDebug = jest.fn();
        const mockInfo = jest.fn();
        console.debug = mockDebug;
        console.info = mockInfo;
        logQuery('start', { sql: "SELECT 1", params: [], db: TEST_DB });
        logQuery('end', { sql: "SELECT 1", params: [], db: TEST_DB, duration: 10 });
        logQuery('error', { sql: "SELECT 1", params: [], db: TEST_DB, error: "err" });
        expect(mockDebug).toHaveBeenCalledTimes(3);
        expect(mockInfo).toHaveBeenCalledTimes(2); // Metrics for end/error
    });
});

describe("[2.] Integration: Connection & DB Ops", () => {
    let realConfig: DbConfig;

    async function setupTestDBs() {
        setTestEnv();
        const masterlessConfig: any = { ...getDbConfig(), database: undefined };
        await Connection.initialize(masterlessConfig);
        const tempConn = Connection.getInstance();
        const client = await tempConn.getClient();
        await client.query(`CREATE DATABASE IF NOT EXISTS ${MASTER_DB}`);
        await client.query(`CREATE DATABASE IF NOT EXISTS ${TEST_DB}`);
        if (client.release) client.release(); else if (client.end) await client.end();
        await tempConn.close();
    }

    async function cleanupTestDBs() {
        setTestEnv();
        const masterlessConfig: any = { ...getDbConfig(), database: undefined };
        await Connection.initialize(masterlessConfig);
        const tempConn = Connection.getInstance();
        const client = await tempConn.getClient();
        await client.query(`DROP DATABASE IF EXISTS ${TEST_DB}`);
        await client.query(`DROP DATABASE IF EXISTS ${MASTER_DB}`);
        if (client.release) client.release(); else if (client.end) await client.end();
        await tempConn.close();
    }

    beforeAll(async () => {
        await setupTestDBs();
    });

    beforeEach(async () => {
        process.env.NODE_ENV = "test";
        setTestEnv();
        try {
            await Connection.getInstance().close();
        } catch {}
        realConfig = getDbConfig();
        await Connection.initialize(realConfig); // Reinit per test
    });

    afterEach(async () => {
        try {
            const conn = Connection.getInstance();
            await conn.close(); // Clean up pool
        } catch {}
    });

    afterAll(async () => {
        await cleanupTestDBs();
    });

    it("[test 1] connection init/close", async () => {
        const conn = Connection.getInstance();
        expect(conn.getConfig()).toEqual(realConfig);
        const client = await conn.getClient(TEST_DB);
        const result = await client.query("SELECT 1");
        expect(result.rows[0]).toEqual({ "1": 1 });
        if (client.release) client.release(); else if (client.end) await client.end();
        await conn.close();
        expect(() => Connection.getInstance()).toThrow("Connection not initialized. Call initialize first.");
    });

    it("[test 2] query/withTransaction/healthCheck", async () => {
        await runWithTenant(TEST_DB, async () => {
            await query(`CREATE TABLE IF NOT EXISTS test_table (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))`);
            const insertRes = await query("INSERT INTO test_table (name) VALUES (?)", ["test"]);
            expect(insertRes.rowCount).toBe(1);
            expect(insertRes.insertId).toBeDefined();

            const txRes = await withTransaction(async (client) => {
                await client.query("INSERT INTO test_table (name) VALUES (?)", ["tx"]);
                return await client.query("SELECT COUNT(*) as count FROM test_table");
            });
            expect(Number(txRes.rows[0].count)).toBe(2);

            const healthy = await healthCheck(TEST_DB);
            expect(healthy).toBe(true);
        });
    });

    it("[test 3] error handling/retries", async () => {
        await runWithTenant(TEST_DB, async () => {
            await expect(query("INVALID SQL")).rejects.toThrow("Query failed");
        });
        const conn = Connection.getInstance();
        jest.spyOn((conn as any).adapter, "initPool").mockRejectedValueOnce(new Error("init fail"));
        await expect(conn.init()).rejects.toThrow("Failed to initialize");
    });
});

describe("[3.] Integration: Tenant Resolver & Multi-Tenant", () => {
    async function setupTenantDBs() {
        setTestEnv(true);
        const masterlessConfig: any = { ...getDbConfig(), database: undefined };
        await Connection.initialize(masterlessConfig);
        const tempConn = Connection.getInstance();
        const client = await tempConn.getClient();
        await client.query(`CREATE DATABASE IF NOT EXISTS ${MASTER_DB}`);
        await client.query(`CREATE DATABASE IF NOT EXISTS ${TENANT_DB}`);
        if (client.release) client.release(); else if (client.end) await client.end();
        await tempConn.close();
    }

    async function cleanupTenantDBs() {
        setTestEnv(true);
        const masterlessConfig: any = { ...getDbConfig(), database: undefined };
        await Connection.initialize(masterlessConfig);
        const tempConn = Connection.getInstance();
        const client = await tempConn.getClient();
        await client.query(`DROP DATABASE IF EXISTS ${TENANT_DB}`);
        await client.query(`DROP DATABASE IF EXISTS ${MASTER_DB}`);
        if (client.release) client.release(); else if (client.end) await client.end();
        await tempConn.close();
    }

    beforeAll(async () => {
        await setupTenantDBs();
    });

    beforeEach(async () => {
        process.env.NODE_ENV = "test";
        setTestEnv(true);
        try {
            await Connection.getInstance().close();
        } catch {}
        const config = getDbConfig();
        await Connection.initialize(config);
        await runWithTenant(MASTER_DB, async () => {
            await query(`CREATE TABLE IF NOT EXISTS tenants (tenant_id VARCHAR(50), db_host VARCHAR(255), db_port VARCHAR(10), db_user VARCHAR(255), db_pass VARCHAR(255), db_name VARCHAR(255), db_ssl VARCHAR(10))`);
            await query(`CREATE TABLE IF NOT EXISTS tenant_users (email VARCHAR(255), tenant_id VARCHAR(50))`);
            await query(`INSERT INTO tenants (tenant_id, db_host, db_port, db_user, db_pass, db_name, db_ssl) VALUES ('tenant-1', 'localhost', '3306', 'user', 'pass', '${TENANT_DB}', 'false')`);
            await query(`INSERT INTO tenant_users (email, tenant_id) VALUES ('test@email.com', 'tenant-1')`);
        });
    });

    afterEach(async () => {
        await runWithTenant(MASTER_DB, async () => {
            await query(`DROP TABLE IF EXISTS tenants, tenant_users`);
        });
        try {
            const conn = Connection.getInstance();
            await conn.close();
        } catch {}
    });

    afterAll(async () => {
        await cleanupTenantDBs();
    });

    it("[test 1] resolveTenant & switch context", async () => {
        await runWithTenant(null, async () => {
            const tenant = await resolveTenant({ body: { email: "test@email.com", password: "pass" } });
            expect(tenant.id).toBe("tenant-1");
            expect(tenant.dbConnection).toContain(TENANT_DB);
        });
    });

    it("[test 2] tenant errors/validation", async () => {
        await runWithTenant(null, async () => {
            await expect(resolveTenant({ body: { email: "", password: "pass" } })).rejects.toThrow("Valid email is required for tenant resolution");
            await expect(resolveTenant({ body: { email: "invalid@email.com", password: "pass" } })).rejects.toThrow("No tenant associated with email: invalid@email.com");
        });
        await runWithTenant(MASTER_DB, async () => {
            await query(`INSERT INTO tenants (tenant_id, db_host, db_port, db_user, db_pass, db_name, db_ssl) VALUES ('tenant-2', 'localhost', '3306', 'user', 'pass', 'tenant2_db', 'false')`);
            await query(`INSERT INTO tenant_users (email, tenant_id) VALUES ('multi@email.com', 'tenant-1')`);
            await query(`INSERT INTO tenant_users (email, tenant_id) VALUES ('multi@email.com', 'tenant-2')`);
        });
        await runWithTenant(null, async () => {
            await expect(resolveTenant({ body: { email: "multi@email.com", password: "pass" } })).rejects.toThrow("Multiple tenants found for email: multi@email.com. Contact support.");
        });
        await runWithTenant(MASTER_DB, async () => {
            await query(`UPDATE tenants SET db_host = NULL WHERE tenant_id = 'tenant-1'`);
        });
        await runWithTenant(null, async () => {
            await expect(resolveTenant({ body: { email: "test@email.com", password: "pass" } })).rejects.toThrow("Incomplete tenant configuration for ID: tenant-1");
        });
    });
});