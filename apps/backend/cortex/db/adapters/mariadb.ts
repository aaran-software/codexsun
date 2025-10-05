// cortex/db/adapters/mariadb.ts

import mariadb from 'mariadb';
import { DbConfig, AnyDbClient, QueryResult, DBAdapter } from '../db-types';

export class MariaDBAdapter implements DBAdapter {
    private static pool: mariadb.Pool | null = null;
    private static poolsInitialized = false;

    async initPool(config: Omit<DbConfig, 'database' | 'type'>): Promise<void> {
        if (MariaDBAdapter.poolsInitialized) return;
        MariaDBAdapter.pool = mariadb.createPool({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            connectionLimit: 10,
            acquireTimeout: 10000,
            idleTimeout: 30000,
        });
        MariaDBAdapter.poolsInitialized = true;
    }

    async closePool(): Promise<void> {
        if (MariaDBAdapter.pool) {
            await MariaDBAdapter.pool.end();
            MariaDBAdapter.pool = null;
            MariaDBAdapter.poolsInitialized = false;
        }
    }

    async getConnection(database: string): Promise<AnyDbClient> {
        if (!MariaDBAdapter.pool) {
            throw new Error('Pool not initialized. Call initPool first.');
        }
        try {
            const connection = await MariaDBAdapter.pool.getConnection();
            if (database) {
                await connection.query(`USE \`${database}\``);
            }
            await connection.query('SELECT 1');
            return {
                query: async (text: string, params?: any[]) => {
                    try {
                        const result = await connection.query(text, params);
                        return {
                            rows: Array.isArray(result) ? result : [],
                            rowCount: (result as any).affectedRows || (Array.isArray(result) ? result.length : 0),
                            insertId: (result as any).insertId || undefined,
                        };
                    } catch (err) {
                        if (process.env.SUPPRESS_DB_LOGS !== 'true') {
                            console.error('MariaDB query error:', err);
                        }
                        throw err;
                    }
                },
                end: () => connection.end(),
                release: () => connection.release(),
            };
        } catch (err) {
            if (process.env.SUPPRESS_DB_LOGS !== 'true') {
                console.error('MariaDB connection error:', err);
            }
            throw err;
        }
    }

    async connect(config: DbConfig): Promise<AnyDbClient> {
        await this.initPool({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            ssl: config.ssl
        });
        return this.getConnection(config.database);
    }

    async disconnect(client: AnyDbClient): Promise<void> {
        if (client.release) {
            client.release();
        } else if (client.end) {
            await client.end();
        }
    }

    async query<T>(client: AnyDbClient, text: string, params?: any[]): Promise<QueryResult<T>> {
        const result = await client.query(text, params);
        return {
            rows: result.rows || [],
            rowCount: result.rowCount || 0,
            insertId: result.insertId || undefined,
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