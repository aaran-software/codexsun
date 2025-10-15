import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { AnyDbClient, QueryResult, DBAdapter } from '../db-types';
import {AppEnv} from "../../config/get-settings";
import {DbConfig} from "../../config/db-config";

export class SqliteAdapter implements DBAdapter {
    async initPool(config: Omit<DbConfig, 'database' | 'driver'>): Promise<void> {
        // No pool for SQLite
    }

    async closePool(): Promise<void> {
        // No pool for SQLite
    }

    async getConnection(database: string): Promise<AnyDbClient> {
        if (!database) {
            throw new Error('Database filename is required for SQLite');
        }
        const db = await open({
            filename: database,
            driver: sqlite3.Database,
        });
        try {
            await db.exec('SELECT 1');
            return {
                query: async (text: string, params: any[] = []) => {
                    const stmt = await db.prepare(text);
                    try {
                        if (text.trim().toUpperCase().startsWith('SELECT') || text.trim().toUpperCase().startsWith('WITH')) {
                            const rows = await stmt.all(...params);
                            return { rows, rowCount: rows.length, insertId: undefined };
                        } else {
                            const result = await stmt.run(...params);
                            return { rows: [], rowCount: result.changes, insertId: result.lastID };
                        }
                    } finally {
                        await stmt.finalize();
                    }
                },
                end: async () => await db.close(),
            };
        } catch (err) {
            if (process.env.APP_ENV !== AppEnv.Production || process.env.SUPPRESS_DB_LOGS !== 'true') {
                console.error('SQLite connection error:', err);
            }
            throw err;
        }
    }

    async connect(config: DbConfig): Promise<AnyDbClient> {
        return this.getConnection(config.database);
    }

    async disconnect(client: AnyDbClient): Promise<void> {
        if (client.end) {
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
        await client.query('BEGIN TRANSACTION');
    }

    async commitTransaction(client: AnyDbClient): Promise<void> {
        await client.query('COMMIT');
    }

    async rollbackTransaction(client: AnyDbClient): Promise<void> {
        await client.query('ROLLBACK');
    }
}