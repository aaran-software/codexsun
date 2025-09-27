import mariadb from "mariadb";
import { DBAdapter, DbConfig } from "./types";

export class MariaDBAdapter implements DBAdapter {
    private pool: mariadb.Pool;

    constructor(cfg: DbConfig) {
        this.pool = mariadb.createPool({
            host: cfg.host,
            port: cfg.port,
            user: cfg.user,
            password: cfg.password,
            database: cfg.database,
        });
    }

    async init() {
        await this.pool.getConnection();
    }

    async close() {
        await this.pool.end();
    }

    async getClient(): Promise<mariadb.PoolConnection> {
        return this.pool.getConnection();
    }

    async pooledQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
        const conn = await this.pool.getConnection();
        try {
            return await conn.query(query, params);
        } finally {
            conn.release();
        }
    }

    async beginTransaction(client: mariadb.PoolConnection) {
        await client.beginTransaction();
    }

    async commitTransaction(client: mariadb.PoolConnection) {
        await client.commit();
    }

    async rollbackTransaction(client: mariadb.PoolConnection) {
        await client.rollback();
    }

    async releaseClient(client: mariadb.PoolConnection) {
        client.release();
    }

    async queryWithClient<T = any>(
        client: mariadb.PoolConnection,
        query: string,
        params: any[] = []
    ): Promise<T[]> {
        return client.query(query, params);
    }
}
