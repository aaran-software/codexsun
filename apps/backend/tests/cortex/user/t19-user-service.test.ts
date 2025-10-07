import { createUser, getUser } from '../../../cortex/core/user/user-service';
import { Tenant, UserData, StoredUser } from '../../../cortex/core/app.types';
import { Connection } from '../../../cortex/db/connection';
import { tenantStorage, query } from '../../../cortex/db/db';
import { logError, logConnection, logQuery } from '../../../cortex/config/logger';
import { getTenantDbConnection } from '../../../cortex/db/db-context-switcher';

// Mock logger functions
jest.mock('../../../cortex/config/logger', () => ({
    logError: jest.fn(),
    logConnection: jest.fn(),
    logQuery: jest.fn(),
}));

// Mock getTenantDbConnection to return a mock connection
jest.mock('../../../cortex/db/db-context-switcher', () => ({
    getTenantDbConnection: jest.fn(),
}));

// Mock query and tenantStorage
jest.mock('../../../cortex/db/db', () => ({
    query: jest.fn(),
    tenantStorage: {
        run: jest.fn((db, fn) => fn()),
    },
}));

const TEST_DB = 'tenant_db';
const mockConnection = {
    query: jest.fn(),
    release: jest.fn(),
    close: jest.fn(),
};

describe('[19.] User Service', () => {
    let connection: Connection;

    beforeAll(async () => {
        const testConfig = {
            type: 'mariadb' as const,
            database: TEST_DB,
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '',
            ssl: false,
            connectionLimit: 10,
            acquireTimeout: 10000,
            idleTimeout: 10000,
        };

        jest.spyOn(Connection, 'initialize').mockResolvedValue(mockConnection as any);
        connection = await Connection.initialize(testConfig);

        (query as jest.Mock)
            .mockResolvedValueOnce({}) // CREATE TABLE
            .mockResolvedValueOnce({}); // INSERT user1
        await tenantStorage.run(TEST_DB, () =>
            query(
                `CREATE TABLE users (
                                        id VARCHAR(255) PRIMARY KEY,
                                        username VARCHAR(255),
                                        email VARCHAR(255) UNIQUE NOT NULL,
                                        tenant_id VARCHAR(50) NOT NULL,
                                        created_at DATETIME,
                                        updated_at DATETIME
                 )`,
                []
            )
        );

        await tenantStorage.run(TEST_DB, () =>
            query(
                `INSERT INTO users (id, username, email, tenant_id, created_at, updated_at)
                 VALUES (?, ?, ?, ?, NOW(), NOW())`,
                ['user1', 'Existing User', 'existing@tenant1.com', 'tenant1']
            )
        );
    });

    afterAll(async () => {
        (query as jest.Mock).mockResolvedValueOnce({});
        await tenantStorage.run(TEST_DB, () => query(`DROP TABLE users`, []));
        await connection.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (getTenantDbConnection as jest.Mock).mockImplementation(async (tenant) => {
            logConnection('success', { db: tenant.id, connectionString: tenant.dbConnection });
            return mockConnection;
        });
    });

    test('[test 1] creates user in tenant DB for v1', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}`,
        };
        const userData: UserData = { name: 'John Doe', email: 'john@tenant1.com', tenantId: 'tenant1' };

        (mockConnection.query as jest.Mock)
            .mockImplementationOnce(async () => {
                logQuery('end', { sql: 'SELECT...', params: [], db: tenant.id });
                return { rows: [] }; // queryUser (no existing user)
            })
            .mockImplementationOnce(async () => {
                logQuery('end', { sql: 'INSERT...', params: [], db: tenant.id });
                return { insertId: 'user123' }; // createUserInDb
            });

        const user = await createUser(userData, tenant, 'v1');
        expect(user).toMatchObject({
            id: 'user123',
            name: 'John Doe',
            email: 'john@tenant1.com',
            tenantId: 'tenant1',
        });
        expect(logError).not.toHaveBeenCalled();
        expect(logConnection).toHaveBeenCalledWith('success', expect.objectContaining({
            db: tenant.id,
            connectionString: tenant.dbConnection,
        }));
        expect(logQuery).toHaveBeenCalledTimes(2); // queryUser + createUserInDb
    });

    test('[test 2] creates user in tenant DB for v2', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}`,
        };
        const userData: UserData = { name: 'Jane Doe', email: 'jane@tenant1.com', tenantId: 'tenant1' };

        (mockConnection.query as jest.Mock)
            .mockImplementationOnce(async () => {
                logQuery('end', { sql: 'SELECT...', params: [], db: tenant.id });
                return { rows: [] };
            })
            .mockImplementationOnce(async () => {
                logQuery('end', { sql: 'INSERT...', params: [], db: tenant.id });
                return { insertId: 'user124' };
            });

        const user = await createUser(userData, tenant, 'v2');
        expect(user).toMatchObject({
            id: 'user124',
            name: 'Jane Doe',
            email: 'jane@tenant1.com',
            tenantId: 'tenant1',
        });
        expect(logError).not.toHaveBeenCalled();
        expect(logConnection).toHaveBeenCalledWith('success', expect.objectContaining({
            db: tenant.id,
            connectionString: tenant.dbConnection,
        }));
        expect(logQuery).toHaveBeenCalledTimes(2);
    });

    test('[test 3] creates user with default version', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}`,
        };
        const userData: UserData = { name: 'Bob Smith', email: 'bob@tenant1.com', tenantId: 'tenant1' };

        (mockConnection.query as jest.Mock)
            .mockImplementationOnce(async () => {
                logQuery('end', { sql: 'SELECT...', params: [], db: tenant.id });
                return { rows: [] };
            })
            .mockImplementationOnce(async () => {
                logQuery('end', { sql: 'INSERT...', params: [], db: tenant.id });
                return { insertId: 'user125' };
            });

        const user = await createUser(userData, tenant);
        expect(user).toMatchObject({
            id: 'user125',
            name: 'Bob Smith',
            email: 'bob@tenant1.com',
            tenantId: 'tenant1',
        });
        expect(logError).not.toHaveBeenCalled();
        expect(logConnection).toHaveBeenCalledWith('success', expect.objectContaining({
            db: tenant.id,
            connectionString: tenant.dbConnection,
        }));
        expect(logQuery).toHaveBeenCalledTimes(2);
    });

    test('[test 4] fetches user from tenant DB', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}`,
        };

        (mockConnection.query as jest.Mock).mockImplementationOnce(async () => {
            logQuery('end', { sql: 'SELECT...', params: [], db: tenant.id });
            return {
                rows: [{ id: 'user1', name: 'Existing User', email: 'existing@tenant1.com', tenantId: 'tenant1' }],
            };
        });

        const user = await getUser('user1', tenant);
        expect(user).toMatchObject({
            id: 'user1',
            name: 'Existing User',
            email: 'existing@tenant1.com',
            tenantId: 'tenant1',
        });
        expect(logError).not.toHaveBeenCalled();
        expect(logConnection).toHaveBeenCalledWith('success', expect.objectContaining({
            db: tenant.id,
            connectionString: tenant.dbConnection,
        }));
        expect(logQuery).toHaveBeenCalledTimes(1); // queryUser
    });

    test('[test 5] rejects user creation for wrong tenant', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}`,
        };
        const userData: UserData = { name: 'John Doe', email: 'john@tenant1.com', tenantId: 'tenant2' };

        await expect(createUser(userData, tenant, 'v1')).rejects.toThrow('Tenant mismatch');
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Tenant mismatch',
            tenantId: 'tenant1',
            version: 'v1',
        }));
        expect(logConnection).not.toHaveBeenCalled();
        expect(logQuery).not.toHaveBeenCalled();
    });

    test('[test 6] rejects user creation with duplicate email', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}`,
        };
        const userData: UserData = { name: 'Duplicate User', email: 'existing@tenant1.com', tenantId: 'tenant1' };

        (mockConnection.query as jest.Mock).mockImplementationOnce(async () => {
            logQuery('end', { sql: 'SELECT...', params: [], db: tenant.id });
            return {
                rows: [{ id: 'user1', name: 'Existing User', email: 'existing@tenant1.com', tenantId: 'tenant1' }],
            };
        });

        await expect(createUser(userData, tenant, 'v1')).rejects.toThrow('User already exists');
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'User already exists',
            tenantId: 'tenant1',
            version: 'v1',
        }));
        expect(logConnection).toHaveBeenCalledWith('success', expect.objectContaining({
            db: tenant.id,
            connectionString: tenant.dbConnection,
        }));
        expect(logQuery).toHaveBeenCalledTimes(1); // queryUser
    });

    test('[test 7] rejects user fetch with non-existent ID', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}`,
        };

        (mockConnection.query as jest.Mock).mockImplementationOnce(async () => {
            logQuery('end', { sql: 'SELECT...', params: [], db: tenant.id });
            return { rows: [] };
        });

        await expect(getUser('nonexistent', tenant)).rejects.toThrow('User not found');
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'User not found',
            tenantId: 'tenant1',
            version: 'unknown',
        }));
        expect(logConnection).toHaveBeenCalledWith('success', expect.objectContaining({
            db: tenant.id,
            connectionString: tenant.dbConnection,
        }));
        expect(logQuery).toHaveBeenCalledTimes(1);
    });

    test('[test 8] creates user in different tenant DB', async () => {
        (query as jest.Mock).mockResolvedValueOnce({});
        await tenantStorage.run(TEST_DB, () =>
            query(
                `INSERT INTO users (id, username, email, tenant_id, created_at, updated_at)
                 VALUES (?, ?, ?, ?, NOW(), NOW())`,
                ['user2', 'Tenant2 User', 'user@tenant2.com', 'tenant2']
            )
        );

        const tenant: Tenant = {
            id: 'tenant2',
            dbConnection: `mariadb://root:@localhost:3306/${TEST_DB}`,
        };
        const userData: UserData = { name: 'Jane Doe', email: 'jane@tenant2.com', tenantId: 'tenant2' };

        (mockConnection.query as jest.Mock)
            .mockImplementationOnce(async () => {
                logQuery('end', { sql: 'SELECT...', params: [], db: tenant.id });
                return { rows: [] };
            })
            .mockImplementationOnce(async () => {
                logQuery('end', { sql: 'INSERT...', params: [], db: tenant.id });
                return { insertId: 'user126' };
            });

        const user = await createUser(userData, tenant, 'v1');
        expect(user).toMatchObject({
            id: 'user126',
            name: 'Jane Doe',
            email: 'jane@tenant2.com',
            tenantId: 'tenant2',
        });
        expect(logError).not.toHaveBeenCalled();
        expect(logConnection).toHaveBeenCalledWith('success', expect.objectContaining({
            db: tenant.id,
            connectionString: tenant.dbConnection,
        }));
        expect(logQuery).toHaveBeenCalledTimes(2); // queryUser + createUserInDb (seed query is mocked separately)
    });

    test('[test 9] handles database connection error', async () => {
        const tenant: Tenant = {
            id: 'tenant1',
            dbConnection: 'mariadb://invalid:invalid@localhost:9999/invalid_db',
        };
        const userData: UserData = { name: 'John Doe', email: 'john@invalid.com', tenantId: 'tenant1' };

        (getTenantDbConnection as jest.Mock).mockImplementationOnce(async () => {
            logConnection('error', { db: tenant.id, connectionString: tenant.dbConnection, error: 'Connection failed' });
            throw new Error('Connection failed');
        });

        await expect(createUser(userData, tenant, 'v1')).rejects.toThrow('Connection failed');
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Connection failed',
            tenantId: 'tenant1',
            version: 'v1',
        }));
        expect(logConnection).toHaveBeenCalledWith('error', expect.objectContaining({
            db: tenant.id,
            connectionString: tenant.dbConnection,
            error: 'Connection failed',
        }));
        expect(logQuery).not.toHaveBeenCalled();
    });
});