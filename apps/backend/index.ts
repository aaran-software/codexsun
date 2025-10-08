import express, { Express, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import { RequestContext } from './cortex/core/app.types';
import { getSettings } from './cortex/config/get-settings';
import { Connection } from './cortex/db/connection';
import { Logger } from './cortex/logger/logger';
import { createApp } from './cortex/core/app';
import { healthCheck } from './cortex/db/mdb';

declare module 'express' {
    interface Request {
        context: RequestContext;
        ip: string;
    }
}

// Initialize logger
const logger = new Logger();

// Initialize Express app
const app: Express = express();
const settings = getSettings();

// Middleware to log requests and responses
const logMiddleware: RequestHandler = (req, res, next) => {
    const start = Date.now();
    const { method, url, body } = req;

    logger.debug('Request', {
        method,
        url,
        body: JSON.stringify(body || {}, null, 2),
    });

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
};

// Middleware to initialize context and ip
// const contextMiddleware: RequestHandler = (req, res, next) => {
//     req.context = { ip: req.ip || '127.0.0.1' };
//     next();
// };

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(logMiddleware);
// app.use(contextMiddleware);

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'X-Tenant-Id', 'Authorization'],
}));

app.use('/api', createApp() as RequestHandler);

// Welcome route
app.get('/', (_req, res: Response) => {
    res.status(200).json({ message: 'Welcome to the API server!' });
});

// Health check route
app.get('/hz', async (_req, res: Response) => {
    try {
        const dbName = settings.TENANCY ? settings.MASTER_DB : settings.DB_NAME;
        const isHealthy = await healthCheck(dbName);
        if (isHealthy) {
            res.status(200).json({ status: 'ok', database: 'connected' });
            logger.debug('Health check succeeded', { database: dbName });
        } else {
            throw new Error('Database health check failed');
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
        try {
            await connection.close();
            logger.info('Database pool closed.');
        } catch (error: any) {
            logger.error(`Failed to close database pool: ${error.message}`);
        }
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
            driver: settings.DB_DRIVER,
            connectionLimit: process.env.NODE_ENV === 'production' ? 50 : 10,
            acquireTimeout: 30000,
            idleTimeout: 60000,
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