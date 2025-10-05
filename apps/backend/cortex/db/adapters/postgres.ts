// cortex/db/adapters/postgres.ts

import { Pool, PoolClient } from 'pg';
import { DbConfig, AnyDbClient, QueryResult, DBAdapter } from '../db-types';

export class PostgresAdapter implements DBAdapter {
    private static pool: Pool | null = null;
    private static poolsInitialized = false;

    async initPool(config: Omit<DbConfig, 'database' | 'type'>): Promise<void> {
        if (PostgresAdapter.poolsInitialized) return;
        PostgresAdapter.pool = new Pool({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            ssl: config.ssl ? { rejectUnauthorized: false } : false,
            max: 10,
            connectionTimeoutMillis: 10000,
            idleTimeoutMillis: 30000,
        });
        PostgresAdapter.poolsInitialized = true;
    }

    async closePool(): Promise<void> {
        if (PostgresAdapter.pool) {
            await PostgresAdapter.pool.end();
            PostgresAdapter.pool = null;
            PostgresAdapter.poolsInitialized = false;
        }
    }

    async getConnection(database: string): Promise<AnyDbClient> {
        if (!PostgresAdapter.pool) {
            throw new Error('Pool not initialized. Call initPool first.');
        }
        try {
            const connection: PoolClient = await PostgresAdapter.pool.connect();
            if (database) {
                await connection.query(`SET search_path TO ${database}`);
            }
            await connection.query('SELECT 1');
            return {
                query: async (text: string, params?: any[]) => {
                    try {
                        const result = await connection.query(text, params);
                        return {
                            rows: result.rows,
                            rowCount: result.rowCount || 0,
                            insertId: result.rows[0]?.id || undefined,
                        };
                    } catch (err) {
                        if (process.env.SUPPRESS_DB_LOGS !== 'true') {
                            console.error('PostgreSQL query error:', err);
                        }
                        throw err;
                    }
                },
                release: () => connection.release(),
            };
        } catch (err) {
            if (process.env.SUPPRESS_DB_LOGS !== 'true') {
                console.error('PostgreSQL connection error:', err);
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
            ssl: config.ssl,
        });
        return this.getConnection(config.database);
    }

    async disconnect(client: AnyDbClient): Promise<void> {
        if (client.release) {
            client.release();
        }
    }

    async query<T>(client: AnyDbClient, text: string, params?: any[]): Promise<QueryResult<T>> {
        const result = await client.query(text, params);
        return {
            rows: result.rows || [],
            rowCount: result.rowCount || 0,
            insertId: result.insertId,
        };
    }

    async beginTransaction(client: AnyDbClient): Promise<void> {
        await client.query('BEGIN');
    }

    async commitTransaction(client: AnyDbClient): Promise<void> {
        await client.query('COMMIT');
    }

    async rollbackTransaction(client: AnyDbClient): Promise<void> {
        await client.query('ROLLBACK');
    }
}