import { SchemaBuilder } from './schema-builder';
import { QueryResult, AnyDbClient } from '../db-types';

// Utility to validate database and table names (basic SQL injection prevention)
const isValidName = (name: string): boolean => /^[a-zA-Z0-9_]+$/.test(name);

export abstract class BaseMigration {
    protected dbName: string;
    protected client?: AnyDbClient;

    constructor(dbName: string, client?: AnyDbClient) {
        if (!dbName || !isValidName(dbName)) {
            throw new Error('Invalid or missing database name');
        }
        this.dbName = dbName;
        this.client = client;
    }

    protected schema = {
        create: async (tableName: string, callback: (table: SchemaBuilder) => void): Promise<QueryResult<any>> => {
            if (!tableName || !isValidName(tableName)) {
                throw new Error('Invalid table name');
            }
            const table = new SchemaBuilder(tableName, this.dbName, this.client);
            callback(table);
            return table.execute();
        },
        dropTable: async (tableName: string): Promise<QueryResult<any>> => {
            if (!tableName || !isValidName(tableName)) {
                throw new Error('Invalid table name');
            }
            const table = new SchemaBuilder(tableName, this.dbName, this.client);
            return table.drop();
        }
    };

    abstract up(): Promise<void>;
    abstract down(): Promise<void>;
}