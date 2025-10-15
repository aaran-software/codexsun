import { connect, disconnect, isHealthy } from './connection';
import { query, execute, transaction } from './db';
import { DbConfig, getPrimaryDbConfig } from './db-config';
import { User, CountResult } from './types';
import { createLogger, Logger } from './logger';
import type { SqlError } from 'mariadb';

let logger: Logger;
try {
    logger = createLogger('MultiTenantMain');
} catch (error: unknown) {
    console.error('Failed to initialize logger:', (error as Error).message, (error as Error).stack);
    process.exit(1);
}

/**
 * Sanitizes input string for database operations.
 * @param input - The input string to sanitize.
 * @param maxLength - Maximum allowed length.
 * @returns Sanitized string.
 * @throws Error if input is invalid.
 */
function sanitizeInput(input: string, maxLength: number): string {
    const sanitized = input.replace(/[^a-zA-Z0-9\s-_]/g, '').slice(0, maxLength);
    if (!sanitized) throw new Error('Invalid input: empty after sanitization');
    return sanitized;
}

/**
 * Tenant information retrieved from the master database.
 */
interface TenantConfig {
    tenantId: string;
    databaseName: string;
}

/**
 * Retrieves tenant database details from the master database.
 * @returns Array of tenant information.
 */
async function getTenants(): Promise<TenantConfig[]> {
    const masterConfig = getPrimaryDbConfig(); // Master DB config (e.g., codexsun_master_db)
    masterConfig.database = 'master_db'; // Override to master database
    try {
        await connect(masterConfig);
        if (!(await isHealthy())) {
            throw new Error('Master database connection is not healthy');
        }
        const tenants = await query<TenantConfig>('SELECT tenantId, databaseName FROM tenants');
        logger.info('Tenants retrieved from master database', { count: tenants.length });
        return tenants;
    } catch (error: unknown) {
        logger.error('Failed to retrieve tenants from master database', {
            message: (error as Error).message,
            stack: (error as Error).stack,
        });
        throw error;
    } finally {
        await disconnect();
    }
}

/**
 * Creates the users table if it doesn't exist in the tenant's database.
 * @param tenantId - The tenant identifier.
 * @param config - Tenant-specific database configuration.
 */
async function createUsersTable(tenantId: string, config: DbConfig): Promise<void> {
    const sql = 'CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100))';
    await execute(sql);
    logger.info('Users table created or verified for tenant', { tenantId });
    try {
        await logger.flush();
    } catch (error: unknown) {
        logger.error('Failed to flush logs in createUsersTable', {
            message: (error as Error).message,
            tenantId,
        });
    }
}

/**
 * Retrieves all users from the tenant's database.
 * @param tenantId - The tenant identifier.
 * @param config - Tenant-specific database configuration.
 * @returns Array of users.
 */
async function getUsers(tenantId: string, config: DbConfig): Promise<User[]> {
    const users = await query<User>('SELECT * FROM users');
    logger.info('Users retrieved for tenant', { tenantId, count: users.length });
    return users;
}

/**
 * Checks if a user already exists by name in the tenant's database.
 * @param name - Name of the user to check.
 * @param tenantId - The tenant identifier.
 * @param config - Tenant-specific database configuration.
 * @returns True if the user exists.
 */
async function userExists(name: string, tenantId: string, config: DbConfig): Promise<boolean> {
    const sanitizedName = sanitizeInput(name, 100);
    const result = await query<{ count: number }>('SELECT COUNT(*) as count FROM users WHERE name = ?', [sanitizedName]);
    return result[0].count > 0;
}

/**
 * Inserts a user and returns the total user count in a transaction for the tenant.
 * @param name - Name of the user to insert.
 * @param tenantId - The tenant identifier.
 * @param config - Tenant-specific database configuration.
 * @returns Total user count or null if user exists.
 */
async function insertAndCountUser(name: string, tenantId: string, config: DbConfig): Promise<number | null> {
    if (await userExists(name, tenantId, config)) {
        logger.info('User already exists, skipping insert', { name, tenantId });
        return null;
    }

    const sanitizedName = sanitizeInput(name, 100);
    const count = await transaction<CountResult['cnt']>(async (conn) => {
        await conn.execute('INSERT INTO users (name) VALUES (?)', [sanitizedName]);
        const result = await conn.query<CountResult[]>('SELECT COUNT(*) as cnt FROM users');
        return result[0].cnt;
    });

    logger.info('User count retrieved for tenant', { count, tenantId });
    try {
        await logger.flush();
    } catch (error: unknown) {
        logger.error('Failed to flush logs in insertAndCountUser', {
            message: (error as Error).message,
            tenantId,
        });
    }
    return count;
}

/**
 * Main function to orchestrate ERP database operations for a specific tenant.
 * @param tenant - Tenant information with tenantId and databaseName.
 */
async function mainForTenant(tenant: TenantConfig) {
    const config = getPrimaryDbConfig(); // Get base config
    config.database = tenant.databaseName; // Override with tenant-specific database
    const tenantId = tenant.tenantId;

    try {
        await connect(config);
        if (!(await isHealthy())) {
            throw new Error(`Database connection is not healthy for tenant ${tenantId}`);
        }
        await createUsersTable(tenantId, config);
        await getUsers(tenantId, config);
        const count = await insertAndCountUser('Alice', tenantId, config);
        if (count !== null) {
            logger.info('New user inserted for tenant', { count, tenantId });
        }
    } catch (error: unknown) {
        logger.error('Main operation failed for tenant', {
            message: (error as Error).message,
            stack: (error as Error).stack,
            tenantId,
        });
        throw error;
    } finally {
        try {
            await disconnect();
        } catch (error: unknown) {
            logger.error('Failed to disconnect for tenant', {
                message: (error as Error).message,
                code: (error as SqlError)?.code,
                sqlState: (error as SqlError)?.sqlState,
                tenantId,
            });
        }
        try {
            await logger.flush();
        } catch (error: unknown) {
            logger.error('Failed to flush logs in main for tenant', {
                message: (error as Error).message,
                tenantId,
            });
        }
    }
}

/**
 * Orchestrates operations across all tenants retrieved from the master database.
 */
async function main() {
    const tenants = await getTenants();
    for (const tenant of tenants) {
        try {
            await mainForTenant(tenant);
            logger.info(`Operations completed successfully for tenant ${tenant.tenantId}`);
        } catch (error: unknown) {
            logger.error(`Operations failed for tenant ${tenant.tenantId}`, {
                message: (error as Error).message,
                stack: (error as Error).stack,
            });
        }
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    logger.error('Unhandled promise rejection', { reason: String(reason), promise });
    logger.flush().finally(() => process.exit(1));
});

main()
    .then(() => {
        logger.info('All tenant operations completed successfully');
        logger.flush().then(() => process.exit(0)).catch((error: unknown) => {
            logger.error('Failed to flush logs in main success', { message: (error as Error).message });
            process.exit(1);
        });
    })
    .catch((error: unknown) => {
        logger.error('Fatal error in multi-tenant operations', {
            message: (error as Error).message,
            stack: (error as Error).stack,
        });
        logger.flush().then(() => process.exit(1)).catch((flushError: unknown) => {
            console.error('Failed to flush logs in main error:', (flushError as Error).message);
            process.exit(1);
        });
    });