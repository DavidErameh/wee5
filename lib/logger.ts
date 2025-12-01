// lib/logger.ts - Structured logging utilities for the application
import pino from 'pino';

// Create a custom serializer for errors to capture full stack trace and context
const errorSerializer = (error: Error) => {
  return {
    type: error.constructor.name,
    message: error.message,
    stack: error.stack,
    ...(error.cause && { cause: errorSerializer(error.cause as Error) })
  };
};

// Pino logger instance with custom configuration
const logger = pino({
  level: process.env.LOG_LEVEL || 'info', // Can be overridden by environment variable
  formatters: {
    level(label) {
      return { level: label };
    }
  },
  base: {
    service: 'wee5-app',
    env: process.env.NODE_ENV || 'development',
    revision: process.env.VERCEL_GIT_COMMIT_SHA || process.env.CURRENT_VERSION
  },
  serializers: {
    error: errorSerializer,
    err: errorSerializer
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Export the main logger instance
export { logger };

// Create specialized loggers with specific contexts
export const appLogger = logger.child({ component: 'app' });
export const apiLogger = logger.child({ component: 'api' });
export const dbLogger = logger.child({ component: 'database' });
export const authLogger = logger.child({ component: 'auth' });
export const xpLogger = logger.child({ component: 'xp-system' });
export const rewardsLogger = logger.child({ component: 'rewards' });

// Helper function to create request-scoped logger with correlation ID
export function createRequestLogger(requestId: string, url?: string) {
  return logger.child({
    component: 'request',
    requestId,
    url,
    timestamp: new Date().toISOString()
  });
}

// Type definition for logging context
export interface LogContext {
  userId?: string;
  experienceId?: string;
  companyId?: string;
  operation?: string;
  requestId?: string;
  [key: string]: any; // Allow additional properties
}

// Enhanced logging functions with context
export const logWithContext = (level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal') => {
  return (message: string, context?: LogContext) => {
    if (context) {
      const childLogger = logger.child(context);
      childLogger[level](message);
    } else {
      logger[level](message);
    }
  };
};

// Convenience functions for common log levels
export const logTrace = logWithContext('trace');
export const logDebug = logWithContext('debug');
export const logInfo = logWithContext('info');
export const logWarn = logWithContext('warn');
export const logError = logWithContext('error');
export const logFatal = logWithContext('fatal');

// Specialized error logging function with additional context
export function logErrorWithContext(
  error: Error | string,
  context?: LogContext,
  message?: string
): void {
  const errorMsg = typeof error === 'string' ? error : error.message;
  const logMsg = message || 'An error occurred';
  
  if (context) {
    logger.child(context).error({ err: typeof error === 'string' ? new Error(error) : error }, logMsg);
  } else {
    logger.error({ err: typeof error === 'string' ? new Error(error) : error }, logMsg);
  }
}

// Performance logging utility
export function logPerformance(
  operation: string, 
  durationMs: number, 
  context?: LogContext
): void {
  const perfContext = {
    ...context,
    operation,
    durationMs,
    performance: true
  };

  // Log warnings for operations that take too long
  if (durationMs > 1000) { // More than 1 second
    logWarn(`Slow operation detected: ${operation} took ${durationMs}ms`, perfContext);
  } else {
    logInfo(`${operation} completed in ${durationMs}ms`, perfContext);
  }
}

// API request/response logging
export function logApiRequest(
  method: string,
  url: string,
  statusCode: number,
  durationMs: number,
  context?: LogContext
): void {
  const apiContext = {
    ...context,
    method,
    url,
    statusCode,
    durationMs,
    component: 'api-request'
  };

  const childLogger = logger.child(apiContext);
  
  if (statusCode >= 500) {
    childLogger.error(`API request failed: ${method} ${url}`);
  } else if (statusCode >= 400) {
    childLogger.warn(`API request error: ${method} ${url}`);
  } else {
    childLogger.info(`API request completed: ${method} ${url}`);
  }
}

// Business event logging
export function logBusinessEvent(
  event: string,
  context?: LogContext,
  metadata?: Record<string, unknown>
): void {
  const eventContext = {
    ...context,
    event,
    metadata,
    business_event: true
  };

  logger.child(eventContext).info(`Business event: ${event}`);
}

// Export a function to configure logger in different environments
export function configureLogger(env: string = process.env.NODE_ENV || 'development'): void {
  if (env === 'development') {
    logger.level = 'debug';
  } else if (env === 'production') {
    logger.level = 'info';
  } else if (env === 'test') {
    logger.level = 'silent'; // Reduce noise during testing
  }
}