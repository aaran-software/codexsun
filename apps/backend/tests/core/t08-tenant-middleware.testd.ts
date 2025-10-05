import { tenantMiddleware } from '../../cortex/core/tenant-middleware';
import { RequestContext, Tenant, User } from '../../cortex/core/tenant.types';

describe('[8.] Tenant Middleware', () => {
    test('[test 1] sets tenant and user in request context from valid JWT', async () => {
        const req = {
            headers: { authorization: 'Bearer mocked.eyJpZCI6InVzZXIxIiwidGVuYW50SWQiOiJ0ZW5hbnQxIiwicm9sZSI6ImFkbWluIn0.signature' },
            context: {} as RequestContext,
        };
        const res = {};
        const next = jest.fn();
        await tenantMiddleware(req, res, next);
        expect(req.context).toEqual({
            tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
            user: { id: 'user1', tenantId: 'tenant1', role: 'admin', token: expect.any(String) },
        });
        expect(next).toHaveBeenCalled();
    });

    test('[test 2] calls next with error for invalid JWT', async () => {
        const req = {
            headers: { authorization: 'Bearer invalid.jwt' },
            context: {} as RequestContext,
        };
        const res = {};
        const next = jest.fn();
        await tenantMiddleware(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(req.context.tenant).toBeUndefined();
        expect(req.context.user).toBeUndefined();
    });

    test('[test 3] skips tenant resolution for no authorization header', async () => {
        const req = { headers: {}, context: {} as RequestContext };
        const res = {};
        const next = jest.fn();
        await tenantMiddleware(req, res, next);
        expect(req.context.tenant).toBeUndefined();
        expect(req.context.user).toBeUndefined();
        expect(next).toHaveBeenCalled();
    });
});