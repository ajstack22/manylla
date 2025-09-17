/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useErrorHandler } from '../useErrorHandler';
import platform from '../../utils/platform';
import { ErrorHandler } from '../../utils/errors';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../utils/platform');
jest.mock('../../utils/errors');

// Mock window and Sentry
const mockSentry = {
  captureException: jest.fn(),
};

Object.defineProperty(window, 'Sentry', {
  value: mockSentry,
  writable: true,
});

// TODO: P2 - Error handling state management
describe.skip('useErrorHandler', () => {
  const mockError = new Error('Test error');
  const mockErrorInfo = {
    componentStack: 'Component stack trace',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock platform
    platform.isWeb = true;

    // Mock ErrorHandler
    ErrorHandler.normalize = jest.fn((error) => ({
      ...error,
      code: 'NORMALIZED_ERROR',
      userMessage: 'User friendly message',
    }));
    ErrorHandler.log = jest.fn();
    ErrorHandler.getUserMessage = jest.fn(() => 'User friendly message');

    // Mock AsyncStorage
    AsyncStorage.getAllKeys = jest.fn(() => Promise.resolve([
      'manylla_profile_1',
      'manylla_profile_2',
      'manylla_all_profiles',
      'other_key'
    ]));
    AsyncStorage.multiRemove = jest.fn(() => Promise.resolve());
    AsyncStorage.clear = jest.fn(() => Promise.resolve());

    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: jest.fn() },
      writable: true,
    });
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useErrorHandler());

    expect(result.current.error).toBeNull();
    expect(result.current.errorInfo).toBeNull();
    expect(result.current.errorCount).toBe(0);
    expect(result.current.isRecovering).toBe(false);
  });

  describe('logError', () => {
    it('should log error and update state', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.logError(mockError, mockErrorInfo);
      });

      expect(ErrorHandler.normalize).toHaveBeenCalledWith(mockError);
      expect(ErrorHandler.log).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'NORMALIZED_ERROR' }),
        expect.objectContaining({
          errorInfo: mockErrorInfo,
          component: 'ErrorBoundary',
          timestamp: expect.any(String),
        })
      );

      expect(result.current.error).toEqual(expect.objectContaining({
        code: 'NORMALIZED_ERROR',
      }));
      expect(result.current.errorInfo).toBe(mockErrorInfo);
      expect(result.current.errorCount).toBe(1);
    });

    it('should send error to Sentry when available', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.logError(mockError, mockErrorInfo);
      });

      expect(mockSentry.captureException).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'NORMALIZED_ERROR' }),
        {
          contexts: { react: mockErrorInfo },
        }
      );
    });

    it('should not send to Sentry when not available', () => {
      window.Sentry = undefined;
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.logError(mockError, mockErrorInfo);
      });

      expect(mockSentry.captureException).not.toHaveBeenCalled();
    });

    it('should increment error count on multiple errors', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.logError(mockError, mockErrorInfo);
      });

      expect(result.current.errorCount).toBe(1);

      act(() => {
        result.current.logError(new Error('Second error'), mockErrorInfo);
      });

      expect(result.current.errorCount).toBe(2);
    });
  });

  describe('resetError', () => {
    it('should reset all error state', () => {
      const { result } = renderHook(() => useErrorHandler());

      // First set some error state
      act(() => {
        result.current.logError(mockError, mockErrorInfo);
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.errorInfo).not.toBeNull();

      // Then reset
      act(() => {
        result.current.resetError();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.errorInfo).toBeNull();
      expect(result.current.isRecovering).toBe(false);
    });
  });

  describe('recoverError', () => {
    it('should recover from storage error by clearing corrupted storage', async () => {
      const storageError = { code: 'STORAGE_ERROR', message: 'Storage corrupted' };
      ErrorHandler.normalize.mockReturnValue(storageError);

      const { result } = renderHook(() => useErrorHandler());

      // Set storage error
      act(() => {
        result.current.logError(storageError, mockErrorInfo);
      });

      // Recover
      await act(async () => {
        await result.current.recoverError();
      });

      expect(AsyncStorage.getAllKeys).toHaveBeenCalled();
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        'manylla_profile_1',
        'manylla_profile_2',
        'manylla_all_profiles'
      ]);
      expect(result.current.error).toBeNull();
      expect(result.current.isRecovering).toBe(false);
    });

    it('should recover from state error by clearing all storage', async () => {
      const stateError = { code: 'STATE_ERROR', message: 'State corrupted' };
      ErrorHandler.normalize.mockReturnValue(stateError);

      const { result } = renderHook(() => useErrorHandler());

      // Set state error
      act(() => {
        result.current.logError(stateError, mockErrorInfo);
      });

      // Recover
      await act(async () => {
        await result.current.recoverError();
      });

      expect(AsyncStorage.clear).toHaveBeenCalled();
      expect(result.current.error).toBeNull();
    });

    it('should handle recovery failure by reloading page', async () => {
      const storageError = { code: 'STORAGE_ERROR', message: 'Storage corrupted' };
      ErrorHandler.normalize.mockReturnValue(storageError);

      // Make AsyncStorage.getAllKeys fail
      AsyncStorage.getAllKeys.mockRejectedValue(new Error('Storage access failed'));

      const { result } = renderHook(() => useErrorHandler());

      // Set error
      act(() => {
        result.current.logError(storageError, mockErrorInfo);
      });

      // Attempt recovery
      await act(async () => {
        await result.current.recoverError();
      });

      expect(window.location.reload).toHaveBeenCalled();
    });

    it('should set recovering state during recovery', async () => {
      const { result } = renderHook(() => useErrorHandler());

      // Set error
      act(() => {
        result.current.logError(mockError, mockErrorInfo);
      });

      // Start recovery
      let recoverPromise;
      act(() => {
        recoverPromise = result.current.recoverError();
      });

      expect(result.current.isRecovering).toBe(true);

      await act(async () => {
        await recoverPromise;
      });

      expect(result.current.isRecovering).toBe(false);
    });

    it('should not reload page on non-web platforms', async () => {
      platform.isWeb = false;

      const storageError = { code: 'STORAGE_ERROR', message: 'Storage corrupted' };
      ErrorHandler.normalize.mockReturnValue(storageError);
      AsyncStorage.getAllKeys.mockRejectedValue(new Error('Storage access failed'));

      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.logError(storageError, mockErrorInfo);
      });

      await act(async () => {
        await result.current.recoverError();
      });

      expect(window.location.reload).not.toHaveBeenCalled();
    });
  });

  describe('getErrorMessage', () => {
    it('should return user-friendly error message', () => {
      const { result } = renderHook(() => useErrorHandler());

      const message = result.current.getErrorMessage(mockError);

      expect(ErrorHandler.getUserMessage).toHaveBeenCalledWith(mockError);
      expect(message).toBe('User friendly message');
    });
  });

  describe('sendErrorReport', () => {
    it('should send error report with normalized error', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const errorData = {
        error: mockError,
        description: 'User description',
        reproductionSteps: 'Steps to reproduce',
      };

      await act(async () => {
        await result.current.sendErrorReport(errorData);
      });

      expect(ErrorHandler.normalize).toHaveBeenCalledWith(mockError);
      expect(ErrorHandler.log).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'NORMALIZED_ERROR' }),
        expect.objectContaining({
          userReport: true,
          description: 'User description',
          reproductionSteps: 'Steps to reproduce',
        })
      );
    });

    it('should send to Sentry when available on web', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const errorData = { error: mockError };

      await act(async () => {
        await result.current.sendErrorReport(errorData);
      });

      expect(mockSentry.captureException).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'NORMALIZED_ERROR' }),
        {
          contexts: {
            error: errorData,
          },
        }
      );
    });

    it('should not send to Sentry when not on web', async () => {
      platform.isWeb = false;
      const { result } = renderHook(() => useErrorHandler());
      const errorData = { error: mockError };

      await act(async () => {
        await result.current.sendErrorReport(errorData);
      });

      expect(mockSentry.captureException).not.toHaveBeenCalled();
    });
  });

  describe('error handling edge cases', () => {
    it('should handle null error gracefully', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.logError(null, mockErrorInfo);
      });

      expect(ErrorHandler.normalize).toHaveBeenCalledWith(null);
      expect(result.current.errorCount).toBe(1);
    });

    it('should handle missing errorInfo gracefully', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.logError(mockError, null);
      });

      expect(ErrorHandler.log).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          errorInfo: null,
        })
      );
    });

    it('should handle missing window object gracefully', async () => {
      const originalWindow = global.window;
      delete global.window;

      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.logError(mockError, mockErrorInfo);
      });

      // Should not crash when window is undefined
      expect(result.current.error).toBeTruthy();

      global.window = originalWindow;
    });
  });
});