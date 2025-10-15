import {Tenant} from '../app.types';
import {query} from '../../db/mdb';

export async function resolveByEmail(req: { body: { email: string; password: string } }): Promise<Tenant> {

    const { email } = req.body;

    if (!email || !email.trim()) {
        return Promise.reject(new Error('Valid email is required for resolving tenant'));
    }

    try {
        // Query tenant_users with join to users to get tenant_id by email
        const tenantUsers = await query<{
            tenant_id: string;
        }>(
            'SELECT tu.tenant_id FROM tenant_users tu INNER JOIN users u ON tu.user_id = u.id WHERE u.email = ?',
            [email.trim()],
        );

        if (tenantUsers.rows.length === 0) {
            return Promise.reject(new Error(`No tenant associated with email: ${email.trim()}`));
        }

        if (tenantUsers.rows.length > 1) {
            return Promise.reject(new Error(`Multiple tenants found for email: ${email.trim()}. Contact support.`));
        }

        const tenantId = tenantUsers.rows[0].tenant_id;

        return {id: tenantId};

    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error during tenant resolution');
        throw new Error(`Tenant resolution failed for email ${email}: ${err.message}`);
    }
}