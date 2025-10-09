// // /cortex/core/todo/todo-service.ts
// // Expert mode: Refactored to match user-service structure: moved empty checks before connection, added pre-query for existing slug like user email check, removed DB catch for duplicate, use 'Duplicate entry' for consistency with tests, ensured logging for all errors.
//
// import { Tenant, TodoItemData, TodoItem, DbConnection } from '../app.types';
// import { getTenantDbConnection } from '../../db/db-context-switcher';
// import { logError } from '../../config/logger';
//
// // Query todo from tenant DB by id or slug
// async function queryTodo(connection: DbConnection, id?: string, slug?: string): Promise<any> {
//     const queryStr = id
//         ? 'SELECT slug, title, tenant_id AS tenantId FROM todos WHERE id = ?'
//         : 'SELECT slug, title, tenant_id AS tenantId FROM todos WHERE slug = ?';
//     const param = id || slug;
//     const result = await connection.query(queryStr, [param]);
//     return result.rows[0] || null;
// }
//
// // Create todo in tenant DB
// async function createTodoInDb(connection: DbConnection, itemData: TodoItemData): Promise<TodoItem> {
//     const { slug, title, tenantId } = itemData;
//     await connection.query(
//         `INSERT INTO todos (id, slug, title, tenant_id, created_at, updated_at)
//          VALUES (UUID(), ?, ?, ?, NOW(), NOW())`,
//         [slug, title, tenantId]
//     );
//     return { slug, title, tenantId };
// }
//
// export async function createTodoItem(itemData: TodoItemData, tenant: Tenant, version: string = 'v1'): Promise<TodoItem> {
//     const { tenantId, slug, title } = itemData;
//
//     if (tenantId !== tenant.id) {
//         const error = new Error('Tenant mismatch');
//         logError('error', { tenantId: tenant.id, version, error: error.message });
//         throw error;
//     }
//
//     if (!title || title.trim() === '') {
//         const error = new Error('Column \'title\' cannot be null or empty');
//         logError('error', { tenantId: tenant.id, version, error: error.message });
//         throw error;
//     }
//     if (!slug || slug.trim() === '') {
//         const error = new Error('Column \'slug\' cannot be null or empty');
//         logError('error', { tenantId: tenant.id, version, error: error.message });
//         throw error;
//     }
//
//     const connection = await getTenantDbConnection(tenant).catch((error) => {
//         logError('error', { tenantId: tenant.id, version, error: error.message || 'Connection failed' });
//         throw error;
//     });
//
//     try {
//         const existingItem = await queryTodo(connection, undefined, slug);
//
//         if (existingItem) {
//             const error = new Error('Duplicate entry');
//             logError('error', { tenantId: tenant.id, version, error: error.message });
//             throw error;
//         }
//
//         const item = await createTodoInDb(connection, itemData);
//         return item;
//     } finally {
//         await connection.release();
//     }
// }
//
// export async function getTodoItem(id: string, tenant: Tenant): Promise<TodoItem> {
//     const connection = await getTenantDbConnection(tenant).catch((error) => {
//         logError('error', { tenantId: tenant.id, version: 'unknown', error: error.message || 'Connection failed' });
//         throw error;
//     });
//
//     try {
//         const item = await queryTodo(connection, id);
//
//         if (!item || item.tenantId !== tenant.id) {
//             const error = new Error('Todo item not found');
//             logError('error', { tenantId: tenant.id, version: 'unknown', error: error.message });
//             throw error;
//         }
//
//         return { slug: item.slug, title: item.title, tenantId: item.tenantId };
//     } finally {
//         await connection.release();
//     }
// }