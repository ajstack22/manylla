/**
 * @jest-environment jsdom
 */
import {
  AppError,
  NetworkError,
  ValidationError,
  SyncError,
  EncryptionError,
  StorageError,
  AuthError,
  ErrorHandler,
} from '../errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create AppError with all properties', () => {
      const error = new AppError(
        'Test message',
        'TEST_CODE',
        'User message',
        true
      );

      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.userMessage).toBe('User message');
      expect(error.recoverable).toBe(true);
      expect(error.timestamp).toBeDefined();
      expect(error.name).toBe('AppError');
    });

    it('should default recoverable to false', () => {
      const error = new AppError('Test', 'CODE', 'User message');
      expect(error.recoverable).toBe(false);
    });
  });

  describe('NetworkError', () => {
    it('should create NetworkError with default values', () => {
      const error = new NetworkError('Connection failed');

      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.userMessage).toBe('Connection issue. Please check your internet and try again.');
      expect(error.retryable).toBe(true);
      expect(error.recoverable).toBe(true);
    });

    it('should create non-retryable NetworkError', () => {
      const error = new NetworkError('Permanent failure', false);
      expect(error.retryable).toBe(false);
      expect(error.recoverable).toBe(false);
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with field', () => {
      const error = new ValidationError('email', 'Invalid email format');

      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.field).toBe('email');
      expect(error.userMessage).toBe('Invalid email format');
      expect(error.recoverable).toBe(true);
      expect(error.message).toBe('Validation failed for email');
    });
  });

  describe('SyncError', () => {
    it('should create SyncError with default retry capability', () => {
      const error = new SyncError('Sync failed');

      expect(error.code).toBe('SYNC_ERROR');
      expect(error.userMessage).toBe('Unable to sync your data. Your changes are saved locally.');
      expect(error.canRetry).toBe(true);
      expect(error.recoverable).toBe(true);
    });

    it('should create non-retryable SyncError', () => {
      const error = new SyncError('Fatal sync error', false);
      expect(error.canRetry).toBe(false);
      expect(error.recoverable).toBe(false);
    });
  });

  describe('EncryptionError', () => {
    it('should create non-recoverable EncryptionError', () => {
      const error = new EncryptionError('Encryption failed');

      expect(error.code).toBe('ENCRYPTION_ERROR');
      expect(error.userMessage).toBe('Security error. Please try again or contact support.');
      expect(error.recoverable).toBe(false);
    });
  });

  describe('StorageError', () => {
    it('should create StorageError with default code', () => {
      const error = new StorageError('Storage failed');

      expect(error.code).toBe('STORAGE_ERROR');
      expect(error.userMessage).toBe('Storage error. Please try again.');
      expect(error.recoverable).toBe(true);
    });

    it('should create StorageError with specific codes and messages', () => {
      const quotaError = new StorageError('Quota exceeded', 'QUOTA_EXCEEDED');
      expect(quotaError.userMessage).toBe('Storage full. Please delete old profiles or data.');

      const saveError = new StorageError('Save failed', 'SAVE_FAILED');
      expect(saveError.userMessage).toBe('Failed to save. Please try again.');

      const loadError = new StorageError('Load failed', 'LOAD_FAILED');
      expect(loadError.userMessage).toBe('Failed to load data. Please refresh the page.');

      const corruptedError = new StorageError('Data corrupted', 'CORRUPTED');
      expect(corruptedError.userMessage).toBe('Data corrupted. Attempting recovery...');
      expect(corruptedError.recoverable).toBe(false);
    });
  });

  describe('AuthError', () => {
    it('should create AuthError with default code', () => {
      const error = new AuthError('Auth failed');

      expect(error.code).toBe('AUTH_ERROR');
      expect(error.userMessage).toBe('Authentication error. Please try again.');
      expect(error.recoverable).toBe(true);
    });

    it('should create AuthError with specific codes and messages', () => {
      const invalidError = new AuthError('Invalid code', 'INVALID_CODE');
      expect(invalidError.userMessage).toBe('Invalid sync code. Please check and try again.');

      const expiredError = new AuthError('Session expired', 'EXPIRED');
      expect(expiredError.userMessage).toBe('Session expired. Please re-enable sync.');

      const unauthorizedError = new AuthError('Access denied', 'UNAUTHORIZED');
      expect(unauthorizedError.userMessage).toBe('Access denied. Please check your permissions.');
    });
  });
});

describe('ErrorHandler', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('log', () => {
    it('should log error in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new AppError('Test error', 'TEST_CODE', 'User message');
      ErrorHandler.log(error, { context: 'test' });

      expect(consoleSpy).toHaveBeenCalledWith('Error occurred:', expect.objectContaining({
        message: 'Test error',
        code: 'TEST_CODE',
        context: { context: 'test' },
        stack: expect.any(String),
        timestamp: expect.any(String),
      }));

      process.env.NODE_ENV = originalEnv;
    });

    it('should not log error in production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new AppError('Test error', 'TEST_CODE', 'User message');
      ErrorHandler.log(error);

      expect(consoleSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('normalize', () => {
    it('should return AppError unchanged', () => {
      const appError = new AppError('Test', 'CODE', 'Message');
      const result = ErrorHandler.normalize(appError);
      expect(result).toBe(appError);
    });

    it('should convert network errors to NetworkError', () => {
      const fetchError = new Error('fetch failed');
      const result = ErrorHandler.normalize(fetchError);

      expect(result).toBeInstanceOf(NetworkError);
      expect(result.code).toBe('NETWORK_ERROR');
      expect(result.message).toBe('fetch failed');
    });

    it('should convert quota errors to StorageError', () => {
      const quotaError = new Error('Quota exceeded');
      quotaError.name = 'QuotaExceededError';
      const result = ErrorHandler.normalize(quotaError);

      expect(result).toBeInstanceOf(StorageError);
      expect(result.code).toBe('QUOTA_EXCEEDED');
    });

    it('should convert unknown errors to AppError', () => {
      const unknownError = new Error('Unknown error');
      const result = ErrorHandler.normalize(unknownError);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.userMessage).toBe('Something went wrong. Please try again.');
      expect(result.recoverable).toBe(true);
    });

    it('should handle errors without message', () => {
      const errorWithoutMessage = new Error();
      const result = ErrorHandler.normalize(errorWithoutMessage);

      expect(result.message).toBe('An unexpected error occurred');
    });
  });

  describe('getUserMessage', () => {
    it('should return user message for AppError', () => {
      const appError = new AppError('Tech message', 'CODE', 'User-friendly message');
      const result = ErrorHandler.getUserMessage(appError);
      expect(result).toBe('User-friendly message');
    });

    it('should return default message for non-AppError', () => {
      const genericError = new Error('Some error');
      const result = ErrorHandler.getUserMessage(genericError);
      expect(result).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('isRecoverable', () => {
    it('should return recoverable property for AppError', () => {
      const recoverableError = new AppError('Test', 'CODE', 'Message', true);
      const nonRecoverableError = new AppError('Test', 'CODE', 'Message', false);

      expect(ErrorHandler.isRecoverable(recoverableError)).toBe(true);
      expect(ErrorHandler.isRecoverable(nonRecoverableError)).toBe(false);
    });

    it('should return true for non-AppError (optimistic)', () => {
      const genericError = new Error('Some error');
      const result = ErrorHandler.isRecoverable(genericError);
      expect(result).toBe(true);
    });
  });
});