// cortex/core/tenant/tenant-resolver.ts

import { Tenant } from '../app.types';
import { query } from '../../db/db';
import { getDbConfig } from '../../config/db-config';
import { tenantStorage } from '../../db/db';

export async function resolveTenant(req: { body: { email: string; password: string } }): Promise<Tenant> {
    const dbConfig = getDbConfig();
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
        throw new Error('Valid email is required for tenant resolution');
    }

    try {
        const users = await query<{
            tenant_id: string;
        }>(
            'SELECT tenant_id FROM users WHERE email = ?',
            [email.trim()]
        );

        if (users.rows.length === 0) {
            throw new Error(`No tenant associated with email: ${email}`);
        }

        if (users.rows.length > 1) {
            throw new Error(`Multiple tenants found for email: ${email}. Contact support.`);
        }

        const tenantId = users.rows[0].tenant_id;

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
            throw new Error(`Tenant not found for ID: ${tenantId}`);
        }

        const { tenant_id, db_host, db_port, db_user, db_pass, db_name, db_ssl } = tenantRes.rows[0];

        if (!db_host || !db_port || !db_user || !db_name) {
            throw new Error(`Incomplete tenant configuration for ID: ${tenant_id}`);
        }

        const protocol = dbConfig.type;
        const sslParam = db_ssl === 'true' ? '?ssl=true' : '';
        const passPart = db_pass ? `:${encodeURIComponent(db_pass)}` : '';
        const dbConnection = `${protocol}://${db_user}${passPart}@${db_host}:${db_port}/${db_name}${sslParam}`;

        const tenant: Tenant = { id: tenant_id, dbConnection };
        tenantStorage.enterWith(db_name);

        return tenant;
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error during tenant resolution');
        throw new Error(`Tenant resolution failed for email ${email}: ${err.message}`);
    }
}