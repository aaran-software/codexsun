import { authMiddleware } from '../../cortex/core/auth-middleware';
import { RequestContext, Tenant, User, PermissionCheck } from '../../cortex/core/tenant.types';

describe('[12.] Auth Middleware', () => {
    test('[test 1] allows request with sufficient role', async () => {
        const req = {
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'user1', tenantId: 'tenant1', role: 'admin', token: 'mocked.token' },
            } as RequestContext,
        };
        const res = {};
        const next = jest.fn();
        const permission: PermissionCheck = { requiredRole: 'admin' };
        await authMiddleware(permission)(req, res, next);
        expect(next).toHaveBeenCalledWith();
    });

    test('[test 2] rejects request with insufficient role', async () => {
        const req = {
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'user1', tenantId: 'tenant1', role: 'user', token: 'mocked.token' },
            } as RequestContext,
        };
        const res = {};
        const next = jest.fn();
        const permission: PermissionCheck = { requiredRole: 'admin' };
        await authMiddleware(permission)(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next.mock.calls[0][0]).toMatchObject({ message: 'Insufficient permissions' });
    });

    test('[test 3] rejects request with missing user context', async () => {
        const req = {
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
            } as RequestContext,
        };
        const res = {};
        const next = jest.fn();
        const permission: PermissionCheck = { requiredRole: 'admin' };
        await authMiddleware(permission)(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next.mock.calls[0][0]).toMatchObject({ message: 'User context required' });
    });
});