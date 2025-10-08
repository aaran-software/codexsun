import { getTenantDbConnection } from "../../../cortex/db/db-context-switcher";
import { Tenant } from "../../../cortex/core/app.types";
import { query, tenantStorage } from "../../../cortex/db/db";
import { Connection } from "../../../cortex/db/connection";
import { getDbConfig } from "../../../cortex/config/db-config";
import * as sinon from "sinon";

// Increase timeout for async operations
jest.setTimeout(30000);

// Environment settings for tests
const fullSettings = {
    MASTER_DB_NAME: "test_master_db",
    MASTER_DB_DRIVER: "mariadb",
    MASTER_DB_HOST: "127.0.0.1",
    MASTER_DB_PORT: "3306",
    MASTER_DB_USER: "root",
    MASTER_DB_PASS: "Computer.1",
    MASTER_DB_SSL: "false",
    DB_DRIVER: "mariadb",
    DB_HOST: "127.0.0.1",
    DB_PORT: "3306",
    DB_USER: "root",
    DB_PASS: "Computer.1",
    DB_NAME: "tenant1_db",
    DB_SSL: "false",
};

// Set environment variables
function setTestEnv(): void {
    Object.entries(fullSettings).forEach(([key, value]) => {
        process.env[key] = typeof value === "string" ? value : String(value);
    });
}

// Helper to run a callback within a tenant context
async function runWithTenant<T = void>(db: string | null, cb: () => Promise<T>): Promise<T> {
    return tenantStorage.run(db ?? "", cb);
}

