import { Pool, PoolClient } from "pg";
import { DBAdapter, DbConfig } from "./types";

export class PostgresAdapter implements DBAdapter {
    private pool: Pool;

    constructor(cfg: DbConfig) {
        const connStr = `postgres://${cfg.user}:${cfg.password}@${cfg.host}:${cfg.port}/${cfg.database}`;
        this.pool = new Pool({ connectionString: connStr });
    }

    async init() {
        await this.pool.connect();
    }

    async close() {
        await this.pool.end();
    }

    async getClient(): Promise<PoolClient> {
        return this.pool.connect();
    }

    async pooledQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
        const res = await this.pool.query(query, params);
        return res.rows;
    }

    async beginTransaction(client: PoolClient) {
        await client.query("BEGIN");
    }

    async commitTransaction(client: PoolClient) {
        await client.query("COMMIT");
    }

    async rollbackTransaction(client: PoolClient) {
        await client.query("ROLLBACK");
    }

    async releaseClient(client: PoolClient) {
        client.release();
    }

    async queryWithClient<T = any>(
        client: PoolClient,
        query: string,
        params: any[] = []
    ): Promise<T[]> {
        const res = await client.query(query, params);
        return res.rows;
    }
}
