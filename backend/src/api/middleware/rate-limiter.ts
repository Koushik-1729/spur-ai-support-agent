import { Request, Response, NextFunction } from 'express';
import { redisAdapter } from '../../infrastructure/adapters/redis.adapter.js';

interface RateLimitConfig {
    windowSeconds: number;
    maxRequests: number;
    message: string;
    keyGenerator?: (req: Request) => string;
}

const createRedisRateLimiter = (config: RateLimitConfig) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Default key generator uses IP
            const keyPrefix = config.keyGenerator ? config.keyGenerator(req) : (req.ip || req.socket.remoteAddress || 'unknown');
            const key = `ratelimit:${keyPrefix}`;

            const currentCount = await redisAdapter.incr(key);

            if (currentCount === 1) {
                await redisAdapter.expire(key, config.windowSeconds);
            }

            if (currentCount > config.maxRequests) {
                res.status(429).json({
                    error: config.message,
                    type: 'rate_limit',
                });
                return;
            }

            next();
        } catch (error) {
            console.error('Rate Limiter Error:', error);
            // Fail open if Redis is down
            next();
        }
    };
};

// Rate limiter for chat API - 30 requests per minute per IP
export const chatRateLimiter = createRedisRateLimiter({
    windowSeconds: 60,
    maxRequests: 30,
    message: 'Too many requests. Please wait a moment before trying again.',
    keyGenerator: (req: Request) => {
        const sessionId = req.body?.sessionId || req.params?.sessionId || '';
        return `chat:${req.ip}-${sessionId}`;
    },
});

// Stricter rate limiter for auth endpoints - 5 requests per minute
export const authRateLimiter = createRedisRateLimiter({
    windowSeconds: 60,
    maxRequests: 5,
    message: 'Too many login attempts. Please try again later.',
    keyGenerator: (req: Request) => `auth:${req.ip}`,
});

// Global rate limiter - 100 requests per minute
export const globalRateLimiter = createRedisRateLimiter({
    windowSeconds: 60,
    maxRequests: 100,
    message: 'Rate limit exceeded. Please slow down.',
    keyGenerator: (req: Request) => `global:${req.ip}`,
});
