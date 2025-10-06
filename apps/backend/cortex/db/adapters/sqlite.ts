// cortex/db/adapters/sqlite.ts

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { DbConfig, AnyDbClient, QueryResult, DBAdapter } from '../db-types';

export class SqliteAdapter implements DBAdapter {
    // No static db; open per connection for multi-file support

    async initPool(config: Omit<DbConfig, 'database' | 'type'>): Promise<void> {
        // No-op for SQLite; no pool needed
    }

    async closePool(): Promise<void> {
        // No-op; connections closed per client
    }

    async getConnection(database: string): Promise<AnyDbClient> {
        if (!database) {
            throw new Error('Database filename is required for SQLite');
        }
        const db = await open({
            filename: database || ':memory:',
            driver: sqlite3.Database,
        });
        await db.exec('SELECT 1'); // Health ping equivalent
        return {
            query: async (text: string, params?: any[]) => {
                const stmt = await db.prepare(text);
                let rows: any[] = [];
                let rowCount = 0;
                let insertId: number | undefined;
                if (text.trim().toUpperCase().startsWith('SELECT')) {
                    rows = await stmt.all(...(params ?? []));
                    rowCount = rows.length;
                } else {
                    await stmt.run(...(params ?? []));
                    rowCount = (stmt as any).changes || 0;
                    insertId = (stmt as any).lastID;
                }
                await stmt.finalize();
                return {
                    rows,
                    rowCount,
                    insertId,
                };
            },
            end: async () => await db.close(),
        };
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