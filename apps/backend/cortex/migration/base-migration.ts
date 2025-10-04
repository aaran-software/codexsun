import { QueryResult } from '../db/db-types';
import { query } from '../db/db';
import * as path from 'path';
import * as fs from 'fs/promises';
import { SchemaBuilder } from './schema-builder';

const MIGRATIONS_PATH = 'cortex/database/migrations';

// Abstract base class for migrations
export abstract class BaseMigration {
    protected schema: {
        create: (tableName: string, callback: (table: SchemaBuilder) => void) => Promise<QueryResult<any>>;
        dropTable: (tableName: string) => Promise<QueryResult<any>>;
    };
    private tableName: string | null = null;

    constructor() {
        this.schema = {
            create: async (tableName: string, callback: (table: SchemaBuilder) => void) => {
                const builder = new SchemaBuilder(tableName);
                this.tableName = tableName; // Store table name for dropTable
                callback(builder);
                return await builder.execute();
            },
            dropTable: async (tableName: string) => {
                const sql = `DROP TABLE IF EXISTS ${this.tableName || tableName};`;
                return await query(sql);
            }
        };
    }

    // Static method to create and return migration object
    static create<T extends BaseMigration>(MigrationClass: new () => T) {
        const instance = new MigrationClass();
        // Derive migration name from class name
        const fileName = path.basename(instance.constructor.name, '.ts');
        return {
            name: fileName,
            up: instance.up.bind(instance),
            down: instance.down.bind(instance)
        };
    }

    // Method to get all migrations from the migrations folder
    static async getAllMigrations(): Promise<Array<{ name: string; up: () => Promise<void>; down: () => Promise<void> }>> {
        try {
            const migrationsPath = path.join(__dirname, '..', '..', MIGRATIONS_PATH);
            const migrationFiles = await fs.readdir(migrationsPath);
            console.log(`Migration files found in ${migrationsPath}: ${migrationFiles.join(', ')}`);
            const migrations: Array<{ name: string; up: () => Promise<void>; down: () => Promise<void> }> = [];

            for (const file of migrationFiles) {
                if (file.endsWith('.ts') || file.endsWith('.js')) {
                    const filePath = path.join(migrationsPath, file);
                    try {
                        console.log(`Attempting to import migration: ${filePath}`);
                        const module = await import(filePath);
                        console.log(`Imported module for ${filePath}:`, module);
                        const MigrationClass = module.default;
                        console.log(`Migration class for ${filePath}:`, MigrationClass);
                        if (MigrationClass) {
                            const migration = BaseMigration.create(MigrationClass);
                            migrations.push(migration);
                        } else {
                            console.warn(`Skipping invalid migration file: ${filePath}`);
                        }
                    } catch (error) {
                        console.error(`Failed to load migration file ${filePath}: ${(error as Error).message}`);
                    }
                }
            }

            console.log(`Loaded ${migrations.length} valid migrations: ${migrations.map(m => m.name).join(', ')}`);
            return migrations.sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error(`Failed to read migrations directory ${MIGRATIONS_PATH}: ${(error as Error).message}`);
            throw error;
        }
    }

    // Abstract methods for up and down migrations
    abstract up(): Promise<void>;
    abstract down(): Promise<void>;
}