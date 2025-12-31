/**
 * Format Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatCompactNumber,
  formatPhoneNumber,
  formatPercentage,
  formatFileSize,
  formatNumber,
} from '../format';

describe('formatCurrency', () => {
  it('should format USD currency correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
    expect(formatCurrency(1000.50)).toBe('$1,000.50');
    expect(formatCurrency(0)).toBe('$0');
  });

  it('should format negative amounts', () => {
    expect(formatCurrency(-500)).toBe('-$500');
  });

  it('should format large numbers with proper separators', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000');
    expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
  });

  it('should support different currencies', () => {
    expect(formatCurrency(1000, 'EUR')).toContain('1,000');
    expect(formatCurrency(1000, 'GBP')).toContain('1,000');
  });
});

describe('formatCompactNumber', () => {
  it('should format numbers under 1000 as-is', () => {
    expect(formatCompactNumber(0)).toBe('0');
    expect(formatCompactNumber(100)).toBe('100');
    expect(formatCompactNumber(999)).toBe('999');
  });

  it('should format thousands with K suffix', () => {
    expect(formatCompactNumber(1000)).toBe('1.0K');
    expect(formatCompactNumber(1500)).toBe('1.5K');
    expect(formatCompactNumber(999999)).toBe('1000.0K');
  });

  it('should format millions with M suffix', () => {
    expect(formatCompactNumber(1000000)).toBe('1.0M');
    expect(formatCompactNumber(2500000)).toBe('2.5M');
  });

  it('should format billions with B suffix', () => {
    expect(formatCompactNumber(1000000000)).toBe('1.0B');
    expect(formatCompactNumber(5500000000)).toBe('5.5B');
  });
});

describe('formatPhoneNumber', () => {
  it('should format 10-digit US phone numbers', () => {
    expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
    expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
  });

  it('should handle phone numbers with hyphens', () => {
    expect(formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890');
  });

  it('should handle phone numbers with spaces', () => {
    expect(formatPhoneNumber('123 456 7890')).toBe('(123) 456-7890');
  });

  it('should handle phone numbers with country code', () => {
    expect(formatPhoneNumber('11234567890')).toBe('1 (123) 456-7890');
  });

  it('should return original for invalid formats', () => {
    expect(formatPhoneNumber('123')).toBe('123');
    expect(formatPhoneNumber('abcdefghij')).toBe('abcdefghij');
  });
});

describe('formatPercentage', () => {
  it('should format decimal to percentage', () => {
    expect(formatPercentage(0.5)).toBe('50%');
    expect(formatPercentage(0.25)).toBe('25%');
    expect(formatPercentage(1)).toBe('100%');
  });

  it('should handle custom decimal places', () => {
    expect(formatPercentage(0.12345, 2)).toBe('12.35%');
    expect(formatPercentage(0.12345, 1)).toBe('12.3%');
    expect(formatPercentage(0.12345, 0)).toBe('12%');
  });

  it('should handle edge cases', () => {
    expect(formatPercentage(0)).toBe('0%');
    expect(formatPercentage(2)).toBe('200%');
  });
});

describe('formatFileSize', () => {
  it('should format bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(100)).toBe('100 B');
    expect(formatFileSize(1023)).toBe('1023 B');
  });

  it('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('should format megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1.0 MB');
    expect(formatFileSize(5242880)).toBe('5.0 MB');
  });

  it('should format gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1.0 GB');
    expect(formatFileSize(2147483648)).toBe('2.0 GB');
  });

  it('should format terabytes', () => {
    expect(formatFileSize(1099511627776)).toBe('1.0 TB');
  });
});

describe('formatNumber', () => {
  it('should format numbers with thousand separators', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
  });

  it('should handle decimals', () => {
    expect(formatNumber(1000.5)).toBe('1,000.5');
    expect(formatNumber(1234.56)).toBe('1,234.56');
  });

  it('should handle small numbers', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(100)).toBe('100');
  });
});
