// cortex/migration/migrator.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import mariadb, { Pool, Connection } from 'mariadb';

// Database configuration - replace with your actual details or use environment variables
const DB_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: 'Computer.1',
    database: 'codexsun_db',
    multipleStatements: true,
};

// Migrations directory
const MIGRATIONS_DIR = './migrations_test'; // Use migrations_test for tests

export async function createMigrationsTable(conn: Connection): Promise<void> {
    await conn.query(`
        CREATE TABLE IF NOT EXISTS migrations (
                                                  id INT AUTO_INCREMENT PRIMARY KEY,
                                                  name VARCHAR(255) NOT NULL UNIQUE,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
    `);
}

export async function getExecutedMigrations(conn: Connection): Promise<Set<string>> {
    const result = await conn.query('SELECT name FROM migrations');
    return new Set(result.map((row: any) => row.name));
}

export async function runMigration(conn: Connection, file: string): Promise<void> {
    const filePath = path.join(MIGRATIONS_DIR, file);
    // Dynamic import for TS module
    const module = await import(filePath);
    const sql = module.migration.up; // Extract raw SQL string
    await conn.query(sql);
    await conn.query('INSERT INTO migrations (name) VALUES (?)', [file]);
    console.log(`Migration executed: ${file}`);
}

export async function main(): Promise<void> {
    let pool: Pool | null = null;
    let conn: Connection | null = null;

    try {
        pool = mariadb.createPool(DB_CONFIG);
        conn = await pool.getConnection();

        await createMigrationsTable(conn);
        const executed = await getExecutedMigrations(conn);

        const files = await fs.readdir(MIGRATIONS_DIR);
        const migrationFiles = files
            .filter((file) => file.endsWith('.ts'))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        for (const file of migrationFiles) {
            if (!executed.has(file)) {
                await conn.beginTransaction();
                try {
                    await runMigration(conn, file);
                    await conn.commit();
                } catch (err) {
                    await conn.rollback();
                    throw err;
                }
            }
        }

        console.log('All migrations completed.');
    } catch (error) {
        console.error('Migration error:', error);
        throw error; // Throw for test to catch
    } finally {
        if (conn) await conn.release();
        if (pool) await pool.end();
    }
}

if (require.main === module) {
    main();
}