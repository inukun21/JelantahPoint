/**
 * Simple in-memory rate limiter
 * Untuk production, gunakan Redis untuk distributed rate limiting
 */

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

// Cleanup old entries setiap 5 menit
setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach(key => {
        if (store[key].resetTime < now) {
            delete store[key];
        }
    });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Max requests per window
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTime: number;
}

/**
 * Check rate limit untuk identifier
 * @param identifier - Unique identifier (IP address, user ID, etc)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const key = identifier;

    // Initialize atau reset jika window expired
    if (!store[key] || store[key].resetTime < now) {
        store[key] = {
            count: 0,
            resetTime: now + config.windowMs,
        };
    }

    // Increment count
    store[key].count++;

    const allowed = store[key].count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - store[key].count);

    return {
        allowed,
        remaining,
        resetTime: store[key].resetTime,
    };
}

/**
 * Reset rate limit untuk identifier
 * @param identifier - Identifier to reset
 */
export function resetRateLimit(identifier: string): void {
    delete store[identifier];
}

/**
 * Predefined rate limit configs
 */
export const RATE_LIMITS = {
    // Login: 5 attempts per 15 minutes
    LOGIN: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 5,
    },
    // Register: 3 attempts per hour
    REGISTER: {
        windowMs: 60 * 60 * 1000,
        maxRequests: 3,
    },
    // API general: 100 requests per minute
    API_GENERAL: {
        windowMs: 60 * 1000,
        maxRequests: 100,
    },
    // API strict: 30 requests per minute untuk sensitive endpoints
    API_STRICT: {
        windowMs: 60 * 1000,
        maxRequests: 30,
    },
    // Password reset: 3 attempts per hour
    PASSWORD_RESET: {
        windowMs: 60 * 60 * 1000,
        maxRequests: 3,
    },
};

/**
 * Get client IP from request
 * @param request - Next.js request object
 * @returns Client IP address
 */
export function getClientIp(request: any): string {
    // Check various headers for real IP
    const forwarded = request.headers.get('x-forwarded-for');
    const real = request.headers.get('x-real-ip');
    const cf = request.headers.get('cf-connecting-ip'); // Cloudflare

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (real) {
        return real;
    }

    if (cf) {
        return cf;
    }

    return 'unknown';
}
