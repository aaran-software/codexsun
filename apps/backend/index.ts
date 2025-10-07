// index.ts

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { getSettings } from './cortex/config/get-settings';
import { Connection } from './cortex/db/connection';
import { Logger } from './cortex/logger/logger';

// Initialize logger
const logger = new Logger();

// Initialize Express app
const app: Express = express();
const settings = getSettings();

// Middleware to log requests and responses
app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const { method, url, body } = req;

    // Log request with minimal info
    logger.debug('Request', {
        method,
        url,
        body: JSON.stringify(body || {}, null, 2),
    });

    // Capture response details
    const originalSend = res.send;
    res.send = function (body: any) {
        const duration = Date.now() - start;
        logger.debug('Response', {
            method,
            url,
            status: res.statusCode,
            body: JSON.stringify(typeof body === 'string' ? JSON.parse(body) : body, null, 2),
            duration_ms: duration,
        });
        return originalSend.call(this, body);
    };

    next();
});

// Middleware
app.use(cors());
app.use(express.json());

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
            logger.debug('Health check succeeded', { database: settings.TENANCY ? settings.MASTER_DB : settings.DB_NAME });
        } finally {
            if (client.release) client.release();
            else if (client.end) await client.end();
        }
    } catch (error: any) {
        logger.error(`Health check failed: ${error.message}`, { database: settings.TENANCY ? settings.MASTER_DB : settings.DB_NAME });
        res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
    }
});

// Server instance
let server: ReturnType<Express['listen']>;

// Graceful shutdown function
async function shutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal}. Shutting down server...`);
    try {
        if (server) {
            await new Promise<void>((resolve) => {
                server.close(() => {
                    logger.info('Server closed.');
                    resolve();
                });
            });
        }
        const connection = Connection.getInstance();
        await connection.close();
        logger.info('Database pool closed.');
        process.exit(0);
    } catch (error: any) {
        logger.error(`Error during shutdown: ${error.message}`);
        process.exit(1);
    }
}

// Boot function
async function startServer(): Promise<void> {
    try {
        // Initialize database connection
        logger.info('Initializing database connection...');
        const dbConfig = {
            host: settings.DB_HOST,
            port: settings.DB_PORT,
            user: settings.DB_USER,
            password: settings.DB_PASS,
            database: settings.TENANCY ? settings.MASTER_DB : settings.DB_NAME,
            ssl: settings.DB_SSL,
            type: settings.DB_DRIVER,
            connectionLimit: process.env.NODE_ENV === 'production' ? 50 : 10,
            acquireTimeout: 30000,
            idleTimeout: 60000
        };
        await Connection.initialize(dbConfig);
        logger.info('Database connection initialized.');

        // Start server
        server = app.listen(settings.APP_PORT, settings.APP_HOST, () => {
            logger.info(`Server is running on http://${settings.APP_HOST}:${settings.APP_PORT}`);
        });

        // Handle server errors
        server.on('error', (error: Error) => {
            logger.error(`Server error: ${error.message}`);
            throw error;
        });

        // Handle process termination signals
        process.on('SIGINT', () => shutdown('SIGINT')); // Ctrl+C
        process.on('SIGTERM', () => shutdown('SIGTERM')); // Termination signal
    } catch (error: any) {
        logger.error(`Failed to start server: ${error.message}`);
        await shutdown('BOOT_ERROR');
    }
}

// Start the server
startServer().catch(async (error: any) => {
    logger.error(`Unexpected error: ${error.message}`);
    await shutdown('UNEXPECTED_ERROR');
});