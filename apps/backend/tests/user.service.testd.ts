import { createUserService, updateUserService, getUsersService, deleteUserService, getUserByIdService } from '../cortex/user/user.service';
import { User } from '../cortex/user/user-model';
import { comparePassword, generateHash } from '../cortex/core/secret/crypt-service';
import { Connection } from '../cortex/db/connection';
import { query } from '../cortex/db/mdb';

const MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

describe('User Management Service - Live Test', () => {
    const tenantId = 'test-tenant-123';
    let createdUserId: number | undefined;
    let connection: Connection;
    // Generate unique email using timestamp
    const uniqueEmail = `testuser-${Date.now()}@example.com`;
    const password = 'testpassword';

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
            console.log(`[0.] Inserted test tenant: ${tenantId}`);
        } catch (error) {
            console.error('[0.] Failed to insert test tenant:', error);
            throw error;
        }
    }, 15000); // Timeout for setup

    afterAll(async () => {
        // Close connection but do not delete data
        if (connection) {
            await connection.close();
            console.log('[6.] Database connection closed');
        }
    }, 10000);

    // Test 1: Create a user
    test('[Test 1] should create a user and associate with tenant', async () => {
        const userInput = {
            username: 'testuser',
            email: uniqueEmail,
            password,
            tenant_id: tenantId,
            mobile: '1234567890',
            status: 'active' as const,
            role_id: 1,
            email_verified: null,
        };

        try {
            const createdUser = await createUserService(userInput);

            // Log created user details
            console.log('[1.] Created User:', {
                id: createdUser.id,
                username: createdUser.username,
                email: createdUser.email,
                mobile: createdUser.mobile,
                status: createdUser.status,
                role_id: createdUser.role_id,
                email_verified: createdUser.email_verified,
                created_at: createdUser.created_at,
                updated_at: createdUser.updated_at,
            });

            // Verify creation
            expect(createdUser).toBeDefined();
            expect(createdUser.id).toBeDefined();
            expect(createdUser.username).toBe(userInput.username);
            expect(createdUser.email).toBe(userInput.email);
            expect(createdUser.mobile).toBe(userInput.mobile);
            expect(createdUser.status).toBe(userInput.status);
            expect(createdUser.role_id).toBe(userInput.role_id);
            expect(createdUser.email_verified).toBe(userInput.email_verified);

            // Verify password hash
            const result = await query(
                'SELECT password_hash FROM users WHERE id = ?',
                [createdUser.id]
            );
            const storedHash = result.rows[0]?.password_hash;
            expect(storedHash).toBeDefined();
            expect(await comparePassword(password, storedHash)).toBe(true);

            // Store ID for next tests
            createdUserId = createdUser.id;
        } catch (error) {
            console.error('[1.] Create user failed:', error);
            throw error;
        }
    }, 10000);

    // Test 2: Update the created user
    test('[Test 2] should update the user email and status', async () => {
        if (!createdUserId) {
            throw new Error('[Test 2] No user ID available for update test');
        }

        const updatedEmail = `updateduser-${Date.now()}@example.com`;
        const updates: Partial<User> & { password?: string } = {
            email: updatedEmail,
            status: 'inactive' as const,
        };

        try {
            const updatedUser = await updateUserService(createdUserId, updates, tenantId);

            // Log updated user details
            console.log('[2.] Updated User:', {
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
        } catch (error) {
            console.error('[2.] Update user failed:', error);
            throw error;
        }
    }, 10000);

    // Test 3: List users and verify the created/updated user
    test('[Test 3] should list users and include the created/updated user', async () => {
        try {
            const users = await getUsersService(tenantId);

            // Log all users
            console.log('[3.] All Users for Tenant:', users.map(user => ({
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
                expect(targetUser!.email).toMatch(/^updateduser-\d+@example\.com$/); // Match dynamic email
                expect(targetUser!.status).toBe('inactive');
                expect(targetUser!.username).toBe('testuser');
            } else {
                console.warn('[3.] No createdUserId available, skipping user-specific assertions');
            }
        } catch (error) {
            console.error('[3.] List users failed:', error);
            throw error;
        }
    }, 10000);

    // Test 4: Delete the created user
    test('[Test 4] should delete a user', async () => {
        if (!createdUserId) {
            throw new Error('[Test 4] No user ID available for delete test');
        }

        try {
            const deleted = await deleteUserService(createdUserId, tenantId);

            // Log deletion result
            console.log('[4.] Deleted User:', { userId: createdUserId, success: deleted });

            // Verify deletion
            expect(deleted).toBe(true);

            // Confirm user is no longer in tenant_users (and users, due to cascade)
            const user = await getUserByIdService(createdUserId, tenantId);
            expect(user).toBeNull();
        } catch (error) {
            console.error('[4.] Delete user failed:', error);
            throw error;
        }
    }, 10000);

    // Test 5: Create 10 users, update 5, delete 3 randomly with sequence
    test('[Test 5] should create 10 users, update 5, delete 3 randomly, and follow sequence', async () => {
        const userIds: number[] = [];
        const baseTimestamp = Date.now();

        // Create 10 users
        try {
            for (let i = 0; i < 10; i++) {
                const userInput = {
                    username: `testuser${i + 1}`,
                    email: `testuser${i + 1}-${baseTimestamp + i}@example.com`,
                    password,
                    tenant_id: tenantId,
                    mobile: '1234567890',
                    status: 'active' as const,
                    role_id: 1,
                    email_verified: null,
                };

                const createdUser = await createUserService(userInput);
                userIds.push(createdUser.id!);

                // Log created user
                console.log(`[5.${i + 1}] Created User ${i + 1}:`, {
                    id: createdUser.id,
                    username: createdUser.username,
                    email: createdUser.email,
                    status: createdUser.status,
                });

                // Verify password hash
                const result = await query('SELECT password_hash FROM users WHERE id = ?', [createdUser.id]);
                const storedHash = result.rows[0]?.password_hash;
                expect(storedHash).toBeDefined();
                expect(await comparePassword(password, storedHash)).toBe(true);
            }

            expect(userIds.length).toBe(10);

            // Sequence: Update 5 users
            const usersToUpdate = userIds.slice(0, 5); // First 5 users
            for (let i = 0; i < usersToUpdate.length; i++) {
                const userId = usersToUpdate[i];
                const updates = {
                    email: `updateduser${i + 1}-${baseTimestamp + i}@example.com`,
                    status: 'inactive' as const,
                };

                const updatedUser = await updateUserService(userId, updates, tenantId);
                console.log(`[5.${i + 11}] Updated User ${i + 1}:`, {
                    id: updatedUser?.id,
                    username: updatedUser?.username,
                    email: updatedUser?.email,
                    status: updatedUser?.status,
                });

                expect(updatedUser).toBeDefined();
                expect(updatedUser!.email).toBe(updates.email);
                expect(updatedUser!.status).toBe(updates.status);
            }

            // Sequence: Delete 2 users
            const usersToDelete1 = usersToUpdate.slice(0, 2); // First 2 of updated users
            for (let i = 0; i < usersToDelete1.length; i++) {
                const userId = usersToDelete1[i];
                const deleted = await deleteUserService(userId, tenantId);
                console.log(`[5.${i + 16}] Deleted User ${i + 1}:`, { userId, success: deleted });

                expect(deleted).toBe(true);
                const user = await getUserByIdService(userId, tenantId);
                expect(user).toBeNull();
            }

            // Sequence: Delete 1 more user (randomly selected from remaining)
            const remainingUsers = userIds.filter(id => !usersToDelete1.includes(id));
            const randomIndex = Math.floor(Math.random() * remainingUsers.length);
            const userIdToDelete = remainingUsers[randomIndex];
            const deleted = await deleteUserService(userIdToDelete, tenantId);
            console.log(`[5.18] Deleted Random User:`, { userId: userIdToDelete, success: deleted });

            expect(deleted).toBe(true);
            const user = await getUserByIdService(userIdToDelete, tenantId);
            expect(user).toBeNull();

            // Sequence: Add 2 new users
            const newUserIds: number[] = [];
            for (let i = 0; i < 2; i++) {
                const userInput = {
                    username: `newuser${i + 1}`,
                    email: `newuser${i + 1}-${baseTimestamp + i + 10}@example.com`,
                    password,
                    tenant_id: tenantId,
                    mobile: '1234567890',
                    status: 'active' as const,
                    role_id: 1,
                    email_verified: null,
                };

                const createdUser = await createUserService(userInput);
                newUserIds.push(createdUser.id!);
                console.log(`[5.${i + 19}] Added New User ${i + 1}:`, {
                    id: createdUser.id,
                    username: createdUser.username,
                    email: createdUser.email,
                    status: createdUser.status,
                });

                expect(createdUser).toBeDefined();
                expect(createdUser.id).toBeDefined();
            }

            // Sequence: Update 1 remaining user
            const finalUpdateUserId = remainingUsers.find(id => id !== userIdToDelete && !usersToDelete1.includes(id));
            if (finalUpdateUserId) {
                const finalUpdate = {
                    email: `finaluser-${baseTimestamp + 20}@example.com`,
                    status: 'suspended' as const,
                };

                const updatedUser = await updateUserService(finalUpdateUserId, finalUpdate, tenantId);
                console.log('[5.21] Final Updated User:', {
                    id: updatedUser?.id,
                    username: updatedUser?.username,
                    email: updatedUser?.email,
                    status: updatedUser?.status,
                });

                expect(updatedUser).toBeDefined();
                expect(updatedUser!.email).toBe(finalUpdate.email);
                expect(updatedUser!.status).toBe(finalUpdate.status);
            } else {
                console.warn('[5.21] No remaining user available for final update');
            }

            // Verify final state
            const users = await getUsersService(tenantId);
            console.log('[5.22] Final Users for Tenant:', users.map(user => ({
                id: user.id,
                username: user.username,
                email: user.email,
                status: user.status,
            })));

            expect(users).toBeInstanceOf(Array);
            expect(users.length).toBeGreaterThanOrEqual(7); // 10 - 3 + 2 = 9, but others may exist
            expect(users.some(user => user.email === `finaluser-${baseTimestamp + 20}@example.com`)).toBe(true);
            expect(users.some(user => user.id === newUserIds[0])).toBe(true);
            expect(users.some(user => user.id === newUserIds[1])).toBe(true);
        } catch (error) {
            console.error('[5.] Multi-user test failed:', error);
            throw error;
        }
    }, 30000); // Increased timeout for multiple operations
});