import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { AppError, handleError, withErrorHandling } from '@/lib/error-handler';

// Mock Sentry for testing
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

describe('Error Handler Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create AppError correctly', () => {
    const error = new AppError('Test error', 404, {
      operation: 'test_operation',
      userId: 'user_123'
    });

    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(404);
    expect(error.context?.operation).toBe('test_operation');
    expect(error.context?.userId).toBe('user_123');
  });

  it('should handle AppError properly', () => {
    const context = {
      operation: 'test_op',
      userId: 'user_123'
    };

    const appError = new AppError('Custom error', 400, context);
    const result = handleError(appError, context);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Custom error');
    expect(result.statusCode).toBe(400);
  });

  it('should handle unknown error properly', () => {
    const context = {
      operation: 'test_op'
    };

    const result = handleError('some random error', context);

    expect(result.success).toBe(false);
    expect(result.error).toBe('An unexpected error occurred');
    expect(result.statusCode).toBe(500);
  });

  it('should handle Error object properly', () => {
    const context = {
      operation: 'test_op'
    };

    const jsError = new Error('JS Error');
    const result = handleError(jsError, context);

    expect(result.success).toBe(false);
    expect(result.error).toBe('An unexpected error occurred');
    expect(result.statusCode).toBe(500);
  });

  it('should use withErrorHandling for successful operations', async () => {
    const testResult = { success: true, data: 'test' };
    const handler = () => Promise.resolve(testResult);

    const result = await withErrorHandling(handler, 'test_operation');

    expect(result).toEqual(testResult);
  });

  it('should handle errors in withErrorHandling', async () => {
    const error = new AppError('Handler error', 422);
    const handler = () => Promise.reject(error);

    const result = await withErrorHandling(handler, 'test_operation') as Response;

    expect(result.status).toBe(422);
    // Check if response body contains the error message
  });

  it('should handle generic errors in withErrorHandling', async () => {
    const handler = () => Promise.reject(new Error('Generic error'));

    const result = await withErrorHandling(handler, 'test_operation') as Response;

    expect(result.status).toBe(500);
  });

  it('should handle validation errors in withErrorHandling', async () => {
    const validationError: any = new Error('Validation failed');
    validationError.name = 'ZodError';
    validationError.issues = [{ path: ['field'], message: 'Invalid field' }];

    const handler = () => Promise.reject(validationError);

    const result = await withErrorHandling(handler, 'test_operation') as Response;

    expect(result.status).toBe(400);
  });
});