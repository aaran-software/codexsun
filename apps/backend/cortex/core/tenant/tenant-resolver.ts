import {Tenant} from '../app.types';
import {query} from '../../db/db';
import {getMasterDbConfig} from '../../config/db-config';
import {tenantStorage} from '../../db/db';

export async function resolveTenant(req: { body: { email: string; password: string } }): Promise<Tenant> {
    const dbConfig = getMasterDbConfig();
    const {email} = req.body;

    if (!email || !email.trim()) {
        return Promise.reject(new Error('Valid email is required for tenant resolution'));
    }

    try {
        // Query tenant_users with join to users to get tenant_id by email
        const tenantUsers = await query<{
            tenant_id: string;
        }>(
            'SELECT tu.tenant_id FROM tenant_users tu INNER JOIN users u ON tu.user_id = u.id WHERE u.email = ?',
            [email.trim()]
        );

        if (tenantUsers.rows.length === 0) {
            return Promise.reject(new Error(`No tenant associated with email: ${email.trim()}`));
        }

        if (tenantUsers.rows.length > 1) {
            return Promise.reject(new Error(`Multiple tenants found for email: ${email.trim()}. Contact support.`));
        }

        const tenantId = tenantUsers.rows[0].tenant_id;

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
            return Promise.reject(new Error(`Tenant not found for ID: ${tenantId}`));
        }

        const {tenant_id, db_host, db_port, db_user, db_pass, db_name, db_ssl} = tenantRes.rows[0];

        if (!db_host || !db_port || !db_user || !db_name) {
            return Promise.reject(new Error(`Incomplete tenant configuration for ID: ${tenant_id}`));
        }

        const driver = dbConfig.driver;
        const sslParam = db_ssl === 'true' || dbConfig.ssl ? '?ssl=true' : '';
        const passPart = db_pass ? `:${encodeURIComponent(db_pass)}` : '';
        const dbConnection = `${driver}://${db_user}${passPart}@${db_host}:${db_port}/${db_name}${sslParam}`;

        const tenant: Tenant = {id: tenant_id, dbConnection};
        tenantStorage.enterWith(db_name);

        return tenant;

    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error during tenant resolution');
        throw new Error(`Tenant resolution failed for email ${email}: ${err.message}`);
    }
}