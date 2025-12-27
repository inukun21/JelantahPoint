// 🔒 SECURE Admin login API with JWT and enhanced security
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readDB } from '@/lib/jsonDB';
import { verifyPassword, isBcryptHash, hashPassword } from '@/lib/auth';
import { generateToken } from '@/lib/jwt';
import { sanitizeInput } from '@/lib/validation';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();
        const clientIp = getClientIp(request);

        // Rate limiting untuk admin login (lebih ketat)
        const rateLimitResult = checkRateLimit(`admin-login:${clientIp}`, RATE_LIMITS.LOGIN);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    error: 'Terlalu banyak percobaan login. Silakan coba lagi nanti.',
                    retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': String(RATE_LIMITS.LOGIN.maxRequests),
                        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                        'X-RateLimit-Reset': String(rateLimitResult.resetTime),
                    }
                }
            );
        }

        // Validate input
        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username dan password harus diisi' },
                { status: 400 }
            );
        }

        // Sanitize input
        const sanitizedUsername = sanitizeInput(username);

        const db = readDB();
        const users = db.users || [];

        // Find user by username (priority), email, or name
        const user = users.find((u: any) =>
            u.username === sanitizedUsername ||
            u.email === sanitizedUsername ||
            u.name === sanitizedUsername
        );

        if (!user) {
            // Log failed attempt
            console.warn(`Failed admin login attempt for username: ${sanitizedUsername} from IP: ${clientIp}`);

            return NextResponse.json(
                { error: 'Username atau password salah' },
                { status: 401 }
            );
        }

        // Verify password - support both hashed and plain text
        let isPasswordValid = false;

        if (isBcryptHash(user.password)) {
            // Password already hashed
            isPasswordValid = await verifyPassword(password, user.password);
        } else {
            // Password still plain text (backward compatibility)
            isPasswordValid = user.password === password;

            // Auto-migrate: hash password if match
            if (isPasswordValid) {
                try {
                    const { writeDB } = await import('@/lib/jsonDB');
                    user.password = await hashPassword(password);
                    writeDB({ ...db, users });
                    console.log(`Auto-migrated password for admin: ${user.username}`);
                } catch (err) {
                    console.error('Failed to auto-migrate admin password:', err);
                }
            }
        }

        if (!isPasswordValid) {
            console.warn(`Failed admin login attempt for username: ${sanitizedUsername} from IP: ${clientIp}`);

            return NextResponse.json(
                { error: 'Username atau password salah' },
                { status: 401 }
            );
        }

        // Check if user has admin access
        const allowedRoles = ['admin', 'moderator'];
        const userRole = user.role ? user.role.toLowerCase() : 'user';

        if (!allowedRoles.includes(userRole)) {
            console.warn(`Non-admin user attempted admin login: ${user.username} (${userRole}) from IP: ${clientIp}`);

            return NextResponse.json(
                {
                    error: 'Akses Ditolak: Anda tidak memiliki hak akses sebagai Admin atau Moderator.',
                    userRole: user.role || 'User'
                },
                { status: 403 }
            );
        }

        // Generate JWT token
        const sessionToken = generateToken({
            userId: user.id,
            username: user.username || user.name,
            email: user.email,
            role: userRole,
            timestamp: Date.now(),
        });

        // Set secure cookie with JWT
        const cookieStore = await cookies();
        cookieStore.set('admin_session', sessionToken, {
            httpOnly: true, // Prevent JavaScript access
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'lax', // CSRF protection
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        });

        // Log successful login
        console.log(`Admin login successful: ${user.username} (${userRole}) from IP: ${clientIp}`);

        return NextResponse.json(
            {
                success: true,
                message: 'Login berhasil',
                role: userRole,
                username: user.username || user.name,
            },
            {
                status: 200,
                headers: {
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'DENY',
                    'X-XSS-Protection': '1; mode=block',
                }
            }
        );
    } catch (error) {
        console.error('Admin login error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
