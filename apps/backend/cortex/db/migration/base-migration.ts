// E:\Workspace\codexsun\apps\backend\cortex\database\migrations\base-migration.ts
import { QueryResult } from '../db-types';
import { query } from '../mdb';
import * as path from 'path';
import * as fs from 'fs/promises';
import { SchemaBuilder } from './schema-builder';
import { pathToFileURL } from 'url';

const MIGRATIONS_PATH = '../database/migrations';

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
                this.tableName = tableName;
                callback(builder);
                return await builder.execute();
            },
            dropTable: async (tableName: string) => {
                const sql = `DROP TABLE IF EXISTS ${this.tableName || tableName};`;
                return await query(sql);
            }
        };
    }

    static create<T extends BaseMigration>(MigrationClass: new () => T, filePath: string) {
        const instance = new MigrationClass();
        const fileName = path.basename(filePath, '.ts').replace(/^\d+_/, '');
        return {
            name: fileName,
            up: instance.up.bind(instance),
            down: instance.down.bind(instance)
        };
    }

    static async getAllMigrations(): Promise<Array<{ name: string; up: () => Promise<void>; down: () => Promise<void> }>> {
        try {
            const migrationsPath = path.join(__dirname, MIGRATIONS_PATH);
            console.log(`Resolved migrations path: ${migrationsPath}`);
            const migrationFiles = await fs.readdir(migrationsPath);
            console.log(`Migration files found: ${migrationFiles.join(', ') || 'none'}`);
            const migrations: Array<{ name: string; up: () => Promise<void>; down: () => Promise<void> }> = [];

            for (const file of migrationFiles) {
                if (file.endsWith('.ts') || file.endsWith('.js')) {
                    const filePath = path.join(migrationsPath, file);
                    const fileURL = pathToFileURL(filePath).href;
                    console.log(`Attempting to import migration: ${fileURL}`);
                    try {
                        const module = await import(fileURL);
                        console.log(`Imported module for ${filePath}:`, module);
                        const MigrationClass = module.default;
                        console.log(`Migration class for ${filePath}:`, MigrationClass);
                        if (MigrationClass) {
                            const migration = BaseMigration.create(MigrationClass, filePath);
                            migrations.push(migration);
                            console.log(`Successfully loaded migration: ${migration.name}`);
                        } else {
                            console.warn(`No default export in ${filePath}`);
                        }
                    } catch (error) {
                        console.error(`Failed to load migration file ${filePath}: ${(error as Error).message}`);
                    }
                }
            }

            console.log(`Loaded ${migrations.length} valid migrations: ${migrations.map(m => m.name).join(', ') || 'none'}`);
            return migrations.sort((a, b) => {
                if (a.name === 'system_migration') return -1;
                if (b.name === 'system_migration') return 1;
                return a.name.localeCompare(b.name);
            });
        } catch (error) {
            console.error(`Failed to read migrations directory ${MIGRATIONS_PATH}: ${(error as Error).message}`);
            throw error;
        }
    }

    abstract up(): Promise<void>;
    abstract down(): Promise<void>;
}