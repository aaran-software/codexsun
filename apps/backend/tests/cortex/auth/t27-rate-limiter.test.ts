// /tests/cortex/auth/t27-rate-limiter.test.ts
// Expert mode: Updated req with tenant/version, mocked handleError, verified logging on exceed, per tenant+IP, full coverage.

import { rateLimiter } from '../../../cortex/core/auth/rate-limiter';
import { RateLimitConfig, RequestContext } from '../../../cortex/core/app.types';
import { handleError } from '../../../cortex/core/error/error-handler';

// Mock handleError
jest.mock('../../../cortex/core/error/error-handler', () => ({
    handleError: jest.fn(),
}));

describe('[27.] Rate Limiter', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('[test 1] allows request within rate limit', async () => {
        const config: RateLimitConfig = { windowMs: 1000, max: 2 };
        const middleware = rateLimiter(config);
        const req = { ip: '127.0.0.1', context: { tenant: { id: 'tenant1', dbConnection: '' } } as RequestContext, version: 'v1' };
        const res = {};
        const next = jest.fn();
        await middleware(req, res, next);
        await middleware(req, res, next);
        expect(next).toHaveBeenCalledTimes(2);
        expect(next).toHaveBeenCalledWith();
        expect(handleError).not.toHaveBeenCalled();
    });

    test('[test 2] rejects request exceeding rate limit', async () => {
        const config: RateLimitConfig = { windowMs: 1000, max: 2 };
        const middleware = rateLimiter(config);
        const req = { ip: '127.0.0.1', context: { tenant: { id: 'tenant1', dbConnection: '' } } as RequestContext, version: 'v1' };
        const res = {};
        const next = jest.fn();
        await middleware(req, res, next);
        await middleware(req, res, next);
        await middleware(req, res, next);
        expect(next).toHaveBeenCalledTimes(3);
        expect(next.mock.calls[2][0]).toMatchObject({ message: 'Too many requests' });
        expect(handleError).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Too many requests' }),
            'tenant1',
            'v1'
        );
    });

    test('[test 3] resets limit after window', async () => {
        jest.useFakeTimers();
        const config: RateLimitConfig = { windowMs: 1000, max: 2 };
        const middleware = rateLimiter(config);
        const req = { ip: '127.0.0.1', context: { tenant: { id: 'tenant1', dbConnection: '' } } as RequestContext, version: 'v1' };
        const res = {};
        const next = jest.fn();
        await middleware(req, res, next);
        await middleware(req, res, next);
        jest.advanceTimersByTime(1001);
        await middleware(req, res, next);
        expect(next).toHaveBeenCalledTimes(3);
        expect(next).toHaveBeenCalledWith();
        expect(handleError).not.toHaveBeenCalled();
        jest.useRealTimers();
    });

    test('[test 4] handles no tenant (global)', async () => {
        const config: RateLimitConfig = { windowMs: 1000, max: 1 };
        const middleware = rateLimiter(config);
        const req = { ip: '127.0.0.1', context: {} as RequestContext, version: 'v1' };
        const res = {};
        const next = jest.fn();
        await middleware(req, res, next);
        await middleware(req, res, next);
        expect(next).toHaveBeenCalledTimes(2);
        expect(next.mock.calls[1][0]).toMatchObject({ message: 'Too many requests' });
        expect(handleError).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Too many requests' }),
            'global',
            'v1'
        );
    });

    test('[test 5] separate limits per tenant', async () => {
        const config: RateLimitConfig = { windowMs: 1000, max: 1 };
        const middleware = rateLimiter(config);
        const req1 = { ip: '127.0.0.1', context: { tenant: { id: 'tenant1', dbConnection: '' } } as RequestContext, version: 'v1' };
        const req2 = { ip: '127.0.0.1', context: { tenant: { id: 'tenant2', dbConnection: '' } } as RequestContext, version: 'v1' };
        const res = {};
        const next = jest.fn();
        await middleware(req1, res, next); // tenant1 pass
        await middleware(req1, res, next); // tenant1 exceed
        await middleware(req2, res, next); // tenant2 pass
        expect(next).toHaveBeenCalledTimes(3);
        expect(next.mock.calls[0][0]).toBeUndefined();
        expect(next.mock.calls[1][0]).toMatchObject({ message: 'Too many requests' });
        expect(next.mock.calls[2][0]).toBeUndefined();
        expect(handleError).toHaveBeenCalledTimes(1);
    });
});