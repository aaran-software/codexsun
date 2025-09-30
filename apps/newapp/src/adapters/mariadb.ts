import mariadb from 'mariadb';
import { DbConfig, AnyDbClient, QueryResult, DBAdapter } from '../types';

export class MariaDBAdapter implements DBAdapter {
    private pool: mariadb.Pool | null = null;

    async connect(config: DbConfig): Promise<AnyDbClient> {
        this.pool = mariadb.createPool({
            host: config.host,
            port: config.port,
            database: config.database,
            user: config.user,
            password: config.password,
            connectionLimit: 10, // Adjust for production
            acquireTimeout: 10000,
        });

        const connection = await this.pool.getConnection();
        return {
            query: (text: string, params?: any[]) => connection.query(text, params),
            end: () => connection.end(),
            release: () => connection.release(),
        };
    }

    async disconnect(client: AnyDbClient): Promise<void> {
        if (client.release) {
            client.release();
        } else if (client.end) {
            await client.end();
        }
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
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