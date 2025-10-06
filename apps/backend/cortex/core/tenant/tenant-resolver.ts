import { Tenant, TenantUser } from './tenant.types';
import { query } from '../../db/mdb';

export async function resolveTenant(req: { body: { email: string; password: string } }): Promise<Tenant> {
    const { email } = req.body;

    if (!email) {
        throw new Error('Email is required');
    }

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

    const tenantRes = await query<{
        tenant_id: string;
        db_host: string;
        db_port: string;
        db_user: string;
        db_pass: string | null;
        db_name: string;
        db_ssl: string | null;
    }>(
        'SELECT tenant_id, db_host, db_port, db_user, db_pass, db_name, db_ssl FROM tenants WHERE tenant_id = ?',
        [tenantId]
    );

    if (tenantRes.rows.length === 0) {
        throw new Error('Tenant not found');
    }

    const { tenant_id, db_host, db_port, db_user, db_pass, db_name, db_ssl } = tenantRes.rows[0];
    const dbConnection = `mariadb://${db_user}${db_pass ? `:${db_pass}` : ''}@${db_host}:${db_port}/${db_name}${db_ssl === 'true' ? '?ssl=true' : ''}`;

    return { id: tenant_id, dbConnection };
}