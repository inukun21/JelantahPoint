import jwt from 'jsonwebtoken';

// Secret key untuk JWT - DI PRODUCTION HARUS DARI ENVIRONMENT VARIABLE!
const JWT_SECRET = process.env.JWT_SECRET || 'jelantahpoint-super-secret-key-2024-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface JWTPayload {
    userId: number | string;
    username: string;
    email: string;
    role: string;
    timestamp: number;
}

/**
 * Generate JWT token
 * @param payload - Data yang akan di-encode dalam token
 * @returns JWT token string
 */
export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'jelantahpoint',
        audience: 'jelantahpoint-users',
    });
}

/**
 * Verify dan decode JWT token
 * @param token - JWT token string
 * @returns Decoded payload atau null jika invalid
 */
export function verifyToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'jelantahpoint',
            audience: 'jelantahpoint-users',
        }) as JWTPayload;
        return decoded;
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}

/**
 * Decode token tanpa verification (untuk debugging)
 * @param token - JWT token string
 * @returns Decoded payload atau null
 */
export function decodeToken(token: string): JWTPayload | null {
    try {
        return jwt.decode(token) as JWTPayload;
    } catch {
        return null;
    }
}

/**
 * Refresh token - generate new token dengan expiry baru
 * @param oldToken - Token lama yang valid
 * @returns Token baru atau null jika token lama invalid
 */
export function refreshToken(oldToken: string): string | null {
    const payload = verifyToken(oldToken);
    if (!payload) return null;

    // Generate token baru dengan timestamp baru
    return generateToken({
        ...payload,
        timestamp: Date.now(),
    });
}
