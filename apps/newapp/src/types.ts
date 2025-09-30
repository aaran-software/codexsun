// src/types.ts
export interface DbConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    type: 'mariadb';
}

export interface AnyDbClient {
    query<T = any>(text: string, params?: any[]): Promise<QueryResult<T> | any>;
    end?: () => Promise<void>;
    release?: () => void;
}

export interface QueryResult<T> {
    rows: T[];
    rowCount: number;
}

export interface DBAdapter {
    connect: (config: DbConfig) => Promise<AnyDbClient>;
    disconnect: (client: AnyDbClient) => Promise<void>;
    query: (client: AnyDbClient, text: string, params?: any[]) => Promise<QueryResult<any>>;
    beginTransaction: (client: AnyDbClient) => Promise<void>;
    commitTransaction: (client: AnyDbClient) => Promise<void>;
    rollbackTransaction: (client: AnyDbClient) => Promise<void>;
}