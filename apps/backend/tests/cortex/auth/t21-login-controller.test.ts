import { login, logout } from '../../../cortex/core/auth/login-controller';
import { Tenant, Credentials } from '../../../cortex/core/app.types';
import { Connection } from '../../../cortex/db/connection';
import { tenantStorage, query } from '../../../cortex/db/db';
import * as jwt from 'jsonwebtoken';
import * as authService from '../../../cortex/core/auth/auth-service';

const TEST_DB = process.env.DB_NAME || 'tenant_db';
const MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';
const JWT_SECRET = process.env.APP_KEY || 'default-secret-please-replace';

describe('[21.] Login Controller', () => {
    let connection: Connection;

    beforeAll(async () => {
        // Initialize test database with MariaDB
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

        // Drop and create tenant_users table in master DB
        await tenantStorage.run(MASTER_DB, () =>
            query(`DROP TABLE IF EXISTS tenant_users`, [])
        );
        await tenantStorage.run(MASTER_DB, () =>
            query(`
                CREATE TABLE tenant_users (
                                              email VARCHAR(255) UNIQUE NOT NULL,
                                              tenant_id VARCHAR(50) NOT NULL,
                                              created_at DATETIME,
                                              updated_at DATETIME
                )
            `, [])
        );

        // Drop and create users table in tenant DB
        await tenantStorage.run(TEST_DB, () =>
            query(`DROP TABLE IF EXISTS users`, [])
        );
        await tenantStorage.run(TEST_DB, () =>
            query(`
                CREATE TABLE users (
                                       id VARCHAR(255) PRIMARY KEY,
                                       email VARCHAR(255) UNIQUE NOT NULL,
                                       password_hash VARCHAR(255) NOT NULL,
                                       tenant_id VARCHAR(50) NOT NULL,
                                       role VARCHAR(50) NOT NULL,
                                       created_at DATETIME,
                                       updated_at DATETIME
                )
            `, [])
        );

        // Seed tenant_users
        await tenantStorage.run(MASTER_DB, () =>
            query(
                `INSERT INTO tenant_users (email, tenant_id, created_at, updated_at)
                 VALUES (?, ?, NOW(), NOW())`,
                ['admin@example.com', 'default']
            )
        );

        // Seed users with plain password (matching auth-service)
        await tenantStorage.run(TEST_DB, () =>
            query(
                `INSERT INTO users (id, email, password_hash, tenant_id, role, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
                ['1', 'admin@example.com', 'pass123', 'default', 'admin']
            )
        );
    });

    afterAll(async () => {
        // Cleanup test database
        await tenantStorage.run(TEST_DB, () => query(`DROP TABLE IF EXISTS users`, []));
        await tenantStorage.run(MASTER_DB, () => query(`DROP TABLE IF EXISTS tenant_users`, []));
        await connection.close();
    });

    test('[test 1] logs in user and returns tenant and user data', async () => {
        const req = { body: { email: 'admin@example.com', password: 'pass123' } };
        const response = await login(req);
        expect(response).toEqual({
            user: { id: '1', tenantId: 'default', role: 'admin', token: expect.any(String) },
            tenant: { id: 'default', dbConnection: expect.any(String) },
        });
        expect(response.user.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);

        // Verify JWT token
        const decoded = jwt.verify(response.user.token, JWT_SECRET) as jwt.JwtPayload;
        expect(decoded).toMatchObject({
            id: '1',
            tenantId: 'default',
            role: 'admin',
        });
    });

    test('[test 2] rejects invalid credentials', async () => {
        const req = { body: { email: 'admin@example.com', password: 'wrongpass' } };
        await expect(login(req)).rejects.toThrow('Invalid credentials');
    });

    test('[test 3] rejects unknown email', async () => {
        const req = { body: { email: 'unknown@domain.com', password: 'pass123' } };
        await expect(login(req)).rejects.toThrow('Tenant resolution failed');
    });

    test('[test 4] successfully logs out user by blacklisting token', async () => {
        const req = { body: { email: 'admin@example.com', password: 'pass123' } };
        const response = await login(req);
        const token = response.user.token;

        await expect(logout(token)).resolves.toBeUndefined();
    });

    test('[test 5] rejects logout with missing token', async () => {
        await expect(logout('')).rejects.toThrow('No token provided');
    });

    test('[test 6] rejects login with blacklisted token', async () => {
        const req = { body: { email: 'admin@example.com', password: 'pass123' } };
        const response = await login(req);
        const token = response.user.token;

        await logout(token);

        // Mock authenticateUser to check blacklist
        jest.spyOn(authService, 'authenticateUser').mockImplementation(async () => {
            throw new Error('Token is blacklisted');
        });

        await expect(login(req)).rejects.toThrow('Token is blacklisted');
    });
});