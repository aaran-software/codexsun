import mariadb from 'mariadb';
import { AnyDbClient, QueryResult, DBAdapter } from '../db-types';
import {DbConfig} from "../../config/db-config";
import {AppEnv} from "../../config/get-settings";

export class MariaDBAdapter implements DBAdapter {
    private static pool: mariadb.Pool | null = null;
    private static poolsInitialized = false;

    async initPool(config: Omit<DbConfig, 'database' | 'driver'>): Promise<void> {
        if (MariaDBAdapter.poolsInitialized) return;
        MariaDBAdapter.pool = mariadb.createPool({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            connectionLimit: config.connectionLimit || 50,
            acquireTimeout: config.acquireTimeout || 30000,
            idleTimeout: config.idleTimeout || 60000,
            ssl: config.ssl ? { rejectUnauthorized: process.env.APP_ENV === AppEnv.Production } : false,
        });
        MariaDBAdapter.poolsInitialized = true;
    }

    async closePool(): Promise<void> {
        if (MariaDBAdapter.pool) {
            await MariaDBAdapter.pool.end(); // Terminate all connections
            MariaDBAdapter.pool = null;
            MariaDBAdapter.poolsInitialized = false;
            console.log('MariaDB pool fully closed');
        }
    }

    async getConnection(database: string): Promise<AnyDbClient> {
        if (!MariaDBAdapter.pool) {
            throw new Error('Pool not initialized. Call initPool first.');
        }
        const connection = await MariaDBAdapter.pool.getConnection();
        try {
            if (database) {
                await connection.query(`USE \`${database}\``);
            }
            await connection.query('SELECT 1'); // Health ping
            return {
                query: async (text: string, params?: any[]) => {
                    const result = await connection.query(text, params);
                    return {
                        rows: Array.isArray(result) ? result : [],
                        rowCount: (result as any).affectedRows || (Array.isArray(result) ? result.length : 0),
                        insertId: (result as any).insertId || undefined,
                    };
                },
                end: () => connection.end(),
                release: () => connection.release(),
            };
        } catch (err) {
            if (connection.release) connection.release();
            if (process.env.NODE_ENV !== 'production' || process.env.SUPPRESS_DB_LOGS !== 'true') {
                console.error('MariaDB connection error:', err);
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