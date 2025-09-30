// tests/connection.test.ts
import { Connection } from '../../../cortex/db/connection';
import { DbConfig, AnyDbClient } from '../../../cortex/db/types';
import mariadb from 'mariadb';
import { MariaDBAdapter } from '../../../cortex/adapters/mariadb';
import { withTenantContext } from '../../../cortex/tenant';
import { query, withTransaction, healthCheck } from '../../../cortex/db/db';

// Test database configuration without database
const baseDbConfig: Omit<DbConfig, 'database' | 'type'> = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Computer.1',
};

const testDatabase = 'codexsun_test';

// Invalid configuration for testing connection failure
const invalidDbConfig: Omit<DbConfig, 'database' | 'type'> = {
    ...baseDbConfig,
    user: 'invalid_user',
    password: 'wrong_password',
};

describe('Connection Integration Tests (Real MariaDB)', () => {
    let connection: Connection;
    let setupPool: mariadb.Pool;

    jest.setTimeout(20000); // Increased timeout for invalid credentials test

    beforeAll(async () => {
        MariaDBAdapter.initPool(baseDbConfig);
        setupPool = mariadb.createPool({
            host: baseDbConfig.host,
            port: baseDbConfig.port,
            user: baseDbConfig.user,
            password: baseDbConfig.password,
            connectionLimit: 1,
            acquireTimeout: 15000,
        });
        const setupConnection = await setupPool.getConnection();
        await setupConnection.query(`CREATE DATABASE IF NOT EXISTS ${testDatabase}`);
        await setupConnection.query(`USE ${testDatabase}`);
        await setupConnection.query(`
            CREATE TABLE IF NOT EXISTS test_table (
                                                      id INT AUTO_INCREMENT PRIMARY KEY,
                                                      name VARCHAR(255)
                )
        `);
        setupConnection.release();
        await setupPool.end();
    });

    afterAll(async () => {
        const cleanupPool = mariadb.createPool({
            host: baseDbConfig.host,
            port: baseDbConfig.port,
            user: baseDbConfig.user,
            password: baseDbConfig.password,
            connectionLimit: 1,
            acquireTimeout: 15000,
        });
        const cleanupConnection = await cleanupPool.getConnection();
        await cleanupConnection.query(`USE ${testDatabase}`);
        await cleanupConnection.query('DROP TABLE IF EXISTS test_table');
        await cleanupConnection.query(`DROP DATABASE IF EXISTS ${testDatabase}`);
        cleanupConnection.release();
        await cleanupPool.end();
        await MariaDBAdapter.closePool();
    });

    beforeEach(async () => {
        connection = new Connection({ ...baseDbConfig, database: testDatabase, type: 'mariadb' });
        const tempPool = mariadb.createPool({
            host: baseDbConfig.host,
            port: baseDbConfig.port,
            user: baseDbConfig.user,
            password: baseDbConfig.password,
            connectionLimit: 1,
            acquireTimeout: 15000,
        });
        const tempConnection = await tempPool.getConnection();
        await tempConnection.query(`USE ${testDatabase}`);
        await tempConnection.query('TRUNCATE TABLE test_table');
        tempConnection.release();
        await tempPool.end();
    });

    afterEach(async () => {
        try {
            if (connection.getClient()) {
                await connection.close();
            }
        } catch (error) {
            // Ignore cleanup errors
        }
    });

    test('[test 1] should initialize real MariaDB connection successfully', async () => {
        await expect(connection.init()).resolves.toBeUndefined();
        expect(connection.getClient()).toBeDefined();
        expect(connection.getConfig()).toEqual({ ...baseDbConfig, database: testDatabase, type: 'mariadb' });
    });

    test('[test 2] should fail to initialize with invalid credentials', async () => {
        await MariaDBAdapter.closePool();
        MariaDBAdapter.initPool(invalidDbConfig);
        const invalidConnection = new Connection({ ...invalidDbConfig, database: testDatabase, type: 'mariadb' });
        await expect(invalidConnection.init()).rejects.toThrow(
            /Access denied for user|ER_ACCESS_DENIED_ERROR|pool timeout|Connection refused/
        );
        expect(() => invalidConnection.getClient()).toThrow('Connection not initialized');
        await MariaDBAdapter.closePool();
        MariaDBAdapter.initPool(baseDbConfig);
    }, 20000);

    test('[test 3] should close real MariaDB connection successfully', async () => {
        await connection.init();
        await expect(connection.close()).resolves.toBeUndefined();
        expect(() => connection.getClient()).toThrow('Connection not initialized');
    });

    test('[test 4] should execute a simple query after connecting', async () => {
        await connection.init();
        const client = connection.getClient();
        const result = await client.query('SELECT 1 as value');
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('value', 1);
    });

    test('[test 5] should insert and retrieve data from test table', async () => {
        await connection.init();
        const client = connection.getClient();
        await client.query('INSERT INTO test_table (name) VALUES (?)', ['test_name']);
        const result = await client.query('SELECT name FROM test_table');
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('name', 'test_name');
    });

    test('[test 6] should handle query errors gracefully', async () => {
        await connection.init();
        const client = connection.getClient();
        await expect(client.query('SELECT * FROM nonexistent_table')).rejects.toThrow(
            /Table '.*nonexistent_table' doesn't exist|ER_NO_SUCH_TABLE/
        );
    });

    test('[test 7] should handle multiple connections and closures', async () => {
        await connection.init();
        const secondConnection = new Connection({ ...baseDbConfig, database: testDatabase, type: 'mariadb' });
        await expect(secondConnection.init()).resolves.toBeUndefined();
        await expect(secondConnection.close()).resolves.toBeUndefined();
        await expect(connection.close()).resolves.toBeUndefined();
        expect(() => connection.getClient()).toThrow('Connection not initialized');
        expect(() => secondConnection.getClient()).toThrow('Connection not initialized');
    });
});