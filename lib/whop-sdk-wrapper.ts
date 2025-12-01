// lib/whop-sdk-wrapper.ts - Robust Whop API wrapper with retry logic
import * as Sentry from '@sentry/nextjs';
import { whopSdk } from './whop-sdk';

// Define retry configuration
interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number;  // milliseconds
  factor?: number;   // exponential factor (default 2)
  jitter?: boolean;  // add randomness to delays
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds  
  factor: 2,
  jitter: true,
};

export interface WhopApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  retryCount?: number;
}

// Generic request wrapper with retry logic
async function makeRequestWithRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<WhopApiResult<T>> {
  let lastError: Error | null = null;
  let retryCount = 0;
  
  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      const result = await operation();
      
      // Success - return the result
      return {
        success: true,
        data: result,
        retryCount: attempt > 1 ? attempt - 1 : 0
      };
    } catch (error) {
      lastError = error as Error;
      retryCount = attempt - 1;
      
      // If this was the last attempt, break out of the retry loop
      if (attempt >= config.maxRetries + 1) {
        break;
      }
      
      // Check if error is retryable (non-retryable: 400, 401, 403, 404)
      if (isNonRetryableError(error)) {
        console.warn(`Non-retryable error occurred: ${error}`);
        break;
      }
      
      // Calculate delay with exponential backoff
      let delay = config.baseDelay * Math.pow(config.factor || 2, attempt - 1);
      
      // Add jitter to prevent thundering herd
      if (config.jitter) {
        const jitter = Math.random() * 0.3 * delay; // Add up to 30% jitter
        delay = Math.min(delay + jitter, config.maxDelay);
      }
      
      delay = Math.min(delay, config.maxDelay);
      
      console.warn(
        `Whop API call failed (attempt ${attempt}/${config.maxRetries}):`, 
        error, 
        `Retrying in ${Math.round(delay)}ms...`
      );
      
      // Wait for the calculated delay
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // All attempts failed
  const errorMessage = getErrorMessage(lastError);
  
  // Log to Sentry
  Sentry.captureException(lastError, {
    tags: { 
      component: 'whop-api',
      retry_count: retryCount,
      max_retries: config.maxRetries
    },
    extra: {
      operation: operation.toString(),
      last_error: errorMessage
    }
  });
  
  console.error(`Whop API failed after ${retryCount} retries:`, lastError);
  
  return {
    success: false,
    error: errorMessage,
    retryCount
  };
}

// Helper to determine if error is non-retryable
function isNonRetryableError(error: any): boolean {
  // Check if it's an HTTP error with status code
  if (error?.status) {
    const status = parseInt(error.status, 10);
    // 4xx errors are generally client errors, not retryable
    return status >= 400 && status < 500 && ![429].includes(status); // 429 is retryable
  }
  
  // Check for specific error patterns
  if (error?.message) {
    const msg = error.message.toLowerCase();
    // Authorization/permission errors are not retryable
    return msg.includes('unauthorized') || 
           msg.includes('forbidden') || 
           msg.includes('invalid') ||
           msg.includes('not found');
  }
  
  return false;
}

// Helper to extract meaningful error message
function getErrorMessage(error: any): string {
  if (!error) return 'Unknown error';
  
  if (error.message) return error.message;
  if (error.error) return error.error;
  if (typeof error === 'string') return error;
  
  return JSON.stringify(error);
}

// Export individual wrapped API functions with retry logic

export const addFreeDaysToMembership = async (
  membershipId: string, 
  days: number
): Promise<WhopApiResult<any>> => {
  return makeRequestWithRetry(async () => {
    return await whopSdk.memberships.addFreeDays({
      id: membershipId,
      days: days,
    });
  });
};

export const listUserMemberships = async (
  userId: string
): Promise<WhopApiResult<any>> => {
  return makeRequestWithRetry(async () => {
    return await whopSdk.memberships.list({
      user_id: userId,
    });
  });
};

export const getMembership = async (
  membershipId: string
): Promise<WhopApiResult<any>> => {
  return makeRequestWithRetry(async () => {
    return await whopSdk.memberships.get({
      id: membershipId,
    });
  });
};

export const sendPushNotification = async (
  params: {
    userId: string;
    title: string;
    message: string;
    experienceId?: string;
  }
): Promise<WhopApiResult<any>> => {
  return makeRequestWithRetry(async () => {
    return await whopSdk.notifications.sendPushNotification({
      user_id: params.userId,
      title: params.title,
      body: params.message,
      experience_id: params.experienceId,
    });
  });
};

export const createPromoCode = async (
  params: {
    code: string;
    discountPercent: number;
    maxUses?: number;
    expiresAt?: Date;
  }
): Promise<WhopApiResult<any>> => {
  return makeRequestWithRetry(async () => {
    return await whopSdk.promoCodes.create({
      code: params.code,
      discount_percent: params.discountPercent,
      max_uses: params.maxUses,
      expires_at: params.expiresAt?.toISOString(),
    });
  });
};

export const getExperience = async (
  experienceId: string
): Promise<WhopApiResult<any>> => {
  return makeRequestWithRetry(async () => {
    return await whopSdk.experiences.get({
      id: experienceId,
    });
  });
};

// Export a direct Whop client access function if needed
export const makeDirectWhopCall = async <T>(
  operation: () => Promise<T>,
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<WhopApiResult<T>> => {
  return makeRequestWithRetry(operation, retryConfig);
};

// Health check function to verify Whop API connectivity
export const checkWhopApiHealth = async (): Promise<boolean> => {
  try {
    // A lightweight call to test API connectivity
    await whopSdk.health.getStatus();
    return true;
  } catch (error) {
    console.error('Whop API health check failed:', error);
    return false;
  }
};