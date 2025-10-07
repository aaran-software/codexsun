import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { getSettings } from './cortex/config/get-settings';

// Logger setup
const log = (message: string): void => {
    console.log(`[${new Date().toISOString()}] ${message}`);
};

// Initialize Express app
const app: Express = express();
const settings = getSettings();

// Middleware
app.use(cors());
app.use(express.json());

// Welcome route
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({ message: 'Welcome to the API server!' });
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
        process.exit(0);
    } catch (error: any) {
        log(`Error during shutdown: ${error.message}`);
        process.exit(1);
    }
}

// Boot function
async function startServer(): Promise<void> {
    try {
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
        log(`Failed to start server: ${error.message}`);
        await shutdown('BOOT_ERROR');
    }
}

// Start the server
startServer().catch(async (error: any) => {
    log(`Unexpected error: ${error.message}`);
    await shutdown('UNEXPECTED_ERROR');
});