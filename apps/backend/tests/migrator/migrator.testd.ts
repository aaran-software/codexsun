// tests/migrator/migrator.test.ts
import { describe, test, expect, beforeAll, afterAll, afterEach, jest } from '@jest/globals';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AnyDbClient, QueryResult } from '../../cortex/db-types';
import { MariaDBAdapter } from '../../cortex/adapters/mariadb';
import { getDbConfig } from '../../cortex/db-config';
import { Connection } from '../../cortex/connection';

// Mock DB client for tests
class MockDbClient implements AnyDbClient {
    queries: string[] = [];
    executedMigrations: { name: string }[] = [];
    rollbackCalled = false;

    async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
        this.queries.push(sql);
        if (sql.includes('CREATE TABLE IF NOT EXISTS migrations')) {
            return { rows: [], rowCount: 0 };
        }
        if (sql === 'SELECT name FROM migrations') {
            return { rows: this.executedMigrations || [], rowCount: this.executedMigrations?.length || 0 };
        }
        if (sql.startsWith('INSERT INTO migrations')) {
            return { rows: [], rowCount: 1, insertId: 1 };
        }
        if (sql === 'INVALID SQL;') {
            throw new Error('SQL Error');
        }
        return { rows: [], rowCount: 0 };
    }

    async release() {}
}

// Mock getDbConfig
jest.mock('../../cortex/db-config', () => ({
    getDbConfig: jest.fn(() => ({
        driver: 'mariadb',
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: 'password',
        database: 'test_db',
        ssl: false,
    })),
}));

// Import migrator functions
import { createMigrationsTable, getExecutedMigrations, runMigration, main } from '../../cortex/migration/migrator';

// Migrations directory for tests
const MIGRATIONS_DIR = './migrations_test';

describe('Migrator', () => {
    beforeAll(async () => {
        // Ensure migrations_test directory is clean
        await fs.rm(MIGRATIONS_DIR, { recursive: true, force: true });
        await fs.mkdir(MIGRATIONS_DIR, { recursive: true });
    });

    afterEach(async () => {
        // Clean up any temporary files and clear mocks
        await fs.rm(MIGRATIONS_DIR, { recursive: true, force: true });
        await fs.mkdir(MIGRATIONS_DIR, { recursive: true });
        jest.clearAllMocks();
    });

    afterAll(async () => {
        // Final cleanup
        await fs.rm(MIGRATIONS_DIR, { recursive: true, force: true });
    });

    test('[test 1] createMigrationsTable creates table if not exists', async () => {
        const mockClient = new MockDbClient();
        jest.spyOn(MariaDBAdapter, 'getConnection').mockResolvedValue(mockClient);

        await createMigrationsTable(mockClient);
        expect(mockClient.queries).toHaveLength(1);
        expect(mockClient.queries[0]).toMatch(/CREATE TABLE IF NOT EXISTS migrations/);
    });

    test('[test 2] getExecutedMigrations returns set of executed names', async () => {
        const mockClient = new MockDbClient();
        mockClient.executedMigrations = [{ name: '001_test.ts' }, { name: '002_test.ts' }];
        jest.spyOn(MariaDBAdapter, 'getConnection').mockResolvedValue(mockClient);

        const executed = await getExecutedMigrations(mockClient);
        expect(executed).toEqual(new Set(['001_test.ts', '002_test.ts']));
    });

    test('[test 3] runMigration executes SQL and inserts record', async () => {
        const mockClient = new MockDbClient();
        jest.spyOn(MariaDBAdapter, 'getConnection').mockResolvedValue(mockClient);

        const mockSql = 'CREATE TABLE test;';
        const mockFile = '001_test.ts';
        const mockModuleContent = `export const migration = { up: \`${mockSql}\`, name: '${mockFile}' };`;

        // Create temporary file for dynamic import
        const tempFilePath = path.join(MIGRATIONS_DIR, mockFile);
        await fs.writeFile(tempFilePath, mockModuleContent);

        await runMigration(mockClient, mockFile);
        expect(mockClient.queries).toHaveLength(2);
        expect(mockClient.queries[0]).toEqual(mockSql);
        expect(mockClient.queries[1]).toMatch(/INSERT INTO migrations/);
    });

    test('[test 4] main reads, sorts, and runs only new migrations', async () => {
        const mockFiles = ['002_second.ts', '001_first.ts'];
        jest.spyOn(fs, 'readdir').mockResolvedValue(mockFiles as any);
        const mockClient = new MockDbClient();
        jest.spyOn(MariaDBAdapter, 'getConnection').mockResolvedValue(mockClient);

        const mockModule1 = `export const migration = { up: 'SQL1;', name: '001_first.ts' };`;
        const mockModule2 = `export const migration = { up: 'SQL2;', name: '002_second.ts' };`;
        await fs.writeFile(path.join(MIGRATIONS_DIR, '001_first.ts'), mockModule1);
        await fs.writeFile(path.join(MIGRATIONS_DIR, '002_second.ts'), mockModule2);

        mockClient.executedMigrations = [{ name: '001_first.ts' }];

        await main();
        expect(mockClient.queries.filter((q) => q === 'SQL2;')).toHaveLength(1); // Only new one run
    });

    test('[test 5] main handles errors and rolls back', async () => {
        jest.spyOn(fs, 'readdir').mockResolvedValue(['001_error.ts'] as any);
        const mockClient = new MockDbClient();
        jest.spyOn(MariaDBAdapter, 'getConnection').mockResolvedValue(mockClient);

        const mockModule = `export const migration = { up: 'INVALID SQL;', name: '001_error.ts' };`;
        await fs.writeFile(path.join(MIGRATIONS_DIR, '001_error.ts'), mockModule);

        mockClient.rollback = async () => {
            mockClient.rollbackCalled = true;
        };

        await expect(main()).rejects.toThrow('SQL Error');
        expect(mockClient.rollbackCalled).toBe(true);
    });
});