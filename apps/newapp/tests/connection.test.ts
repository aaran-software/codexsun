import { Connection } from '../src/connection';
import { DbConfig, AnyDbClient } from '../src/types';
import mariadb from 'mariadb';

// Test database configuration
const testDbConfig: DbConfig = {
    host: 'localhost',
    port: 3306,
    database: 'codexsun_test',
    user: 'root',
    password: 'Computer.1',
    type: 'mariadb',
};

// Invalid configuration for testing connection failure
const invalidDbConfig: DbConfig = {
    ...testDbConfig,
    user: 'invalid_user',
    password: 'wrong_password',
};

describe('Connection Integration Tests (Real MariaDB)', () => {
    let connection: Connection;
    let setupPool: mariadb.Pool;

    jest.setTimeout(20000); // Increased timeout for invalid credentials test

    beforeAll(async () => {
        setupPool = mariadb.createPool({
            host: testDbConfig.host,
            port: testDbConfig.port,
            user: testDbConfig.user,
            password: testDbConfig.password,
            connectionLimit: 1,
            acquireTimeout: 15000,
        });
        const setupConnection = await setupPool.getConnection();
        await setupConnection.query('CREATE DATABASE IF NOT EXISTS codexsun_test');
        await setupConnection.query('USE codexsun_test');
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
            host: testDbConfig.host,
            port: testDbConfig.port,
            user: testDbConfig.user,
            password: testDbConfig.password,
            connectionLimit: 1,
            acquireTimeout: 15000,
        });
        const cleanupConnection = await cleanupPool.getConnection();
        await cleanupConnection.query('USE codexsun_test');
        await cleanupConnection.query('DROP TABLE IF EXISTS test_table');
        await cleanupConnection.query('DROP DATABASE IF EXISTS codexsun_test');
        cleanupConnection.release();
        await cleanupPool.end();
    });

    beforeEach(async () => {
        connection = new Connection(testDbConfig);
        const tempPool = mariadb.createPool({
            host: testDbConfig.host,
            port: testDbConfig.port,
            user: testDbConfig.user,
            password: testDbConfig.password,
            connectionLimit: 1,
            acquireTimeout: 15000,
        });
        const tempConnection = await tempPool.getConnection();
        await tempConnection.query('USE codexsun_test');
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
        expect(connection.getConfig()).toEqual(testDbConfig);
    });

    test('[test 2] should fail to initialize with invalid credentials', async () => {
        const invalidConnection = new Connection(invalidDbConfig);
        await expect(invalidConnection.init()).rejects.toThrow(
            /Access denied for user|ER_ACCESS_DENIED_ERROR|pool timeout|Connection refused/
        );
        expect(() => invalidConnection.getClient()).toThrow('Connection not initialized');
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
        const secondConnection = new Connection(testDbConfig);
        await expect(secondConnection.init()).resolves.toBeUndefined();
        await expect(secondConnection.close()).resolves.toBeUndefined();
        await expect(connection.close()).resolves.toBeUndefined();
        expect(() => connection.getClient()).toThrow('Connection not initialized');
        expect(() => secondConnection.getClient()).toThrow('Connection not initialized');
    });
});