/**
 * Validation Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidCreditCard,
  isValidDate,
  isEmpty,
  isNumeric,
  validatePasswordStrength,
  isValidZipCode,
  isValidSSN,
  isAllowedFileType,
} from '../validation';

describe('isValidEmail', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.user@example.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user @example.com')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('should validate 10-digit US phone numbers', () => {
    expect(isValidPhone('1234567890')).toBe(true);
    expect(isValidPhone('555-123-4567')).toBe(true);
    expect(isValidPhone('(555) 123-4567')).toBe(true);
  });

  it('should validate 11-digit numbers starting with 1', () => {
    expect(isValidPhone('11234567890')).toBe(true);
    expect(isValidPhone('1-555-123-4567')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('12345')).toBe(false);
    expect(isValidPhone('abcdefghij')).toBe(false);
  });
});

describe('isValidUrl', () => {
  it('should validate correct URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('https://example.com/path?query=1')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(isValidUrl('not a url')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false);
    expect(isValidUrl('ftp://example')).toBe(false);
  });
});

describe('isValidCreditCard', () => {
  it('should validate correct credit card numbers using Luhn algorithm', () => {
    // Test card numbers (these pass Luhn check)
    expect(isValidCreditCard('4532015112830366')).toBe(true); // Visa
    expect(isValidCreditCard('5425233430109903')).toBe(true); // Mastercard
  });

  it('should reject invalid credit card numbers', () => {
    expect(isValidCreditCard('1234567890123456')).toBe(false);
    expect(isValidCreditCard('0000000000000000')).toBe(false);
    expect(isValidCreditCard('123')).toBe(false);
  });

  it('should handle cards with spaces and dashes', () => {
    expect(isValidCreditCard('4532-0151-1283-0366')).toBe(true);
    expect(isValidCreditCard('4532 0151 1283 0366')).toBe(true);
  });
});

describe('isValidDate', () => {
  it('should validate correct date strings', () => {
    expect(isValidDate('2024-01-01')).toBe(true);
    expect(isValidDate('12/31/2024')).toBe(true);
    expect(isValidDate('2024-12-31T10:00:00Z')).toBe(true);
  });

  it('should reject invalid date strings', () => {
    expect(isValidDate('not a date')).toBe(false);
    expect(isValidDate('2024-13-01')).toBe(false);
    expect(isValidDate('2024-02-30')).toBe(false);
  });
});

describe('isEmpty', () => {
  it('should return true for empty values', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('   ')).toBe(true);
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });

  it('should return false for non-empty values', () => {
    expect(isEmpty('text')).toBe(false);
    expect(isEmpty('  text  ')).toBe(false);
    expect(isEmpty('0')).toBe(false);
  });
});

describe('isNumeric', () => {
  it('should validate numeric strings', () => {
    expect(isNumeric('123')).toBe(true);
    expect(isNumeric('123.45')).toBe(true);
    expect(isNumeric('-123.45')).toBe(true);
    expect(isNumeric('0')).toBe(true);
  });

  it('should reject non-numeric strings', () => {
    expect(isNumeric('abc')).toBe(false);
    expect(isNumeric('12a')).toBe(false);
    expect(isNumeric('')).toBe(false);
  });
});

describe('validatePasswordStrength', () => {
  it('should validate strong passwords', () => {
    const result = validatePasswordStrength('StrongP@ss123');
    expect(result.isValid).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(3);
    expect(result.feedback).toHaveLength(0);
  });

  it('should reject weak passwords', () => {
    const result = validatePasswordStrength('weak');
    expect(result.isValid).toBe(false);
    expect(result.score).toBeLessThan(3);
    expect(result.feedback.length).toBeGreaterThan(0);
  });

  it('should provide feedback for missing requirements', () => {
    const result = validatePasswordStrength('password');
    expect(result.feedback).toContain('Include both uppercase and lowercase letters');
    expect(result.feedback).toContain('Include at least one number');
    expect(result.feedback).toContain('Include at least one special character');
  });

  it('should check minimum length', () => {
    const result = validatePasswordStrength('Pass1!', 8);
    expect(result.feedback).toContain('Password must be at least 8 characters');
  });
});

describe('isValidZipCode', () => {
  it('should validate 5-digit ZIP codes', () => {
    expect(isValidZipCode('12345')).toBe(true);
    expect(isValidZipCode('90210')).toBe(true);
  });

  it('should validate ZIP+4 format', () => {
    expect(isValidZipCode('12345-6789')).toBe(true);
    expect(isValidZipCode('90210-1234')).toBe(true);
  });

  it('should reject invalid ZIP codes', () => {
    expect(isValidZipCode('1234')).toBe(false);
    expect(isValidZipCode('123456')).toBe(false);
    expect(isValidZipCode('abcde')).toBe(false);
  });
});

describe('isValidSSN', () => {
  it('should validate 9-digit SSN', () => {
    expect(isValidSSN('123456789')).toBe(true);
    expect(isValidSSN('123-45-6789')).toBe(true);
  });

  it('should reject invalid SSN', () => {
    expect(isValidSSN('12345')).toBe(false);
    expect(isValidSSN('123-45-678')).toBe(false);
    expect(isValidSSN('abc-de-fghi')).toBe(false);
  });
});

describe('isAllowedFileType', () => {
  it('should validate allowed file extensions', () => {
    expect(isAllowedFileType('document.pdf', ['pdf', 'doc'])).toBe(true);
    expect(isAllowedFileType('image.jpg', ['jpg', 'png'])).toBe(true);
  });

  it('should be case-insensitive', () => {
    expect(isAllowedFileType('document.PDF', ['pdf'])).toBe(true);
    expect(isAllowedFileType('IMAGE.JPG', ['jpg'])).toBe(true);
  });

  it('should reject disallowed file types', () => {
    expect(isAllowedFileType('script.exe', ['pdf', 'doc'])).toBe(false);
    expect(isAllowedFileType('file.txt', ['jpg', 'png'])).toBe(false);
  });

  it('should handle files without extensions', () => {
    expect(isAllowedFileType('filename', ['pdf'])).toBe(false);
  });
});
