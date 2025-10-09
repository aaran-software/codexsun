import { createUserService, updateUserService, getUsersService } from '../cortex/user/user.service';
import { User } from '../cortex/user/user.model';
import * as cryptService from '../cortex/core/secret/crypt-service';
import { Connection } from '../cortex/db/connection';
import {query} from "../cortex/db/mdb";

const MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

// Mock the crypt-service to avoid real password hashing
jest.mock('../cortex/core/secret/crypt-service', () => ({
    generateHash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('User Management Service - Live Test', () => {
    const tenantId = 'test-tenant-123';
    let createdUserId: number | undefined;
    let connection: Connection;

    beforeAll(async () => {
        // Initialize database connection
        const testConfig = {
            driver: 'mariadb' as const,
            database: MASTER_DB,
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306', 10),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || 'Computer.1',
            ssl: process.env.DB_SSL === 'true',
            connectionLimit: 10,
            acquireTimeout: 10000,
            idleTimeout: 10000,
        };

        connection = await Connection.initialize(testConfig);

        // Insert a test tenant to satisfy foreign key constraint
        try {
            await query(
                'INSERT INTO tenants (tenant_id) VALUES (?) ON DUPLICATE KEY UPDATE tenant_id = tenant_id',
                [tenantId]
            );
            console.log(`Inserted test tenant: ${tenantId}`);
        } catch (error) {
            console.error('Failed to insert test tenant:', error);
            throw error;
        }
    }, 15000); // Timeout for setup

    afterAll(async () => {
        // Close connection but do not delete data
        if (connection) {
            await connection.close();
            console.log('Database connection closed');
        }
    }, 10000);

    // Test 1: Create a user
    test('should create a user and associate with tenant', async () => {
        const userInput = {
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'testpassword',
            tenant_id: tenantId,
            mobile: '1234567890',
            status: 'active' as const,
            role_id: 1,
            email_verified: null,
        };

        try {
            const createdUser = await createUserService(userInput);

            // Log created user details
            console.log('Created User:', {
                id: createdUser.id,
                username: createdUser.username,
                email: createdUser.email,
                mobile: createdUser.mobile,
                status: createdUser.status,
                role_id: createdUser.role_id,
                email_verified: createdUser.email_verified,
                created_at: createdUser.created_at,
            });

            // Verify creation
            expect(createdUser).toBeDefined();
            expect(createdUser.id).toBeDefined();
            expect(createdUser.username).toBe(userInput.username);
            expect(createdUser.email).toBe(userInput.email);
            expect(createdUser.password_hash).toBe('hashed_password');
            expect(createdUser.mobile).toBe(userInput.mobile);
            expect(createdUser.status).toBe(userInput.status);
            expect(createdUser.role_id).toBe(userInput.role_id);
            expect(createdUser.email_verified).toBe(userInput.email_verified);

            // Store ID for next tests
            createdUserId = createdUser.id;
        } catch (error) {
            console.error('Create user failed:', error);
            throw error;
        }
    }, 10000);

    // Test 2: Update the created user
    test('should update the user email and status', async () => {
        if (!createdUserId) {
            throw new Error('No user ID available for update test');
        }

        const updates: Partial<User> & { password?: string } = {
            email: 'updateduser@example.com',
            status: 'inactive' as const,
        };

        try {
            const updatedUser = await updateUserService(createdUserId, updates, tenantId);

            // Log updated user details
            console.log('Updated User:', {
                id: updatedUser?.id,
                username: updatedUser?.username,
                email: updatedUser?.email,
                mobile: updatedUser?.mobile,
                status: updatedUser?.status,
                role_id: updatedUser?.role_id,
                email_verified: updatedUser?.email_verified,
                created_at: updatedUser?.created_at,
                updated_at: updatedUser?.updated_at,
            });

            // Verify update
            expect(updatedUser).toBeDefined();
            expect(updatedUser!.id).toBe(createdUserId);
            expect(updatedUser!.email).toBe(updates.email);
            expect(updatedUser!.status).toBe(updates.status);
            expect(updatedUser!.username).toBe('testuser'); // Unchanged
            expect(updatedUser!.password_hash).toBe('hashed_password'); // Unchanged
        } catch (error) {
            console.error('Update user failed:', error);
            throw error;
        }
    }, 10000);

    // Test 3: List users and verify the created/updated user
    test('should list users and include the created/updated user', async () => {
        try {
            const users = await getUsersService(tenantId);

            // Log all users
            console.log('All Users for Tenant:', users.map(user => ({
                id: user.id,
                username: user.username,
                email: user.email,
                mobile: user.mobile,
                status: user.status,
                role_id: user.role_id,
                email_verified: user.email_verified,
                created_at: user.created_at,
                updated_at: user.updated_at,
            })));

            // Verify the list contains the updated user
            expect(users).toBeInstanceOf(Array);
            if (createdUserId) {
                const targetUser = users.find(user => user.id === createdUserId);
                expect(targetUser).toBeDefined();
                expect(targetUser!.email).toBe('updateduser@example.com');
                expect(targetUser!.status).toBe('inactive');
                expect(targetUser!.username).toBe('testuser');
            } else {
                console.warn('No createdUserId available, skipping user-specific assertions');
            }
        } catch (error) {
            console.error('List users failed:', error);
            throw error;
        }
    }, 10000);
});