// [test 4] Multiple Connections and Multi DB/Table

import { Connection } from '../../cortex/db/connection';
import { getDbConfig } from '../../cortex/config/db-config';
import { settings } from '../../cortex/config/get-settings';
import { createTenant } from '../../cortex/db/db';

let conn: Connection;

describe('[test 4] Multiple Connections and Multi DB/Table', () => {
    beforeAll(async () => {
        conn = await Connection.initialize(getDbConfig());
    });

    afterAll(async () => {
        await conn.close();
    });

    it('should handle multiple concurrent connections to multi DB and tables without failure', async () => {
        const dbs = [settings.DB_NAME, 'test_db2'];
        const tables = ['test_table1', 'test_table2'];

        // Clean up existing test tenant and database if needed
        if (settings.TENANCY) {
            const cleanupClient = await conn.getClient(settings.MASTER_DB);
            try {
                await cleanupClient.query('DELETE FROM tenants WHERE tenant_id = ?', ['test_tenant']);
                if (settings.DB_DRIVER === 'postgres') {
                    await cleanupClient.query(`DROP SCHEMA IF EXISTS "test_db2" CASCADE`);
                } else {
                    await cleanupClient.query(`DROP DATABASE IF EXISTS test_db2`);
                }
            } finally {
                if (cleanupClient.release) cleanupClient.release();
                else if (cleanupClient.end) await cleanupClient.end();
            }
        }

        // Create test DB if needed
        if (settings.TENANCY) {
            await createTenant('test_tenant', 'test_db2');
        } else {
            const client = await conn.getClient('');
            try {
                await client.query(`CREATE DATABASE IF NOT EXISTS test_db2`);
            } finally {
                if (client.release) client.release();
                else if (client.end) await client.end();
            }
        }

        const promises = dbs.flatMap((db) =>
            tables.map(async (table) => {
                const client = await conn.getClient(db);
                try {
                    const createTableQuery =
                        settings.DB_DRIVER === 'sqlite'
                            ? `CREATE TABLE IF NOT EXISTS ${table} (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)`
                            : settings.DB_DRIVER === 'postgres'
                                ? `CREATE TABLE IF NOT EXISTS "${db}".${table} (id SERIAL PRIMARY KEY, data VARCHAR(255))`
                                : `CREATE TABLE IF NOT EXISTS ${table} (id INT AUTO_INCREMENT PRIMARY KEY, data VARCHAR(255))`;
                    const insertQuery =
                        settings.DB_DRIVER === 'postgres' ? `INSERT INTO "${db}".${table} (data) VALUES ($1)` : `INSERT INTO ${table} (data) VALUES (?)`;

                    await client.query(createTableQuery);
                    await client.query(insertQuery, ['multi-test']);
                    const selectQuery = settings.DB_DRIVER === 'postgres' ? `SELECT * FROM "${db}".${table}` : `SELECT * FROM ${table}`;
                    const result = await client.query(selectQuery);
                    expect(result.rows.length).toBeGreaterThan(0);
                } finally {
                    const dropTableQuery = settings.DB_DRIVER === 'postgres' ? `DROP TABLE IF EXISTS "${db}".${table}` : `DROP TABLE IF EXISTS ${table}`;
                    await client.query(dropTableQuery);
                    if (client.release) client.release();
                    else if (client.end) await client.end();
                }
            })
        );

        await Promise.all(promises);

        // Cleanup test DB
        const cleanupClient = await conn.getClient('');
        try {
            if (settings.DB_DRIVER === 'postgres') {
                await cleanupClient.query(`DROP SCHEMA IF EXISTS "test_db2" CASCADE`);
            } else {
                await cleanupClient.query(`DROP DATABASE IF EXISTS test_db2`);
            }
        } finally {
            if (cleanupClient.release) cleanupClient.release();
            else if (cleanupClient.end) await cleanupClient.end();
        }
    }, 20000); // Longer timeout for multiple operations
});