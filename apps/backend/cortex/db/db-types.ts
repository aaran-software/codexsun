// cortex/db/types.ts

import {DbConfig} from "../config/db-config";

export interface AnyDbClient {
    query<T = any>(text: string, params?: any[], tenantId?: string): Promise<QueryResult<T> | any>;

    end?: () => Promise<void>;
    release?: () => void;
}

export interface QueryResult<T> {
    rows: T[];
    rowCount: number;
    insertId?: number;
}

export interface DBAdapter {
    initPool?: (config: Omit<DbConfig, 'database' | 'driver'>) => Promise<void>;
    closePool?: () => Promise<void>;
    getConnection: (database: string) => Promise<AnyDbClient>;
    connect: (config: DbConfig) => Promise<AnyDbClient>;
    disconnect: (client: AnyDbClient) => Promise<void>;
    query: (client: AnyDbClient, text: string, params?: any[]) => Promise<QueryResult<any>>;
    beginTransaction: (client: AnyDbClient) => Promise<void>;
    commitTransaction: (client: AnyDbClient) => Promise<void>;
    rollbackTransaction: (client: AnyDbClient) => Promise<void>;
}