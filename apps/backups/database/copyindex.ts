// index.ts
import { connect, disconnect, isHealthy } from './connection';
import { query, execute, transaction } from './db';
import { getPrimaryDbConfig } from './db-config';
import { User, CountResult } from './types';
import { createLogger, Logger} from './logger';

let logger: Logger;
try {
    logger = createLogger('Main');
} catch (error) {
    console.error('Failed to initialize logger:', error.message, error.stack);
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
 * Creates the users table if it doesn't exist.
 * Ensures the database schema is ready for ERP user management.
 */
async function createUsersTable(): Promise<void> {
    const sql = 'CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100))';
    await execute(sql);
    logger.info('Users table created or verified');
    try {
        await logger.flush();
    } catch (error) {
        logger.error('Failed to flush logs in createUsersTable', { message: error.message });
    }
}

/**
 * Retrieves all users from the database.
 * Used for ERP user reporting.
 * @returns Array of users.
 */
async function getUsers(): Promise<User[]> {
    const users = await query<User>('SELECT * FROM users');
    logger.info('Users retrieved', { count: users.length });
    return users;
}

/**
 * Checks if a user already exists by name.
 * Prevents duplicate inserts.
 * @param name - Name of the user to check.
 * @returns True if the user exists.
 */
async function userExists(name: string): Promise<boolean> {
    const sanitizedName = sanitizeInput(name, 100);
    const result = await query<{ count: number }>('SELECT COUNT(*) as count FROM users WHERE name = ?', [sanitizedName]);
    return result[0].count > 0;
}

/**
 * Inserts a user and returns the total user count in a transaction.
 * Ensures atomicity for ERP data integrity.
 * @param name - Name of the user to insert.
 * @returns Total user count or null if user exists.
 */
async function insertAndCountUser(name: string): Promise<number | null> {
    if (await userExists(name)) {
        logger.info('User already exists, skipping insert', { name });
        return null;
    }

    const sanitizedName = sanitizeInput(name, 100);
    const count = await transaction<CountResult['cnt']>(async (conn) => {
        await conn.execute('INSERT INTO users (name) VALUES (?)', [sanitizedName]);
        const result = await conn.query<CountResult[]>('SELECT COUNT(*) as cnt FROM users');
        return result[0].cnt;
    });

    logger.info('User count retrieved', { count });
    try {
        await logger.flush();
    } catch (error) {
        logger.error('Failed to flush logs in insertAndCountUser', { message: error.message });
    }
    return count;
}

/**
 * Main function to orchestrate ERP database operations.
 * Connects to the database, performs schema setup, queries users, and inserts a new user.
 */
async function main() {
    const config = getPrimaryDbConfig();

    try {
        await connect(config);
        if (!(await isHealthy())) {
            throw new Error('Database connection is not healthy');
        }
        await createUsersTable();
        await getUsers();
        const count = await insertAndCountUser('Alice');
        if (count !== null) {
            logger.info('New user inserted', { count });
        }
    } catch (error) {
        logger.error('Main operation failed', { message: error.message, stack: error.stack });
        throw error;
    } finally {
        try {
            await disconnect();
        } catch (error) {
            logger.error('Failed to disconnect', { message: error.message, code: error.code, sqlState: error.sqlState });
        }
        try {
            await logger.flush();
        } catch (error) {
            logger.error('Failed to flush logs in main', { message: error.message });
        }
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection', { reason: reason?.toString(), promise });
    logger.flush().finally(() => process.exit(1));
});

main()
    .then(() => {
        logger.info('Database operations completed successfully');
        logger.flush().then(() => process.exit(0)).catch((error) => {
            logger.error('Failed to flush logs in main success', { message: error.message });
            process.exit(1);
        });
    })
    .catch((error) => {
        logger.error('Fatal error', { message: error.message, stack: error.stack });
        logger.flush().then(() => process.exit(1)).catch((flushError) => {
            console.error('Failed to flush logs in main error:', flushError.message);
            process.exit(1);
        });
    });