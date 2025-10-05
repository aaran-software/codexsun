// E:\Workspace\codexsun\apps\backend\cortex\database\migrations\schema-builder.ts
import { QueryResult } from '../db-types';
import { query } from '../mdb';

export class SchemaBuilder {
    private columns: string[] = [];
    public readonly tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    id(): this {
        this.columns.push('id SERIAL PRIMARY KEY');
        return this;
    }

    string(column: string): this {
        this.columns.push(`${column} VARCHAR(255) NOT NULL`);
        return this;
    }

    unique(): this {
        const lastColumn = this.columns[this.columns.length - 1];
        if (lastColumn.includes('NOT NULL')) {
            this.columns[this.columns.length - 1] = lastColumn.replace('NOT NULL', 'NOT NULL UNIQUE');
        }
        return this;
    }

    timestamps(): this {
        this.columns.push(
            'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
        );
        return this;
    }

    async execute(): Promise<QueryResult<any>> {
        const columnDefinitions = this.columns.join(', ');
        const sql = `CREATE TABLE IF NOT EXISTS ${this.tableName} (${columnDefinitions});`;
        return await query(sql);
    }

    async drop(): Promise<QueryResult<any>> {
        const sql = `DROP TABLE IF EXISTS ${this.tableName};`;
        return await query(sql);
    }

    getSql(): string {
        const columnDefinitions = this.columns.join(', ');
        return `CREATE TABLE IF NOT EXISTS ${this.tableName} (${columnDefinitions});`;
    }

    getDropSql(): string {
        return `DROP TABLE IF EXISTS ${this.tableName};`;
    }

    nullable(): this {
        const lastColumn = this.columns[this.columns.length - 1];
        if (lastColumn.includes('NOT NULL')) {
            this.columns[this.columns.length - 1] = lastColumn.replace('NOT NULL', '');
        }
        return this;
    }
}