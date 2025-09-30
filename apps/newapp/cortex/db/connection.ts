// cortex/connection.ts
import { DbConfig, AnyDbClient, DBAdapter } from './db-types';
import { MariaDBAdapter } from './adapters/mariadb';

export class Connection {
    private config: DbConfig;
    private adapter: DBAdapter;
    private client: AnyDbClient | null = null;

    constructor(config: DbConfig) {
        this.config = config;
        if (this.config.type !== 'mariadb') {
            throw new Error(`Unsupported database type: ${this.config.type}. Only mariadb is supported.`);
        }
        this.adapter = new MariaDBAdapter();
    }

    async init(): Promise<void> {
        if (this.client) {
            throw new Error('Connection already initialized');
        }
        try {
            this.client = await this.adapter.connect(this.config);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to initialize connection: ${error.message}`);
            } else {
                throw new Error(`Failed to initialize connection: Unknown error`);
            }
        }
    }

    async close(): Promise<void> {
        if (!this.client) {
            return;
        }
        try {
            await this.adapter.disconnect(this.client);
            this.client = null;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to close connection: ${error.message}`);
            } else {
                throw new Error(`Failed to close connection: Unknown error`);
            }
        }
    }

    getClient(): AnyDbClient {
        if (!this.client) {
            throw new Error('Connection not initialized');
        }
        return this.client;
    }

    getConfig(): DbConfig {
        return this.config;
    }
}