import { QueryResult } from '../db-types';
import { query } from '../mdb';

// Enhanced validation to prevent SQL injection and reserved keywords
const isValidName = (name: string): boolean => /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name) && !['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'FROM', 'WHERE'].includes(name.toUpperCase());

export class SchemaBuilder {
    private columns: string[] = [];
    private indexes: string[] = [];
    private tableOptions: string[] = [];
    public readonly tableName: string;
    private readonly dbName: string;

    constructor(tableName: string, dbName: string) {
        if (!tableName || !isValidName(tableName)) {
            throw new Error('Invalid or reserved table name');
        }
        if (!dbName || !isValidName(dbName)) {
            throw new Error('Invalid or reserved database name');
        }
        this.tableName = tableName;
        this.dbName = dbName;
    }

    id(): this {
        this.columns.push('id INT AUTO_INCREMENT PRIMARY KEY');
        return this;
    }

    string(column: string, length: number = 255): this {
        if (!column || !isValidName(column)) {
            throw new Error('Invalid or reserved column name');
        }
        this.columns.push(`${column} VARCHAR(${length}) NOT NULL`);
        return this;
    }

    integer(column: string): this {
        if (!column || !isValidName(column)) {
            throw new Error('Invalid or reserved column name');
        }
        this.columns.push(`${column} INT NOT NULL`);
        return this;
    }

    tinyint(column: string): this {
        if (!column || !isValidName(column)) {
            throw new Error('Invalid or reserved column name');
        }
        this.columns.push(`${column} TINYINT NOT NULL`);
        return this;
    }

    boolean(column: string): this {
        if (!column || !isValidName(column)) {
            throw new Error('Invalid or reserved column name');
        }
        this.columns.push(`${column} TINYINT NOT NULL DEFAULT 0`);
        return this;
    }

    date(column: string): this {
        if (!column || !isValidName(column)) {
            throw new Error('Invalid or reserved column name');
        }
        this.columns.push(`${column} DATE NOT NULL`);
        return this;
    }

    datetime(column: string): this {
        if (!column || !isValidName(column)) {
            throw new Error('Invalid or reserved column name');
        }
        this.columns.push(`${column} DATETIME NOT NULL`);
        return this;
    }

    active(column: string): this {
        if (!column || !isValidName(column)) {
            throw new Error('Invalid or reserved column name');
        }
        this.columns.push(`${column} TINYINT NOT NULL DEFAULT 1`);
        return this;
    }

    json(column: string): this {
        if (!column || !isValidName(column)) {
            throw new Error('Invalid or reserved column name');
        }
        this.columns.push(`${column} JSON NOT NULL`);
        return this;
    }

    text(column: string): this {
        if (!column || !isValidName(column)) {
            throw new Error('Invalid or reserved column name');
        }
        this.columns.push(`${column} TEXT NOT NULL`);
        return this;
    }

    longtext(column: string): this {
        if (!column || !isValidName(column)) {
            throw new Error('Invalid or reserved column name');
        }
        this.columns.push(`${column} LONGTEXT NOT NULL`);
        return this;
    }

    blob(column: string): this {
        if (!column || !isValidName(column)) {
            throw new Error('Invalid or reserved column name');
        }
        this.columns.push(`${column} BLOB NOT NULL`);
        return this;
    }

    decimal(column: string, precision: number = 10, scale: number = 2): this {
        if (!column || !isValidName(column)) {
            throw new Error('Invalid or reserved column name');
        }
        this.columns.push(`${column} DECIMAL(${precision},${scale}) NOT NULL`);
        return this;
    }

    unique(): this {
        const lastColumn = this.columns[this.columns.length - 1];
        if (!lastColumn) {
            throw new Error('No column defined to apply UNIQUE constraint');
        }
        if (lastColumn.includes('NOT NULL')) {
            this.columns[this.columns.length - 1] = lastColumn.replace('NOT NULL', 'NOT NULL UNIQUE');
        } else if (!lastColumn.includes('UNIQUE') && !lastColumn.includes('PRIMARY KEY')) {
            this.columns[this.columns.length - 1] = `${lastColumn} UNIQUE`;
        }
        return this;
    }

    nullable(): this {
        const lastColumn = this.columns[this.columns.length - 1];
        if (!lastColumn) {
            throw new Error('No column defined to apply nullable');
        }
        if (lastColumn.includes('NOT NULL') && !lastColumn.includes('PRIMARY KEY')) {
            this.columns[this.columns.length - 1] = lastColumn.replace(' NOT NULL', '');
        } else if (!lastColumn.includes('NULL') && !lastColumn.includes('UNIQUE') && !lastColumn.includes('PRIMARY KEY')) {
            this.columns[this.columns.length - 1] = `${lastColumn} NULL`;
        }
        return this;
    }

    timestamps(): this {
        this.columns.push(
            'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        );
        return this;
    }

    foreignKey(column: string, referencedTable: string, referencedColumn: string = 'id', columnType: string = 'INT'): this {
        if (!column || !isValidName(column) || !referencedTable || !isValidName(referencedTable) || !isValidName(referencedColumn)) {
            throw new Error('Invalid or reserved column or table name');
        }
        if (!['INT', 'VARCHAR(255)'].includes(columnType)) {
            throw new Error('Invalid column type for foreign key; use INT or VARCHAR(255)');
        }
        this.columns.push(
            `${column} ${columnType} NOT NULL`,
            `FOREIGN KEY (\`${column}\`) REFERENCES \`${referencedTable}\`(\`${referencedColumn}\`) ON DELETE CASCADE`
        );
        return this;
    }

    reference(column: string, referencedTable: string, referencedColumn: string = 'id', columnType: string = 'INT'): this {
        return this.foreignKey(column, referencedTable, referencedColumn, columnType);
    }

    default(value: string | number | boolean): this {
        const lastColumn = this.columns[this.columns.length - 1];
        if (!lastColumn) {
            throw new Error('No column defined to apply default value');
        }
        const valueStr = typeof value === 'string' ? `'${value}'` : value;
        if (lastColumn.includes('DEFAULT')) {
            this.columns[this.columns.length - 1] = lastColumn.replace(/DEFAULT [^,)]+/, `DEFAULT ${valueStr}`);
        } else {
            this.columns[this.columns.length - 1] = `${lastColumn} DEFAULT ${valueStr}`;
        }
        return this;
    }

    index(column: string): this {
        if (!column || !isValidName(column)) {
            throw new Error('Invalid or reserved column name for index');
        }
        this.indexes.push(`CREATE INDEX idx_${this.tableName}_${column} ON \`${this.tableName}\` (\`${column}\`);`);
        return this;
    }

    engine(engine: string = 'InnoDB'): this {
        if (!['InnoDB', 'MyISAM'].includes(engine)) {
            throw new Error('Invalid table engine; use InnoDB or MyISAM');
        }
        this.tableOptions.push(`ENGINE=${engine}`);
        return this;
    }

    charset(charset: string = 'utf8mb4'): this {
        if (!['utf8mb4', 'latin1', 'utf8'].includes(charset)) {
            throw new Error('Invalid charset; use utf8mb4, latin1, or utf8');
        }
        this.tableOptions.push(`CHARSET=${charset}`);
        return this;
    }

    async execute(): Promise<QueryResult<any>> {
        try {
            const columnDefinitions = this.columns.join(', ');
            const tableOptions = this.tableOptions.length ? ' ' + this.tableOptions.join(' ') : '';
            const sql = `CREATE TABLE IF NOT EXISTS \`${this.tableName}\` (${columnDefinitions})${tableOptions};`;
            console.log(`Executing SQL: ${sql}`);
            const result = await query(sql, [], this.dbName);

            // Execute index creation queries
            for (const indexSql of this.indexes) {
                console.log(`Executing index SQL: ${indexSql}`);
                await query(indexSql, [], this.dbName);
            }

            return result;
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown database error');
            console.error(`Error executing schema for ${this.tableName}: ${error.message}`, { sql: (err as any).sql || 'unknown' });
            throw error;
        }
    }

    async drop(): Promise<QueryResult<any>> {
        try {
            const sql = `DROP TABLE IF EXISTS \`${this.tableName}\`;`;
            console.log(`Executing drop SQL: ${sql}`);
            return await query(sql, [], this.dbName);
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown database error');
            console.error(`Error dropping table ${this.tableName}: ${error.message}`, { sql: (err as any).sql || 'unknown' });
            throw error;
        }
    }

    getSql(): string {
        const columnDefinitions = this.columns.join(', ');
        const tableOptions = this.tableOptions.length ? ' ' + this.tableOptions.join(' ') : '';
        return `CREATE TABLE IF NOT EXISTS \`${this.tableName}\` (${columnDefinitions})${tableOptions};`;
    }

    getDropSql(): string {
        return `DROP TABLE IF EXISTS \`${this.tableName}\`;`;
    }
}