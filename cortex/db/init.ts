import { Database } from 'sqlite3';

export async function initializeDatabase(db: Database) {
 db.run(`
    CREATE TABLE IF NOT EXISTS data_points (
    x REAL,
    y REAL
)
`);
}