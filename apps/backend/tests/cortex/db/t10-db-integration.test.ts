import mariadb from 'mariadb';
import { Connection } from "../../../cortex/db/connection";
import { getDbConfig } from "../../../cortex/config/db-config";
import { query, withTransaction, healthCheck, tenantStorage } from "../../../cortex/db/db";
import { logQuery, logTransaction, logHealthCheck, logConnection } from "../../../cortex/config/logger";
import { getSettings } from "../../../cortex/config/get-settings";
import { resolveTenant } from "../../../cortex/core/tenant/tenant-resolver";
import { Tenant } from "../../../cortex/core/tenant/tenant.types";
import { DbConfig } from "../../../cortex/db/db-types";

const TEST_HOST = 'localhost';
const TEST_PORT = 3306;
const TEST_USER = 'root';
const TEST_PASS = 'Computer.1'; // Adjust for local MariaDB
const TEST_DB = 'test_integration_db';
const MASTER_DB = 'master_db';
const TENANT_DB = 'tenant_db';

let pool: mariadb.Pool;

beforeAll(async () => {
    pool = mariadb.createPool({ host: TEST_HOST, port: TEST_PORT, user: TEST_USER, password: TEST_PASS, connectionLimit: 5 });
    await pool.query(`CREATE DATABASE IF NOT EXISTS ${TEST_DB}`);
    await pool.query(`USE ${TEST_DB}`);
    await pool.query(`CREATE TABLE IF NOT EXISTS test_table (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))`);
    await pool.query(`CREATE DATABASE IF NOT EXISTS ${MASTER_DB}`);
    await pool.query(`USE ${MASTER_DB}`);
    await pool.query(`CREATE TABLE IF NOT EXISTS tenant_users (email VARCHAR(255), tenant_id VARCHAR(36))`);
    await pool.query(`CREATE TABLE IF NOT EXISTS tenants (tenant_id VARCHAR(36), db_host VARCHAR(255), db_port INT, db_user VARCHAR(255), db_pass VARCHAR(255), db_name VARCHAR(255), db_ssl BOOLEAN)`);
    await pool.query(`CREATE DATABASE IF NOT EXISTS ${TENANT_DB}`);
    await pool.query(`USE ${TENANT_DB}`);
    await pool.query(`CREATE TABLE IF NOT EXISTS tenant_table (id INT AUTO_INCREMENT PRIMARY KEY, value VARCHAR(255))`);
    // Seed data
    await pool.query(`USE ${MASTER_DB}`);
    await pool.query(`INSERT IGNORE INTO tenant_users (email, tenant_id) VALUES ('test@email.com', 'tenant-1')`);
    await pool.query(`INSERT IGNORE INTO tenants (tenant_id, db_host, db_port, db_user, db_pass, db_name, db_ssl) VALUES ('tenant-1', '${TEST_HOST}', ${TEST_PORT}, '${TEST_USER}', '${TEST_PASS}', '${TENANT_DB}', false)`);
});

afterAll(async () => {
    await pool.query(`DROP DATABASE IF EXISTS ${TEST_DB}`);
    await pool.query(`DROP DATABASE IF EXISTS ${MASTER_DB}`);
    await pool.query(`DROP DATABASE IF EXISTS ${TENANT_DB}`);
    await pool.end();
});

describe("[1.] Integration: Config & Logger", () => {
    it("[test 1] getSettings loads defaults/overrides", () => {
        process.env.APP_NAME = "TestERP";
        process.env.APP_DEBUG = "false";
        const settings = getSettings();
        expect(settings.APP_NAME).toBe("TestERP");
        expect(settings.APP_DEBUG).toBe(false);
    });

    it("[test 2] getDbConfig with tenancy", () => {
        process.env.TENANCY = "true";
        process.env.MASTER_DB = MASTER_DB;
        const config = getDbConfig();
        expect(config.database).toBe(MASTER_DB);
        expect(config.type).toBe("mariadb"); // Default assumption
    });

    it("[test 3] logger phases/metrics", () => {
        console.debug = jest.fn();
        console.info = jest.fn();
        logQuery('start', { sql: "SELECT 1", params: [], db: TEST_DB });
        logQuery('end', { sql: "SELECT 1", params: [], db: TEST_DB, duration: 5 });
        logQuery('error', { sql: "INVALID", params: [], db: TEST_DB, error: "fail" });
        expect(console.debug).toHaveBeenCalled();
        expect(console.info).toHaveBeenCalledWith(expect.stringContaining("query_duration_ms"));
        expect(console.info).toHaveBeenCalledWith(expect.stringContaining("query_error"));
        logTransaction('start', { db: TEST_DB });
        logTransaction('end', { db: TEST_DB, duration: 10 });
        logTransaction('error', { db: TEST_DB, error: "tx fail" });
        logHealthCheck('success', { database: TEST_DB, duration: 2 });
        logHealthCheck('error', { database: TEST_DB, error: "health fail" });
        logConnection('start', { db: TEST_DB, connectionString: "str" });
        logConnection('success', { db: TEST_DB, connectionString: "str", duration: 3 });
        logConnection('error', { db: TEST_DB, connectionString: "str", error: "conn fail" });
    });
});

