// cortex/db/adapters/sqlite.ts

import sqlite3 from "sqlite3";
import { open, Database as SqliteDatabase } from "sqlite";
import { DBAdapter, DbConfig } from "./types";
import fs from "fs";
import path from "path";

export class SQLiteAdapter implements DBAdapter {
    /* ---------------- OLD VERSION ---------------- */
    // private db!: Database;

    /* ---------------- NEW VERSION ---------------- */
    private db: SqliteDatabase | null = null;

    constructor(private cfg: DbConfig) {}

    async init() {
        const filename =
            this.cfg.database && this.cfg.database.trim() !== ""
                ? this.cfg.database
                : "./data/dev.sqlite";

        const dir = path.dirname(filename);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const fresh = !fs.existsSync(filename); // check if new db file

        /* ---------------- OLD VERSION ---------------- */
        // this.db = await open({
        //     filename,
        //     driver: sqlite3.Database,
        // });

        /* ---------------- NEW VERSION ---------------- */
        this.db = await open({
            filename,
            driver: sqlite3.Database,
        });

        // ✅ Auto-bootstrap schema if fresh db
        if (fresh) {
            await this.bootstrap();
        }
    }

    async close() {
        if (this.db) {
            await this.db.close();
            this.db = null;
        }
    }

    async getClient(): Promise<SqliteDatabase> {
        if (!this.db) {
            throw new Error("SQLite database not initialized. Did you call init()?");
        }
        return this.db;
    }

    async pooledQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
        if (!this.db) throw new Error("SQLite not initialized");
        if (/^\s*select/i.test(query)) {
            return this.db.all<T[]>(query, params);
        } else {
            const result = await this.db.run(query, params);
            // RETURNING * is supported in SQLite 3.35+, otherwise ignore
            return (result as any)?.rows || [];
        }
    }

    async beginTransaction(client: SqliteDatabase) {
        await client.exec("BEGIN");
    }

    async commitTransaction(client: SqliteDatabase) {
        await client.exec("COMMIT");
    }

    async rollbackTransaction(client: SqliteDatabase) {
        await client.exec("ROLLBACK");
    }

    async releaseClient(client: SqliteDatabase) {
        // no-op for sqlite
    }

    async queryWithClient<T = any>(
        client: SqliteDatabase,
        query: string,
        params: any[] = []
    ): Promise<T[]> {
        if (/^\s*select/i.test(query)) {
            return client.all<T[]>(query, params);
        } else {
            const result = await client.run(query, params);
            return (result as any)?.rows || [];
        }
    }

    /* ---------------- NEW METHOD ---------------- */
    private async bootstrap() {
        if (!this.db) return;
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                app TEXT NOT NULL,
                id  TEXT NOT NULL,
                applied_at TEXT NOT NULL DEFAULT (datetime('now')),
                PRIMARY KEY (app, id)
            )
        `);
    }
}
