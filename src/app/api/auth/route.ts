// 🔒 SECURE API route for authentication with complete security features
import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/jsonDB';
import { hashPassword, verifyPassword, isBcryptHash } from '@/lib/auth';
import { generateToken } from '@/lib/jwt';
import {
  sanitizeInput,
  sanitizeEmail,
  isValidEmail,
  validatePassword,
  isValidUsername
} from '@/lib/validation';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const { email, password, action, name, username } = await request.json();
    const clientIp = getClientIp(request);

    // ==================== LOGIN ====================
    if (action === 'login') {
      // Rate limiting untuk login
      const rateLimitResult = checkRateLimit(`login:${clientIp}`, RATE_LIMITS.LOGIN);
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

      const loginIdentifier = username || email;

      // Input validation
      if (!loginIdentifier || !password) {
        return NextResponse.json(
          { error: 'Username/email dan password harus diisi' },
          { status: 400 }
        );
      }

      // Sanitize input
      const sanitizedIdentifier = sanitizeInput(loginIdentifier);

      const db = readDB();
      const users = db.users || [];

      // Find user by username (priority), email, or name
      const user = users.find((u: any) =>
        u.username === sanitizedIdentifier ||
        u.email === sanitizedIdentifier ||
        u.name === sanitizedIdentifier
      );

      if (!user) {
        // Generic error message untuk security (jangan kasih tahu user tidak ditemukan)
        return NextResponse.json(
          { error: 'Username/email atau password salah' },
          { status: 401 }
        );
      }

      // Verify password - support both hashed and plain text (untuk backward compatibility)
      let isPasswordValid = false;

      if (isBcryptHash(user.password)) {
        // Password sudah di-hash, verify dengan bcrypt
        isPasswordValid = await verifyPassword(password, user.password);
      } else {
        // Password masih plain text (backward compatibility)
        // TODO: Hash password yang plain text
        isPasswordValid = user.password === password;

        // Auto-migrate: hash password jika match
        if (isPasswordValid) {
          try {
            user.password = await hashPassword(password);
            writeDB({ ...db, users });
            console.log(`Auto-migrated password for user: ${user.username}`);
          } catch (err) {
            console.error('Failed to auto-migrate password:', err);
          }
        }
      }

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Username/email atau password salah' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'User',
        timestamp: Date.now(),
      });

      const { password: _, ...userWithoutPassword } = user;

      return NextResponse.json({
        message: 'Login berhasil',
        user: userWithoutPassword,
        token: token, // Return JWT token
      });

      // ==================== REGISTER ====================
    } else if (action === 'register') {
      // Rate limiting untuk register
      const rateLimitResult = checkRateLimit(`register:${clientIp}`, RATE_LIMITS.REGISTER);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          {
            error: 'Terlalu banyak percobaan registrasi. Silakan coba lagi nanti.',
            retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
          },
          { status: 429 }
        );
      }

      // Input validation
      if (!username || !email || !password) {
        return NextResponse.json(
          { error: 'Username, email, dan password harus diisi' },
          { status: 400 }
        );
      }

      // Validate username format
      if (!isValidUsername(username)) {
        return NextResponse.json(
          { error: 'Username hanya boleh mengandung huruf, angka, underscore, dan dash (3-30 karakter)' },
          { status: 400 }
        );
      }

      // Validate email format
      if (!isValidEmail(email)) {
        return NextResponse.json(
          { error: 'Format email tidak valid' },
          { status: 400 }
        );
      }

      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return NextResponse.json(
          { error: passwordValidation.message },
          { status: 400 }
        );
      }

      // Sanitize inputs
      const sanitizedUsername = sanitizeInput(username);
      const sanitizedEmail = sanitizeEmail(email);
      const sanitizedName = name ? sanitizeInput(name) : sanitizedUsername;

      const db = readDB();
      const users = db.users || [];

      // Check if username already exists (case-insensitive)
      const existingUsername = users.find((u: any) =>
        u.username.toLowerCase() === sanitizedUsername.toLowerCase()
      );
      if (existingUsername) {
        return NextResponse.json(
          { error: 'Username sudah digunakan' },
          { status: 409 }
        );
      }

      // Check if email already exists (case-insensitive)
      const existingEmail = users.find((u: any) =>
        u.email.toLowerCase() === sanitizedEmail.toLowerCase()
      );
      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email sudah terdaftar' },
          { status: 409 }
        );
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      const newUser = {
        id: Date.now(),
        username: sanitizedUsername,
        name: sanitizedName,
        email: sanitizedEmail,
        password: hashedPassword, // Store hashed password!
        points: 0,
        totalDeposited: 0,
        co2Saved: 0,
        joinDate: new Date().toISOString().split('T')[0],
        pointHistory: [],
        role: 'User',
        image: '',
        phone: '',
        address: '',
      };

      const updatedUsers = [...users, newUser];
      const updatedDB = { ...db, users: updatedUsers };

      if (writeDB(updatedDB)) {
        // Generate JWT token for auto-login after registration
        const token = generateToken({
          userId: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          timestamp: Date.now(),
        });

        const { password: __, ...newUserWithoutPassword } = newUser;

        return NextResponse.json({
          message: 'Registrasi berhasil',
          user: newUserWithoutPassword,
          token: token, // Return JWT token for auto-login
        }, { status: 201 });
      } else {
        return NextResponse.json(
          { error: 'Gagal membuat user. Silakan coba lagi.' },
          { status: 500 }
        );
      }

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "login" or "register"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing auth request:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
