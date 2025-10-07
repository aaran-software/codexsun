import { authenticateUser } from '../../../cortex/core/auth/auth-service';
import { Tenant, Credentials } from '../../../cortex/core/app.types';
import { Connection } from '../../../cortex/db/connection';
import { tenantStorage, query } from '../../../cortex/db/db';
import * as jwt from 'jsonwebtoken';

const TEST_DB = process.env.DB_NAME || 'tenant_db';
const JWT_SECRET = process.env.APP_KEY || 'default-secret-please-replace';

describe('[17.] Authentication with Tenant Context', () => {
    let connection: Connection;

    beforeAll(async () => {
        // Initialize test database with MariaDB
        const testConfig = {
            type: 'mariadb' as const,
            database: TEST_DB,
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

        // Create users table
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

        // Seed test user
        await tenantStorage.run(TEST_DB, () =>
            query(
                `INSERT INTO users (id, email, password_hash, tenant_id, role, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
                ['user1', 'john@tenant1.com', 'pass123', 'tenant1', 'admin']
            )
        );
    });

    afterAll(async () => {
        // Cleanup test database
        await tenantStorage.run(TEST_DB, () => query(`DROP TABLE users`, []));
        await connection.close();
    });

    test('[test 1] authenticates user in tenant-specific DB', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://${process.env.DB_USER || 'root'}:${process.env.DB_PASS || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}/${TEST_DB}`
        };
        const credentials: Credentials = { email: 'john@tenant1.com', password: 'pass123' };

        const user = await authenticateUser(credentials, tenant);

        expect(user).toEqual({
            id: 'user1',
            tenantId: 'tenant1',
            role: 'admin',
            token: expect.any(String),
        });

        // Verify JWT token
        const decoded = jwt.verify(user.token, JWT_SECRET) as jwt.JwtPayload;
        expect(decoded).toMatchObject({
            id: 'user1',
            tenantId: 'tenant1',
            role: 'admin',
        });
        expect(user.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });

    test('[test 2] rejects invalid password in tenant DB', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://${process.env.DB_USER || 'root'}:${process.env.DB_PASS || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}/${TEST_DB}`
        };
        const credentials: Credentials = { email: 'john@tenant1.com', password: 'wrongpass' };

        await expect(authenticateUser(credentials, tenant)).rejects.toThrow('Invalid credentials');
    });

    test('[test 3] rejects user with mismatched tenant', async () => {
        const tenant: Tenant = {
            id: 'tenant2',
            dbConnection: `mariadb://${process.env.DB_USER || 'root'}:${process.env.DB_PASS || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}/${TEST_DB}`
        };
        const credentials: Credentials = { email: 'john@tenant1.com', password: 'pass123' };

        await expect(authenticateUser(credentials, tenant)).rejects.toThrow('Invalid credentials');
    });
});