describe("[1.] DB Context Switching", () => {
    const masterDb = process.env.MASTER_DB_NAME || "test_master_db";
    const tenantDb = process.env.DB_NAME || "tenant1_db";

    async function setupTestDBs(): Promise<void> {
        setTestEnv();
        const masterlessConfig: any = { ...getDbConfig(), database: undefined };
        await Connection.initialize(masterlessConfig);
        const tempConn = Connection.getInstance();
        const client = await tempConn.getClient();
        await client.query(`DROP DATABASE IF EXISTS \`${masterDb}\``);
        await client.query(`DROP DATABASE IF EXISTS \`${tenantDb}\``);
        await client.query(`CREATE DATABASE \`${masterDb}\``);
        await client.query(`CREATE DATABASE \`${tenantDb}\``);
        if (client.release) client.release();
        else if (client.end) await client.end();
        await tempConn.close();
    }

    async function cleanupTestDBs(): Promise<void> {
        setTestEnv();
        const masterlessConfig: any = { ...getDbConfig(), database: undefined };
        await Connection.initialize(masterlessConfig);
        const tempConn = Connection.getInstance();
        const client = await tempConn.getClient();
        await client.query(`DROP DATABASE IF EXISTS \`${tenantDb}\``);
        await client.query(`DROP DATABASE IF EXISTS \`${masterDb}\``);
        if (client.release) client.release();
        else if (client.end) await client.end();
        await tempConn.close();
    }

    beforeAll(async () => {
        await setupTestDBs();
        (Connection as any).instance = null;
        setTestEnv();
        await Connection.initialize(getDbConfig());

        // Seed tenant DB with test data
        await runWithTenant(tenantDb, async () =>
            query(`CREATE TABLE IF NOT EXISTS test_table (id INT PRIMARY KEY AUTO_INCREMENT)`));
        await runWithTenant(tenantDb, async () =>
            query(`INSERT INTO test_table (id) VALUES (?)`, [1]));
    });

    afterAll(async () => {
        await cleanupTestDBs();
        try {
            await Connection.getInstance().close();
        } catch (error) {
            console.error(`Error closing connection: ${(error as Error).message}`);
        }
    });

    test("[test 1] switches to tenant-specific DB connection", async () => {
        const tenant: Tenant = { id: "tenant1", dbConnection: `mariadb://root:Computer.1@localhost:3306/${tenantDb}` };
        const connection = await getTenantDbConnection(tenant);
        expect(connection.database).toBe(tenantDb);

        // Test query on tenant DB
        const result = await connection.query("SELECT id FROM test_table WHERE id = ?", [1]);
        expect(result.rows).toEqual([{ id: 1 }]);

        // Test master DB context
        await runWithTenant(masterDb, async () => {
            const masterResult = await query("SELECT 1 AS test");
            expect(masterResult.rows).toEqual([{ test: 1 }]);
        });

        // Test release method
        await connection.release();
        await expect(connection.query("SELECT 1")).rejects.toThrow("Cannot read properties of null");
    }, 10000);

    test("[test 2] throws error for invalid tenant DB connection", async () => {
        const tenant: Tenant = { id: "invalid", dbConnection: "mariadb://root:Computer.1@localhost:3306/invalid_db" };
        await expect(getTenantDbConnection(tenant)).rejects.toThrow(/Failed to connect to tenant DB/);
    }, 10000);

    test("[test 3] releases client properly on error", async () => {
        const tenant: Tenant = { id: "invalid", dbConnection: "mariadb://root:Computer.1@localhost:3306/invalid_db" };
        try {
            await getTenantDbConnection(tenant);
        } catch (error) {
            expect((error as Error).message).toContain("Failed to connect to tenant DB invalid_db");
            // Verify a new connection can still be made
            const connection = await getTenantDbConnection({
                id: "tenant1",
                dbConnection: `mariadb://root:Computer.1@localhost:3306/${tenantDb}`
            });
            const result = await connection.query("SELECT 1 AS test");
            expect(result.rows).toEqual([{ test: 1 }]);
            await connection.release();
        }
    }, 10000);

    test("[test 4] uses end method for non-pooled connection", async () => {
        const tenant: Tenant = { id: "tenant1", dbConnection: `mariadb://root:Computer.1@localhost:3306/${tenantDb}` };
        const endStub = sinon.stub();
        const stub = sinon.stub(Connection.getInstance(), "getClient").resolves({
            query: async (sql: string) => ({ rows: [{ test: 1 }], rowCount: 1 }),
            end: endStub,
        });

        const connection = await getTenantDbConnection(tenant);
        expect(connection.database).toBe(tenantDb);
        const result = await connection.query("SELECT 1 AS test");
        expect(result.rows).toEqual([{ test: 1 }]);

        // Test release method using end
        await connection.release();
        expect(endStub.calledOnce).toBe(true);

        // Restore stub
        stub.restore();
    }, 10000);

    test("[test 5] uses release method for pooled connection", async () => {
        const tenant: Tenant = { id: "tenant1", dbConnection: `mariadb://root:Computer.1@localhost:3306/${tenantDb}` };
        const releaseStub = sinon.stub();
        const stub = sinon.stub(Connection.getInstance(), "getClient").resolves({
            query: async (sql: string) => ({ rows: [{ test: 1 }], rowCount: 1 }),
            release: releaseStub,
        });

        const connection = await getTenantDbConnection(tenant);
        expect(connection.database).toBe(tenantDb);
        const result = await connection.query("SELECT 1 AS test");
        expect(result.rows).toEqual([{ test: 1 }]);

        // Test release method using release
        await connection.release();
        expect(releaseStub.calledOnce).toBe(true);

        // Restore stub
        stub.restore();
    }, 10000);

    test("[test 6] handles query with insertId and array result", async () => {
        const tenant: Tenant = { id: "tenant1", dbConnection: `mariadb://root:Computer.1@localhost:3306/${tenantDb}` };
        const stub = sinon.stub(Connection.getInstance(), "getClient").resolves({
            query: async (sql: string) => ({ rows: [{ id: 2 }], insertId: 2, rowCount: 1 }),
        });

        const connection = await getTenantDbConnection(tenant);
        expect(connection.database).toBe(tenantDb);
        const result = await connection.query("INSERT INTO test_table (id) VALUES (2)");
        expect(result.rows).toEqual([{ id: 2 }]);
        expect(result.rowCount).toBe(1);
        expect(result.insertId).toBe(2);

        // Restore stub
        stub.restore();
        await connection.release();
    }, 10000);
});