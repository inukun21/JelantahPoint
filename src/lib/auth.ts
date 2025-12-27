import bcrypt from 'bcryptjs';

/**
 * Hash password menggunakan bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 12; // Higher = more secure but slower
    return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify password dengan hash
 * @param password - Plain text password
 * @param hash - Hashed password dari database
 * @returns true jika match, false jika tidak
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

/**
 * Check apakah string adalah bcrypt hash
 * @param str - String to check
 * @returns true jika bcrypt hash, false jika plain text
 */
export function isBcryptHash(str: string): boolean {
    // Bcrypt hash selalu dimulai dengan $2a$, $2b$, atau $2y$
    return /^\$2[ayb]\$\d{2}\$/.test(str);
}
