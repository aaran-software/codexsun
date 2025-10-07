import { Tenant, User, RequestContext } from '../app.types';
import { mockTenantLookup } from '../mock-master-db';
import { handleError } from '../error/error-handler';

// Mock JWT verification (replace with actual JWT library like jsonwebtoken in production)
const mockJwtVerify = async (token: string): Promise<User | null> => {
    const validTokens = [
        'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6ImFkbWluIn0.signature',
        'mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6InVzZXIifQ.signature',
    ];
    if (!validTokens.includes(token)) {
        return null;
    }
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return { id: payload.id, tenantId: payload.tenantId, role: payload.role, token };
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