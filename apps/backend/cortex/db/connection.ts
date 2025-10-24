import { AnyDbClient, DBAdapter } from './db-types';
import { MariaDBAdapter } from './adapters/mariadb';
import { PostgresAdapter } from './adapters/postgres';
import { MysqlAdapter } from './adapters/mysql';
import { SqliteAdapter } from './adapters/sqlite';
import { logConnection } from '../config/logger';
import { DbConfig } from "../config/db-config";

export class Connection {
    private readonly config: DbConfig;
    private adapter: DBAdapter;
    private static instance: Connection | null = null;

    private constructor(config: DbConfig) {
        this.config = config;
        switch (this.config.driver) {
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
                throw new Error(`Unsupported database type: ${this.config.driver}`);
        }
    }

    static async initialize(config: DbConfig): Promise<Connection> {
        if (Connection.instance) {
            await Connection.instance.close(); // Ensure previous instance is closed
        }
        Connection.instance = new Connection(config);
        await Connection.instance.init();
        return Connection.instance;
    }

    static getInstance(): Connection {
        if (!Connection.instance) {
            throw new Error('Connection not initialized. Call initialize first.');
        }
        return Connection.instance;
    }

    async init(): Promise<void> {
        const start = Date.now();
        const connectionString = this.getConnectionString();
        try {
            // logConnection('start', { db: this.config.database || 'default', connectionString });
            if (this.adapter.initPool) {
                await this.adapter.initPool({
                    host: this.config.host,
                    port: this.config.port,
                    user: this.config.user,
                    password: this.config.password,
                    database: this.config.database,
                    ssl: this.config.ssl,
                    connectionLimit: this.config.connectionLimit,
                    acquireTimeout: this.config.acquireTimeout,
                    idleTimeout: this.config.idleTimeout,
                });
            }
            // logConnection('success', { db: this.config.database || 'default', connectionString, duration: Date.now() - start });
        } catch (error) {
            const errMsg = (error as Error).message || 'Unknown init error';
            logConnection('error', { db: this.config.database || 'default', connectionString, duration: Date.now() - start, error: errMsg });
            if (process.env.NODE_ENV === 'production') {
                await new Promise(resolve => setTimeout(resolve, 5000));
                return this.init(); // Retry once
            }
            throw new Error(`Failed to initialize pool: ${errMsg}`);
        }
    }

    async close(): Promise<void> {
        try {
            if (this.adapter.closePool) {
                await this.adapter.closePool();
            }
            Connection.instance = null;
            console.log('Connection fully closed');
        } catch (error) {
            const errMsg = (error as Error).message || 'Unknown error';
            console.error(`Failed to close pool: ${errMsg}`);
            throw new Error(`Failed to close pool: ${errMsg}`);
        }
    }

    async getClient(database: string = ''): Promise<AnyDbClient> {
        // Use the provided database name if specified, otherwise fall back to config.database
        const effectiveDb = database || this.config.database;
        return await this.adapter.getConnection(effectiveDb);
    }

    getConfig(): DbConfig {
        return this.config;
    }

    private getConnectionString(): string {
        const dbPart = this.config.database ? `/${this.config.database}` : '';
        return `${this.config.driver}://${this.config.user}@${this.config.host}:${this.config.port}${dbPart}`;
    }
}