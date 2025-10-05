// cortex/db/types.ts

export interface DbConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    type: 'mariadb' | 'postgres' | 'mysql' | 'sqlite';
    ssl?: boolean;
}

export interface AnyDbClient {
    query<T = any>(text: string, params?: any[]): Promise<QueryResult<T> | any>;
    end?: () => Promise<void>;
    release?: () => void;
}

export interface QueryResult<T> {
    rows: T[];
    rowCount: number;
    insertId?: number;
}

export interface DBAdapter {
    initPool?: (config: Omit<DbConfig, 'database' | 'type'>) => Promise<void>;
    closePool?: () => Promise<void>;
    getConnection: (database: string) => Promise<AnyDbClient>;
    connect: (config: DbConfig) => Promise<AnyDbClient>;
    disconnect: (client: AnyDbClient) => Promise<void>;
    query: (client: AnyDbClient, text: string, params?: any[]) => Promise<QueryResult<any>>;
    beginTransaction: (client: AnyDbClient) => Promise<void>;
    commitTransaction: (client: AnyDbClient) => Promise<void>;
    rollbackTransaction: (client: AnyDbClient) => Promise<void>;
}

export interface User {
    id?: number;
    username: string;
    email: string;
    password?: string; // Input for create/update
    password_hash?: string; // Stored in database
    tenantId: string;
    created_at?: string;
}