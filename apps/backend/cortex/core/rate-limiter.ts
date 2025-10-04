import { RateLimitConfig } from './tenant.types';

interface RateLimitStore {
    [ip: string]: { count: number; timestamp: number };
}

export function rateLimiter(config: RateLimitConfig) {
    const store: RateLimitStore = {};

    return async (req: { ip: string; context: any }, res: any, next: (error?: Error) => void): Promise<void> => {
        const { windowMs, max } = config;
        const ip = req.ip;
        const now = Date.now();

        if (!store[ip] || now - store[ip].timestamp > windowMs) {
            store[ip] = { count: 0, timestamp: now };
        }

        store[ip].count += 1;

        if (store[ip].count > max) {
            return next(new Error('Too many requests'));
        }

        next();
    };
}