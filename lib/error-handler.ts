// lib/error-handler.ts
import * as Sentry from '@sentry/nextjs';

// For test environment compatibility
declare const NextResponse: any;

export interface ErrorContext {
  operation: string;
  userId?: string;
  experienceId?: string;
  metadata?: Record<string, any>;
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public context?: ErrorContext
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown, context: ErrorContext) {
  const startTime = Date.now();

  // Sanitize error for logging
  const sanitizedError = error instanceof Error
    ? {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }
    : { message: 'Unknown error' };

  // Log with context
  console.error('Application Error:', {
    ...context,
    error: sanitizedError,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });

  // Capture in Sentry with enhanced context
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      tags: {
        operation: context.operation,
        environment: process.env.NODE_ENV || 'unknown',
        status_code: context.metadata?.statusCode || 500,
      },
      contexts: {
        operation: context,
        performance: {
          duration_ms: Date.now() - startTime,
        },
        request: context.metadata?.request || {},
      },
      user: context.userId ? { id: context.userId } : undefined,
    });
  }

  // Return sanitized error for client
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      statusCode: error.statusCode,
    };
  }

  return {
    success: false,
    error: 'An unexpected error occurred',
    statusCode: 500,
  };
}

/**
 * Creates a consistent error response for API routes
 */
export function createApiResponse(data: any, statusCode: number = 200) {
  // This function should only be used in API routes, not in tests
  try {
    return new Response(JSON.stringify(data), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch {
    // Fallback for test environment
    return {
      json: async () => data,
      status: statusCode,
    };
  }
}

/**
 * Creates a consistent error response for API routes
 */
export function createErrorResponse(message: string, statusCode: number, details?: any) {
  const errorResponse = {
    error: message,
    ...(details && { details })
  };
  
  // This function should only be used in API routes, not in tests
  try {
    return new Response(JSON.stringify(errorResponse), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch {
    // Fallback for test environment
    return {
      json: async () => errorResponse,
      status: statusCode,
    };
  }
}

/**
 * Safely executes an API route handler with enhanced error handling
 */
export async function withErrorHandling<T>(
  handler: () => Promise<T>,
  operation: string,
  userId?: string,
  experienceId?: string
): Promise<T | Response> {
  const startTime = Date.now();
  
  try {
    return await handler();
  } catch (error) {
    // Prepare context for logging and Sentry
    const context: ErrorContext = {
      operation,
      userId,
      experienceId,
      metadata: {
        timestamp: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
        environment: process.env.NODE_ENV || 'unknown'
      }
    };

    // Sanitize error for logging
    const sanitizedError = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        }
      : { message: 'Unknown error' };

    // Log with enhanced context
    console.error('API Route Error:', {
      ...context,
      error: sanitizedError,
    });

    // Capture in Sentry with comprehensive context
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, {
        tags: {
          operation,
          environment: process.env.NODE_ENV || 'unknown',
        },
        contexts: {
          operation: context,
          performance: {
            duration_ms: Date.now() - startTime,
          },
          error: sanitizedError,
        },
        user: userId ? { id: userId } : undefined,
      });
    }

    // Return appropriate error response
    if (error instanceof AppError) {
      return createErrorResponse(error.message, error.statusCode, error.context);
    }

    if (error instanceof Error) {
      // Handle known error types with specific responses
      if ((error as any).name === 'ZodError') {
        return createErrorResponse('Invalid request data', 400, { 
          message: error.message,
          validation_errors: (error as any).issues || [] 
        });
      }
      
      if (error.message.toLowerCase().includes('database') || error.message.toLowerCase().includes('pgrest')) {
        return createErrorResponse('Database error occurred', 500, {
          type: 'DATABASE_ERROR',
          message: error.message
        });
      }
      
      // Handle specific error cases
      if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('too many requests')) {
        return createErrorResponse('Rate limit exceeded', 429);
      }
    }

    return createErrorResponse('Internal server error', 500, {
      type: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
    });
  }
}