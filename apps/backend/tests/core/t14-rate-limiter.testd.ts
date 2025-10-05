import { rateLimiter } from '../../cortex/core/rate-limiter';
import { RateLimitConfig } from '../../cortex/core/tenant.types';

describe('[14.] Rate Limiter', () => {
    test('[test 1] allows request within rate limit', async () => {
        const config: RateLimitConfig = { windowMs: 1000, max: 2 };
        const middleware = rateLimiter(config);
        const req = { ip: '127.0.0.1', context: {} };
        const res = {};
        const next = jest.fn();
        await middleware(req, res, next);
        await middleware(req, res, next);
        expect(next).toHaveBeenCalledTimes(2);
        expect(next).toHaveBeenCalledWith();
    });

    test('[test 2] rejects request exceeding rate limit', async () => {
        const config: RateLimitConfig = { windowMs: 1000, max: 2 };
        const middleware = rateLimiter(config);
        const req = { ip: '127.0.0.1', context: {} };
        const res = {};
        const next = jest.fn();
        await middleware(req, res, next);
        await middleware(req, res, next);
        await middleware(req, res, next);
        expect(next).toHaveBeenCalledTimes(3);
        expect(next.mock.calls[2][0]).toMatchObject({ message: 'Too many requests' });
    });

    test('[test 3] resets limit after window', async () => {
        jest.useFakeTimers();
        const config: RateLimitConfig = { windowMs: 1000, max: 2 };
        const middleware = rateLimiter(config);
        const req = { ip: '127.0.0.1', context: {} };
        const res = {};
        const next = jest.fn();
        await middleware(req, res, next);
        await middleware(req, res, next);
        jest.advanceTimersByTime(1001);
        await middleware(req, res, next);
        expect(next).toHaveBeenCalledTimes(3);
        expect(next).toHaveBeenCalledWith();
        jest.useRealTimers();
    });
});