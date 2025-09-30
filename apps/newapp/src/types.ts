export interface DbConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    type: 'mariadb';
}

export interface AnyDbClient {
    query: (text: string, params?: any[]) => Promise<QueryResult | any>;
    end?: () => Promise<void>;
    release?: () => void;
}

export interface QueryResult {
    rows: any[];
    rowCount: number;
}

export interface DBAdapter {
    connect: (config: DbConfig) => Promise<AnyDbClient>;
    disconnect: (client: AnyDbClient) => Promise<void>;
    query: (client: AnyDbClient, text: string, params?: any[]) => Promise<QueryResult>;
    beginTransaction: (client: AnyDbClient) => Promise<void>;
    commitTransaction: (client: AnyDbClient) => Promise<void>;
    rollbackTransaction: (client: AnyDbClient) => Promise<void>;
}