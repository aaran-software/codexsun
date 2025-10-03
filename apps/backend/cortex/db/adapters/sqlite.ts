// cortex/adapters/sqlite.ts
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { DbConfig, AnyDbClient, QueryResult, DBAdapter } from '../db-types';
import { settings } from '../../config/get-settings';

export class SqliteAdapter implements DBAdapter {
    private static connections: Map<string, Database> = new Map();
    private static poolsInitialized = false;

    async initPool(config: Omit<DbConfig, 'database' | 'type'>): Promise<void> {
        if (SqliteAdapter.poolsInitialized) return;
        SqliteAdapter.poolsInitialized = true;
        const dbPath = `${settings.APP_NAME}_${settings.DB_NAME}.sqlite`;
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        SqliteAdapter.connections.set(settings.DB_NAME, db);
    }

    async closePool(): Promise<void> {
        for (const db of SqliteAdapter.connections.values()) {
            await db.close();
        }
        SqliteAdapter.connections.clear();
        SqliteAdapter.poolsInitialized = false;
    }

    async getConnection(database: string): Promise<AnyDbClient> {
        if (!SqliteAdapter.poolsInitialized) {
            throw new Error('Connections not initialized. Call initPool first.');
        }
        const dbName = database || settings.DB_NAME;
        let db = SqliteAdapter.connections.get(dbName);
        if (!db) {
            const dbPath = `${settings.APP_NAME}_${dbName}.sqlite`;
            db = await open({
                filename: dbPath,
                driver: sqlite3.Database,
            });
            SqliteAdapter.connections.set(dbName, db);
        }
        try {
            await db.get('SELECT 1');
            return {
                query: async (text: string, params?: any[]) => {
                    try {
                        const result = await db.all(text, params || []);
                        return {
                            rows: result,
                            rowCount: result.length,
                            insertId: (await db.get('SELECT last_insert_rowid() as id'))?.id || undefined,
                        };
                    } catch (err) {
                        if (process.env.SUPPRESS_DB_LOGS !== 'true') {
                            console.error('SQLite query error:', err);
                        }
                        throw err;
                    }
                },
                release: () => {
                    // SQLite connections are managed in the connections map; no release needed
                },
            };
        } catch (err) {
            if (process.env.SUPPRESS_DB_LOGS !== 'true') {
                console.error('SQLite connection error:', err);
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
        // SQLite connections are managed in the connections map; no action needed
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
        await client.query('BEGIN TRANSACTION');
    }

    async commitTransaction(client: AnyDbClient): Promise<void> {
        await client.query('COMMIT');
    }

    async rollbackTransaction(client: AnyDbClient): Promise<void> {
        await client.query('ROLLBACK');
    }
}