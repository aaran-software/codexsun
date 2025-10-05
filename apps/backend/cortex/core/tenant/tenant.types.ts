// cortex/core/tenant/tenant.types.ts

export interface Tenant {
    id: string;
    dbConnection: string;
}

export interface TenantUser {
    email: string;
    tenantId: string;
}

export interface DbConnection {
    database: string;
    query: (query: string, params?: any[]) => Promise<any>;
}

export interface User {
    id: string;
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

export interface InventoryItemData {
    name: string;
    quantity: number;
    tenantId: string;
}

export interface StoredInventoryItem {
    id: string;
    name: string;
    quantity: number;
    tenantId: string;
}

export interface LoginResponse {
    user: User;
    tenant: Tenant;
}

export interface RequestContext {
    tenant?: Tenant;
    user?: User;
}

export interface UserResponse {
    user: StoredUser;
}

export interface InventoryResponse {
    item: StoredInventoryItem;
}

export type Role = 'admin' | 'user' | 'viewer';

export interface PermissionCheck {
    requiredRole: Role;
}

export interface RateLimitConfig {
    windowMs: number;
    max: number;
}