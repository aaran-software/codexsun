// cortex/db/db.ts

import { getClient, pooledQuery, getAdapter } from "./connection";
import { mapDbError } from "./errors";
import type { DBAdapter } from "./adapters/types";
import { getDbConfig } from "../config/db-config";

export interface DbQueryResult<T = any> {
    rows: T[];             // SELECT results
    insertId?: number;     // for INSERT
    affectedRows?: number; // for UPDATE/DELETE
}

/* ---------------- NEW VERSION (portable across drivers) ---------------- */
function normalizeQuery(
    text: string,
    params: any[] = []
): { sql: string; params: any[]; postSelect?: string } {
    const { driver } = getDbConfig();
    let sql = text.trim();
    let postSelect: string | undefined;

    // Placeholder rewriting ($1 → ? for non-Postgres)
    if (driver !== "postgres") {
        sql = sql.replace(/\$\d+/g, "?");
    }

    // Handle NOW() differences
    if (driver === "mysql" || driver === "mariadb") {
        sql = sql.replace(/\bNOW\(\)/gi, "CURRENT_TIMESTAMP");
    }
    if (driver === "sqlite") {
        sql = sql.replace(/\bNOW\(\)/gi, "datetime('now')");
    }

    // Handle RETURNING * differences
    if (/returning\s+\*/i.test(sql)) {
        if (driver === "postgres") {
            // native support
        } else if (driver === "mysql" || driver === "mariadb") {
            const match = sql.match(/insert\s+into\s+([a-z0-9_]+)/i);
            const table = match ? match[1] : undefined;
            sql = sql.replace(/returning\s+\*/i, "");
            if (table) {
                postSelect = `SELECT * FROM ${table} WHERE id = LAST_INSERT_ID()`;
            }
        } else if (driver === "sqlite") {
            const match = sql.match(/insert\s+into\s+([a-z0-9_]+)/i);
            const table = match ? match[1] : undefined;
            sql = sql.replace(/returning\s+\*/i, "");
            if (table) {
                postSelect = `SELECT * FROM ${table} WHERE rowid = last_insert_rowid()`;
            }
        }
    }

    return { sql, params, postSelect };
}

export async function query<T = any>(
    text: string,
    params?: any[]
): Promise<DbQueryResult<T>> {
    try {
        const { sql, params: normalized, postSelect } = normalizeQuery(text, params ?? []);

        const result: any = await pooledQuery<T>(sql, normalized);

        // mysql2 returns [rows, fields] for SELECT, but OkPacket for INSERT/UPDATE
        let rows: any[] = Array.isArray(result) ? result : result.rows ?? [];
        let insertId: number | undefined = undefined;
        let affectedRows: number | undefined = undefined;

        if (result.insertId !== undefined) {
            insertId = result.insertId;
        }
        if (result.affectedRows !== undefined) {
            affectedRows = result.affectedRows;
        }

        // Run SELECT if we emulated RETURNING *
        if (postSelect) {
            rows = await pooledQuery<T>(postSelect);
        }

        return { rows, insertId, affectedRows };
    } catch (err) {
        throw mapDbError(err);
    }
}


export async function withTransaction<T>(
    fn: (q: <R = any>(text: string, params?: any[]) => Promise<DbQueryResult<R>>) => Promise<T>
): Promise<T> {
    const adapter: DBAdapter = getAdapter();
    const client = await getClient();

    try {
        await adapter.beginTransaction(client);

        const q = async <R = any>(
            text: string,
            params?: any[]
        ): Promise<DbQueryResult<R>> => {
            try {
                const { sql, params: normalized, postSelect } = normalizeQuery(text, params ?? []);
                let rows = await adapter.queryWithClient<R>(client, sql, normalized);

                if (postSelect) {
                    rows = await adapter.queryWithClient<R>(client, postSelect);
                }

                return { rows };
            } catch (err) {
                throw mapDbError(err);
            }
        };

        const result = await fn(q);
        await adapter.commitTransaction(client);
        return result;
    } catch (err) {
        try {
            await adapter.rollbackTransaction(client);
        } catch {
            /* ignore rollback errors */
        }
        throw err;
    } finally {
        await adapter.releaseClient(client);
    }
}

export async function healthCheck(): Promise<void> {
    const { driver } = getDbConfig();
    let sql = "SELECT 1";

    if (driver === "sqlite") {
        sql = "SELECT 1";
    }
    await query(sql);
}
