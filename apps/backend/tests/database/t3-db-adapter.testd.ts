// [test 3] Check every db adapter is running, connects to particular data server and test with test_table with lagging and measure time elapse

import { Connection } from '../../cortex/db/connection';
import { getDbConfig } from '../../cortex/config/db-config';
import { settings } from '../../cortex/config/get-settings';
import { healthCheck } from '../../cortex/db/db';
import { DbConfig } from '../../cortex/db/db-types';

// Adapter-specific configurations for testing
const adapterConfigs: Record<string, DbConfig> = {
    mariadb: { ...getDbConfig(), type: 'mariadb',  port: 3306 },
    mysql: { ...getDbConfig(), type: 'mysql', port: 3306 },
    postgres: { ...getDbConfig(), type: 'postgres', port: 5432, user: 'postgres', password: 'DbPass1@@' },
    sqlite: { ...getDbConfig(), type: 'sqlite', host: '', port: 0, user: '', password: '' },
};

describe('[test 3] Database Adapters', () => {
    Object.entries(adapterConfigs).forEach(([driver, config]) => {
        it(`should connect and query with ${driver} adapter`, async () => {
            // Initialize connection before health check
            const conn = await Connection.initialize(config);

            // Skip if database server is not available (except for SQLite)
            const isAvailable = driver === 'sqlite' || (await healthCheck(config.database));
            if (!isAvailable && driver !== 'sqlite') {
                console.warn(`Skipping ${driver} adapter test: database server not available`);
                await conn.close();
                return;
            }

            const startTime = performance.now();
            const client = await conn.getClient(settings.DB_NAME);
            try {
                // Create schema for PostgresSQL
                if (driver === 'postgres') {
                    await client.query(`CREATE SCHEMA IF NOT EXISTS "${settings.DB_NAME}"`);
                }

                const tableName = driver === 'postgres' ? `"${settings.DB_NAME}".test_table` : 'test_table';
                const createTableQuery =
                    driver === 'sqlite'
                        ? 'CREATE TABLE IF NOT EXISTS test_table (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)'
                        : driver === 'postgres'
                            ? `CREATE TABLE IF NOT EXISTS ${tableName} (id SERIAL PRIMARY KEY, name VARCHAR(255))`
                            : 'CREATE TABLE IF NOT EXISTS test_table (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))';

                const insertQuery = driver === 'postgres' ? `INSERT INTO ${tableName} (name) VALUES ($1)` : 'INSERT INTO test_table (name) VALUES (?)';

                await client.query(createTableQuery);
                await client.query(insertQuery, ['test']);
                const selectQuery = driver === 'postgres' ? `SELECT * FROM ${tableName}` : 'SELECT * FROM test_table';
                const result = await client.query(selectQuery);
                expect(result.rows).toBeDefined();
                expect(result.rows.length).toBeGreaterThan(0);

                // Simulate lagging with a delay
                await new Promise((resolve) => setTimeout(resolve, 1000));

                const endTime = performance.now();
                const elapsed = endTime - startTime;
                console.log(`Time elapsed for ${driver}: ${elapsed} ms`);
                expect(elapsed).toBeGreaterThan(1000); // Expect lag
            } finally {
                // Drop table
                const dropTableQuery = driver === 'postgres' ? `DROP TABLE IF EXISTS "${settings.DB_NAME}".test_table` : 'DROP TABLE IF EXISTS test_table';
                await client.query(dropTableQuery);

                // Drop schema for PostgresSQL
                if (driver === 'postgres') {
                    await client.query(`DROP SCHEMA IF EXISTS "${settings.DB_NAME}" CASCADE`);
                }

                if (client.release) client.release();
                else if (client.end) await client.end();
                await conn.close();
            }
        }, driver === 'sqlite' ? 15000 : 10000); // Increased timeout for SQLite
    });
});