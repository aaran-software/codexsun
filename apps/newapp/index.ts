import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { createUserRouter } from './cortex/api/api-user';
import { createAuthRouter } from './cortex/api/api-auth';
import { MariaDBAdapter } from './cortex/db/adapters/mariadb';

// Configuration
const baseDbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Computer.1',
};

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const HOST = 'localhost';

// Logger setup
const log = (message: string): void => {
    console.log(`[${new Date().toISOString()}] ${message}`);
};

// Initialize Express app
const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', createUserRouter());
app.use('/api/auth', createAuthRouter());

// Welcome route
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({ message: 'Welcome to the API server!' });
});

// Health check route
app.get('/hz', async (_req: Request, res: Response) => {
    try {
        // Test database connectivity
        const connection = await MariaDBAdapter.getConnection('master_db');
        try {
            await connection.query('SELECT 1');
            res.status(200).json({ status: 'ok', database: 'connected' });
        } finally {
            if (connection.release) connection.release();
            else if (connection.end) await connection.end();
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
        await MariaDBAdapter.closePool();
        log('Database pool closed.');
        process.exit(0);
    } catch (error: any) {
        log(`Error during shutdown: ${error.message}`);
        process.exit(1);
    }
}

// Boot function
async function bootServer(): Promise<void> {
    try {
        // Initialize database pool
        log('Initializing MariaDB pool...');
        MariaDBAdapter.initPool(baseDbConfig);
        log('MariaDB pool initialized.');

        // Start server
        server = app.listen(PORT, HOST, () => {
            log(`Server is running on http://${HOST}:${PORT}`);
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