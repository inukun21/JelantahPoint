import validator from 'validator';

/**
 * Sanitize string untuk mencegah XSS
 * @param input - String input dari user
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
    if (!input) return '';

    // Escape HTML special characters
    return validator.escape(input.trim());
}

/**
 * Sanitize email
 * @param email - Email input
 * @returns Normalized and sanitized email
 */
export function sanitizeEmail(email: string): string {
    if (!email) return '';

    const normalized = validator.normalizeEmail(email, {
        gmail_remove_dots: false,
        gmail_remove_subaddress: false,
    });

    return normalized || email.toLowerCase().trim();
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns true if valid email
 */
export function isValidEmail(email: string): boolean {
    return validator.isEmail(email);
}

/**
 * Validate password strength
 * Minimal: 8 karakter, 1 huruf besar, 1 huruf kecil, 1 angka
 * @param password - Password to validate
 * @returns Object dengan result dan message
 */
export function validatePassword(password: string): { valid: boolean; message: string } {
    if (!password || password.length < 8) {
        return { valid: false, message: 'Password minimal 8 karakter' };
    }

    if (password.length > 128) {
        return { valid: false, message: 'Password maksimal 128 karakter' };
    }

    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password harus mengandung minimal 1 huruf besar' };
    }

    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password harus mengandung minimal 1 huruf kecil' };
    }

    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password harus mengandung minimal 1 angka' };
    }

    return { valid: true, message: 'Password valid' };
}

/**
 * Validate username
 * Hanya alphanumeric, underscore, dan dash. 3-30 karakter.
 * @param username - Username to validate
 * @returns true if valid
 */
export function isValidUsername(username: string): boolean {
    if (!username) return false;
    return validator.isAlphanumeric(username.replace(/[_-]/g, '')) &&
        username.length >= 3 &&
        username.length <= 30;
}

/**
 * Sanitize HTML untuk mencegah XSS in rich text
 * Note: Gunakan DOMPurify di client side untuk hasil lebih baik
 * @param html - HTML string
 * @returns Sanitized HTML
 */
export function sanitizeHTML(html: string): string {
    if (!html) return '';

    // Basic sanitization - hapus script tags dan dangerous attributes
    let cleaned = html;

    // Remove script tags
    cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove on* event handlers
    cleaned = cleaned.replace(/\s*on\w+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, '');

    // Remove javascript: protocol
    cleaned = cleaned.replace(/javascript:/gi, '');

    return cleaned;
}

/**
 * Validate numeric ID
 * @param id - ID to validate
 * @returns true if valid positive integer
 */
export function isValidId(id: any): boolean {
    const num = Number(id);
    return Number.isInteger(num) && num > 0;
}

/**
 * Sanitize phone number
 * @param phone - Phone number
 * @returns Sanitized phone
 */
export function sanitizePhone(phone: string): string {
    if (!phone) return '';

    // Remove all non-numeric characters except +
    return phone.replace(/[^\d+]/g, '');
}

/**
 * Rate limit key generator
 * @param identifier - Unique identifier (IP, user ID, etc)
 * @param action - Action being performed
 * @returns Rate limit key
 */
export function getRateLimitKey(identifier: string, action: string): string {
    return `ratelimit:${action}:${identifier}`;
}
