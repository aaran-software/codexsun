import {getTenantDbConnection} from "../../cortex/core/db-context-switcher";
import {Tenant} from "../../cortex/core/tenant.types";

describe('[2.] DB Context Switching', () => {
    test('[test 1] switches to tenant-specific DB connection', async () => {
        const tenant: Tenant = { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' };
        const connection = await getTenantDbConnection(tenant);
        expect(connection.database).toBe('tenant1_db');
        expect(connection).toHaveProperty('query');
    });

    test('[test 2] throws error for invalid tenant DB connection', async () => {
        const tenant: Tenant = { id: 'tenant1', dbConnection: 'invalid://connection' };
        await expect(getTenantDbConnection(tenant)).rejects.toThrow('Failed to connect to tenant DB');
    });
});