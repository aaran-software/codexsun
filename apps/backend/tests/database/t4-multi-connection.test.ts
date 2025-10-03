// [test 4] Hard and multiple connection at a time with multi table multi db

import { Connection } from '../../cortex/db/connection';
import { getDbConfig } from '../../cortex/config/db-config';
import { settings } from '../../cortex/config/get-settings';
import {createTenant} from "../../cortex/db/db";

describe('[test 4] Multiple Connections and Multi DB/Table', () => {
    it('should handle multiple concurrent connections to multi DB and tables without failure', async () => {
        const conn = await Connection.initialize(getDbConfig());

        const dbs = [settings.DB_NAME, 'test_db2'];
        const tables = ['test_table1', 'test_table2'];

        // Create test DB if needed
        if (settings.TENANCY) {
            await createTenant('test_tenant', 'test_db2');
        } else {
            const client = await conn.getClient('');
            await client.query(`CREATE DATABASE IF NOT EXISTS test_db2`);
            if (client.release) client.release();
        }

        const promises = dbs.flatMap((db) =>
            tables.map(async (table) => {
                const client = await conn.getClient(db);
                try {
                    await client.query(`CREATE TABLE IF NOT EXISTS ${table} (id SERIAL PRIMARY KEY, data VARCHAR(255))`);
                    await client.query(`INSERT INTO ${table} (data) VALUES (?)`, ['multi-test']);
                    const result = await client.query(`SELECT * FROM ${table}`);
                    expect(result.rows.length).toBeGreaterThan(0);
                } finally {
                    await client.query(`DROP TABLE IF EXISTS ${table}`);
                    if (client.release) client.release();
                    else if (client.end) await client.end();
                }
            })
        );

        await Promise.all(promises);

        // Cleanup test DB
        const cleanupClient = await conn.getClient('');
        await cleanupClient.query(`DROP DATABASE IF EXISTS test_db2`);
        if (cleanupClient.release) cleanupClient.release();

        await conn.close();
    }, 20000); // Longer timeout for multiple operations
});