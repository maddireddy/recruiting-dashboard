/**
 * Error Handling Utilities
 *
 * Custom error classes and error handling helpers
 */

import { logger } from '../logger';

/**
 * Base application error
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public statusCode?: number,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public fields?: Record<string, string[]>,
    context?: Record<string, any>
  ) {
    super(message, 'VALIDATION_ERROR', 400, context);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: Record<string, any>) {
    super(message, 'AUTH_ERROR', 401, context);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', context?: Record<string, any>) {
    super(message, 'AUTHORIZATION_ERROR', 403, context);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string, context?: Record<string, any>) {
    super(`${resource} not found`, 'NOT_FOUND', 404, context);
    this.name = 'NotFoundError';
  }
}

/**
 * Network error
 */
export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed', context?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', 0, context);
    this.name = 'NetworkError';
  }
}

/**
 * Handle errors consistently across the application
 */
export function handleError(error: unknown, context?: Record<string, any>): AppError {
  // If already an AppError, just log and return
  if (error instanceof AppError) {
    logger.error(error.message, error, { ...error.context, ...context });
    return error;
  }

  // If standard Error, wrap it
  if (error instanceof Error) {
    const appError = new AppError(error.message, 'UNKNOWN_ERROR', 500, context);
    logger.error(error.message, error, context);
    return appError;
  }

  // If string, create AppError
  if (typeof error === 'string') {
    const appError = new AppError(error, 'UNKNOWN_ERROR', 500, context);
    logger.error(error, undefined, context);
    return appError;
  }

  // Unknown error type
  const appError = new AppError('An unknown error occurred', 'UNKNOWN_ERROR', 500, context);
  logger.error('Unknown error', error, context);
  return appError;
}

/**
 * Extract user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

/**
 * Check if error is a specific type
 */
export function isErrorType<T extends AppError>(
  error: unknown,
  errorClass: new (...args: any[]) => T
): error is T {
  return error instanceof errorClass;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      logger.warn(`Retry attempt ${i + 1}/${maxRetries} failed`, { error });

      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw handleError(lastError, { maxRetries, message: 'All retry attempts failed' });
}

/**
 * Wrap an async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorMessage?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      const appError = handleError(error, { function: fn.name });
      if (errorMessage) {
        throw new AppError(errorMessage, appError.code, appError.statusCode, appError.context);
      }
      throw appError;
    }
  }) as T;
}

/**
 * Assert a condition, throw error if false
 */
export function assert(condition: boolean, message: string, context?: Record<string, any>): asserts condition {
  if (!condition) {
    throw new AppError(message, 'ASSERTION_ERROR', 500, context);
  }
}

/**
 * Assert value is not null/undefined
 */
export function assertExists<T>(
  value: T | null | undefined,
  message: string = 'Value does not exist',
  context?: Record<string, any>
): asserts value is T {
  if (value === null || value === undefined) {
    throw new NotFoundError(message, context);
  }
}
