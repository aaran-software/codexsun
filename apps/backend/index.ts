import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { createAuthRouter } from './cortex/api/api-auth';
import { createTodoRouter } from './cortex/todos/todo.routes';
import { createUserRouter } from './cortex/user/user.routes';
import { getDbConfig } from './cortex/config/db-config';
import { Connection } from './cortex/db/connection';
import { settings } from './cortex/config/get-settings';
import { tenantMiddleware } from './cortex/middleware/tenant-middleware';

// Logger setup
const log = (message: string): void => {
    console.log(`[${new Date().toISOString()}] ${message}`);
};

// Initialize Express app
export const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(tenantMiddleware);

// Routes
app.use('/api/users', createUserRouter());
app.use('/api/auth', createAuthRouter());
app.use('/api/todos', createTodoRouter());

// Welcome route
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({ message: 'Welcome to the API server!' });
});

// Health check route
app.get('/hz', async (_req: Request, res: Response) => {
    try {
        const connection = Connection.getInstance();
        const client = await connection.getClient(settings.TENANCY ? settings.MASTER_DB : settings.DB_NAME);
        try {
            await client.query('SELECT 1');
            res.status(200).json({ status: 'ok', database: 'connected' });
        } finally {
            if (client.release) client.release();
            else if (client.end) await client.end();
        }
    } catch (error: any) {
        log(`Health check failed: ${error.message}`);
        res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
    }
});

// Server instance
let server: ReturnType<Express['listen']>;

// Graceful shutdown function
async function shutdown(signal: string): Promise<void> {
    log(`Received ${signal}. Shutting down server...`);
    try {
        if (server) {
            await new Promise<void>((resolve) => {
                server.close(() => {
                    log('Server closed.');
                    resolve();
                });
            });
        }
        const connection = Connection.getInstance();
        await connection.close();
        log('Database pool closed.');
        process.exit(0);
    } catch (error: any) {
        log(`Error during shutdown: ${error.message}`);
        process.exit(1);
    }
}

async function setupMasterDb(): Promise<void> {
    if (!settings.TENANCY) {
        return; // Skip master_db setup if tenancy is disabled
    }
    const conn = Connection.getInstance();
    let client = await conn.getClient('');
    try {
        if (settings.DB_DRIVER === 'postgres') {
            await client.query(`CREATE SCHEMA IF NOT EXISTS "${settings.MASTER_DB}"`);
        } else {
            await client.query(`CREATE DATABASE IF NOT EXISTS \`${settings.MASTER_DB}\``);
        }
    } catch (error) {
        log(`Failed to create master_db: ${(error as Error).message}`);
        throw error;
    } finally {
        if (client.release) client.release();
        else if (client.end) await client.end();
    }

    client = await conn.getClient(settings.MASTER_DB);
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS tenants (
                                                   id INT AUTO_INCREMENT PRIMARY KEY,
                                                   tenant_id VARCHAR(255) UNIQUE NOT NULL,
                database_name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
        `);
    } catch (error) {
        log(`Failed to setup tenants table: ${(error as Error).message}`);
        throw error;
    } finally {
        if (client.release) client.release();
        else if (client.end) await client.end();
    }
}

// Boot function
async function bootServer(): Promise<void> {
    try {
        // Initialize database connection
        log('Initializing database connection...');
        const dbConfig = getDbConfig();
        await Connection.initialize(dbConfig);
        log('Database connection initialized.');

        // Setup master db if tenancy is enabled
        await setupMasterDb();
        log('Master database setup completed.');

        // Start server
        server = app.listen(settings.APP_PORT, settings.APP_HOST, () => {
            log(`Server is running on http://${settings.APP_HOST}:${settings.APP_PORT}`);
        });

        // Handle server errors
        server.on('error', (error: Error) => {
            log(`Server error: ${error.message}`);
            throw error;
        });

        // Handle process termination signals
        process.on('SIGINT', () => shutdown('SIGINT')); // Ctrl+C
        process.on('SIGTERM', () => shutdown('SIGTERM')); // Termination signal
    } catch (error: any) {
        log(`Failed to boot server: ${error.message}`);
        await shutdown('BOOT_ERROR');
    }
}

// Start the server
bootServer().catch(async (error: any) => {
    log(`Unexpected error: ${error.message}`);
    await shutdown('UNEXPECTED_ERROR');
});