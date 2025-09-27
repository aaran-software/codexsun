import mysql from "mysql2/promise";
import { DBAdapter, DbConfig } from "./types";

export class MySQLAdapter implements DBAdapter {
    private pool: mysql.Pool;

    constructor(cfg: DbConfig) {
        const connStr = `mysql://${cfg.user}:${cfg.password}@${cfg.host}:${cfg.port}/${cfg.database}`;
        this.pool = mysql.createPool(connStr);
    }

    async init() {
        await this.pool.getConnection();
    }

    async close() {
        await this.pool.end();
    }

    async getClient(): Promise<mysql.PoolConnection> {
        return this.pool.getConnection();
    }

    async pooledQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
        const [rows] = await this.pool.query(query, params);
        return rows as T[];
    }

    async beginTransaction(client: mysql.PoolConnection) {
        await client.beginTransaction();
    }

    async commitTransaction(client: mysql.PoolConnection) {
        await client.commit();
    }

    async rollbackTransaction(client: mysql.PoolConnection) {
        await client.rollback();
    }

    async releaseClient(client: mysql.PoolConnection) {
        client.release();
    }

    async queryWithClient<T = any>(
        client: mysql.PoolConnection,
        query: string,
        params: any[] = []
    ): Promise<T[]> {
        const [rows] = await client.query(query, params);
        return rows as T[];
    }
}
