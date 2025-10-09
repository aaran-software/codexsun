import { IncomingMessage, ServerResponse } from 'node:http';
import { UserController } from '../cortex/user/user.controller';
import * as userService from '../cortex/user/user.service';
import { User } from '../cortex/user/user.model';
import { Logger } from '../cortex/logger/logger';

// Mock dependencies
jest.mock('../cortex/user/user.service');
jest.mock('../cortex/logger/logger');

const mockUser: User & { tenant_id?: string } = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    mobile: '1234567890',
    status: 'active',
    role_id: 1,
    email_verified: null,
    created_at: '2025-10-09T12:00:00Z',
    updated_at: '2025-10-09T12:00:00Z',
    tenant_id: 'tenant1',
};

describe('[31.] UserController', () => {
    let mockRequest: Partial<IncomingMessage>;
    let mockResponse: Partial<ServerResponse>;
    let writeHeadMock: jest.Mock;
    let endMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        writeHeadMock = jest.fn();
        endMock = jest.fn();
        mockRequest = {
            url: '',
            headers: {},
            on: jest.fn(),
        };
        mockResponse = {
            writeHead: writeHeadMock,
            end: endMock,
        };
        (Logger.prototype.info as jest.Mock) = jest.fn();
        (Logger.prototype.error as jest.Mock) = jest.fn();
    });

    describe('[1.] create', () => {
        it('[test 1] should create a user and return 201 with user data', async () => {
            const input = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                tenant_id: 'tenant1',
            };
            (userService.createUserService as jest.Mock).mockResolvedValue(mockUser);
            mockRequest.on = jest.fn((event, callback) => {
                if (event === 'data') callback(JSON.stringify(input));
                if (event === 'end') callback();
                return mockRequest;
            });

            await UserController.create(mockRequest as IncomingMessage, mockResponse as ServerResponse);

            expect(userService.createUserService).toHaveBeenCalledWith(input);
            expect(writeHeadMock).toHaveBeenCalledWith(201, { 'Content-Type': 'application/json' });
            expect(endMock).toHaveBeenCalledWith(JSON.stringify({
                id: mockUser.id,
                username: mockUser.username,
                email: mockUser.email,
                mobile: mockUser.mobile,
                status: mockUser.status,
                role_id: mockUser.role_id,
                email_verified: mockUser.email_verified,
                created_at: mockUser.created_at,
                updated_at: mockUser.updated_at
            }));
        });

        it('[test 2] should return 400 if tenant_id is missing', async () => {
            const input = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
            };
            mockRequest.on = jest.fn((event, callback) => {
                if (event === 'data') callback(JSON.stringify(input));
                if (event === 'end') callback();
                return mockRequest;
            });

            await UserController.create(mockRequest as IncomingMessage, mockResponse as ServerResponse);

            expect(writeHeadMock).toHaveBeenCalledWith(400, { 'Content-Type': 'application/json' });
            expect(endMock).toHaveBeenCalledWith(JSON.stringify({ error: 'Tenant ID is required' }));
        });

        it('[test 3] should return 400 on invalid JSON', async () => {
            mockRequest.on = jest.fn((event, callback) => {
                if (event === 'data') callback('invalid json');
                if (event === 'end') callback();
                return mockRequest;
            });

            await UserController.create(mockRequest as IncomingMessage, mockResponse as ServerResponse);

            expect(writeHeadMock).toHaveBeenCalledWith(400, { 'Content-Type': 'application/json' });
            const calledWith = endMock.mock.calls[0][0];
            const response = JSON.parse(calledWith);
            expect(response).toHaveProperty('error');
            expect(typeof response.error).toBe('string');
        });
    });

    describe('[2.] getAll', () => {
        it('[test 4] should return a list of users for a tenant', async () => {
            mockRequest.url = '/api/users?tenant_id=tenant1';
            (userService.getUsersService as jest.Mock).mockResolvedValue([mockUser]);

            await UserController.getAll(mockRequest as IncomingMessage, mockResponse as ServerResponse);

            expect(userService.getUsersService).toHaveBeenCalledWith('tenant1');
            expect(writeHeadMock).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
            expect(endMock).toHaveBeenCalledWith(JSON.stringify([{
                id: mockUser.id,
                username: mockUser.username,
                email: mockUser.email,
                mobile: mockUser.mobile,
                status: mockUser.status,
                role_id: mockUser.role_id,
                email_verified: mockUser.email_verified,
                created_at: mockUser.created_at,
                updated_at: mockUser.updated_at
            }]));
        });

        it('[test 5] should return 400 if tenant_id is missing', async () => {
            mockRequest.url = '/api/users';

            await UserController.getAll(mockRequest as IncomingMessage, mockResponse as ServerResponse);

            expect(writeHeadMock).toHaveBeenCalledWith(400, { 'Content-Type': 'application/json' });
            expect(endMock).toHaveBeenCalledWith(JSON.stringify({ error: 'Tenant ID is required' }));
        });
    });

    describe('[3.] getById', () => {
        it('[test 6] should return a user by ID', async () => {
            mockRequest.url = '/api/users/1?tenant_id=tenant1';
            (userService.getUserByIdService as jest.Mock).mockResolvedValue(mockUser);

            await UserController.getById(mockRequest as IncomingMessage, mockResponse as ServerResponse);

            expect(userService.getUserByIdService).toHaveBeenCalledWith(1, 'tenant1');
            expect(writeHeadMock).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
            expect(endMock).toHaveBeenCalledWith(JSON.stringify({
                id: mockUser.id,
                username: mockUser.username,
                email: mockUser.email,
                mobile: mockUser.mobile,
                status: mockUser.status,
                role_id: mockUser.role_id,
                email_verified: mockUser.email_verified,
                created_at: mockUser.created_at,
                updated_at: mockUser.updated_at
            }));
        });

        it('[test 7] should return 404 if user not found', async () => {
            mockRequest.url = '/api/users/1?tenant_id=tenant1';
            (userService.getUserByIdService as jest.Mock).mockResolvedValue(null);

            await UserController.getById(mockRequest as IncomingMessage, mockResponse as ServerResponse);

            expect(userService.getUserByIdService).toHaveBeenCalledWith(1, 'tenant1');
            expect(writeHeadMock).toHaveBeenCalledWith(404, { 'Content-Type': 'application/json' });
            expect(endMock).toHaveBeenCalledWith(JSON.stringify({ error: 'User not found' }));
        });

        it('[test 8] should return 400 if user ID or tenant_id is missing', async () => {
            mockRequest.url = '/api/users/0';

            await UserController.getById(mockRequest as IncomingMessage, mockResponse as ServerResponse);

            expect(writeHeadMock).toHaveBeenCalledWith(400, { 'Content-Type': 'application/json' });
            expect(endMock).toHaveBeenCalledWith(JSON.stringify({ error: 'User ID and Tenant ID are required' }));
        });
    });

    describe('[4.] update', () => {
        it('[test 9] should update a user and return updated data', async () => {
            const updates = { username: 'updateduser', email: 'updated@example.com' };
            const updatedUser = { ...mockUser, ...updates };
            mockRequest.url = '/api/users/1?tenant_id=tenant1';
            mockRequest.on = jest.fn((event, callback) => {
                if (event === 'data') callback(JSON.stringify(updates));
                if (event === 'end') callback();
                return mockRequest;
            });
            (userService.updateUserService as jest.Mock).mockResolvedValue(updatedUser);

            await UserController.update(mockRequest as IncomingMessage, mockResponse as ServerResponse);

            expect(userService.updateUserService).toHaveBeenCalledWith(1, updates, 'tenant1');
            expect(writeHeadMock).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
            expect(endMock).toHaveBeenCalledWith(JSON.stringify({
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                mobile: updatedUser.mobile,
                status: updatedUser.status,
                role_id: updatedUser.role_id,
                email_verified: updatedUser.email_verified,
                created_at: updatedUser.created_at,
                updated_at: updatedUser.updated_at
            }));
        });

        it('[test 10] should return 404 if update fails', async () => {
            mockRequest.url = '/api/users/1?tenant_id=tenant1';
            mockRequest.on = jest.fn((event, callback) => {
                if (event === 'data') callback(JSON.stringify({ username: 'updateduser' }));
                if (event === 'end') callback();
                return mockRequest;
            });
            (userService.updateUserService as jest.Mock).mockResolvedValue(null);

            await UserController.update(mockRequest as IncomingMessage, mockResponse as ServerResponse);

            expect(userService.updateUserService).toHaveBeenCalledWith(1, { username: 'updateduser' }, 'tenant1');
            expect(writeHeadMock).toHaveBeenCalledWith(404, { 'Content-Type': 'application/json' });
            expect(endMock).toHaveBeenCalledWith(JSON.stringify({ error: 'User not found or update failed' }));
        });

        it('[test 11] should return 400 on invalid JSON', async () => {
            mockRequest.url = '/api/users/1?tenant_id=tenant1';
            mockRequest.on = jest.fn((event, callback) => {
                if (event === 'data') callback('invalid json');
                if (event === 'end') callback();
                return mockRequest;
            });

            await UserController.update(mockRequest as IncomingMessage, mockResponse as ServerResponse);

            expect(writeHeadMock).toHaveBeenCalledWith(400, { 'Content-Type': 'application/json' });
            const calledWith = endMock.mock.calls[0][0];
            const response = JSON.parse(calledWith);
            expect(response).toHaveProperty('error');
            expect(typeof response.error).toBe('string');
        });
    });

    describe('[5.] delete', () => {
        it('[test 12] should delete a user and return 200', async () => {
            mockRequest.url = '/api/users/1?tenant_id=tenant1';
            (userService.deleteUserService as jest.Mock).mockResolvedValue(true);

            await UserController.delete(mockRequest as IncomingMessage, mockResponse as ServerResponse);

            expect(userService.deleteUserService).toHaveBeenCalledWith(1, 'tenant1');
            expect(writeHeadMock).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
            expect(endMock).toHaveBeenCalledWith(JSON.stringify({ message: 'User deleted successfully' }));
        });

        it('[test 13] should return 404 if deletion fails', async () => {
            mockRequest.url = '/api/users/1?tenant_id=tenant1';
            (userService.deleteUserService as jest.Mock).mockResolvedValue(false);

            await UserController.delete(mockRequest as IncomingMessage, mockResponse as ServerResponse);

            expect(userService.deleteUserService).toHaveBeenCalledWith(1, 'tenant1');
            expect(writeHeadMock).toHaveBeenCalledWith(404, { 'Content-Type': 'application/json' });
            expect(endMock).toHaveBeenCalledWith(JSON.stringify({ error: 'User not found or deletion failed' }));
        });

        it('[test 14] should return 400 if user ID or tenant_id is missing', async () => {
            mockRequest.url = '/api/users/0';

            await UserController.delete(mockRequest as IncomingMessage, mockResponse as ServerResponse);

            expect(writeHeadMock).toHaveBeenCalledWith(400, { 'Content-Type': 'application/json' });
            expect(endMock).toHaveBeenCalledWith(JSON.stringify({ error: 'User ID and Tenant ID are required' }));
        });
    });
});