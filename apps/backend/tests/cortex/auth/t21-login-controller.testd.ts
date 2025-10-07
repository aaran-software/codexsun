import * as AuthService from '../../../cortex/core/auth/auth-service';
import * as TenantResolver from '../../../cortex/core/tenant/tenant-resolver';
import { Tenant, Credentials } from '../../../cortex/core/app.types';
import { Connection } from '../../../cortex/db/connection';
import { tenantStorage, query } from '../../../cortex/db/db';
import * as jwt from 'jsonwebtoken';

const TEST_DB = process.env.DB_NAME || 'codexsun_db';
const MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-please-replace';

describe('[21.] Login Controller Tests', () => {
    let connection: Connection;
    let loginController: any;

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

        // Setup master and tenant DB schema
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
            ['1', 'default', 'localhost', '3306', 'root', '', TEST_DB, 'false']));

        await tenantStorage.run(MASTER_DB, () => query('DROP TABLE IF EXISTS tenant_users', []));
        await tenantStorage.run(MASTER_DB, () => query(`
            CREATE TABLE tenant_users (
                                          email VARCHAR(255) UNIQUE NOT NULL,
                                          tenant_id VARCHAR(50) NOT NULL,
                                          created_at DATETIME,
                                          updated_at DATETIME
            )`, []));

        await tenantStorage.run(TEST_DB, () => query('DROP TABLE IF EXISTS users', []));
        await tenantStorage.run(TEST_DB, () => query(`
            CREATE TABLE users (
                                   id VARCHAR(255) PRIMARY KEY,
                                   email VARCHAR(255) UNIQUE NOT NULL,
                                   password_hash VARCHAR(255) NOT NULL,
                                   tenant_id VARCHAR(50) NOT NULL,
                                   role VARCHAR(50) NOT NULL,
                                   created_at DATETIME,
                                   updated_at DATETIME
            )`, []));

        // Seed test data
        await tenantStorage.run(MASTER_DB, () => query(`
            INSERT INTO tenant_users (email, tenant_id, created_at, updated_at)
            VALUES (?, ?, NOW(), NOW())`, ['admin@example.com', 'default']));

        await tenantStorage.run(TEST_DB, () => query(`
                    INSERT INTO users (id, email, password_hash, tenant_id, role, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            ['1', 'admin@example.com', 'pass123', 'default', 'admin']));
    });

    afterAll(async () => {
        // Cleanup
        await tenantStorage.run(TEST_DB, () => query('DROP TABLE IF EXISTS users', []));
        await tenantStorage.run(MASTER_DB, () => query('DROP TABLE IF EXISTS tenant_users', []));
        await tenantStorage.run(MASTER_DB, () => query('DROP TABLE IF EXISTS tenants', []));
        await connection.close();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        delete require.cache[require.resolve('../../../cortex/core/auth/login-controller')];
        loginController = require('../../../cortex/core/auth/login-controller');
    });

    test('[test 1] logs in user successfully', async () => {
        const req = { body: { email: 'admin@example.com', password: 'pass123' } };
        const tenant = { id: 'default', dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}` };
        const now = Math.floor(Date.now() / 1000);
        const token = jwt.sign({ id: '1', tenantId: 'default', role: 'admin', iat: now, exp: now + 3600 }, JWT_SECRET);
        jest.spyOn(TenantResolver, 'resolveTenant').mockResolvedValue(tenant);
        jest.spyOn(AuthService, 'authenticateUser').mockResolvedValue({
            id: '1',
            tenantId: 'default',
            role: 'admin',
            token,
        });
        const response = await loginController.login(req);
        expect(response).toEqual({
            user: { id: '1', tenantId: 'default', role: 'admin', token: expect.any(String) },
            tenant: { id: 'default', dbConnection: expect.any(String) },
        });
        const decoded = jwt.verify(response.user.token, JWT_SECRET) as jwt.JwtPayload;
        expect(decoded).toMatchObject({ id: '1', tenantId: 'default', role: 'admin' });
    });

    test('[test 2] rejects invalid password', async () => {
        const req = { body: { email: 'admin@example.com', password: 'wrongpass' } };
        const tenant = { id: 'default', dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}` };
        jest.spyOn(TenantResolver, 'resolveTenant').mockResolvedValue(tenant);
        jest.spyOn(AuthService, 'authenticateUser').mockRejectedValue(new Error('Invalid credentials'));
        await expect(loginController.login(req)).rejects.toThrow('Invalid credentials');
    });

    test('[test 3] rejects unknown email', async () => {
        const req = { body: { email: 'unknown@domain.com', password: 'pass123' } };
        jest.spyOn(TenantResolver, 'resolveTenant').mockRejectedValue(
            new Error('Tenant resolution failed for email unknown@domain.com: No tenant associated with email: unknown@domain.com')
        );
        await expect(loginController.login(req)).rejects.toThrow('Tenant resolution failed');
    });

    test('[test 4] logs out user successfully', async () => {
        const req = { body: { email: 'admin@example.com', password: 'pass123' } };
        const tenant = { id: 'default', dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}` };
        const now = Math.floor(Date.now() / 1000);
        const token = jwt.sign({ id: '1', tenantId: 'default', role: 'admin', iat: now, exp: now + 3600 }, JWT_SECRET);
        jest.spyOn(TenantResolver, 'resolveTenant').mockResolvedValue(tenant);
        jest.spyOn(AuthService, 'authenticateUser').mockResolvedValue({
            id: '1',
            tenantId: 'default',
            role: 'admin',
            token,
        });
        const response = await loginController.login(req);
        await expect(loginController.logout(response.user.token)).resolves.toBeUndefined();
        expect(loginController.isTokenBlacklisted(response.user.token)).toBe(true);
    });

    test('[test 5] rejects logout with empty token', async () => {
        await expect(loginController.logout('')).rejects.toThrow('Token required');
    });

    test('[test 6] rejects login with blacklisted token', async () => {
        const req = { body: { email: 'admin@example.com', password: 'pass123' } };
        const tenant = { id: 'default', dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}` };
        const now = Math.floor(Date.now() / 1000);
        const token = jwt.sign({ id: '1', tenantId: 'default', role: 'admin', iat: now, exp: now + 3600 }, JWT_SECRET);
        // Blacklist the token first
        await loginController.logout(token);
        // Attempt login with the blacklisted token
        jest.spyOn(TenantResolver, 'resolveTenant').mockResolvedValue(tenant);
        jest.spyOn(AuthService, 'authenticateUser').mockResolvedValue({
            id: '1',
            tenantId: 'default',
            role: 'admin',
            token,
        });
        await expect(loginController.login(req)).rejects.toThrow('Token blacklisted');
    });

    test('[test 7] rejects invalid email format', async () => {
        const req = { body: { email: 'invalid-email', password: 'pass123' } };
        jest.spyOn(TenantResolver, 'resolveTenant').mockRejectedValue(
            new Error('Tenant resolution failed for email invalid-email: No tenant associated with email: invalid-email')
        );
        await expect(loginController.login(req)).rejects.toThrow('Tenant resolution failed');
    });

    test('[test 8] rejects empty credentials', async () => {
        const req = { body: { email: '', password: '' } };
        await expect(loginController.login(req)).rejects.toThrow('Email and password are required');
    });

    test('[test 9] rejects expired token', async () => {
        const req = { body: { email: 'admin@example.com', password: 'pass123' } };
        const tenant = { id: 'default', dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}` };
        const now = Math.floor(Date.now() / 1000);
        const expiredToken = jwt.sign(
            { id: '1', tenantId: 'default', role: 'admin', iat: now - 7200, exp: now - 3600 },
            JWT_SECRET
        );
        jest.spyOn(TenantResolver, 'resolveTenant').mockResolvedValue(tenant);
        jest.spyOn(AuthService, 'authenticateUser').mockResolvedValue({
            id: '1',
            tenantId: 'default',
            role: 'admin',
            token: expiredToken,
        });
        await expect(loginController.login(req)).rejects.toThrow('jwt expired');
    });

    test('[test 10] rejects missing password', async () => {
        const req = { body: { email: 'admin@example.com', password: '' } };
        await expect(loginController.login(req)).rejects.toThrow('Email and password are required');
    });

    test('[test 11] verifies token blacklist check', async () => {
        const token = 'test-token';
        expect(loginController.isTokenBlacklisted(token)).toBe(false);
        await loginController.logout(token);
        expect(loginController.isTokenBlacklisted(token)).toBe(true);
    });
});