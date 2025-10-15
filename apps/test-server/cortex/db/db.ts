// cortex/db/db.ts

import { Connection } from './connection';
import { QueryResult, AnyDbClient } from './db-types';
import { getPrimaryDbConfig, getMasterDbConfig, DbConfig } from '../config/db-config';
import { logQuery, logTransaction, logHealthCheck } from '../config/logger';
import { getSettings, AppEnv } from '../config/get-settings';

// Define allowed driver types
type DatabaseDriver = 'postgres' | 'mysql' | 'mariadb' | 'sqlite';

// Interface for tenant table row
interface TenantRow {
  id: number;
  tenant_id: string;
  db_driver: string;
  db_host: string;
  db_port: string | number;
  db_user: string;
  db_pass: string;
  db_name: string;
  db_ssl: string | boolean | null;
  active: string;
  created_at: string;
  updated_at: string;
}

// Connection pool manager for master and tenant databases
class ConnectionManager {
  private static tenantConnections: Map<string, Connection> = new Map();
  private static masterConnection: Connection | null = null;

  static async getMasterConnection(): Promise<Connection> {
    if (!this.masterConnection) {
      this.masterConnection = await Connection.initialize(getMasterDbConfig());
    }
    return this.masterConnection;
  }

  static async getTenantConnection(tenantId: string, tenantConfig: DbConfig): Promise<Connection> {
    const key = `${tenantId}:${tenantConfig.driver}:${tenantConfig.database}:${tenantConfig.host}:${tenantConfig.port}`;
    if (!this.tenantConnections.has(key)) {
      const connection = await Connection.initialize(tenantConfig);
      this.tenantConnections.set(key, connection);
    }
    return this.tenantConnections.get(key)!;
  }

  static async closeAll(): Promise<void> {
    if (this.masterConnection) {
      await this.masterConnection.close();
      this.masterConnection = null;
    }
    for (const [key, connection] of this.tenantConnections) {
      await connection.close();
      this.tenantConnections.delete(key);
    }
  }
}

async function resolveTenant(tenantId: string): Promise<DbConfig> {
  if (!getSettings().TENANCY) {
    return getMasterDbConfig();
  }

  const start = Date.now();
  let client: AnyDbClient | null = null;

  try {
    const masterConnection = await ConnectionManager.getMasterConnection();
    client = await masterConnection.getClient(getMasterDbConfig().database);
    const result = await client.query('SELECT * FROM tenants WHERE tenant_id = ?', [tenantId]);
    logQuery('end', {
      sql: 'SELECT * FROM tenants WHERE tenant_id = ?',
      params: [tenantId],
      tenantId,
      duration: Date.now() - start,
    });

    if (result.rowCount === 0) {
      if (process.env.STRICT_TENANCY === 'true') {
        throw new Error(`Tenant not found for tenant_id: ${tenantId} and strict tenancy is enabled`);
      }
      return getPrimaryDbConfig();
    }

    const row: TenantRow = result.rows[0];
    const driver = row.db_driver;
    if (!['postgres', 'mysql', 'mariadb', 'sqlite'].includes(driver)) {
      throw new Error(`Invalid database driver: ${driver}`);
    }

    // Handle db_ssl for PostgreSQL (object or boolean)
    let ssl: boolean | object;
    if (driver === 'postgres' && row.db_ssl) {
      try {
        ssl = typeof row.db_ssl === 'string' ? JSON.parse(row.db_ssl) : !!row.db_ssl;
      } catch {
        ssl = row.db_ssl === 'true' || row.db_ssl === '1';
      }
    } else {
      ssl = row.db_ssl === 'true' || row.db_ssl === '1' || !!row.db_ssl;
    }

    return {
      driver: driver as DatabaseDriver,
      host: row.db_host,
      port: Number(row.db_port),
      user: row.db_user,
      password: row.db_pass,
      database: row.db_name,
      ssl,
      connectionLimit: process.env.APP_ENV === AppEnv.Production ? 50 : 10,
      acquireTimeout: 10000,
      idleTimeout: 10000,
    };
  } finally {
    if (client && client.release) {
      client.release();
    } else if (client && client.end) {
      await client.end();
    }
  }
}

