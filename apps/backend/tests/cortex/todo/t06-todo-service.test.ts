import { createInventoryItem, getInventoryItem } from '../../../cortex/core/todo/todo-service';
import { Tenant, TodoItemData } from '../../../cortex/core/app.types';
import { Connection } from '../../../cortex/db/connection';
import { tenantStorage, query } from '../../../cortex/db/db';

const TEST_DB = process.env.DB_NAME || 'tenant_db';

describe('[6.] Todo Service', () => {
    let connection: Connection;

    beforeAll(async () => {
        // Initialize test database with MariaDB
        const testConfig = {
            type: 'mariadb' as const,
            database: TEST_DB,
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306', 10),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            ssl: process.env.DB_SSL === 'true',
            connectionLimit: 10,
            acquireTimeout: 10000,
            idleTimeout: 10000,
        };

        connection = await Connection.initialize(testConfig);

        // Create todos table
        await tenantStorage.run(TEST_DB, () =>
            query(`
                CREATE TABLE todos (
                                       id VARCHAR(255) PRIMARY KEY,
                                       slug VARCHAR(255) UNIQUE NOT NULL,
                                       title VARCHAR(255) NOT NULL,
                                       tenant_id VARCHAR(50) NOT NULL,
                                       created_at DATETIME,
                                       updated_at DATETIME
                )
            `, [])
        );

        // Seed test todo
        await tenantStorage.run(TEST_DB, () =>
            query(
                `INSERT INTO todos (id, slug, title, tenant_id, created_at, updated_at)
                 VALUES (?, ?, ?, ?, NOW(), NOW())`,
                ['item1', 'widget-123', 'Widget', 'tenant1']
            )
        );
    });

    afterAll(async () => {
        // Cleanup test database
        await tenantStorage.run(TEST_DB, () => query(`DROP TABLE todos`, []));
        await connection.close();
    });

    test('[test 1] creates todo item in tenant DB', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://${process.env.DB_USER || 'root'}:${process.env.DB_PASS || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}/${TEST_DB}`
        };
        const itemData: TodoItemData = { slug: 'new-todo', title: 'New Todo', tenantId: 'tenant1' };

        const item = await createInventoryItem(itemData, tenant);
        expect(item).toMatchObject({
            slug: expect.stringContaining('new-todo-'),
            title: 'New Todo',
            tenantId: 'tenant1',
        });
    });

    test('[test 2] fetches todo item from tenant DB', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://${process.env.DB_USER || 'root'}:${process.env.DB_PASS || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}/${TEST_DB}`
        };
        const item = await getInventoryItem('item1', tenant);
        expect(item).toMatchObject({
            slug: 'widget-123',
            title: 'Widget',
            tenantId: 'tenant1',
        });
    });

    test('[test 3] rejects todo item creation for wrong tenant', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://${process.env.DB_USER || 'root'}:${process.env.DB_PASS || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}/${TEST_DB}`
        };
        const itemData: TodoItemData = { slug: 'new-todo', title: 'New Todo', tenantId: 'tenant2' };

        await expect(createInventoryItem(itemData, tenant)).rejects.toThrow('Tenant mismatch');
    });

    test('[test 4] rejects todo creation with duplicate slug', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://${process.env.DB_USER || 'root'}:${process.env.DB_PASS || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}/${TEST_DB}`
        };
        const itemData: TodoItemData = { slug: 'widget-123', title: 'Widget', tenantId: 'tenant1' };

        await expect(createInventoryItem(itemData, tenant)).rejects.toThrow('Duplicate entry');
    });

    test('[test 5] rejects todo fetch with non-existent ID', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://${process.env.DB_USER || 'root'}:${process.env.DB_PASS || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}/${TEST_DB}`
        };

        await expect(getInventoryItem('nonexistent', tenant)).rejects.toThrow('Todo item not found');
    });
});