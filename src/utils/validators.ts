/**
 * Centralized validation utilities for form fields
 * Per Master Prompt: All forms must validate email, phone, and required fields
 */

// ========================================
// VALIDATION REGEX PATTERNS
// ========================================

/**
 * Email validation (RFC 5322 simplified)
 * Matches: user@domain.com, user.name+tag@sub.domain.co.uk
 */
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone validation (US format)
 * Matches: (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890
 */
export const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

/**
 * URL validation
 * Matches: https://example.com, http://sub.domain.com/path
 */
export const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

/**
 * Password strength validation
 * Requirements: Min 8 chars, 1 uppercase, 1 number, 1 special char
 */
export const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Alphanumeric only (no spaces)
 * Matches: abc123, UserName99
 */
export const alphanumericRegex = /^[a-zA-Z0-9]+$/;

/**
 * Numeric only
 * Matches: 123, 456789
 */
export const numericRegex = /^\d+$/;

/**
 * Zip code (US 5-digit or 5+4)
 * Matches: 12345, 12345-6789
 */
export const zipCodeRegex = /^\d{5}(-\d{4})?$/;

// ========================================
// VALIDATION FUNCTIONS
// ========================================

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return emailRegex.test(email.trim());
}

/**
 * Validates phone number format (US)
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof email !== 'string') return false;
  return phoneRegex.test(phone.trim());
}

/**
 * Validates URL format
 * @param url - URL to validate
 * @returns true if valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return urlRegex.test(url.trim());
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns true if meets requirements, false otherwise
 */
export function isValidPassword(password: string): boolean {
  if (!password || typeof password !== 'string') return false;
  return passwordRegex.test(password);
}

/**
 * Validates required field (not empty, not just whitespace)
 * @param value - Value to validate
 * @returns true if not empty, false otherwise
 */
export function isRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value);
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Validates minimum length
 * @param value - String to validate
 * @param minLength - Minimum length required
 * @returns true if meets minimum length, false otherwise
 */
export function minLength(value: string, minLength: number): boolean {
  if (!value || typeof value !== 'string') return false;
  return value.trim().length >= minLength;
}

/**
 * Validates maximum length
 * @param value - String to validate
 * @param maxLength - Maximum length allowed
 * @returns true if within maximum length, false otherwise
 */
export function maxLength(value: string, maxLength: number): boolean {
  if (!value || typeof value !== 'string') return true; // Empty is ok for max length
  return value.trim().length <= maxLength;
}

/**
 * Validates numeric range
 * @param value - Number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns true if within range, false otherwise
 */
export function inRange(value: number, min: number, max: number): boolean {
  if (typeof value !== 'number' || isNaN(value)) return false;
  return value >= min && value <= max;
}

// ========================================
// FORMATTING FUNCTIONS
// ========================================

/**
 * Formats phone number to (XXX) XXX-XXXX
 * @param phone - Raw phone number (can include non-numeric chars)
 * @returns Formatted phone number or original if invalid
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

/**
 * Formats currency to USD with 2 decimals
 * @param amount - Numeric amount
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Formats date to MM/DD/YYYY
 * @param date - Date object or ISO string
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
}

/**
 * Sanitizes string by trimming and removing extra whitespace
 * @param value - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(value: string): string {
  if (!value || typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ');
}

// ========================================
// ERROR MESSAGE GENERATORS
// ========================================

/**
 * Generates error message for field validation
 * @param fieldName - Name of the field
 * @param rule - Validation rule that failed
 * @returns User-friendly error message
 */
export function getErrorMessage(fieldName: string, rule: string, params?: any): string {
  const messages: Record<string, string> = {
    required: `${fieldName} is required`,
    email: `Please enter a valid email address`,
    phone: `Please enter a valid phone number (e.g., (123) 456-7890)`,
    url: `Please enter a valid URL`,
    password: `Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character`,
    minLength: `${fieldName} must be at least ${params?.minLength} characters`,
    maxLength: `${fieldName} cannot exceed ${params?.maxLength} characters`,
    range: `${fieldName} must be between ${params?.min} and ${params?.max}`,
    alphanumeric: `${fieldName} can only contain letters and numbers`,
    numeric: `${fieldName} must be a number`,
    zipCode: `Please enter a valid ZIP code (e.g., 12345 or 12345-6789)`,
  };
  return messages[rule] || `${fieldName} is invalid`;
}

// ========================================
// COMPOSITE VALIDATORS
// ========================================

/**
 * Validates multiple rules for a field
 * @param value - Value to validate
 * @param rules - Object with validation rules
 * @returns Error message if validation fails, null otherwise
 *
 * @example
 * validateField('john@example.com', {
 *   required: true,
 *   email: true
 * }, 'Email');
 */
export function validateField(
  value: any,
  rules: {
    required?: boolean;
    email?: boolean;
    phone?: boolean;
    url?: boolean;
    password?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    alphanumeric?: boolean;
    numeric?: boolean;
    zipCode?: boolean;
  },
  fieldName: string = 'Field'
): string | null {
  // Required check
  if (rules.required && !isRequired(value)) {
    return getErrorMessage(fieldName, 'required');
  }

  // If not required and empty, skip other validations
  if (!rules.required && !value) {
    return null;
  }

  // Format-specific validations
  if (rules.email && !isValidEmail(value)) {
    return getErrorMessage(fieldName, 'email');
  }

  if (rules.phone && !isValidPhone(value)) {
    return getErrorMessage(fieldName, 'phone');
  }

  if (rules.url && !isValidUrl(value)) {
    return getErrorMessage(fieldName, 'url');
  }

  if (rules.password && !isValidPassword(value)) {
    return getErrorMessage(fieldName, 'password');
  }

  // Length validations
  if (rules.minLength !== undefined && !minLength(value, rules.minLength)) {
    return getErrorMessage(fieldName, 'minLength', { minLength: rules.minLength });
  }

  if (rules.maxLength !== undefined && !maxLength(value, rules.maxLength)) {
    return getErrorMessage(fieldName, 'maxLength', { maxLength: rules.maxLength });
  }

  // Numeric validations
  if (rules.numeric && !numericRegex.test(value)) {
    return getErrorMessage(fieldName, 'numeric');
  }

  if (rules.alphanumeric && !alphanumericRegex.test(value)) {
    return getErrorMessage(fieldName, 'alphanumeric');
  }

  if (rules.zipCode && !zipCodeRegex.test(value)) {
    return getErrorMessage(fieldName, 'zipCode');
  }

  // Range validation (for numbers)
  if (rules.min !== undefined || rules.max !== undefined) {
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    const min = rules.min ?? -Infinity;
    const max = rules.max ?? Infinity;
    if (!inRange(numValue, min, max)) {
      return getErrorMessage(fieldName, 'range', { min, max });
    }
  }

  return null;
}

/**
 * Validates entire form object
 * @param formData - Object with form field values
 * @param validationRules - Object with validation rules for each field
 * @returns Object with field errors, or empty object if valid
 *
 * @example
 * const errors = validateForm(
 *   { email: 'test', password: '123' },
 *   {
 *     email: { required: true, email: true },
 *     password: { required: true, password: true }
 *   }
 * );
 */
export function validateForm<T extends Record<string, any>>(
  formData: T,
  validationRules: Record<keyof T, any>
): Record<keyof T, string> | {} {
  const errors: any = {};

  for (const fieldName in validationRules) {
    const value = formData[fieldName];
    const rules = validationRules[fieldName];
    const error = validateField(value, rules, fieldName as string);

    if (error) {
      errors[fieldName] = error;
    }
  }

  return errors;
}
