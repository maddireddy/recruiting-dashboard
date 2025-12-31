/**
 * Application Monitoring & Error Tracking
 *
 * Centralized configuration for Sentry error tracking and performance monitoring
 */

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
export function initializeMonitoring(): void {
  // Only initialize Sentry in production
  if (!import.meta.env.PROD) {
    console.log('[Monitoring] Sentry disabled in development mode');
    return;
  }

  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

  if (!sentryDsn) {
    console.warn('[Monitoring] Sentry DSN not configured, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,

    // Integrations
    integrations: [
      new BrowserTracing({
        // Set sampling rate for performance monitoring
        tracingOrigins: ['localhost', /^\//],
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in prod, 100% in dev

    // Error Sampling
    sampleRate: 1.0, // Capture 100% of errors

    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || 'development',

    // Ignore common/expected errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      // Network errors that are expected
      'NetworkError',
      'Network request failed',
      // Abort errors (user cancelled)
      'AbortError',
      'The user aborted a request',
    ],

    // Attach user context
    beforeSend(event, hint) {
      // Don't send events in development
      if (!import.meta.env.PROD) {
        return null;
      }

      // Add custom context
      const error = hint.originalException;

      if (error && typeof error === 'object') {
        // Add extra context for debugging
        event.extra = {
          ...event.extra,
          timestamp: new Date().toISOString(),
        };
      }

      return event;
    },
  });

  console.log('[Monitoring] Sentry initialized successfully');
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  name?: string;
  tenantId?: string;
  role?: string;
}): void {
  if (!import.meta.env.PROD) {
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
  });

  // Add custom tags
  if (user.tenantId) {
    Sentry.setTag('tenant_id', user.tenantId);
  }

  if (user.role) {
    Sentry.setTag('user_role', user.role);
  }
}

/**
 * Clear user context on logout
 */
export function clearUserContext(): void {
  if (!import.meta.env.PROD) {
    return;
  }

  Sentry.setUser(null);
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  if (!import.meta.env.PROD) {
    console.error('[Monitoring] Error captured (dev mode):', error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Manually capture a message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>): void {
  if (!import.meta.env.PROD) {
    console.log(`[Monitoring] Message captured (dev mode) [${level}]:`, message, context);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(category: string, message: string, data?: Record<string, any>): void {
  if (!import.meta.env.PROD) {
    return;
  }

  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
    timestamp: Date.now() / 1000,
  });
}

/**
 * Set custom context
 */
export function setContext(name: string, context: Record<string, any>): void {
  if (!import.meta.env.PROD) {
    return;
  }

  Sentry.setContext(name, context);
}

/**
 * Start a transaction for performance monitoring
 */
export function startTransaction(name: string, op: string): Sentry.Transaction | null {
  if (!import.meta.env.PROD) {
    return null;
  }

  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Wrap component with error boundary
 */
export const ErrorBoundary = Sentry.ErrorBoundary;

/**
 * Performance profiler HOC
 */
export const withProfiler = Sentry.withProfiler;
