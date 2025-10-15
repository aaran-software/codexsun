import { DbConfig, getMasterDbConfig, getPrimaryDbConfig } from './cortex/config/db-config';
import { AnyDbClient } from './cortex/db/db-types';
import { Connection } from './cortex/db/connection';
import { AppEnv } from './cortex/config/get-settings';

// Define the allowed driver types
type DatabaseDriver = 'postgres' | 'mysql' | 'mariadb' | 'sqlite';

async function getTenant(): Promise<DbConfig> {
    const start = Date.now();
    let client: AnyDbClient | null = null;

    try {
        client = await Connection.getInstance().getClient(getMasterDbConfig().database);
        const result = await client.query('SELECT * FROM tenants', []);
        console.log('Tenants:', JSON.stringify(result.rows, null, 2));
        console.log('Query details:', {
            sql: 'SELECT * FROM tenants',
            rowCount: result.rowCount,
            duration: Date.now() - start,
        });

        if (result.rows.length === 0) {
            throw new Error('No tenants found in the database');
        }

        // Validate the driver value from the database
        const driver = result.rows[0].db_driver;
        if (!['postgres', 'mysql', 'mariadb', 'sqlite'].includes(driver)) {
            throw new Error(`Invalid database driver: ${driver}`);
        }

        // Convert db_ssl to boolean (handle string "false" or "true")
        const dbSsl = result.rows[0].db_ssl;
        const ssl = dbSsl === 'true' ? true : dbSsl === 'false' ? false : !!dbSsl;

        return {
            driver: driver as DatabaseDriver,
            host: result.rows[0].db_host,
            port: result.rows[0].db_port,
            user: result.rows[0].db_user,
            password: result.rows[0].db_pass,
            database: result.rows[0].db_name,
            ssl,
            connectionLimit: process.env.APP_ENV === AppEnv.Production ? 50 : 10,
            acquireTimeout: 30000,
            idleTimeout: 60000,
        };
    } finally {
        if (client && client.release) {
            client.release();
        } else if (client && client.end) {
            await client.end();
        }
    }
}

async function getTodos(tenantId: string, tenantConfig: DbConfig) {
    const start = Date.now();
    let client: AnyDbClient | null = null;

    try {
        // Initialize a new connection for the tenant's database
        const tenantConnection = await Connection.initialize(tenantConfig);
        client = await tenantConnection.getClient(tenantConfig.database);

        // Query the todos table in the tenant's database
        const result = await client.query('SELECT * FROM todos WHERE tenant_id = ?', [tenantId]);
        console.log('Todos:', JSON.stringify(result.rows, null, 2));
        console.log('Query details:', {
            sql: 'SELECT * FROM todos WHERE tenant_id = ?',
            rowCount: result.rowCount,
            duration: Date.now() - start,
        });
        return result;
    } finally {
        if (client && client.release) {
            client.release();
        } else if (client && client.end) {
            await client.end();
        }
        // Close the tenant connection pool
        try {
            await Connection.getInstance().close();
        } catch (closeError) {
            console.error('Error closing tenant connection:', closeError);
        }
    }
}

// Initialize connection and call getTenant and getTodos
(async () => {
    let masterConnection: Connection | null = null;
    try {
        const masterConfig = getMasterDbConfig();
        masterConnection = await Connection.initialize(masterConfig); // Initialize master connection once
        const tenant = await getTenant();
        await getTodos('default', tenant); // Use tenant_id from tenants table
    } catch (error) {
        console.error('Error in main execution:', error);
    } finally {
        // Close the master connection pool
        if (masterConnection) {
            try {
                await masterConnection.close();
            } catch (closeError) {
                console.error('Error closing master connection:', closeError);
            }
        }
        process.exit(0);
    }
})();