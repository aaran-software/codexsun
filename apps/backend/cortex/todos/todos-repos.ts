import {query} from '../db/db';
import {QueryResult} from '../db/db-types';
import {TenantId, Todo} from './todos-model';
import {getTenantDbConnection} from "../db/db-context-switcher";
import {User} from "../user/user-model";

export async function createUser(TenantId: TenantId, todo: Todo): Promise<QueryResult<Todo>> {
    const tenantId = TenantId.tenant_id || 'default_tenant';
    // Get tenant-specific DB connection
    const tenantDb = await getTenantDbConnection({
        id: tenantId,
        dbConnection: `mysql://user:password@localhost/${tenantId}`
    });
        // Start transaction
        await tenantDb.query('START TRANSACTION');

        return query<Todo>(
            'INSERT INTO todos (todoname, email, password_hash, mobile, status, role_id, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [todo.todoname, todo.email, todo.password_hash, todo.mobile, todo.status, todo.role_id, todo.email_verified]
        );
    }

    export async function getUsers(tenantId: string): Promise<Todo[]> {
        const result = await query<any>(
            'SELECT u.id, u.todoname, u.email, u.mobile, u.status, u.role_id, u.email_verified, u.created_at, u.updated_at ' +
            'FROM todos u ' +
            'JOIN tenant_todos tu ON u.id = tu.todo_id ' +
            'WHERE tu.tenant_id = ? ORDER BY u.created_at DESC',
            [tenantId]
        );
        return result.rows.map((r: any) => ({
            id: r.id,
            todoname: r.todoname,
            email: r.email,
            mobile: r.mobile || null,
            status: r.status,
            role_id: r.role_id,
            email_verified: r.email_verified || null,
            created_at: r.created_at,
            updated_at: r.updated_at
        }));
    }

    export async function getUserById(id: number, tenantId: string): Promise<Todo | null> {
        const result = await query<any>(
            'SELECT u.id, u.todoname, u.email, u.mobile, u.status, u.role_id, u.email_verified, u.created_at, u.updated_at ' +
            'FROM todos u ' +
            'JOIN tenant_todos tu ON u.id = tu.todo_id ' +
            'WHERE u.id = ? AND tu.tenant_id = ?',
            [id, tenantId]
        );
        const r = result.rows[0];
        return r ? {
            id: r.id,
            todoname: r.todoname,
            email: r.email,
            mobile: r.mobile || null,
            status: r.status,
            role_id: r.role_id,
            email_verified: r.email_verified || null,
            created_at: r.created_at,
            updated_at: r.updated_at
        } : null;
    }

    export async function getUserByEmail(email: string, tenantId: string): Promise<Todo | null> {
        const result = await query<any>(
            'SELECT u.id, u.todoname, u.email, u.mobile, u.status, u.role_id, u.email_verified, u.created_at, u.updated_at ' +
            'FROM todos u ' +
            'JOIN tenant_todos tu ON u.id = tu.todo_id ' +
            'WHERE u.email = ? AND tu.tenant_id = ?',
            [email, tenantId]
        );
        const r = result.rows[0];
        return r ? {
            id: r.id,
            todoname: r.todoname,
            email: r.email,
            mobile: r.mobile || null,
            status: r.status,
            role_id: r.role_id,
            email_verified: r.email_verified || null,
            created_at: r.created_at,
            updated_at: r.updated_at
        } : null;
    }

    export async function updateUser(id: number, updates: Partial<Todo>, tenantId: string): Promise<QueryResult<Todo>> {
        const {todoname, email, password_hash, mobile, status, role_id, email_verified} = updates;
        const updatesStr: string[] = [];
        const params: any[] = [];

        if (todoname !== undefined) {
            updatesStr.push('todoname = ?');
            params.push(todoname);
        }
        if (email !== undefined) {
            updatesStr.push('email = ?');
            params.push(email);
        }
        if (password_hash !== undefined) {
            updatesStr.push('password_hash = ?');
            params.push(password_hash);
        }
        if (mobile !== undefined) {
            updatesStr.push('mobile = ?');
            params.push(mobile);
        }
        if (status !== undefined) {
            updatesStr.push('status = ?');
            params.push(status);
        }
        if (role_id !== undefined) {
            updatesStr.push('role_id = ?');
            params.push(role_id);
        }
        if (email_verified !== undefined) {
            updatesStr.push('email_verified = ?');
            params.push(email_verified);
        }

        if (updatesStr.length === 0) {
            throw new Error('No fields provided for update');
        }

        params.push(id);
        const sql = `UPDATE todos u ` +
            `JOIN tenant_todos tu ON u.id = tu.todo_id ` +
            `SET ${updatesStr.join(', ')} ` +
            `WHERE u.id = ? AND tu.tenant_id = ?`;
        params.push(tenantId);
        return query<Todo>(sql, params);
    }

    export async function deleteUser(id: number, tenantId: string): Promise<QueryResult<Todo>> {
        return query<Todo>(
            'DELETE u FROM todos u ' +
            'JOIN tenant_todos tu ON u.id = tu.todo_id ' +
            'WHERE u.id = ? AND tu.tenant_id = ?',
            [id, tenantId]
        );
    }