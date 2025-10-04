import { Tenant, User, RequestContext } from './tenant.types';
import { mockTenantLookup } from './mock-master-db';
import { handleError } from './error-handler';

// Mock JWT verification (replace with actual JWT library like jsonwebtoken in production)
const mockJwtVerify = async (token: string): Promise<User | null> => {
    if (token === 'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6ImFkbWluIn0.signature') {
        return { id: 'user1', tenantId: 'tenant1', role: 'admin', token };
    }
    return null;
};

export async function tenantMiddleware(
    req: { headers: { authorization?: string }; context: RequestContext },
    res: any,
    next: (error?: Error) => void
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const user = await mockJwtVerify(token);

        if (!user) {
            throw new Error('Invalid token');
        }

        const tenant = await mockTenantLookup(user.tenantId);
        if (!tenant) {
            throw new Error('Tenant not found');
        }

        req.context = { tenant, user };
        next();
    } catch (error) {
        await handleError(error instanceof Error ? error : new Error('Unknown error'), undefined);
        next(error instanceof Error ? error : new Error('Unknown error'));
    }
}