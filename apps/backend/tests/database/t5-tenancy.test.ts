// [test 5] Tenancy Logic
import request from 'supertest';
import { app } from '../../index'; // Assuming index.ts exports app
import { settings } from '../../cortex/config/get-settings';
import { withTenantContext, query, createTenant } from '../../cortex/db/db';
import { Connection } from '../../cortex/db/connection';
import { getDbConfig } from '../../cortex/config/db-config';
import { QueryResult } from '../../cortex/db/db-types';
import { Server } from 'http';

let connection: Connection;
let server: Server;

describe('[test 5] Tenancy Logic', () => {
    beforeAll(async () => {
        // Initialize connection for tests
        const dbConfig = getDbConfig();
        connection = await Connection.initialize(dbConfig);
        // Start server on random port
        // server = app.listen(0);
        // await new Promise<void>((resolve) => {
        //     server.on('listening', resolve);
        // });
    });

    afterAll(async () => {
        // Close connection to release open handles
        await connection.close();
        // Close server
        // await new Promise<void>((resolve, reject) => {
        //     server.close((err) => {
        //         if (err) reject(err);
        //         else resolve();
        //     });
        // });
    });

    it('should handle tenancy when TENANCY=true', async () => {
        // Temporarily set TENANCY to true for test
        const originalTenancy = settings.TENANCY;
        (settings as any).TENANCY = true;

        // Clean up existing test tenant if it exists
        const cleanupClient = await connection.getClient(settings.MASTER_DB);
        try {
            await cleanupClient.query('DELETE FROM tenants WHERE tenant_id = ?', ['test_tenant']);
            if (settings.DB_DRIVER === 'postgres') {
                await cleanupClient.query(`DROP SCHEMA IF EXISTS "test_tenant_db" CASCADE`);
            } else {
                await cleanupClient.query(`DROP DATABASE IF EXISTS test_tenant_db`);
            }
        } finally {
            if (cleanupClient.release) cleanupClient.release();
            else if (cleanupClient.end) await cleanupClient.end();
        }

        // Create test tenant
        await createTenant('test_tenant', 'test_tenant_db');

        // Verify tenant exists
        const verifyClient = await connection.getClient(settings.MASTER_DB);
        try {
            const result: QueryResult<{ database_name: string }> = await verifyClient.query('SELECT database_name FROM tenants WHERE tenant_id = ?', ['test_tenant']);
            expect(result.rows.length).toBe(1);
            expect(result.rows[0].database_name).toBe('test_tenant_db');
        } finally {
            if (verifyClient.release) verifyClient.release();
            else if (verifyClient.end) await verifyClient.end();
        }

        // Test tenant context
        await withTenantContext('test_tenant', async () => {
            const createTableQuery =
                settings.DB_DRIVER === 'sqlite'
                    ? 'CREATE TABLE IF NOT EXISTS tenant_test (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)'
                    : settings.DB_DRIVER === 'postgres'
                        ? 'CREATE TABLE IF NOT EXISTS tenant_test (id SERIAL PRIMARY KEY, name VARCHAR(255))'
                        : 'CREATE TABLE IF NOT EXISTS tenant_test (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))';
            const createResult = await query(createTableQuery);
            expect(createResult.rowCount).toBe(0); // Table creation
        });

        // // Check middleware with request
        // const response = await request(server).get('/hz').set('x-tenant-id', 'test_tenant');
        // expect(response.status).toBe(200);

        // Cleanup
        await withTenantContext('test_tenant', async () => {
            await query('DROP TABLE IF EXISTS tenant_test');
        });

        // Reset TENANCY
        (settings as any).TENANCY = originalTenancy;
    }, 15000); // Increased timeout for tenancy operations

    it('should use default DB when TENANCY=false', async () => {
        // Temporarily set TENANCY to false for test
        const originalTenancy = settings.TENANCY;
        (settings as any).TENANCY = false;

        const result: QueryResult<{ value: number }> = await query('SELECT 1 AS value');
        expect(result.rows.length).toBeGreaterThan(0);
        expect(result.rows[0].value).toBe(1); // Access column by name for adapter compatibility

        // Reset TENANCY
        (settings as any).TENANCY = originalTenancy;
    });
});