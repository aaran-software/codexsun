import { tenantMiddleware } from '../../../cortex/core/tenant/tenant-middleware';
import { RequestContext } from '../../../cortex/core/app.types';
import { Connection } from '../../../cortex/db/connection';
import { tenantStorage, query } from '../../../cortex/db/db';
import * as jwt from 'jsonwebtoken';

const TEST_DB = process.env.DB_NAME || 'codexsun_db';
const MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-please-replace';

describe('[22.] Tenant Middleware Tests', () => {
    let connection: Connection;

    beforeAll(async () => {
        // Initialize MariaDB connection
        const testConfig = {
            type: 'mariadb' as const,
            database: MASTER_DB,
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306', 10),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            ssl: process.env.DB_SSL === 'true',
            connectionLimit: 10,
            acquireTimeout: 10000,
            idleTimeout: 10000,
        };

        connection = await Connection.initialize(testConfig);

        // Setup master DB schema
        await tenantStorage.run(MASTER_DB, () => query('DROP TABLE IF EXISTS tenants', []));
        await tenantStorage.run(MASTER_DB, () => query(`
            CREATE TABLE tenants (
                                     id VARCHAR(255) PRIMARY KEY,
                                     tenant_id VARCHAR(50) UNIQUE NOT NULL,
                                     db_host VARCHAR(255),
                                     db_port VARCHAR(10),
                                     db_user VARCHAR(255),
                                     db_pass VARCHAR(255),
                                     db_name VARCHAR(255) NOT NULL,
                                     db_ssl VARCHAR(10),
                                     created_at DATETIME,
                                     updated_at DATETIME
            )`, []));

        await tenantStorage.run(MASTER_DB, () => query(`
                    INSERT INTO tenants (id, tenant_id, db_host, db_port, db_user, db_pass, db_name, db_ssl, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            ['1', 'tenant1', 'localhost', '3306', 'root', '', TEST_DB, 'false']));
    });

    afterAll(async () => {
        // Cleanup
        await tenantStorage.run(MASTER_DB, () => query('DROP TABLE IF EXISTS tenants', []));
        await connection.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('[test 1] sets tenant and user in request context from valid JWT', async () => {
        const now = Math.floor(Date.now() / 1000);
        const token = jwt.sign(
            { id: 'user1', tenantId: 'tenant1', role: 'admin', iat: now, exp: now + 3600 },
            JWT_SECRET
        );
        const req = {
            headers: { authorization: `Bearer ${token}` },
            context: {} as RequestContext,
        };
        const res = {};
        const next = jest.fn();

        await tenantMiddleware(req, res, next);

        expect(req.context).toEqual({
            tenant: { id: 'tenant1', dbConnection: `mariadb://root@localhost:3306/${TEST_DB}` },
            user: { id: 'user1', tenantId: 'tenant1', role: 'admin', token: expect.any(String) },
        });
        await tenantStorage.run(TEST_DB, async () => {
            expect(tenantStorage.getStore()).toBe(TEST_DB);
        });
        expect(next).toHaveBeenCalledWith();
    });

    test('[test 2] calls next with error for invalid JWT', async () => {
        const req = {
            headers: { authorization: 'Bearer invalid.jwt' },
            context: {} as RequestContext,
        };
        const res = {};
        const next = jest.fn();

        await tenantMiddleware(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next.mock.calls[0][0].message).toBe('jwt malformed');
        expect(req.context.tenant).toBeUndefined();
        expect(req.context.user).toBeUndefined();
        expect(tenantStorage.getStore()).toBeUndefined();
    });

    test('[test 3] skips tenant resolution for no authorization header', async () => {
        const req = { headers: {}, context: {} as RequestContext };
        const res = {};
        const next = jest.fn();

        await tenantMiddleware(req, res, next);

        expect(req.context.tenant).toBeUndefined();
        expect(req.context.user).toBeUndefined();
        expect(tenantStorage.getStore()).toBeUndefined();
        expect(next).toHaveBeenCalledWith();
    });

    test('[test 4] calls next with error for non-existent tenant', async () => {
        const now = Math.floor(Date.now() / 1000);
        const token = jwt.sign(
            { id: 'user1', tenantId: 'nonexistent', role: 'admin', iat: now, exp: now + 3600 },
            JWT_SECRET
        );
        const req = {
            headers: { authorization: `Bearer ${token}` },
            context: {} as RequestContext,
        };
        const res = {};
        const next = jest.fn();

        await tenantMiddleware(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next.mock.calls[0][0].message).toBe('Tenant not found for ID: nonexistent');
        expect(req.context.tenant).toBeUndefined();
        expect(req.context.user).toBeUndefined();
        expect(tenantStorage.getStore()).toBeUndefined();
    });
});