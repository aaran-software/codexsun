// /tests/cortex/auth/t26-auth-middleware.test.ts
// Expert mode: Added handleError mock to verify error logging, added version in requests, maintained full coverage for role-based access control.

import { authMiddleware } from '../../../cortex/core/auth/auth-middleware';
import { RequestContext, PermissionCheck } from '../../../cortex/core/app.types';
import { handleError } from '../../../cortex/core/error/error-handler';

// Mock handleError to verify error logging
jest.mock('../../../cortex/core/error/error-handler', () => ({
    handleError: jest.fn(),
}));

describe('[26.] Auth Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('[test 1] allows request with sufficient role', async () => {
        const req = {
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'user1', tenantId: 'tenant1', role: 'admin', token: 'mocked.token' },
            } as RequestContext,
            version: 'v1',
        };
        const res = {};
        const next = jest.fn();
        const permission: PermissionCheck = { requiredRole: 'admin' };

        await authMiddleware(permission)(req, res, next);
        expect(next).toHaveBeenCalledWith();
        expect(handleError).not.toHaveBeenCalled();
    });

    test('[test 2] rejects request with insufficient role', async () => {
        const req = {
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
                user: { id: 'user1', tenantId: 'tenant1', role: 'user', token: 'mocked.token' },
            } as RequestContext,
            version: 'v1',
        };
        const res = {};
        const next = jest.fn();
        const permission: PermissionCheck = { requiredRole: 'admin' };

        await authMiddleware(permission)(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next.mock.calls[0][0]).toMatchObject({ message: 'Insufficient permissions' });
        expect(handleError).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Insufficient permissions' }),
            'tenant1',
            'v1'
        );
    });

    test('[test 3] rejects request with missing user context', async () => {
        const req = {
            context: {
                tenant: { id: 'tenant1', dbConnection: 'postgresql://localhost/tenant1_db' },
            } as RequestContext,
            version: 'v1',
        };
        const res = {};
        const next = jest.fn();
        const permission: PermissionCheck = { requiredRole: 'admin' };

        await authMiddleware(permission)(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next.mock.calls[0][0]).toMatchObject({ message: 'User context required' });
        expect(handleError).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'User context required' }),
            'tenant1',
            'v1'
        );
    });
});