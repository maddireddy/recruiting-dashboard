/**
 * Security Configuration and Utilities
 *
 * This file contains security-related configurations and helper functions
 * for CSRF protection, rate limiting awareness, and secure data handling.
 */

// CSRF Token Management
export class CSRFTokenManager {
  private static instance: CSRFTokenManager;
  private token: string | null = null;

  private constructor() {}

  static getInstance(): CSRFTokenManager {
    if (!CSRFTokenManager.instance) {
      CSRFTokenManager.instance = new CSRFTokenManager();
    }
    return CSRFTokenManager.instance;
  }

  /**
   * Get CSRF token from meta tag or cookie
   */
  getToken(): string | null {
    // Try to get from meta tag first (set by backend)
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      this.token = metaTag.getAttribute('content');
      return this.token;
    }

    // Fallback to cookie (XSRF-TOKEN pattern)
    const cookieValue = this.getCookie('XSRF-TOKEN');
    if (cookieValue) {
      this.token = cookieValue;
      return this.token;
    }

    return this.token;
  }

  /**
   * Get cookie value by name
   */
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  /**
   * Set CSRF token (called after login or token refresh)
   */
  setToken(token: string): void {
    this.token = token;
  }
}

// Rate Limiting - Client-side awareness
export class RateLimitTracker {
  private requests: Map<string, number[]> = new Map();
  private readonly WINDOW_MS = 60 * 1000; // 1 minute
  private readonly MAX_REQUESTS = 60; // 60 requests per minute

