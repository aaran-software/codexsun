// /cortex/core/user/user-controller.ts
// Expert mode: Fixed error handling to properly throw 'Unknown error' for non-Error objects, ensuring test coverage for all error paths.

import { RequestContext, UserResponse, UserData } from '../app.types';
import { createUser as createUserService } from './user-service';
import { handleError } from '../error/error-handler';

export async function createUser(
    req: { body: UserData; context: RequestContext; version?: string },
): Promise<UserResponse> {
    try {
        const { tenant, user } = req.context;
        const apiVersion = req.version || 'v1'; // Default to v1 if not specified

        if (!tenant) {
            throw new Error('Tenant context required');
        }
        if (!user || user.role !== 'admin') {
            throw new Error('Admin role required');
        }

        const userData = { ...req.body, tenantId: tenant.id };
        const newUser = await createUserService(userData, tenant, apiVersion);
        return { user: newUser };
    } catch (error) {
        const errorToLog = error instanceof Error ? error : new Error('Unknown error');
        await handleError(errorToLog, req.context.tenant?.id, req.version);
        throw errorToLog; // Ensure the error is thrown for test expectation
    }
}