describe("[2.] Integration: Connection & DB Ops", () => {
    let realConfig: DbConfig;

    beforeEach(async () => {
        realConfig = { type: "mariadb", host: TEST_HOST, port: TEST_PORT, user: TEST_USER, password: TEST_PASS, database: TEST_DB, ssl: false, connectionLimit: 10, acquireTimeout: 30000, idleTimeout: 60000 };
        await Connection.initialize(realConfig);
    });

    afterEach(async () => {
        await Connection.getInstance().close();
    });

    it("[test 1] connection init/close", async () => {
        const conn = Connection.getInstance();
        expect(conn.getConfig()).toEqual(realConfig);
        const client = await conn.getClient(TEST_DB);
        await client.query("SELECT 1");
        await conn.close();
        expect(() => Connection.getInstance()).toThrow("Connection not initialized");
    });

    it("[test 2] query/withTransaction/healthCheck", async () => {
        await query(`INSERT INTO test_table (name) VALUES (?)`, ["test"]);
        const res = await query(`SELECT * FROM test_table WHERE name = ?`, ["test"]);
        expect(res.rowCount).toBe(1);
        await withTransaction(async (tx) => {
            await tx.query(`INSERT INTO test_table (name) VALUES (?)`, ["tx-test"]);
        });
        const txRes = await query(`SELECT * FROM test_table WHERE name = ?`, ["tx-test"]);
        expect(txRes.rowCount).toBe(1);
        expect(await healthCheck(TEST_DB)).toBe(true);
    });

    it("[test 3] error handling/retries", async () => {
        await expect(query("INVALID SQL")).rejects.toThrow();
        await expect(withTransaction(async () => { throw new Error("tx fail"); })).rejects.toThrow();
        await Connection.getInstance().close();
        // Simulate init fail (bad port), expect throw (no retry test in real, as retry is in code)
        const badConfig: DbConfig = { ...realConfig, port: 9999 };
        await expect(Connection.initialize(badConfig)).rejects.toThrow();
        // Test production retry: set NODE_ENV, force init fail via mock if needed, but since real, verify logs or multiple calls
        process.env.NODE_ENV = "production";
        await expect(Connection.initialize(badConfig)).rejects.toThrow(); // Expect retry internally, but throw after
        process.env.NODE_ENV = "test";
    });
});

describe("[3.] Integration: Tenant Resolver & Multi-Tenant", () => {
    let masterConfig: DbConfig;

    beforeEach(async () => {
        masterConfig = { type: "mariadb", host: TEST_HOST, port: TEST_PORT, user: TEST_USER, password: TEST_PASS, database: MASTER_DB, ssl: false, connectionLimit: 10, acquireTimeout: 30000, idleTimeout: 60000 };
        await Connection.initialize(masterConfig);
    });

    afterEach(async () => {
        await Connection.getInstance().close();
    });

    it("[test 1] resolveTenant & switch context", async () => {
        const tenant: Tenant = await resolveTenant({ body: { email: "test@email.com", password: "pass" } });
        expect(tenant.id).toBe("tenant-1");
        expect(tenant.dbConnection).toBe(`mariadb://${TEST_USER}:${encodeURIComponent(TEST_PASS)}@${TEST_HOST}:${TEST_PORT}/${TENANT_DB}`);
        expect(tenantStorage.getStore()).toBe(TENANT_DB);
        // Ops in tenant DB
        await query(`INSERT INTO tenant_table (value) VALUES (?)`, ["tenant-value"]);
        const tenantRes = await query(`SELECT * FROM tenant_table WHERE value = ?`, ["tenant-value"]);
        expect(tenantRes.rowCount).toBe(1);
    });

    it("[test 2] tenant errors/validation", async () => {
        await expect(resolveTenant({ body: { email: "", password: "pass" } })).rejects.toThrow("Valid email");
        await expect(resolveTenant({ body: { email: "invalid@email.com", password: "pass" } })).rejects.toThrow("No tenant associated");
        // Simulate multi
        await query(`INSERT INTO tenant_users (email, tenant_id) VALUES ('multi@email.com', 'tenant-2')`);
        await expect(resolveTenant({ body: { email: "multi@email.com", password: "pass" } })).rejects.toThrow("Multiple tenants");
        // Incomplete config
        await query(`UPDATE tenants SET db_host = NULL WHERE tenant_id = 'tenant-1'`);
        await expect(resolveTenant({ body: { email: "test@email.com", password: "pass" } })).rejects.toThrow("Incomplete");
        // Restore
        await query(`UPDATE tenants SET db_host = '${TEST_HOST}' WHERE tenant_id = 'tenant-1'`);
    });
});