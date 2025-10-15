/**
 * Interface representing a tenant in the multi-tenant ERP system.
 */
export interface Tenant {
    id: string;
}

/**
 * Interface representing a tenant user mapping.
 */
export interface TenantUser {
    email: string;
    tenantId: string;
}

/**
 * Interface representing a database connection for tenant operations.
 */
export interface DbConnection {
    database: string;
    query<T = any>(sql: string, params?: any[]): Promise<{
        insertId?: number;
        rows: T[];
    }>;
    release: () => Promise<void>;
}

export interface User {
    id: string;
    username: string;
    email: string;
    tenantId: string;
    role: string;
    token: string;
}

export interface Credentials {
    email: string;
    password: string;
}

export interface JwtPayload {
    id: string;
    tenantId: string;
    role: string;
}

export interface UserData {
    name: string;
    email: string;
    tenantId: string;
}

export interface StoredUser {
    id: string;
    name: string;
    email: string;
    tenantId: string;
}

export interface TodoItemData {
    slug: string;
    title: string;
    tenantId: string;
}

export interface TodoItem {
    slug: string;
    title: string;
    tenantId: string;
}

export interface LoginResponse {
    user: User;
    tenant: Tenant;
}

export interface RequestContext {
    ip: string;
    tenant?: Tenant;
    user?: User;
}

export interface UserResponse {
    user: StoredUser;
}

export interface TodoResponse {
    item: TodoItem;
}

export type Role = 'admin' | 'user' | 'viewer';

export interface PermissionCheck {
    requiredRole: Role;
}

export interface RateLimitConfig {
    windowMs: number;
    max: number;
}