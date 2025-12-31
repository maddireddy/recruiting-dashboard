/**
 * String Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  randomString,
  slugify,
  getInitials,
  escapeRegExp,
  containsIgnoreCase,
  padNumber,
  parseQueryString,
  buildQueryString,
  maskString,
  countWords,
  extractEmails,
  snakeToCamel,
  camelToSnake,
} from '../string';

describe('randomString', () => {
  it('should generate string of correct length', () => {
    expect(randomString(10)).toHaveLength(10);
    expect(randomString(20)).toHaveLength(20);
  });

  it('should generate different strings', () => {
    const str1 = randomString(10);
    const str2 = randomString(10);
    // Very unlikely to be equal
    expect(str1).not.toBe(str2);
  });

  it('should only contain alphanumeric characters', () => {
    const str = randomString(100);
    expect(str).toMatch(/^[A-Za-z0-9]+$/);
  });
});

describe('slugify', () => {
  it('should convert to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should replace spaces with hyphens', () => {
    expect(slugify('This is a test')).toBe('this-is-a-test');
  });

  it('should remove special characters', () => {
    expect(slugify('Hello! @World#')).toBe('hello-world');
  });

  it('should handle multiple consecutive spaces/hyphens', () => {
    expect(slugify('hello    world')).toBe('hello-world');
    expect(slugify('hello---world')).toBe('hello-world');
  });

  it('should trim leading/trailing hyphens', () => {
    expect(slugify(' hello world ')).toBe('hello-world');
  });
});

describe('getInitials', () => {
  it('should extract initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('Jane Smith')).toBe('JS');
  });

  it('should handle single name', () => {
    expect(getInitials('John')).toBe('JO');
  });

  it('should limit to 2 characters', () => {
    expect(getInitials('John Paul Jones')).toBe('JP');
  });

  it('should convert to uppercase', () => {
    expect(getInitials('john doe')).toBe('JD');
  });
});

describe('escapeRegExp', () => {
  it('should escape special regex characters', () => {
    expect(escapeRegExp('.*+?^${}()|[]\\')).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
  });

  it('should not modify regular strings', () => {
    expect(escapeRegExp('hello')).toBe('hello');
  });
});

describe('containsIgnoreCase', () => {
  it('should find substring case-insensitively', () => {
    expect(containsIgnoreCase('Hello World', 'hello')).toBe(true);
    expect(containsIgnoreCase('Hello World', 'WORLD')).toBe(true);
  });

  it('should return false when not found', () => {
    expect(containsIgnoreCase('Hello World', 'test')).toBe(false);
  });
});

describe('padNumber', () => {
  it('should pad numbers with leading zeros', () => {
    expect(padNumber(5, 3)).toBe('005');
    expect(padNumber(42, 4)).toBe('0042');
  });

  it('should not pad if already long enough', () => {
    expect(padNumber(12345, 3)).toBe('12345');
  });
});

describe('parseQueryString', () => {
  it('should parse query string into object', () => {
    const result = parseQueryString('key1=value1&key2=value2');
    expect(result).toEqual({ key1: 'value1', key2: 'value2' });
  });

  it('should handle URL-encoded values', () => {
    const result = parseQueryString('name=John%20Doe');
    expect(result.name).toBe('John Doe');
  });

  it('should handle empty query string', () => {
    const result = parseQueryString('');
    expect(result).toEqual({});
  });
});

describe('buildQueryString', () => {
  it('should build query string from object', () => {
    const params = { key1: 'value1', key2: 'value2' };
    expect(buildQueryString(params)).toBe('key1=value1&key2=value2');
  });

  it('should skip null and undefined values', () => {
    const params = { key1: 'value1', key2: null, key3: undefined, key4: 'value4' };
    const result = buildQueryString(params);
    expect(result).not.toContain('key2');
    expect(result).not.toContain('key3');
    expect(result).toContain('key1=value1');
    expect(result).toContain('key4=value4');
  });

  it('should handle special characters', () => {
    const params = { name: 'John Doe' };
    expect(buildQueryString(params)).toBe('name=John+Doe');
  });
});

describe('maskString', () => {
  it('should mask string except last N characters', () => {
    expect(maskString('1234567890', 4)).toBe('******7890');
    expect(maskString('secretpassword', 4)).toBe('**********word');
  });

  it('should not mask if string is shorter than visible chars', () => {
    expect(maskString('123', 4)).toBe('123');
  });

  it('should use default visible chars of 4', () => {
    expect(maskString('1234567890')).toBe('******7890');
  });
});

describe('countWords', () => {
  it('should count words in a string', () => {
    expect(countWords('Hello world')).toBe(2);
    expect(countWords('This is a test sentence')).toBe(5);
  });

  it('should handle multiple spaces', () => {
    expect(countWords('Hello    world')).toBe(2);
  });

  it('should handle empty string', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
  });
});

describe('extractEmails', () => {
  it('should extract email addresses from text', () => {
    const text = 'Contact us at support@example.com or sales@example.com';
    const emails = extractEmails(text);
    expect(emails).toEqual(['support@example.com', 'sales@example.com']);
  });

  it('should return empty array if no emails found', () => {
    const emails = extractEmails('No emails here');
    expect(emails).toEqual([]);
  });
});

describe('snakeToCamel', () => {
  it('should convert snake_case to camelCase', () => {
    expect(snakeToCamel('hello_world')).toBe('helloWorld');
    expect(snakeToCamel('first_name')).toBe('firstName');
  });

  it('should handle multiple underscores', () => {
    expect(snakeToCamel('hello_world_test')).toBe('helloWorldTest');
  });
});

describe('camelToSnake', () => {
  it('should convert camelCase to snake_case', () => {
    expect(camelToSnake('helloWorld')).toBe('hello_world');
    expect(camelToSnake('firstName')).toBe('first_name');
  });

  it('should handle multiple capital letters', () => {
    expect(camelToSnake('helloWorldTest')).toBe('hello_world_test');
  });
});
