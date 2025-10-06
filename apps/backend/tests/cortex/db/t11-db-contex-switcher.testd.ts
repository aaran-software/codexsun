// E:\Workspace\codexsun\apps\backend\tests\cortex/db/t11-db-context-switcher.test.ts
import { getTenantDbConnection } from "../../../cortex/db/db-context-switcher";
import { Tenant } from "../../../cortex/core/tenant/tenant.types";
import { query, tenantStorage } from "../../../cortex/db/db";
import { Connection } from "../../../cortex/db/connection";
import { getDbConfig } from "../../../cortex/config/db-config";
import * as sinon from "sinon";

jest.setTimeout(30000);

const fullSettings = {
    APP_NAME: "TestApp",
    APP_VERSION: "1.0.0",
    APP_DEBUG: "false",
    APP_KEY: "testkey",
    VITE_APP_URL: "http://localhost:3006",
    APP_PORT: "3006",
    APP_HOST: "0.0.0.0",
    MASTER_DB_NAME: "test_master_db",
    TENANCY: "true",
    DB_DRIVER: "mariadb",
    DB_HOST: "127.0.0.1",
    DB_PORT: "3306",
    DB_USER: "root",
    DB_PASS: "Computer.1",
    DB_NAME: "test_master_db",
    DB_SSL: "false",
};

function setTestEnv(): void {
    Object.entries(fullSettings).forEach(([key, value]) => {
        process.env[key] = typeof value === 'string' ? value : String(value);
    });
}

async function runWithTenant<T = void>(db: string | null, cb: () => Promise<T>): Promise<T> {
    if (db) {
        return tenantStorage.run(db, cb);
    } else {
        return tenantStorage.run('', cb);
    }
}

describe('DB Context Switching', () => {
    const masterDb = process.env.MASTER_DB_NAME || 'test_master_db';
    const tenantDb = 'tenant1_db';

    async function setupTestDBs() {
        setTestEnv();
        const masterlessConfig: any = { ...getDbConfig(), database: undefined };
        await Connection.initialize(masterlessConfig);
        const tempConn = Connection.getInstance();
        const client = await tempConn.getClient();
        await client.query(`CREATE DATABASE IF NOT EXISTS ${masterDb}`);
        await client.query(`CREATE DATABASE IF NOT EXISTS ${tenantDb}`);
        if (client.release) client.release();
        else if (client.end) await client.end();
        await tempConn.close();
    }

    async function cleanupTestDBs() {
        setTestEnv();
        const masterlessConfig: any = { ...getDbConfig(), database: undefined };
        await Connection.initialize(masterlessConfig);
        const tempConn = Connection.getInstance();
        const client = await tempConn.getClient();
        await client.query(`DROP DATABASE IF EXISTS ${tenantDb}`);
        await client.query(`DROP DATABASE IF EXISTS ${masterDb}`);
        if (client.release) client.release();
        else if (client.end) await client.end();
        await tempConn.close();
    }

    beforeAll(async () => {
        await setupTestDBs();
        (Connection as any).instance = null;
        setTestEnv();
        await Connection.initialize(getDbConfig());

        // Seed master DB with test data
        await runWithTenant(masterDb, async () =>
            query(
                `CREATE TABLE IF NOT EXISTS tenants (id VARCHAR(50), db_connection TEXT)`
            )
        );
        await runWithTenant(masterDb, async () =>
            query(
                `INSERT INTO tenants (id, db_connection) VALUES (?, ?)`,
                ['tenant1', 'mariadb://localhost/tenant1_db']
            )
        );
    }, 15000);

    afterAll(async () => {
        // Reinit for cleanup
        (Connection as any).instance = null;
        setTestEnv();
        await Connection.initialize(getDbConfig());
        // Clean up test data
        try {
            await runWithTenant(masterDb, async () => query('DROP TABLE IF EXISTS tenants'));
        } catch (error) {
            console.error(`Error during cleanup: ${(error as Error).message}`);
        }
        await cleanupTestDBs();
        try {
            const conn = Connection.getInstance();
            await conn.close();
        } catch {}
    }, 15000);

    beforeEach(async () => {
        (Connection as any).instance = null;
        setTestEnv();
        await Connection.initialize(getDbConfig());
    });

    test('switches to tenant-specific DB connection', async () => {
        const tenant: Tenant = { id: 'tenant1', dbConnection: 'mariadb://localhost/tenant1_db' };
        const connection = await getTenantDbConnection(tenant);
        expect(connection.database).toBe('tenant1_db');
        expect(connection).toHaveProperty('query');

        // Verify connection works with a simple query
        const result = await connection.query('SELECT 1 AS test');
        expect(result.rows).toEqual([{ test: 1 }]);

        // Test release method
        await connection.release();
        await expect(connection.query('SELECT 1')).rejects.toThrow('Cannot read properties of null');
    }, 10000);

    test('throws error for invalid tenant DB connection', async () => {
        const tenant: Tenant = { id: 'invalid', dbConnection: 'mariadb://localhost/invalid_db' };
        await expect(getTenantDbConnection(tenant)).rejects.toThrow(/Failed to connect to tenant DB/);
    }, 10000);

    test('releases client properly on error', async () => {
        const tenant: Tenant = { id: 'invalid', dbConnection: 'mariadb://localhost/invalid_db' };
        try {
            await getTenantDbConnection(tenant);
        } catch (error) {
            expect((error as Error).message).toContain('Failed to connect to tenant DB invalid_db');
            // Verify a new connection can still be made
            const connection = await getTenantDbConnection({ id: 'tenant1', dbConnection: 'mariadb://localhost/tenant1_db' });
            const result = await connection.query('SELECT 1 AS test');
            expect(result.rows).toEqual([{ test: 1 }]);
            await connection.release();
        }
    }, 10000);

    test('uses end method for non-pooled connection', async () => {
        const tenant: Tenant = { id: 'tenant1', dbConnection: 'mariadb://localhost/tenant1_db' };
        const endStub = sinon.stub();
        const stub = sinon.stub(Connection.getInstance(), 'getClient').resolves({
            query: async (sql: string) => ({ rows: [{ test: 1 }] }),
            end: endStub,
        });

        const connection = await getTenantDbConnection(tenant);
        expect(connection.database).toBe('tenant1_db');
        const result = await connection.query('SELECT 1 AS test');
        expect(result.rows).toEqual([{ test: 1 }]);

        // Test release method using end
        await connection.release();
        expect(endStub.calledOnce).toBe(true);

        // Restore stub
        stub.restore();
    }, 10000);

    test('uses release method for pooled connection', async () => {
        const tenant: Tenant = { id: 'tenant1', dbConnection: 'mariadb://localhost/tenant1_db' };
        const releaseStub = sinon.stub();
        const stub = sinon.stub(Connection.getInstance(), 'getClient').resolves({
            query: async (sql: string) => ({ rows: [{ test: 1 }] }),
            release: releaseStub,
        });

        const connection = await getTenantDbConnection(tenant);
        expect(connection.database).toBe('tenant1_db');
        const result = await connection.query('SELECT 1 AS test');
        expect(result.rows).toEqual([{ test: 1 }]);

        // Test release method using release
        await connection.release();
        expect(releaseStub.calledOnce).toBe(true);

        // Restore stub
        stub.restore();
    }, 10000);
});