// cortex/db/adapters/mysql.ts

import mysql from 'mysql2/promise';
import { DbConfig, AnyDbClient, QueryResult, DBAdapter } from '../db-types';

export class MysqlAdapter implements DBAdapter {
    private static pool: mysql.Pool | null = null;
    private static poolsInitialized = false;

    async initPool(config: Omit<DbConfig, 'database' | 'type'>): Promise<void> {
        if (MysqlAdapter.poolsInitialized) return;
        MysqlAdapter.pool = mysql.createPool({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            connectionLimit: config.connectionLimit || 50,
            maxIdle: config.connectionLimit || 50,
            idleTimeout: config.idleTimeout || 60000,
            queueLimit: 0,
            waitForConnections: true,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
            ssl: config.ssl ? { rejectUnauthorized: process.env.NODE_ENV === 'production' } : undefined,
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
        const connection = await MysqlAdapter.pool.getConnection();
        try {
            if (database) {
                await connection.query(`USE \`${database}\``);
            }
            await connection.query('SELECT 1');
            return {
                query: async (text: string, params?: any[]) => {
                    const [rows] = await connection.query(text, params);
                    return {
                        rows: Array.isArray(rows) ? rows : [],
                        rowCount: (rows as any).affectedRows || (Array.isArray(rows) ? rows.length : 0),
                        insertId: (rows as any).insertId || undefined,
                    };
                },
                end: () => connection.end(),
                release: () => connection.release(),
            };
        } catch (err) {
            if (process.env.NODE_ENV !== 'production' || process.env.SUPPRESS_DB_LOGS !== 'true') {
                console.error('MySQL connection error:', err);
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