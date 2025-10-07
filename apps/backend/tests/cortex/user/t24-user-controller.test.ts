import { createUser } from '../../../cortex/core/user/user-controller';
import { RequestContext, Tenant, User, UserData } from '../../../cortex/core/app.types';
import { logError } from '../../../cortex/config/logger';
import { createUser as createUserService } from '../../../cortex/core/user/user-service';

// Mock logger to prevent actual logging during tests
jest.mock('../../../cortex/config/logger', () => ({
    logError: jest.fn(),
}));

// Mock user-service to control createUser behavior
jest.mock('../../../cortex/core/user/user-service', () => ({
    createUser: jest.fn(),
}));

describe('[10.] User Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('[test 1] creates user and returns user data for v1', async () => {
        const mockUser = { id: 'user1', name: 'John Doe', email: 'john@tenant1.com', tenantId: 'tenant1' };
        (createUserService as jest.Mock).mockResolvedValue(mockUser);

        const req = {
            body: { name: 'John Doe', email: 'john@tenant1.com' } as Omit<UserData, 'tenantId'>,
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'admin1', tenantId: 'tenant1', role: 'admin', token: 'mocked.token' },
            } as RequestContext,
            version: 'v1',
        };

        const response = await createUser(req);
        expect(response).toEqual({ user: mockUser });
        expect(createUserService).toHaveBeenCalledWith(
            { name: 'John Doe', email: 'john@tenant1.com', tenantId: 'tenant1' },
            req.context.tenant,
            'v1'
        );
        expect(logError).not.toHaveBeenCalled();
    });

    test('[test 2] creates user and returns user data for v2', async () => {
        const mockUser = { id: 'user1', name: 'John Doe', email: 'john@tenant1.com', tenantId: 'tenant1' };
        (createUserService as jest.Mock).mockResolvedValue(mockUser);

        const req = {
            body: { name: 'John Doe', email: 'john@tenant1.com' } as Omit<UserData, 'tenantId'>,
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'admin1', tenantId: 'tenant1', role: 'admin', token: 'mocked.token' },
            } as RequestContext,
            version: 'v2',
        };

        const response = await createUser(req);
        expect(response).toEqual({ user: mockUser });
        expect(createUserService).toHaveBeenCalledWith(
            { name: 'John Doe', email: 'john@tenant1.com', tenantId: 'tenant1' },
            req.context.tenant,
            'v2'
        );
        expect(logError).not.toHaveBeenCalled();
    });

    test('[test 3] creates user with default version when version is undefined', async () => {
        const mockUser = { id: 'user1', name: 'John Doe', email: 'john@tenant1.com', tenantId: 'tenant1' };
        (createUserService as jest.Mock).mockResolvedValue(mockUser);

        const req = {
            body: { name: 'John Doe', email: 'john@tenant1.com' } as Omit<UserData, 'tenantId'>,
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'admin1', tenantId: 'tenant1', role: 'admin', token: 'mocked.token' },
            } as RequestContext,
            // version is undefined
        };

        const response = await createUser(req);
        expect(response).toEqual({ user: mockUser });
        expect(createUserService).toHaveBeenCalledWith(
            { name: 'John Doe', email: 'john@tenant1.com', tenantId: 'tenant1' },
            req.context.tenant,
            'v1' // Default version
        );
        expect(logError).not.toHaveBeenCalled();
    });

    test('[test 4] rejects user creation for missing tenant context', async () => {
        const req = {
            body: { name: 'John Doe', email: 'john@tenant1.com' } as Omit<UserData, 'tenantId'>,
            context: {} as RequestContext,
            version: 'v1',
        };

        await expect(createUser(req)).rejects.toThrow('Tenant context required');
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Tenant context required',
            tenantId: 'unknown',
            version: 'v1',
        }));
        expect(createUserService).not.toHaveBeenCalled();
    });

    test('[test 5] rejects user creation for missing user context', async () => {
        const req = {
            body: { name: 'John Doe', email: 'john@tenant1.com' } as Omit<UserData, 'tenantId'>,
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: undefined,
            } as RequestContext,
            version: 'v1',
        };

        await expect(createUser(req)).rejects.toThrow('Admin role required');
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Admin role required',
            tenantId: 'tenant1',
            version: 'v1',
        }));
        expect(createUserService).not.toHaveBeenCalled();
    });

    test('[test 6] rejects user creation for non-admin user', async () => {
        const req = {
            body: { name: 'John Doe', email: 'john@tenant1.com' } as Omit<UserData, 'tenantId'>,
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'user1', tenantId: 'tenant1', role: 'user', token: 'mocked.token' },
            } as RequestContext,
            version: 'v1',
        };

        await expect(createUser(req)).rejects.toThrow('Admin role required');
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Admin role required',
            tenantId: 'tenant1',
            version: 'v1',
        }));
        expect(createUserService).not.toHaveBeenCalled();
    });

    test('[test 7] handles tenant mismatch error from createUserService', async () => {
        const error = new Error('Tenant mismatch');
        (createUserService as jest.Mock).mockRejectedValue(error);

        const req = {
            body: { name: 'John Doe', email: 'john@tenant1.com' } as Omit<UserData, 'tenantId'>,
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'admin1', tenantId: 'tenant1', role: 'admin', token: 'mocked.token' },
            } as RequestContext,
            version: 'v1',
        };

        await expect(createUser(req)).rejects.toThrow('Tenant mismatch');
        expect(createUserService).toHaveBeenCalledWith(
            { name: 'John Doe', email: 'john@tenant1.com', tenantId: 'tenant1' },
            req.context.tenant,
            'v1'
        );
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Tenant mismatch',
            tenantId: 'tenant1',
            version: 'v1',
        }));
    });

    test('[test 8] handles user already exists error from createUserService', async () => {
        const error = new Error('User already exists');
        (createUserService as jest.Mock).mockRejectedValue(error);

        const req = {
            body: { name: 'John Doe', email: 'john@tenant1.com' } as Omit<UserData, 'tenantId'>,
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'admin1', tenantId: 'tenant1', role: 'admin', token: 'mocked.token' },
            } as RequestContext,
            version: 'v1',
        };

        await expect(createUser(req)).rejects.toThrow('User already exists');
        expect(createUserService).toHaveBeenCalledWith(
            { name: 'John Doe', email: 'john@tenant1.com', tenantId: 'tenant1' },
            req.context.tenant,
            'v1'
        );
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'User already exists',
            tenantId: 'tenant1',
            version: 'v1',
        }));
    });

    test('[test 9] handles unexpected error from createUserService', async () => {
        const error = new Error('Unexpected database error');
        (createUserService as jest.Mock).mockRejectedValue(error);

        const req = {
            body: { name: 'John Doe', email: 'john@tenant1.com' } as Omit<UserData, 'tenantId'>,
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'admin1', tenantId: 'tenant1', role: 'admin', token: 'mocked.token' },
            } as RequestContext,
            version: 'v1',
        };

        await expect(createUser(req)).rejects.toThrow('Unexpected database error');
        expect(createUserService).toHaveBeenCalledWith(
            { name: 'John Doe', email: 'john@tenant1.com', tenantId: 'tenant1' },
            req.context.tenant,
            'v1'
        );
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Unexpected database error',
            tenantId: 'tenant1',
            version: 'v1',
        }));
    });

    test('[test 10] handles non-Error object thrown from createUserService', async () => {
        const error = 'Non-Error object error';
        (createUserService as jest.Mock).mockRejectedValue(error);

        const req = {
            body: { name: 'John Doe', email: 'john@tenant1.com' } as Omit<UserData, 'tenantId'>,
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'admin1', tenantId: 'tenant1', role: 'admin', token: 'mocked.token' },
            } as RequestContext,
            version: 'v1',
        };

        await expect(createUser(req)).rejects.toThrow('Unknown error');
        expect(createUserService).toHaveBeenCalledWith(
            { name: 'John Doe', email: 'john@tenant1.com', tenantId: 'tenant1' },
            req.context.tenant,
            'v1'
        );
        expect(logError).toHaveBeenCalledWith('error', expect.objectContaining({
            error: 'Unknown error',
            tenantId: 'tenant1',
            version: 'v1',
        }));
    });
});