import mariadb from 'mariadb';
import { DbConfig, AnyDbClient, QueryResult, DBAdapter } from '../types';

export class MariaDBAdapter implements DBAdapter {
    private static pool: mariadb.Pool | null = null;
    private static poolsInitialized = false;

    static initPool(config: Omit<DbConfig, 'database' | 'type'>): void {
        if (this.poolsInitialized) return;
        this.pool = mariadb.createPool({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            connectionLimit: 10,
            acquireTimeout: 10000,
            idleTimeout: 30000,
        });
        this.poolsInitialized = true;
    }

    static async closePool(): Promise<void> {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            this.poolsInitialized = false;
        }
    }

    static async getConnection(database: string): Promise<AnyDbClient> {
        if (!this.pool) {
            throw new Error('Pool not initialized. Call initPool first.');
        }
        try {
            const connection = await this.pool.getConnection();
            await connection.query(`USE \`${database}\``);
            // Validate connection
            await connection.query('SELECT 1');
            return {
                query: async (text: string, params?: any[]) => {
                    try {
                        return await connection.query(text, params);
                    } catch (err) {
                        console.error('MariaDB query error:', err);
                        throw err;
                    }
                },
                end: () => connection.end(),
                release: () => connection.release(),
            };
        } catch (err) {
            console.error('MariaDB connection error:', err);
            throw err;
        }
    }

    async connect(config: DbConfig): Promise<AnyDbClient> {
        return MariaDBAdapter.getConnection(config.database);
    }

    async disconnect(client: AnyDbClient): Promise<void> {
        if (client.release) {
            client.release();
        } else if (client.end) {
            await client.end();
        }
    }

    async query(client: AnyDbClient, text: string, params?: any[]): Promise<QueryResult> {
        const result = await client.query(text, params);
        return {
            rows: Array.isArray(result) ? result : [],
            rowCount: (result as any).affectedRows || result.length || 0,
        };
    }

    async beginTransaction(client: AnyDbClient): Promise<void> {
        await client.query('START TRANSACTION');
    }

    async commitTransaction(client: AnyDbClient): Promise<void> {
        await client.query('COMMIT');
    }

    async rollbackTransaction(client: AnyDbClient): Promise<void> {
        await client.query('ROLLBACK');
    }
}