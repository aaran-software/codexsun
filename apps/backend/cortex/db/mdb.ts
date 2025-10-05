// E:\Workspace\codexsun\apps\backend\db\mdb.ts
import { Connection } from './connection';
import { QueryResult } from './db-types';

export async function query<T>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const conn = Connection.getInstance();
    const client = await conn.getClient('');
    try {
        const result = await client.query(text, params);
        return {
            rows: Array.isArray(result) ? result : [],
            rowCount: (result as any).affectedRows || (Array.isArray(result) ? result.length : 0),
            insertId: (result as any).insertId || undefined
        };
    } catch (err) {
        console.error('MariaDB query error:', err);
        throw err;
    } finally {
        if (client.release) client.release();
        else if (client.end) await client.end();
    }
}