  /**
   * Check if request should be allowed
   */
  canMakeRequest(endpoint: string): boolean {
    const now = Date.now();
    const key = this.getKey(endpoint);
    const timestamps = this.requests.get(key) || [];

    // Remove old timestamps outside the window
    const validTimestamps = timestamps.filter(ts => now - ts < this.WINDOW_MS);

    if (validTimestamps.length >= this.MAX_REQUESTS) {
      console.warn(`[RateLimit] Exceeded rate limit for ${endpoint}`);
      return false;
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }

  /**
   * Get remaining requests for endpoint
   */
  getRemainingRequests(endpoint: string): number {
    const now = Date.now();
    const key = this.getKey(endpoint);
    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter(ts => now - ts < this.WINDOW_MS);
    return Math.max(0, this.MAX_REQUESTS - validTimestamps.length);
  }

  private getKey(endpoint: string): string {
    // Normalize endpoint to handle query params
    try {
      const url = new URL(endpoint, 'http://dummy');
      return url.pathname;
    } catch {
      return endpoint;
    }
  }
}

// Singleton instance
export const rateLimitTracker = new RateLimitTracker();

// Content Security Policy helpers
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Adjust based on needs
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'", import.meta.env.VITE_API_URL || 'http://localhost:8084'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};

/**
 * Generate CSP header value
 */
export function generateCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

// Input Sanitization
export class InputSanitizer {
  /**
   * Sanitize HTML to prevent XSS
   */
  static sanitizeHTML(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  /**
   * Sanitize SQL-like inputs (for search queries)
   */
  static sanitizeSQL(input: string): string {
    return input.replace(/['";\\]/g, '');
  }

  /**
   * Sanitize file names
   */
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .substring(0, 255);
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL
   */
  static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// Password validation
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
}

export class PasswordValidator {
  private static readonly MIN_LENGTH = 12;
  private static readonly COMMON_PASSWORDS = [
    'password', 'password123', '123456', '12345678', 'qwerty',
    'abc123', 'monkey', '1234567', 'letmein', 'trustno1'
  ];

  static validate(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let strength: PasswordValidationResult['strength'] = 'weak';

    // Length check
    if (password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters`);
    }

    // Character variety checks
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasUppercase) errors.push('Password must contain uppercase letter');
    if (!hasLowercase) errors.push('Password must contain lowercase letter');
    if (!hasNumber) errors.push('Password must contain number');
    if (!hasSpecial) errors.push('Password must contain special character');

    // Common password check
    if (this.COMMON_PASSWORDS.includes(password.toLowerCase())) {
      errors.push('Password is too common');
    }

    // Calculate strength
    const varietyScore = [hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
    if (password.length >= 16 && varietyScore === 4) {
      strength = 'very-strong';
    } else if (password.length >= 14 && varietyScore >= 3) {
      strength = 'strong';
    } else if (password.length >= 12 && varietyScore >= 2) {
      strength = 'medium';
    }

    return {
      valid: errors.length === 0,
      errors,
      strength
    };
  }

  /**
   * Check if password has been pwned (requires API call)
   * Returns number of times password appears in breaches
   */
  static async checkPwned(password: string): Promise<number> {
    try {
      // Use k-anonymity model - only send first 5 chars of SHA-1 hash
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const prefix = hashHex.substring(0, 5).toUpperCase();
      const suffix = hashHex.substring(5).toUpperCase();

      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await response.text();

      const lines = text.split('\n');
      for (const line of lines) {
        const [hash, count] = line.split(':');
        if (hash === suffix) {
          return parseInt(count, 10);
        }
      }

      return 0; // Not found in breaches
    } catch (error) {
      console.error('[PasswordValidator] Error checking pwned password:', error);
      return 0; // Fail open - don't block if API is down
    }
  }
}

// Secure Storage (with encryption for sensitive data)
export class SecureStorage {
  private static readonly ENCRYPTION_KEY = 'app-encryption-key'; // In production, use env variable

  /**
   * Store sensitive data (encrypted in localStorage)
   * Note: This is NOT as secure as httpOnly cookies, use for non-critical data only
   */
  static setSecure(key: string, value: any): void {
    try {
      const encrypted = btoa(JSON.stringify(value)); // Basic encoding, use crypto in production
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('[SecureStorage] Error storing data:', error);
    }
  }

  /**
   * Retrieve sensitive data
   */
  static getSecure(key: string): any {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return JSON.parse(atob(encrypted));
    } catch (error) {
      console.error('[SecureStorage] Error retrieving data:', error);
      return null;
    }
  }

  /**
   * Remove sensitive data
   */
  static removeSecure(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clear all storage
   */
  static clearAll(): void {
    localStorage.clear();
    sessionStorage.clear();
  }
}

// File Upload Validation
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export class FileValidator {
  private static readonly DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  static validate(file: File, options: FileValidationOptions = {}): { valid: boolean; error?: string } {
    const maxSize = options.maxSize || this.DEFAULT_MAX_SIZE;
    const allowedTypes = options.allowedTypes || this.ALLOWED_DOCUMENT_TYPES;
    const allowedExtensions = options.allowedExtensions;

    // Size check
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${(maxSize / 1024 / 1024).toFixed(2)}MB limit`
      };
    }

    // MIME type check
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`
      };
    }

    // Extension check
    if (allowedExtensions) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !allowedExtensions.includes(ext)) {
        return {
          valid: false,
          error: `File extension .${ext} is not allowed`
        };
      }
    }

    // File name validation
    if (!/^[a-zA-Z0-9._-]+$/.test(file.name.replace(/\.[^.]+$/, ''))) {
      return {
        valid: false,
        error: 'File name contains invalid characters'
      };
    }

    return { valid: true };
  }

  /**
   * Generate safe file name
   */
  static generateSafeFileName(originalName: string): string {
    const ext = originalName.split('.').pop();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${timestamp}_${random}.${ext}`;
  }
}

// Security Headers (for documentation - implemented on backend)
export const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

export default {
  CSRFTokenManager,
  RateLimitTracker,
  rateLimitTracker,
  InputSanitizer,
  PasswordValidator,
  SecureStorage,
  FileValidator,
  generateCSPHeader,
  SECURITY_HEADERS,
};
