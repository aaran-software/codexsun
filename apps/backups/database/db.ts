// db.ts
import { dbAdapter, isConnected } from './connection';
import type { Connection, RowDataPacket, OkPacket } from 'mariadb';
import { createLogger } from './logger';
import { randomUUID } from 'crypto';

const logger = createLogger('Database');

export type ExecuteResult = OkPacket;

export async function query<T = any>(sql: string, params?: any[], timeoutMs = 30000): Promise<T[]> {
    if (!sql || typeof sql !== 'string') throw new Error('Invalid SQL query');
    if (params && !Array.isArray(params)) throw new Error('Params must be an array');
    logger.info('Entering query function', { sql, params: params || 'No params' });

    if (!isConnected() || !dbAdapter) {
        throw new Error('Database not connected. Call connect() first.');
    }

    let conn: Connection | null = null;
    try {
        conn = await dbAdapter.getConnection();
        logger.debug('Connection acquired', { threadId: conn.threadId });

        const start = Date.now();
        const result = await conn.query({ sql, timeout: timeoutMs }, params);
        const duration = Date.now() - start;
        logger.info('Query executed successfully', {
            duration,
            rows: Array.isArray(result) ? result.length : 1,
        });

        return Array.isArray(result) ? result : [result];
    } catch (error) {
        logger.error('Query failed', { error: error.message, sql, params });
        throw error;
    } finally {
        if (conn) {
            await conn.release();
            logger.debug('Connection released', { threadId: conn.threadId });
        }
    }
}

export async function execute(sql: string, params?: any[], timeoutMs = 30000): Promise<ExecuteResult> {
    if (!sql || typeof sql !== 'string') throw new Error('Invalid SQL query');
    if (params && !Array.isArray(params)) throw new Error('Params must be an array');
    logger.info('Entering execute function', { sql, params: params || 'No params' });

    if (!isConnected() || !dbAdapter) {
        throw new Error('Database not connected. Call connect() first.');
    }

    let conn: Connection | null = null;
    try {
        conn = await dbAdapter.getConnection();
        logger.debug('Connection acquired', { threadId: conn.threadId });

        const start = Date.now();
        const result = (await conn.execute({ sql, timeout: timeoutMs }, params)) as OkPacket;
        const duration = Date.now() - start;
        logger.info('Execute successful', {
            duration,
            affectedRows: result.affectedRows.toString(),
            insertId: result.insertId?.toString() ?? 'N/A',
        });

        return result;
    } catch (error) {
        logger.error('Execute failed', { error: error.message, sql, params });
        throw error;
    } finally {
        if (conn) {
            await conn.release();
            logger.debug('Connection released', { threadId: conn.threadId });
        }
    }
}

export async function transaction<T>(callback: (conn: Connection) => Promise<T>): Promise<T> {
    if (!callback || typeof callback !== 'function') throw new Error('Invalid transaction callback');
    const txId = randomUUID();
    logger.info('Entering transaction function', { txId });

    if (!isConnected() || !dbAdapter) {
        throw new Error('Database not connected. Call connect() first.');
    }

    let conn: Connection | null = null;
    try {
        conn = await dbAdapter.getConnection();
        logger.debug('Connection acquired for transaction', { txId, threadId: conn.threadId });

        const start = Date.now();
        await conn.beginTransaction();
        logger.debug('Transaction begun', { txId });

        const result = await callback(conn);
        await conn.commit();
        logger.info('Transaction committed', { txId, duration: Date.now() - start });

        return result;
    } catch (error) {
        if (conn) {
            try {
                await conn.rollback();
                logger.debug('Transaction rolled back', { txId });
            } catch (rollbackError) {
                logger.error('Rollback failed', { txId, error: rollbackError.message });
            }
        }
        logger.error('Transaction failed', { txId, error: error.message });
        throw error;
    } finally {
        if (conn) {
            await conn.release();
            logger.debug('Connection released', { txId, threadId: conn.threadId });
        }
    }
}