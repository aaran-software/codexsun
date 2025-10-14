// // db.ts
// import {AsyncLocalStorage} from 'async_hooks';
// import {AnyDbClient, QueryResult} from './db-types';
// import {Connection} from './connection';
// import {query as masterQuery} from './mdb';
// import {logHealthCheck, logQuery, logTransaction} from '../config/logger';
// import {DbConfig, getPrimaryDbConfig} from '../config/db-config';
//
// export const tenantStorage = new AsyncLocalStorage<string>(); // Tenant ID context
//
// interface TenantRow {
//     driver: string;
//     host: string;
//     port: string | number;
//     user: string;
//     password: string;
//     database: string;
//     ssl: string;
// }
//
// /**
//  * Validates if the driver is supported
//  */
// function validateDriver(driver: string): driver is DbConfig['driver'] {
//     return ['postgres', 'mysql', 'mariadb', 'sqlite'].includes(driver);
// }
//
// /**
//  * Fetches tenant configuration from master database by tenant_id
//  */
// async function getTenantConfig(tenantId: string): Promise<DbConfig> {
//     try {
//         const tenantQuery = `
//             SELECT
//                 db_driver as driver,
//                 db_host as host,
//                 db_port as port,
//                 db_user as user,
//                 db_pass as password,
//                 db_name as database
//             FROM tenants
//             WHERE tenant_id = ? AND active = 'active'
//             LIMIT 1
//         `;
//
//         const result = await masterQuery<TenantRow>(tenantQuery, [tenantId]);
//
//         // Since LIMIT 1, we expect either one row or empty array
//         if (!result.rows || result.rows.length === 0) {
//             return Promise.reject(new Error(`Tenant ${tenantId} not found or inactive`));
//         }
//
//         const tenantRow: TenantRow = result.rows[0];
//         const port = tenantRow.port ? parseInt(tenantRow.port.toString(), 10) : 3306;
//         const config = getPrimaryDbConfig();
//
//         // Validate driver
//         const driver = validateDriver(tenantRow.driver) ? tenantRow.driver : config.driver;
//
//         // Validate SSL is boolean
//         const ssl = tenantRow.ssl === 'true';
//
//         return {
//             driver,
//             host: tenantRow.host || config.host,
//             port: port,
//             user: tenantRow.user || config.user,
//             password: tenantRow.password || config.password,
//             database: tenantRow.database || config.database,
//             ssl,
//             connectionLimit: config.connectionLimit,
//             acquireTimeout: config.acquireTimeout,
//             idleTimeout: config.idleTimeout,
//         };
//     } catch (error) {
//         console.error(`Failed to fetch tenant config for ${tenantId}:`, error);
//         throw new Error(`Unable to resolve tenant configuration: ${(error as Error).message}`);
//     }
// }
//
// /**
//  * Creates a temporary connection for a specific tenant using Connection. initialize
//  */
// async function createTenantConnection(tenantConfig: DbConfig): Promise<Connection> {
//     return await Connection.initialize(tenantConfig);
// }
//
// /**
//  * Executes a SQL query on the tenant-specific database.
//  * Resolves tenant config from master DB if tenantId is provided.
//  *
//  * @param sql - SQL query string
//  * @param params - Optional parameters for safe querying
//  * @param tenantId - Tenant ID to resolve database connection
//  * @returns QueryResult with rows, count, and insert ID
//  */
// export async function query<T>(
//     sql: string,
//     params: any[] = [],
//     tenantId?: string
// ): Promise<QueryResult<T>> {
//     let tenantConnection: Connection | null = null;
//     let client: AnyDbClient | null = null;
//     let effectiveTenantId: string | undefined;
//     const start = Date.now();
//
//     try {
//         if (!sql) {
//             return Promise.reject(new Error('Invalid SQL query provided'));
//         }
//
//         effectiveTenantId = tenantId;
//
//         // If no tenantId provided, try to get from AsyncLocalStorage
//         if (!effectiveTenantId) {
//             effectiveTenantId = tenantStorage.getStore();
//         }
//
//         // Use master database if no tenant context
//         if (!effectiveTenantId) {
//             console.warn('No tenant context available, falling back to master database');
//             return masterQuery<T>(sql, params);
//         }
//
//         // logQuery('start', {
//         //     sql: sql.slice(0, 100) + (sql.length > 100 ? '...' : ''),
//         //     params: params.length ? '[HIDDEN]' : '[]',
//         //     tenantId: effectiveTenantId
//         // });
//
//         // Fetch tenant configuration and create connection
//         const tenantConfig = await getTenantConfig(effectiveTenantId);
//
//         console.log("t sundar "+ tenantConfig)
//
//
//         tenantConnection = await createTenantConnection(tenantConfig);
//         client = await tenantConnection.getClient(tenantConfig.database);
//
//         const result = await client.query(sql, params);
//
//         logQuery('end', {
//             tenantId: effectiveTenantId,
//             duration: Date.now() - start,
//             rowCount: result.rowCount || result.affectedRows || 0
//         });
//
//         return {
//             rows: (Array.isArray(result) ? result : result.rows || []) as T[],
//             rowCount: result.rowCount || (result.affectedRows ?? (Array.isArray(result) ? result.length : 0)),
//             insertId: result.insertId || undefined,
//         };
//
//     } catch (error) {
//         const errMsg = (error as Error).message || 'Unknown query error';
//         logQuery('error', {
//             tenantId: effectiveTenantId || 'unknown',
//             duration: Date.now() - start,
//             error: errMsg
//         });
//         throw new Error(`Tenant query failed for ${effectiveTenantId || 'unknown'}: ${sql.slice(0, 50)}... - ${errMsg}`);
//     } finally {
//         // Clean up resources
//         if (client) {
//             try {
//                 if (client.release) {
//                     client.release();
//                 } else if (client.end) {
//                     await client.end();
//                 }
//             } catch (releaseErr) {
//                 console.error(`Failed to release client: ${(releaseErr as Error).message}`);
//             }
//         }
//
//         if (tenantConnection) {
//             try {
//                 await tenantConnection.close();
//             } catch (closeErr) {
//                 console.error(`Failed to close tenant connection: ${(closeErr as Error).message}`);
//             }
//         }
//     }
// }
//
// /**
//  * Executes a transactional callback on tenant-specific database.
//  *
//  * @param callback - Function receiving DB client for operations
//  * @param tenantId - Tenant ID to resolve database connection
//  * @returns Result from callback
//  */
// export async function withTransaction<T>(
//     callback: (client: AnyDbClient) => Promise<T>,
//     tenantId?: string
// ): Promise<T> {
//     let tenantConnection: Connection | null = null;
//     let client: AnyDbClient | null = null;
//     const start = Date.now();
//     let effectiveTenantId: string | undefined = tenantId || tenantStorage.getStore();
//
//     try {
//         if (!effectiveTenantId) {
//             return Promise.reject(new Error('Tenant ID required for transaction'));
//         }
//
//         logTransaction('start', { tenantId: effectiveTenantId });
//
//         // Fetch tenant config and create connection
//         const tenantConfig = await getTenantConfig(effectiveTenantId);
//         tenantConnection = await createTenantConnection(tenantConfig);
//         client = await tenantConnection.getClient(tenantConfig.database);
//
//         // Start transaction
//         await client.query('START TRANSACTION');
//
//         const result = await callback(client);
//
//         // Commit transaction
//         await client.query('COMMIT');
//         logTransaction('end', { tenantId: effectiveTenantId, duration: Date.now() - start });
//
//         return result;
//
//     } catch (error) {
//         const errMsg = (error as Error).message || 'Unknown transaction error';
//         logTransaction('error', {
//             tenantId: effectiveTenantId || 'unknown',
//             duration: Date.now() - start,
//             error: errMsg
//         });
//
//         // Rollback on error
//         if (client) {
//             try {
//                 await client.query('ROLLBACK');
//                 console.log(`Transaction rolled back for tenant: ${effectiveTenantId}`);
//             } catch (rollbackErr) {
//                 console.error(`Rollback failed for tenant ${effectiveTenantId}: ${(rollbackErr as Error).message}`);
//             }
//         }
//
//         throw new Error(`Transaction failed for tenant ${effectiveTenantId || 'unknown'}: ${errMsg}`);
//     } finally {
//         // Clean up resources
//         if (client) {
//             try {
//                 if (client.release) client.release();
//                 else if (client.end) await client.end();
//             } catch (releaseErr) {
//                 console.error(`Failed to release transaction client: ${(releaseErr as Error).message}`);
//             }
//         }
//
//         if (tenantConnection) {
//             try {
//                 await tenantConnection.close();
//             } catch (closeErr) {
//                 console.error(`Failed to close tenant transaction connection: ${(closeErr as Error).message}`);
//             }
//         }
//     }
// }
//
// /**
//  * Checks health of tenant-specific database.
//  *
//  * @param tenantId - Tenant ID to check
//  * @returns True if healthy, false otherwise
//  */
// export async function healthCheck(tenantId: string): Promise<boolean> {
//     let tenantConnection: Connection | null = null;
//     let client: AnyDbClient | null = null;
//     const start = Date.now();
//
//     try {
//         const tenantConfig = await getTenantConfig(tenantId);
//         tenantConnection = await createTenantConnection(tenantConfig);
//         client = await tenantConnection.getClient(tenantConfig.database);
//
//         await client.query('SELECT 1');
//
//         // Log with standard fields (avoid tenantId if not supported)
//         logHealthCheck('success', {
//             database: tenantConfig.database,
//             duration: Date.now() - start
//         });
//         return true;
//
//     } catch (error) {
//         const errMsg = (error as Error).message || 'Unknown health check error';
//         logHealthCheck('error', {
//             database: tenantId,
//             duration: Date.now() - start,
//             error: errMsg
//         });
//         return false;
//     } finally {
//         if (client) {
//             try {
//                 if (client.release) client.release();
//                 else if (client.end) await client.end();
//             } catch (releaseErr) {
//                 console.error(`Failed to release health check client: ${(releaseErr as Error).message}`);
//             }
//         }
//
//         if (tenantConnection) {
//             try {
//                 await tenantConnection.close();
//             } catch (closeErr) {
//                 console.error(`Failed to close tenant health check connection: ${(closeErr as Error).message}`);
//             }
//         }
//     }
// }
//
// /**
//  * Sets tenant context for AsyncLocalStorage (for middleware use)
//  */
// export function setTenantContext(tenantId: string): void {
//     tenantStorage.enterWith(tenantId);
// }
//
// /**
//  * Clears tenant context
//  */
// export function clearTenantContext(): void {
//     tenantStorage.exit(() => {});
// }
//
// /**
//  * Middleware helper to run queries with tenant context
//  */
// export async function withTenantContext<T>(
//     tenantId: string,
//     callback: () => Promise<T>
// ): Promise<T> {
//     return tenantStorage.run(tenantId, callback);
// }