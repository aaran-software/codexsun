// cortex/db/connection.ts

import { DbConfig, AnyDbClient, DBAdapter } from './db-types';
import { MariaDBAdapter } from './adapters/mariadb';
import { PostgresAdapter } from './adapters/postgres';
import { MysqlAdapter } from './adapters/mysql';
import { SqliteAdapter } from './adapters/sqlite';

export class Connection {
    private readonly config: DbConfig;
    private adapter: DBAdapter;
    private static instance: Connection | null = null;

    private constructor(config: DbConfig) {
        this.config = config;
        switch (this.config.type) {
            case 'mariadb':
                this.adapter = new MariaDBAdapter();
                break;
            case 'postgres':
                this.adapter = new PostgresAdapter();
                break;
            case 'mysql':
                this.adapter = new MysqlAdapter();
                break;
            case 'sqlite':
                this.adapter = new SqliteAdapter();
                break;
            default:
                throw new Error(`Unsupported database type: ${this.config.type}`);
        }
    }

    /**
     * Initialize the singleton connection instance.
     */
    static async initialize(config: DbConfig): Promise<Connection> {
        if (!Connection.instance) {
            Connection.instance = new Connection(config);
            await Connection.instance.init();
        }
        return Connection.instance;
    }

    /**
     * Get the singleton connection instance.
     */
    static getInstance(): Connection {
        if (!Connection.instance) {
            throw new Error('Connection not initialized. Call initialize first.');
        }
        return Connection.instance;
    }

    async init(): Promise<void> {
        try {
            if (this.adapter.initPool) {
                await this.adapter.initPool(this.config);
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to initialize pool: ${error.message}`);
            } else {
                throw new Error(`Failed to initialize pool: Unknown error`);
            }
        }
    }

    async close(): Promise<void> {
        try {
            if (this.adapter.closePool) {
                await this.adapter.closePool();
            }
            Connection.instance = null;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to close pool: ${error.message}`);
            } else {
                throw new Error(`Failed to close pool: Unknown error`);
            }
        }
    }

    async getClient(database: string = ''): Promise<AnyDbClient> {
        return await this.adapter.getConnection(database);
    }

    getConfig(): DbConfig {
        return this.config;
    }
}