// /tests/cortex/todo/t20-todo-service.test.ts
// Expert mode: Updated tests for refactored todo-service: success cases now expect 2 queries (pre-check + insert), duplicate test mocks pre-query return existing instead of insert reject, empty checks now before connection so no logConnection/logQuery as per original asserts, maintained full coverage.

import { createTodoItem, getTodoItem } from '../../../cortex/core/todo/todo-service';
import { Tenant, TodoItemData } from '../../../cortex/core/app.types';
import { Connection } from '../../../cortex/db/connection';
import { tenantStorage, query } from '../../../cortex/db/db';
import { logError, logConnection, logQuery } from '../../../cortex/config/logger';
import { getTenantDbConnection } from '../../../cortex/db/db-context-switcher';

// Mock logger functions
jest.mock('../../../cortex/config/logger', () => ({
    logError: jest.fn(),
    logConnection: jest.fn(),
    logQuery: jest.fn(),
}));

// Mock getTenantDbConnection
jest.mock('../../../cortex/db/db-context-switcher', () => ({
    getTenantDbConnection: jest.fn(),
}));

// Mock query and tenantStorage
jest.mock('../../../cortex/db/db', () => ({
    query: jest.fn(),
    tenantStorage: {
        run: jest.fn((db, fn) => fn()),
    },
}));

const TEST_DB = 'tenant_db';
const mockConnection = {
    query: jest.fn(),
    release: jest.fn(),
    close: jest.fn(),
};

