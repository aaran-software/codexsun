import { createUser, getUser } from '../../../cortex/core/user/user-service';
import { Tenant, UserData } from '../../../cortex/core/app.types';
import { Connection } from '../../../cortex/db/connection';
import { tenantStorage, query } from '../../../cortex/db/db';

const TEST_DB = process.env.DB_NAME || 'tenant_db';

describe('[5.] User Service', () => {
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
                    username VARCHAR(255),
                    email VARCHAR(255) UNIQUE NOT NULL,
                    tenant_id VARCHAR(50) NOT NULL,
                    created_at DATETIME,
                    updated_at DATETIME
                )
            `, [])
        );

        // Seed test user
        await tenantStorage.run(TEST_DB, () =>
            query(
                `INSERT INTO users (id, username, email, tenant_id, created_at, updated_at)
                 VALUES (?, ?, ?, ?, NOW(), NOW())`,
                ['user1', 'Existing User', 'existing@tenant1.com', 'tenant1']
            )
        );
    });

    afterAll(async () => {
        // Cleanup test database
        await tenantStorage.run(TEST_DB, () => query(`DROP TABLE users`, []));
        await connection.close();
    });

    test('[test 1] creates user in tenant DB', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://${process.env.DB_USER || 'root'}:${process.env.DB_PASS || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}/${TEST_DB}`
        };
        const userData: UserData = { name: 'John Doe', email: 'john@tenant1.com', tenantId: 'tenant1' };

        const user = await createUser(userData, tenant);
        expect(user).toMatchObject({
            id: expect.any(String),
            name: 'John Doe',
            email: 'john@tenant1.com',
            tenantId: 'tenant1',
        });
    });

    test('[test 2] fetches user from tenant DB', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://${process.env.DB_USER || 'root'}:${process.env.DB_PASS || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}/${TEST_DB}`
        };
        const user = await getUser('user1', tenant);
        expect(user).toMatchObject({
            id: 'user1',
            name: 'Existing User',
            email: 'existing@tenant1.com',
            tenantId: 'tenant1',
        });
    });

    test('[test 3] rejects user creation for wrong tenant', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://${process.env.DB_USER || 'root'}:${process.env.DB_PASS || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}/${TEST_DB}`
        };
        const userData: UserData = { name: 'John Doe', email: 'john@tenant1.com', tenantId: 'tenant2' };

        await expect(createUser(userData, tenant)).rejects.toThrow('Tenant mismatch');
    });
});