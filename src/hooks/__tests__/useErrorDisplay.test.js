/**
 * Tests for useErrorDisplay hook
 */

import { renderHook, act } from '@testing-library/react';
import { useErrorDisplay } from '../useErrorDisplay';

// Mock platform
jest.mock('../../utils/platform', () => ({
  isWeb: true
}));

// Mock global variables
global.window = {};
global.process = { env: { NODE_ENV: 'test' } };

describe('useErrorDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with default values when no error', () => {
    const { result } = renderHook(() => useErrorDisplay(null, null));

    expect(result.current.userMessage).toBe('');
    expect(result.current.showDetails).toBe(false);
    expect(result.current.reportSent).toBe(false);
    expect(typeof result.current.sendReport).toBe('function');
    expect(typeof result.current.toggleDetails).toBe('function');
  });

  it('should set user message for generic error', () => {
    const error = new Error('Something went wrong');
    const { result } = renderHook(() => useErrorDisplay(error, null));

    expect(result.current.userMessage).toBe('An unexpected error occurred. Please try again.');
  });

  it('should set appropriate message for AsyncStorage error', () => {
    const error = new Error('AsyncStorage is not available');
    const { result } = renderHook(() => useErrorDisplay(error, null));

    expect(result.current.userMessage).toBe('There was a problem accessing your local data.');
  });

  it('should set appropriate message for network error', () => {
    const error = new Error('Network request failed');
    const { result } = renderHook(() => useErrorDisplay(error, null));

    expect(result.current.userMessage).toBe('Network connection issue. Please check your internet.');
  });

  it('should set appropriate message for fetch error', () => {
    const error = new Error('fetch failed');
    const { result } = renderHook(() => useErrorDisplay(error, null));

    expect(result.current.userMessage).toBe('Network connection issue. Please check your internet.');
  });

  it('should set appropriate message for undefined/null error', () => {
    const error = new Error('Cannot read property of undefined');
    const { result } = renderHook(() => useErrorDisplay(error, null));

    expect(result.current.userMessage).toBe('Something unexpected happened. Please reload the app.');
  });

  it('should toggle details visibility', () => {
    const error = new Error('Test error');
    const { result } = renderHook(() => useErrorDisplay(error, null));

    expect(result.current.showDetails).toBe(false);

    act(() => {
      result.current.toggleDetails();
    });

    expect(result.current.showDetails).toBe(true);

    act(() => {
      result.current.toggleDetails();
    });

    expect(result.current.showDetails).toBe(false);
  });

  it('should send error report', async () => {
    const error = new Error('Test error');
    const { result } = renderHook(() => useErrorDisplay(error, null));

    expect(result.current.reportSent).toBe(false);

    act(() => {
      result.current.sendReport();
    });

    // Advance timers to simulate async operation
    act(() => {
      jest.advanceTimersByTime(600);
    });

    // Wait for state update
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.reportSent).toBe(true);
  });

  it('should show details in development environment', () => {
    // Mock development environment
    global.__DEV__ = true;

    const error = new Error('Dev error');
    const { result } = renderHook(() => useErrorDisplay(error, null));

    expect(result.current.showDetails).toBe(true);

    // Cleanup
    delete global.__DEV__;
  });

  it('should handle error prop changes', () => {
    const { result, rerender } = renderHook(
      ({ error }) => useErrorDisplay(error, null),
      { initialProps: { error: null } }
    );

    expect(result.current.userMessage).toBe('');

    // Update with error
    const newError = new Error('New error');
    rerender({ error: newError });

    expect(result.current.userMessage).toBe('An unexpected error occurred. Please try again.');
  });
});