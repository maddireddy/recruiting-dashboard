/**
 * Centralized Logging Service
 *
 * Provides structured logging with environment-aware behavior:
 * - Development: Console logging with colors and context
 * - Production: Integration with error tracking (Sentry, CloudWatch, etc.)
 */

import { captureException, captureMessage, addBreadcrumb } from './monitoring';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDev = import.meta.env.DEV;
  private isProd = import.meta.env.PROD;

  /**
   * Debug-level logging (only in development)
   * Use for detailed diagnostic information
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.debug(
        `%c[DEBUG] ${message}`,
        'color: #6B7280; font-weight: normal;',
        context || ''
      );
    }
  }

  /**
   * Info-level logging
   * Use for general informational messages
   */
  info(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.info(
        `%c[INFO] ${message}`,
        'color: #3B82F6; font-weight: bold;',
        context || ''
      );
    }

    // In production, send to logging service
    if (this.isProd && context) {
      this.sendToLoggingService('info', message, context);
    }
  }

  /**
   * Warning-level logging
   * Use for potentially harmful situations
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.warn(
        `%c[WARN] ${message}`,
        'color: #F59E0B; font-weight: bold;',
        context || ''
      );
    }

    // In production, send to monitoring
    if (this.isProd) {
      this.sendToLoggingService('warn', message, context);
    }
  }

  /**
   * Error-level logging
   * Use for error events that might still allow the application to continue
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.isDev) {
      console.error(
        `%c[ERROR] ${message}`,
        'color: #EF4444; font-weight: bold;',
        error || '',
        context || ''
      );
    }

    // In production, send to error tracking (Sentry)
    if (this.isProd) {
      this.sendToErrorTracking(message, error, context);
    }
  }

  /**
   * Log successful operations
   */
  success(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.log(
        `%c[SUCCESS] ${message}`,
        'color: #10B981; font-weight: bold;',
        context || ''
      );
    }
  }

  /**
   * Log workflow events (BPM system)
   */
  workflow(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.log(
        `%c[WORKFLOW] ${message}`,
        'color: #8B5CF6; font-weight: bold;',
        context || ''
      );
    }

    if (this.isProd && context) {
      this.sendToLoggingService('info', `[WORKFLOW] ${message}`, context);
    }
  }

  /**
   * Log API requests/responses
   */
  api(method: string, url: string, context?: LogContext): void {
    if (this.isDev) {
      console.log(
        `%c[API] ${method.toUpperCase()} ${url}`,
        'color: #06B6D4; font-weight: normal;',
        context || ''
      );
    }
  }

  /**
   * Group related logs together
   */
  group(label: string, callback: () => void): void {
    if (this.isDev) {
      console.group(`%c${label}`, 'color: #8B5CF6; font-weight: bold;');
      callback();
      console.groupEnd();
    } else {
      callback();
    }
  }

  /**
   * Send logs to external logging service in production
   * Integration point for CloudWatch, Datadog, etc.
   */
  private sendToLoggingService(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): void {
    try {
      // Send to Sentry as breadcrumb for context
      addBreadcrumb(level, message, context);

      // For warnings and errors, also capture as message
      if (level === 'warn' || level === 'error') {
        captureMessage(message, level === 'warn' ? 'warning' : 'error', context);
      }
    } catch (err) {
      // Fail silently - don't let logging break the app
      console.error('Failed to send log to logging service:', err);
    }
  }

  /**
   * Send errors to error tracking service in production
   * Integration point for Sentry, Rollbar, etc.
   */
  private sendToErrorTracking(
    message: string,
    error?: Error | unknown,
    context?: LogContext
  ): void {
    try {
      // Send to Sentry error tracking
      if (error instanceof Error) {
        // Capture as exception with full stack trace
        captureException(error, {
          message,
          ...context,
        });
      } else if (error) {
        // Capture as message if not an Error object
        captureMessage(message, 'error', {
          error,
          ...context,
        });
      } else {
        // No error object, just capture the message
        captureMessage(message, 'error', context);
      }
    } catch (err) {
      // Fail silently
      console.error('Failed to send error to tracking service:', err);
    }
  }

  /**
   * Performance timing measurement
   */
  time(label: string): void {
    if (this.isDev) {
      console.time(label);
    }
  }

  /**
   * End performance timing measurement
   */
  timeEnd(label: string): void {
    if (this.isDev) {
      console.timeEnd(label);
    }
  }

  /**
   * Log table data (useful for debugging arrays/objects)
   */
  table(data: any): void {
    if (this.isDev) {
      console.table(data);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in other files
export type { LogLevel, LogContext };
