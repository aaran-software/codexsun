import type { PoolClient as PgClient } from "pg";
import type { PoolConnection as MySQLClient } from "mysql2/promise";
import type { PoolConnection as MariaClient } from "mariadb";
import type { Database as SQLiteClient } from "sqlite";

export type AnyDbClient = PgClient | MySQLClient | MariaClient | SQLiteClient;

export interface DbConfig {
    driver: "postgres" | "mysql" | "mariadb" | "sqlite";
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database: string; // file path for sqlite, DB name for others
}

export interface DBAdapter {
    init(): Promise<void>;
    close(): Promise<void>;
    getClient(): Promise<AnyDbClient>;
    pooledQuery<T = any>(query: string, params?: any[]): Promise<T[]>;

    beginTransaction(client: AnyDbClient): Promise<void>;
    commitTransaction(client: AnyDbClient): Promise<void>;
    rollbackTransaction(client: AnyDbClient): Promise<void>;
    releaseClient(client: AnyDbClient): Promise<void>;
    queryWithClient<T = any>(
        client: AnyDbClient,
        query: string,
        params?: any[]
    ): Promise<T[]>;
}
