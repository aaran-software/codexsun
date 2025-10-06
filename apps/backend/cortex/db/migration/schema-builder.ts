import { QueryResult } from '../db-types';
import { query } from '../mdb';

// Enhanced validation to prevent SQL injection and reserved keywords
const isValidName = (name: string): boolean => /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name) && !['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'FROM', 'WHERE'].includes(name.toUpperCase());

class ForeignKeyBuilder {
    private column: string;
    private referencedTable: string | null = null;
    private referencedColumn: string | null = null;
    private columnType: string = 'INT';
    private cascade: string = 'CASCADE';
    private readonly schemaBuilder: SchemaBuilder;

    constructor(column: string, schemaBuilder: SchemaBuilder) {
        if (!column || !isValidName(column)) {
            throw new Error('Invalid or reserved column name');
        }
        this.column = column;
        this.schemaBuilder = schemaBuilder;
    }

    reference(referencedColumn: string): this {
        if (!referencedColumn || !isValidName(referencedColumn)) {
            throw new Error('Invalid or reserved referenced column name');
        }
        this.referencedColumn = referencedColumn;
        return this;
    }

    onTable(referencedTable: string): this {
        if (!referencedTable || !isValidName(referencedTable)) {
            throw new Error('Invalid or reserved referenced table name');
        }
        this.referencedTable = referencedTable;
        return this;
    }

    onDelete(action: string): this {
        if (!['CASCADE', 'RESTRICT', 'SET NULL'].includes(action)) {
            throw new Error('Invalid ON DELETE action; use CASCADE, RESTRICT, or SET NULL');
        }
        this.cascade = action;
        return this;
    }

    withType(columnType: string): this {
        if (!['INT', 'VARCHAR(50)', 'VARCHAR(255)'].includes(columnType)) {
            throw new Error('Invalid column type for foreign key; use INT, VARCHAR(50), or VARCHAR(255)');
        }
        this.columnType = columnType;
        return this;
    }

    build(): void {
        if (!this.referencedTable || !this.referencedColumn) {
            throw new Error('Foreign key incomplete: reference and onTable must be specified');
        }
        // Only add FK constraint; assume column pre-defined
        this.schemaBuilder['columns'].push(
            `FOREIGN KEY (\`${this.column}\`) REFERENCES \`${this.referencedTable}\`(\`${this.referencedColumn}\`) ON DELETE ${this.cascade}`
        );
    }
}

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

    null(): this {
        const lastColumn = this.columns[this.columns.length - 1];
        if (!lastColumn) {
            throw new Error('No column defined to apply null');
        }
        if (lastColumn.includes('NOT NULL') && !lastColumn.includes('PRIMARY KEY')) {
            this.columns[this.columns.length - 1] = lastColumn.replace(' NOT NULL', '');
        }
        return this;
    }

    notNull(): this {
        const lastColumn = this.columns[this.columns.length - 1];
        if (!lastColumn) {
            throw new Error('No column defined to apply notNull');
        }
        if (!lastColumn.includes('NOT NULL') && !lastColumn.includes('PRIMARY KEY')) {
            this.columns[this.columns.length - 1] = `${lastColumn} NOT NULL`;
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

    foreignKey(column: string): ForeignKeyBuilder {
        return new ForeignKeyBuilder(column, this);
    }

    reference(column: string, referencedTable: string, referencedColumn: string = 'id', columnType: string = 'INT'): this {
        const fkBuilder = this.foreignKey(column).reference(referencedColumn).onTable(referencedTable).withType(columnType);
        fkBuilder.build();
        return this;
    }

    default(value: string | number | boolean): this {
        const lastColumn = this.columns[this.columns.length - 1];
        if (!lastColumn) {
            throw new Error('No column defined to apply default value');
        }
        const valueStr = typeof value === 'string' ? `'${value}'` : value;
        if (lastColumn.includes('DEFAULT')) {
            this.columns[this.columns.length - 1] = lastColumn.replace(/DEFAULT [^,)]+/, `DEFAULT ${valueStr}`);
        } else if (lastColumn.includes('NOT NULL')) {
            this.columns[this.columns.length - 1] = lastColumn.replace('NOT NULL', `NOT NULL DEFAULT ${valueStr}`);
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
        this.tableOptions = this.tableOptions.filter(opt => !opt.startsWith('ENGINE='));
        this.tableOptions.push(`ENGINE=${engine}`);
        return this;
    }

    charset(charset: string = 'utf8mb4'): this {
        if (!['utf8mb4', 'latin1', 'utf8'].includes(charset)) {
            throw new Error('Invalid charset; use utf8mb4, latin1, or utf8');
        }
        this.tableOptions = this.tableOptions.filter(opt => !opt.startsWith('CHARSET='));
        this.tableOptions.push(`CHARSET=${charset}`);
        return this;
    }

    async execute(): Promise<QueryResult<unknown>> {
        try {
            if (!this.tableOptions.some(opt => opt.startsWith('ENGINE='))) {
                this.tableOptions.push('ENGINE=InnoDB');
            }
            if (!this.tableOptions.some(opt => opt.startsWith('CHARSET='))) {
                this.tableOptions.push('CHARSET=utf8mb4');
            }

            const columnDefinitions = this.columns.join(', ');
            const tableOptions = this.tableOptions.length ? ' ' + this.tableOptions.join(' ') : '';
            const sql = `CREATE TABLE IF NOT EXISTS \`${this.tableName}\` (${columnDefinitions})${tableOptions};`;
            console.log(`Executing SQL: ${sql}`);
            const result = await query<unknown>(sql, [], this.dbName);

            for (const indexSql of this.indexes) {
                console.log(`Executing index SQL: ${indexSql}`);
                await query<unknown>(indexSql, [], this.dbName);
            }

            return result;
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown database error');
            console.error(`Error executing schema for ${this.tableName}: ${error.message}`, { sql: (err as any).sql || 'unknown' });
            throw error;
        }
    }

    async drop(): Promise<QueryResult<unknown>> {
        try {
            const sql = `DROP TABLE IF EXISTS \`${this.tableName}\`;`;
            console.log(`Executing drop SQL: ${sql}`);
            return await query<unknown>(sql, [], this.dbName);
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error('Unknown database error');
            console.error(`Error dropping table ${this.tableName}: ${error.message}`, { sql: (err as any).sql || 'unknown' });
            throw error;
        }
    }

    getSql(): string {
        const finalTableOptions = [...this.tableOptions];
        if (!finalTableOptions.some(opt => opt.startsWith('ENGINE='))) {
            finalTableOptions.push('ENGINE=InnoDB');
        }
        if (!finalTableOptions.some(opt => opt.startsWith('CHARSET='))) {
            finalTableOptions.push('CHARSET=utf8mb4');
        }

        const columnDefinitions = this.columns.join(', ');
        const tableOptions = finalTableOptions.length ? ' ' + finalTableOptions.join(' ') : '';
        return `CREATE TABLE IF NOT EXISTS \`${this.tableName}\` (${columnDefinitions})${tableOptions};`;
    }

    getDropSql(): string {
        return `DROP TABLE IF EXISTS \`${this.tableName}\`;`;
    }
}