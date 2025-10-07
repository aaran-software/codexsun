import { Tenant, TenantUser } from '../app.types';
import { query } from '../../db/db'; // Use db.ts for consistent querying
import { getDbConfig } from '../../config/db-config';
import { tenantStorage } from '../../db/db'; // For tenant context isolation

/**
 * Resolves the tenant based on the provided email from the request body.
 * Queries the master database to find the associated tenant and constructs
 * a dynamic connection string based on the database adapter type.
 * Stores the tenant database name in AsyncLocalStorage for isolation.
 *
 * @param req - Request object containing email and password in body.
 * @returns Promise resolving to the Tenant object.
 * @throws Error with specific messages for validation or query failures.
 */
export async function resolveTenant(req: { body: { email: string; password: string } }): Promise<Tenant> {
    const dbConfig = getDbConfig(); // Master DB config
    const { email } = req.body;

    // Input validation
    if (!email || typeof email !== 'string' || !email.trim()) {
        throw new Error('Valid email is required for tenant resolution');
    }

    try {
        // Query for user-tenant mapping
        const users = await query<TenantUser>(
            'SELECT email, tenant_id AS tenantId FROM tenant_users WHERE email = ?',
            [email.trim()]
        );

        if (users.rows.length === 0) {
            throw new Error(`No tenant associated with email: ${email}`);
        }

        if (users.rows.length > 1) {
            throw new Error(`Multiple tenants found for email: ${email}. Contact support.`);
        }

        const tenantId = users.rows[0].tenantId;

        // Query for tenant details
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

        // Validate tenant details
        if (!db_host || !db_port || !db_user || !db_name) {
            throw new Error(`Incomplete tenant configuration for ID: ${tenant_id}`);
        }

        // Build dynamic connection string
        const protocol = dbConfig.type;
        const sslParam = db_ssl === 'true' ? '?ssl=true' : '';
        const passPart = db_pass ? `:${encodeURIComponent(db_pass)}` : ''; // Encode password for safety
        const dbConnection = `${protocol}://${db_user}${passPart}@${db_host}:${db_port}/${db_name}${sslParam}`;

        const tenant: Tenant = { id: tenant_id, dbConnection };

        // Store in AsyncLocalStorage for isolation
        tenantStorage.enterWith(db_name);

        return tenant;
    } catch (error) {
        // Enhanced error handling: Wrap and rethrow with context
        const err = error instanceof Error ? error : new Error('Unknown error during tenant resolution');
        throw new Error(`Tenant resolution failed for email ${email}: ${err.message}`);
    }
}