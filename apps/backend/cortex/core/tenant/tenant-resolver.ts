import { Tenant, TenantUser } from './tenant.types';
import { query } from '../../db/db';
import { getDbConfig } from '../../config/db-config';

/**
 * Resolves a tenant based on the user's email from the master database.
 * Used in multi-tenant ERP to identify the tenant database for user requests.
 * @param req - Request object containing email and password in the body.
 * @returns A promise resolving to the Tenant object with id and dbConnection.
 * @throws Error if email is missing, not associated with a tenant, associated with multiple tenants, or tenant not found.
 */
export async function resolveTenant(req: { body: { email: string; password: string } }): Promise<Tenant> {
    const { email } = req.body;

    if (!email) {
        throw new Error('Email is required');
    }

    // Query tenant_users table in master DB to find tenant ID
    const users = await query<TenantUser>(
        'SELECT email, tenant_id AS tenantId FROM tenant_users WHERE email = ?',
        [email]
    );

    if (users.rows.length === 0) {
        throw new Error('Email not associated with any tenant');
    }

    if (users.rows.length > 1) {
        throw new Error('Multiple tenants found for email');
    }

    const tenantId = users.rows[0].tenantId;

    // Query tenants table in master DB to get tenant details
    const tenantRes = await query<Tenant>(
        'SELECT id, db_connection AS dbConnection FROM tenants WHERE id = ?',
        [tenantId]
    );

    if (tenantRes.rows.length === 0) {
        throw new Error('Tenant not found');
    }

    return tenantRes.rows[0];
}