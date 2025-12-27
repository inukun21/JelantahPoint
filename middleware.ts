// 🔒 Enhanced Security Middleware with JWT verification
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionToken = request.cookies.get('admin_session')?.value;

    // Security headers untuk semua responses
    const headers = new Headers();
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy
    headers.set(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https: blob:; " +
        "connect-src 'self' ws: wss:; " +
        "frame-ancestors 'none';"
    );

    // 1. Redirect /login to /admin/login
    if (pathname === '/login') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // 2. Protect /admin routes
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
        // Allow access to login page
        if (pathname === '/admin/login') {
            if (sessionToken) {
                // Verify token is valid
                const payload = verifyToken(sessionToken);
                if (payload) {
                    // Already logged in with valid token, redirect to admin dashboard
                    return NextResponse.redirect(new URL('/admin', request.url));
                }
                // Token invalid, clear cookie and show login
                const response = NextResponse.next();
                response.cookies.delete('admin_session');
                return response;
            }
            // Not logged in, show login page with security headers
            return NextResponse.next({
                headers,
            });
        }

        // Require session and valid JWT for everything else in /admin
        if (!sessionToken) {
            console.warn(`Unauthorized access attempt to ${pathname}`);
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        // Verify JWT token
        const payload = verifyToken(sessionToken);
        if (!payload) {
            console.warn(`Invalid JWT token for ${pathname}`);
            const response = NextResponse.redirect(new URL('/admin/login', request.url));
            response.cookies.delete('admin_session'); // Clear invalid cookie
            return response;
        }

        // Check if token is about to expire (less than 1 hour left)
        const now = Date.now() / 1000; // JWT uses seconds
        if (payload.timestamp && (now - payload.timestamp / 1000) > 23 * 60 * 60) {
            console.log(`Token expiring soon for user ${payload.username}, consider refresh`);
        }

        // Allow access with security headers
        return NextResponse.next({
            headers,
        });
    }

    // For all other routes, add security headers
    return NextResponse.next({
        headers,
    });
}

export const config = {
    matcher: [
        '/login',
        '/admin',
        '/admin/:path*',
        // Add security headers to all routes
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
