import { Tenant, TodoItemData, TodoInventoryItem, DbConnection } from '../app.types';
import { getTenantDbConnection } from '../../db/db-context-switcher';

// Query todo from tenant DB by id
async function queryTodo(connection: DbConnection, id: string): Promise<any> {
    const result = await connection.query(
        'SELECT id, slug, title, tenant_id AS tenantId FROM todos WHERE id = ?',
        [id]
    );
    return result.rows[0] || null;
}

// Create todo in tenant DB
async function createTodoInDb(connection: DbConnection, itemData: TodoItemData): Promise<TodoInventoryItem> {
    const { slug, title, tenantId } = itemData;
    const uniqueSlug = `${slug}-${Date.now()}`; // Ensure slug uniqueness
    const result = await connection.query(
        `INSERT INTO todos (id, slug, title, tenant_id, created_at, updated_at)
         VALUES (UUID(), ?, ?, ?, NOW(), NOW())`,
        [uniqueSlug, title, tenantId]
    );
    const insertedId = result.insertId || (await queryTodo(connection, result.insertId)).id;
    return { slug: uniqueSlug, title, tenantId };
}

export async function createInventoryItem(itemData: TodoItemData, tenant: Tenant): Promise<TodoInventoryItem> {
    const { tenantId } = itemData;

    if (tenantId !== tenant.id) {
        throw new Error('Tenant mismatch');
    }

    const connection = await getTenantDbConnection(tenant);
    try {
        const item = await createTodoInDb(connection, itemData);
        return item;
    } finally {
        await connection.release();
    }
}

export async function getInventoryItem(id: string, tenant: Tenant): Promise<TodoInventoryItem> {
    const connection = await getTenantDbConnection(tenant);
    try {
        const item = await queryTodo(connection, id);

        if (!item || item.tenantId !== tenant.id) {
            throw new Error('Todo item not found');
        }

        return { slug: item.slug, title: item.title, tenantId: item.tenantId };
    } finally {
        await connection.release();
    }
}