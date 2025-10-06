// cortex/db/adapters/postgres.ts

import pg from 'pg';
import { DbConfig, AnyDbClient, QueryResult, DBAdapter } from '../db-types';

export class PostgresAdapter implements DBAdapter {
    private static pool: pg.Pool | null = null;
    private static poolsInitialized = false;

    async initPool(config: Omit<DbConfig, 'database' | 'type'>): Promise<void> {
        if (PostgresAdapter.poolsInitialized) return;
        PostgresAdapter.pool = new pg.Pool({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            max: config.connectionLimit || 50,
            connectionTimeoutMillis: config.acquireTimeout || 30000,
            idleTimeoutMillis: config.idleTimeout || 60000,
            ssl: config.ssl ? { rejectUnauthorized: process.env.NODE_ENV === 'production' } : false,
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
        const client = await PostgresAdapter.pool.connect();
        try {
            if (database) {
                await client.query(`SET search_path TO "${database}"`);
            }
            await client.query('SELECT 1');
            return {
                query: async (text: string, params?: any[]) => {
                    const result = await client.query(text, params);
                    return {
                        rows: result.rows || [],
                        rowCount: result.rowCount || 0,
                        insertId: undefined, // Postgres doesn't have insertId like MySQL
                    };
                },
                release: () => client.release(),
            };
        } catch (err) {
            if (process.env.NODE_ENV !== 'production' || process.env.SUPPRESS_DB_LOGS !== 'true') {
                console.error('Postgres connection error:', err);
            }
            throw err;
        }
    }

    async connect(config: DbConfig): Promise<AnyDbClient> {
        await this.initPool(config);
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
            insertId: undefined,
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