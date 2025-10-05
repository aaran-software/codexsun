// cortex/db/adapters/mysql.ts

import mysql, { Pool as MySqlPool, PoolConnection } from 'mysql2/promise';
import { DbConfig, AnyDbClient, QueryResult, DBAdapter } from '../db-types';

export class MysqlAdapter implements DBAdapter {
    private static pool: MySqlPool | null = null;
    private static poolsInitialized = false;

    async initPool(config: Omit<DbConfig, 'database' | 'type'>): Promise<void> {
        if (MysqlAdapter.poolsInitialized) return;
        MysqlAdapter.pool = mysql.createPool({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
            connectionLimit: 10,
            connectTimeout: 10000,
            waitForConnections: true,
        });
        MysqlAdapter.poolsInitialized = true;
    }

    async closePool(): Promise<void> {
        if (MysqlAdapter.pool) {
            await MysqlAdapter.pool.end();
            MysqlAdapter.pool = null;
            MysqlAdapter.poolsInitialized = false;
        }
    }

    async getConnection(database: string): Promise<AnyDbClient> {
        if (!MysqlAdapter.pool) {
            throw new Error('Pool not initialized. Call initPool first.');
        }
        try {
            const connection: PoolConnection = await MysqlAdapter.pool.getConnection();
            if (database) {
                await connection.query(`USE \`${database}\``);
            }
            await connection.query('SELECT 1');
            return {
                query: async (text: string, params?: any[]) => {
                    try {
                        const [rows, fields] = await connection.query(text, params);
                        return {
                            rows: Array.isArray(rows) ? rows : [],
                            rowCount: (rows as any).affectedRows || (Array.isArray(rows) ? rows.length : 0),
                            insertId: (rows as any).insertId || undefined,
                        };
                    } catch (err) {
                        if (process.env.SUPPRESS_DB_LOGS !== 'true') {
                            console.error('MySQL query error:', err);
                        }
                        throw err;
                    }
                },
                release: () => connection.release(),
            };
        } catch (err) {
            if (process.env.SUPPRESS_DB_LOGS !== 'true') {
                console.error('MySQL connection error:', err);
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
        await client.query('START TRANSACTION');
    }

    async commitTransaction(client: AnyDbClient): Promise<void> {
        await client.query('COMMIT');
    }

    async rollbackTransaction(client: AnyDbClient): Promise<void> {
        await client.query('ROLLBACK');
    }
}