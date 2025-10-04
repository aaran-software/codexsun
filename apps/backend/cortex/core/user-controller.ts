import { RequestContext, UserResponse, UserData } from './tenant.types';
import { createUser as createUserService } from './user-service';
import { handleError } from './error-handler';

export async function createUser(req: { body: UserData; context: RequestContext }): Promise<UserResponse> {
    try {
        const { tenant, user } = req.context;
        if (!tenant) {
            throw new Error('Tenant context required');
        }
        if (!user || user.role !== 'admin') {
            throw new Error('Admin role required');
        }

        const userData = { ...req.body, tenantId: tenant.id };
        const newUser = await createUserService(userData, tenant);
        return { user: newUser };
    } catch (error) {
        await handleError(error instanceof Error ? error : new Error('Unknown error'), req.context.tenant?.id);
        throw error;
    }
}