export async function query<T>(text: string, params: any[] = [], tenantId: string): Promise<QueryResult<T>> {
  let config: DbConfig;
  try {
    config = await resolveTenant(tenantId);
  } catch (e) {
    if (!getSettings().TENANCY) {
      throw e;
    }
    config = getPrimaryDbConfig();
  }

  const start = Date.now();
  let client: AnyDbClient | null = null;

  try {
    if (!text) {
      return Promise.reject(new Error('Invalid SQL query provided'));
    }
    logQuery('start', { sql: text, params, tenantId });

    const connection = await ConnectionManager.getTenantConnection(tenantId, config);
    client = await connection.getClient(config.database);

    // Use PostgreSQL-compatible query syntax if driver is postgres
    const queryText = config.driver === 'postgres' ? text.replace(/\?/g, '$1') : text;
    const result = await client.query(queryText, params);
    logQuery('end', { sql: text, params, tenantId, duration: Date.now() - start });

    return {
      rows: (Array.isArray(result) ? result : result.rows || []) as T[],
      rowCount: result.rowCount || (result.affectedRows ?? (Array.isArray(result) ? result.length : 0)) || result.changes || 0,
      insertId: result.insertId || result.lastID || undefined,
    };
  } catch (error) {
    const errMsg = (error as Error).message || 'Unknown query error';
    logQuery('error', { sql: text, params, tenantId, duration: Date.now() - start, error: errMsg });
    throw new Error(`Query failed on DB ${config.database || 'default'}: ${text.slice(0, 50)}... - ${errMsg}`);
  } finally {
    if (client) {
      try {
        if (client.release) client.release();
        else if (client.end) await client.end();
      } catch (releaseErr) {
        console.error(`Failed to release client for DB ${config.database || 'default'}: ${(releaseErr as Error).message}`);
      }
    }
  }
}

export async function withTransaction<T>(callback: (client: AnyDbClient) => Promise<T>, tenantId: string): Promise<T> {
  let config: DbConfig;
  try {
    config = await resolveTenant(tenantId);
  } catch (e) {
    if (getSettings().TENANCY) {
      throw e;
    }
    config = getPrimaryDbConfig();
  }

  const start = Date.now();
  let client: AnyDbClient | null = null;

  try {
    logTransaction('start', { tenantId });
    const connection = await ConnectionManager.getTenantConnection(tenantId, config);
    client = await connection.getClient(config.database);

    // Use appropriate transaction commands based on driver
    const beginTransaction = config.driver === 'postgres' ? 'BEGIN' : 'START TRANSACTION';
    await client.query(beginTransaction);

    const result = await callback(client);

    await client.query('COMMIT');
    logTransaction('end', { tenantId, duration: Date.now() - start });

    return result;
  } catch (error) {
    const errMsg = (error as Error).message || 'Unknown transaction error';
    logTransaction('error', { tenantId, duration: Date.now() - start, error: errMsg });

    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        console.error(`Rollback failed on DB ${config.database || 'default'}: ${(rollbackErr as Error).message}`);
      }
    }

    throw new Error(`Transaction failed on DB ${config.database || 'default'}: ${errMsg}`);
  } finally {
    if (client) {
      try {
        if (client.release) client.release();
        else if (client.end) await client.end();
      } catch (releaseErr) {
        console.error(`Failed to release client for DB ${config.database || 'default'}: ${(releaseErr as Error).message}`);
      }
    }
  }
}

export async function healthCheck(tenantId: string): Promise<boolean> {
  let config: DbConfig;
  try {
    config = await resolveTenant(tenantId);
  } catch (e) {
    if (getSettings().TENANCY) {
      return false;
    }
    config = getPrimaryDbConfig();
  }

  const start = Date.now();
  let client: AnyDbClient | null = null;

  try {
    const connection = await ConnectionManager.getTenantConnection(tenantId, config);
    client = await connection.getClient(config.database);
    await client.query('SELECT 1');
    logHealthCheck('success', { database: config.database || 'default', duration: Date.now() - start });
    return true;
  } catch (error) {
    const errMsg = (error as Error).message || 'Unknown health check error';
    logHealthCheck('error', { database: config.database || 'default', duration: Date.now() - start, error: errMsg });
    return false;
  } finally {
    if (client) {
      try {
        if (client.release) client.release();
        else if (client.end) await client.end();
      } catch (releaseErr) {
        console.error(`Failed to release client for health check on ${config.database || 'default'}: ${(releaseErr as Error).message}`);
      }
    }
  }
}