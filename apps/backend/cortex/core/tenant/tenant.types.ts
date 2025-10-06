// cortex/core/tenant/tenant.types.ts

/**
 * Interface representing a tenant in the multi-tenant ERP system.
 */
export interface Tenant {
    id: string;
    dbConnection: string;
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
    query: (sql: string, params?: any[]) => Promise<{ rows: any[] }>;
    release: () => Promise<void>;
}