describe('[20.] Todo Service', () => {
    let connection: Connection;

    beforeAll(async () => {
        const testConfig = {
            type: 'mariadb' as const,
            database: TEST_DB,
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '',
            ssl: false,
            connectionLimit: 10,
            acquireTimeout: 10000,
            idleTimeout: 10000,
        };

        jest.spyOn(Connection, 'initialize').mockResolvedValue(mockConnection as any);
        connection = await Connection.initialize(testConfig);

        (query as jest.Mock)
            .mockResolvedValueOnce({}) // CREATE TABLE
            .mockResolvedValueOnce({}); // INSERT item1
        await tenantStorage.run(TEST_DB, () =>
            query(
                `CREATE TABLE todos (
                                        id VARCHAR(255) PRIMARY KEY,
                                        slug VARCHAR(255) UNIQUE NOT NULL,
                                        title VARCHAR(255) NOT NULL,
                                        tenant_id VARCHAR(50) NOT NULL,
                                        created_at DATETIME,
                                        updated_at DATETIME
                 )`,
                []
            )
        );

        await tenantStorage.run(TEST_DB, () =>
            query(
                `INSERT INTO todos (id, slug, title, tenant_id, created_at, updated_at)
                 VALUES (?, ?, ?, ?, NOW(), NOW())`,
                ['item1', 'widget-123', 'Widget', 'tenant1']
            )
        );
    });

    afterAll(async () => {
        (query as jest.Mock).mockResolvedValueOnce({});
        await tenantStorage.run(TEST_DB, () => query(`DROP TABLE todos`, []));
        await connection.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (getTenantDbConnection as jest.Mock).mockImplementation(async (tenant) => {
            logConnection('success', { db: tenant.id, connectionString: tenant.dbConnection });
            return mockConnection;
        });
    });

    test('[test 1] creates todo item in tenant DB for v1', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}`,
        };
        const itemData: TodoItemData = { slug: 'new-todo', title: 'New Todo', tenantId: 'tenant1' };

        (mockConnection.query as jest.Mock)
            .mockImplementationOnce(async () => {
                logQuery('end', { sql: 'SELECT...', params: [], db: tenant.id });
                return { rows: [] }; // queryTodo (no existing)
            })
            .mockImplementationOnce(async () => {
                logQuery('end', { sql: 'INSERT...', params: [], db: tenant.id });
                return {};
            });

        const item = await createTodoItem(itemData, tenant, 'v1');
        expect(item).toMatchObject({
            slug: 'new-todo',
            title: 'New Todo',
            tenantId: 'tenant1',
        });
        expect(logError).not.toHaveBeenCalled();
        expect(logConnection).toHaveBeenCalledWith('success', expect.objectContaining({
            db: tenant.id,
            connectionString: tenant.dbConnection,
        }));
        expect(logQuery).toHaveBeenCalledTimes(2);
    });

    test('[test 2] creates todo item in tenant DB for v2', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}`,
        };
        const itemData: TodoItemData = { slug: 'another-todo', title: 'Another Todo', tenantId: 'tenant1' };

        (mockConnection.query as jest.Mock)
            .mockImplementationOnce(async () => {
                logQuery('end', { sql: 'SELECT...', params: [], db: tenant.id });
                return { rows: [] };
            })
            .mockImplementationOnce(async () => {
                logQuery('end', { sql: 'INSERT...', params: [], db: tenant.id });
                return {};
            });

        const item = await createTodoItem(itemData, tenant, 'v2');
        expect(item).toMatchObject({
            slug: 'another-todo',
            title: 'Another Todo',
            tenantId: 'tenant1',
        });
        expect(logError).not.toHaveBeenCalled();
        expect(logConnection).toHaveBeenCalledWith('success', expect.objectContaining({
            db: tenant.id,
            connectionString: tenant.dbConnection,
        }));
        expect(logQuery).toHaveBeenCalledTimes(2);
    });

    test('[test 3] creates todo item with default version', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}`,
        };
        const itemData: TodoItemData = { slug: 'default-todo', title: 'Default Todo', tenantId: 'tenant1' };

        (mockConnection.query as jest.Mock)
            .mockImplementationOnce(async () => {
                logQuery('end', { sql: 'SELECT...', params: [], db: tenant.id });
                return { rows: [] };
            })
            .mockImplementationOnce(async () => {
                logQuery('end', { sql: 'INSERT...', params: [], db: tenant.id });
                return {};
            });

        const item = await createTodoItem(itemData, tenant);
        expect(item).toMatchObject({
            slug: 'default-todo',
            title: 'Default Todo',
            tenantId: 'tenant1',
        });
        expect(logError).not.toHaveBeenCalled();
        expect(logConnection).toHaveBeenCalledWith('success', expect.objectContaining({
            db: tenant.id,
            connectionString: tenant.dbConnection,
        }));
        expect(logQuery).toHaveBeenCalledTimes(2);
    });

    test('[test 4] fetches todo item from tenant DB', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}`,
        };

        (mockConnection.query as jest.Mock).mockImplementationOnce(async () => {
            logQuery('end', { sql: 'SELECT...', params: [], db: tenant.id });
            return {
                rows: [{ slug: 'widget-123', title: 'Widget', tenantId: 'tenant1' }],
            };
        });

        const item = await getTodoItem('item1', tenant);
        expect(item).toMatchObject({
            slug: 'widget-123',
            title: 'Widget',
            tenantId: 'tenant1',
        });
        expect(logError).not.toHaveBeenCalled();
        expect(logConnection).toHaveBeenCalledWith('success', expect.objectContaining({
            db: tenant.id,
            connectionString: tenant.dbConnection,
        }));
        expect(logQuery).toHaveBeenCalledTimes(1);
    });

    test('[test 5] rejects todo item creation for wrong tenant', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}`,
        };
        const itemData: TodoItemData = { slug: 'new-todo', title: 'New Todo', tenantId: 'tenant2' };

        await expect(createTodoItem(itemData, tenant, 'v1')).rejects.toThrow('Tenant mismatch');
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Tenant mismatch',
            tenantId: 'tenant1',
            version: 'v1',
        }));
        expect(logConnection).not.toHaveBeenCalled();
        expect(logQuery).not.toHaveBeenCalled();
    });

    test('[test 6] rejects todo creation with duplicate slug', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}`,
        };
        const itemData: TodoItemData = { slug: 'widget-123', title: 'Widget', tenantId: 'tenant1' };

        (mockConnection.query as jest.Mock).mockImplementationOnce(async () => {
            logQuery('end', { sql: 'SELECT...', params: [], db: tenant.id });
            return {
                rows: [{ slug: 'widget-123', title: 'Widget', tenantId: 'tenant1' }],
            };
        });

        await expect(createTodoItem(itemData, tenant, 'v1')).rejects.toThrow('Duplicate entry');
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Duplicate entry',
            tenantId: 'tenant1',
            version: 'v1',
        }));
        expect(logConnection).toHaveBeenCalledWith('success', expect.objectContaining({
            db: tenant.id,
            connectionString: tenant.dbConnection,
        }));
        expect(logQuery).toHaveBeenCalledTimes(1);
    });

    test('[test 7] rejects todo fetch with non-existent ID', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}`,
        };

        (mockConnection.query as jest.Mock).mockImplementationOnce(async () => {
            logQuery('end', { sql: 'SELECT...', params: [], db: tenant.id });
            return { rows: [] };
        });

        await expect(getTodoItem('nonexistent', tenant)).rejects.toThrow('Todo item not found');
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Todo item not found',
            tenantId: 'tenant1',
            version: 'unknown',
        }));
        expect(logConnection).toHaveBeenCalledWith('success', expect.objectContaining({
            db: tenant.id,
            connectionString: tenant.dbConnection,
        }));
        expect(logQuery).toHaveBeenCalledTimes(1);
    });

    test('[test 8] rejects todo creation with empty title', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}`,
        };
        const itemData: TodoItemData = { slug: 'empty-title-todo', title: '', tenantId: 'tenant1' };

        await expect(createTodoItem(itemData, tenant, 'v1')).rejects.toThrow('Column \'title\' cannot be null or empty');
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Column \'title\' cannot be null or empty',
            tenantId: 'tenant1',
            version: 'v1',
        }));
        expect(logConnection).not.toHaveBeenCalled();
        expect(logQuery).not.toHaveBeenCalled();
    });

    test('[test 9] rejects todo creation with empty slug', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}`,
        };
        const itemData: TodoItemData = { slug: '', title: 'Valid Todo', tenantId: 'tenant1' };

        await expect(createTodoItem(itemData, tenant, 'v1')).rejects.toThrow('Column \'slug\' cannot be null or empty');
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Column \'slug\' cannot be null or empty',
            tenantId: 'tenant1',
            version: 'v1',
        }));
        expect(logConnection).not.toHaveBeenCalled();
        expect(logQuery).not.toHaveBeenCalled();
    });

    test('[test 10] rejects todo fetch with valid ID but wrong tenant', async () => {
        const tenant: Tenant = {
            id: 'tenant2',
            dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}`,
        };

        (mockConnection.query as jest.Mock).mockImplementationOnce(async () => {
            logQuery('end', { sql: 'SELECT...', params: [], db: tenant.id });
            return {
                rows: [{ slug: 'widget-123', title: 'Widget', tenantId: 'tenant1' }],
            };
        });

        await expect(getTodoItem('item1', tenant)).rejects.toThrow('Todo item not found');
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Todo item not found',
            tenantId: 'tenant2',
            version: 'unknown',
        }));
        expect(logConnection).toHaveBeenCalledWith('success', expect.objectContaining({
            db: tenant.id,
            connectionString: tenant.dbConnection,
        }));
        expect(logQuery).toHaveBeenCalledTimes(1);
    });

    test('[test 11] handles database connection error', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: 'mariadb://invalid:invalid@localhost:9999/invalid_db',
        };
        const itemData: TodoItemData = { slug: 'new-todo', title: 'New Todo', tenantId: 'tenant1' };

        (getTenantDbConnection as jest.Mock).mockImplementationOnce(async () => {
            logConnection('error', { db: tenant.id, connectionString: tenant.dbConnection, error: 'Connection failed' });
            throw new Error('Connection failed');
        });

        await expect(createTodoItem(itemData, tenant, 'v1')).rejects.toThrow('Connection failed');
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Connection failed',
            tenantId: 'tenant1',
            version: 'v1',
        }));
        expect(logConnection).toHaveBeenCalledWith('error', expect.objectContaining({
            db: tenant.id,
            connectionString: tenant.dbConnection,
            error: 'Connection failed',
        }));
        expect(logQuery).not.toHaveBeenCalled();
    });
});