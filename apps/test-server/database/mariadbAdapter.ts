import mariadb, { SqlError } from 'mariadb';
import { DatabaseAdapter } from './connection';
import { DbConfig } from './db-config';
import type { Connection, Pool, PoolConfig } from 'mariadb';
import { createLogger } from './logger';

const logger = createLogger('MariaDBAdapter');

export class MariaDBAdapter implements DatabaseAdapter {
    private pool: Pool | null = null;
    private connectionLimit: number = 1;

    async init(config: DbConfig): Promise<void> {
        if (!config.host || !config.user || !config.database) {
            logger.error('Missing required DBConfig properties', { host: config.host, user: config.user, database: config.database });
            throw new Error('Missing required DBConfig properties: host, user, or database');
        }

        const poolConfig: PoolConfig = {
            host: config.host,
            port: config.port || 3306,
            user: config.user,
            password: config.password,
            database: config.database,
            connectionLimit: config.connectionLimit || 1,
            acquireTimeout: config.acquireTimeout || 60000,
            idleTimeout: config.idleTimeout || 30000,
            allowLocalInfile: config.allowLocalInfile ?? false,
            charset: config.charset ?? 'utf8mb4',
            timezone: 'Z',
        };

        this.connectionLimit = poolConfig.connectionLimit;
        try {
            this.pool = mariadb.createPool(poolConfig);
            logger.info('MariaDB pool initialized', {
                host: config.host,
                database: config.database,
                connectionLimit: poolConfig.connectionLimit,
            });
        } catch (error: unknown) {
            logger.error('Failed to initialize MariaDB pool', {
                error: (error as Error).message,
                code: (error as SqlError)?.code,
                sqlState: (error as SqlError)?.sqlState,
            });
            throw error;
        }

        this.pool.on('error', (err: SqlError) => {
            logger.error('MariaDB pool error', {
                error: err.message,
                code: err.code,
                sqlState: err.sqlState,
                connId: err.conn ? err.conn.threadId : -1,
            });
        });
    }

    async getConnection(): Promise<Connection> {
        if (!this.pool) {
            logger.error('MariaDB pool not initialized');
            throw new Error('MariaDB pool not initialized');
        }

        try {
            const conn = await this.pool.getConnection();
            if (process.env.APP_DEBUG === 'true') {
                logger.debug('MariaDB connection opened', {
                    threadId: conn.threadId,
                    activeConnections: this.pool.activeConnections(),
                    totalConnections: this.pool.totalConnections(),
                    idleConnections: this.pool.idleConnections(),
                });
            }
            return conn;
        } catch (error: unknown) {
            logger.error('Connection attempt failed', {
                error: (error as Error).message,
                code: (error as SqlError)?.code,
                sqlState: (error as SqlError)?.sqlState,
            });
            if ((error as SqlError).code === 'ER_CON_COUNT_ERROR') {
                logger.error('Too many connections', {
                    activeConnections: this.pool.activeConnections(),
                    totalConnections: this.pool.totalConnections(),
                    idleConnections: this.pool.idleConnections(),
                });
                throw new Error('Database connection limit reached');
            }
            throw error;
        }
    }

    async end(): Promise<void> {
        if (this.pool) {
            const stats = {
                activeConnections: this.pool.activeConnections(),
                totalConnections: this.pool.totalConnections(),
                idleConnections: this.pool.idleConnections(),
            };
            logger.info('Ending MariaDB pool...', stats);

            try {
                await this.pool.end();
            } catch (error: unknown) {
                logger.error('Failed to end MariaDB pool', {
                    error: (error as Error).message,
                    code: (error as SqlError)?.code,
                    sqlState: (error as SqlError)?.sqlState,
                });
            }

            this.pool = null;
            logger.info('MariaDB pool ended gracefully', stats);
        }
    }

    async isHealthy(): Promise<boolean> {
        if (!this.pool) {
            logger.error('MariaDB pool not initialized');
            return false;
        }
        try {
            const conn = await this.pool.getConnection();
            await conn.ping();
            await conn.release();
            if (process.env.APP_DEBUG === 'true') {
                logger.debug('MariaDB pool health check passed');
            }
            return true;
        } catch (error: unknown) {
            logger.error('MariaDB health check failed', {
                error: (error as Error).message,
                code: (error as SqlError)?.code,
                sqlState: (error as SqlError)?.sqlState,
            });
            return false;
        }
    }
}