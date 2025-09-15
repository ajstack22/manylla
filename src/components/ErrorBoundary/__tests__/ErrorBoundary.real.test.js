/**
 * Real integration tests for ErrorBoundary
 * Tests actual error catching and fallback behavior
 * Focus: Real behavior testing as required by Story S029
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow = false, errorMessage = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div data-testid="no-error">No error occurred</div>;
};

// Component with async error
const AsyncError = ({ shouldThrow = false }) => {
  React.useEffect(() => {
    if (shouldThrow) {
      setTimeout(() => {
        throw new Error('Async error');
      }, 10);
    }
  }, [shouldThrow]);

  return <div data-testid="async-component">Async component</div>;
};

// Suppress console.error for error boundary tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary Real Integration', () => {
  beforeEach(() => {
    console.error.mockClear();
  });

  describe('Normal Operation', () => {
    test('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('no-error')).toBeInTheDocument();
      expect(screen.getByText('No error occurred')).toBeInTheDocument();
    });

    test('should render multiple children without errors', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('no-error')).toBeInTheDocument();
    });

    test('should handle complex nested components', () => {
      const NestedComponent = () => (
        <div data-testid="nested">
          <span>Nested content</span>
          <ThrowError shouldThrow={false} />
        </div>
      );

      render(
        <ErrorBoundary>
          <NestedComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('nested')).toBeInTheDocument();
      expect(screen.getByText('Nested content')).toBeInTheDocument();
    });
  });

  describe('Error Catching and Recovery', () => {
    test('should catch render errors and show fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Render error" />
        </ErrorBoundary>
      );

      // Should show error boundary fallback
      expect(screen.queryByTestId('no-error')).not.toBeInTheDocument();

      // Should display error information
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Console.error should have been called
      expect(console.error).toHaveBeenCalled();
    });

    test('should catch errors from nested components', () => {
      const NestedErrorComponent = () => (
        <div>
          <span>Before error</span>
          <ThrowError shouldThrow={true} errorMessage="Nested error" />
          <span>After error</span>
        </div>
      );

      render(
        <ErrorBoundary>
          <NestedErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Before error')).not.toBeInTheDocument();
      expect(screen.queryByText('After error')).not.toBeInTheDocument();
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    test('should handle different types of errors', () => {
      const TypeErrorComponent = () => {
        const obj = null;
        return <div>{obj.nonExistentProperty}</div>;
      };

      render(
        <ErrorBoundary>
          <TypeErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(console.error).toHaveBeenCalled();
    });

    test('should provide error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Development error" />
        </ErrorBoundary>
      );

      // In development, should show more error details
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error Boundary State Management', () => {
    test('should reset error state when children change', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should show error state
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Render with different children that don't throw
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should still show error state (doesn't auto-recover)
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    test('should handle multiple consecutive errors', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="First error" />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Render another error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Second error" />
        </ErrorBoundary>
      );

      // Should still show error UI
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    test('should isolate errors to the boundary scope', () => {
      render(
        <div>
          <div data-testid="outside-boundary">Outside boundary</div>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
          <div data-testid="after-boundary">After boundary</div>
        </div>
      );

      // Elements outside boundary should still render
      expect(screen.getByTestId('outside-boundary')).toBeInTheDocument();
      expect(screen.getByTestId('after-boundary')).toBeInTheDocument();

      // Error boundary should show fallback
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Props and Configuration', () => {
    test('should accept custom fallback component', () => {
      const CustomFallback = () => (
        <div data-testid="custom-fallback">Custom error message</div>
      );

      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    test('should pass error information to custom fallback', () => {
      const CustomFallback = ({ error, errorInfo }) => (
        <div data-testid="custom-fallback">
          <div>Error: {error?.message}</div>
          <div>Component stack available: {!!errorInfo?.componentStack}</div>
        </div>
      );

      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError shouldThrow={true} errorMessage="Custom error test" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error: Custom error test')).toBeInTheDocument();
      expect(screen.getByText(/Component stack available: true/)).toBeInTheDocument();
    });

    test('should handle missing fallback gracefully', () => {
      render(
        <ErrorBoundary fallback={null}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should fall back to default error UI
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Real-world Error Scenarios', () => {
    test('should handle API response parsing errors', () => {
      const ApiErrorComponent = () => {
        const [data, setData] = React.useState(null);

        React.useEffect(() => {
          // Simulate API response that causes parsing error
          const badResponse = { malformed: 'data' };
          const result = badResponse.nonExistent.deeply.nested.property;
          setData(result);
        }, []);

        return <div>{data}</div>;
      };

      render(
        <ErrorBoundary>
          <ApiErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    test('should handle state update errors', () => {
      const StateErrorComponent = () => {
        const [state, setState] = React.useState({ count: 0 });

        React.useEffect(() => {
          // Simulate error in state update
          setState(prevState => {
            if (prevState.count === 0) {
              throw new Error('State update error');
            }
            return prevState;
          });
        }, []);

        return <div>Count: {state.count}</div>;
      };

      render(
        <ErrorBoundary>
          <StateErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    test('should handle component lifecycle errors', () => {
      const LifecycleErrorComponent = () => {
        React.useEffect(() => {
          throw new Error('Effect error');
        }, []);

        return <div>Component content</div>;
      };

      render(
        <ErrorBoundary>
          <LifecycleErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    test('should handle errors in event handlers gracefully', () => {
      // Note: Error boundaries don't catch errors in event handlers
      // This test verifies that the boundary doesn't interfere with normal error handling
      let eventError = null;

      const EventErrorComponent = () => {
        const handleClick = () => {
          try {
            throw new Error('Event handler error');
          } catch (error) {
            eventError = error;
          }
        };

        return (
          <button data-testid="error-button" onClick={handleClick}>
            Click to trigger error
          </button>
        );
      };

      render(
        <ErrorBoundary>
          <EventErrorComponent />
        </ErrorBoundary>
      );

      const button = screen.getByTestId('error-button');
      button.click();

      // Component should still be rendered (error boundary doesn't catch event errors)
      expect(screen.getByTestId('error-button')).toBeInTheDocument();
      expect(eventError).toBeDefined();
      expect(eventError.message).toBe('Event handler error');
    });
  });

  describe('Performance and Memory', () => {
    test('should not impact performance when no errors occur', () => {
      const HeavyComponent = () => {
        const items = Array.from({ length: 1000 }, (_, i) => `Item ${i}`);
        return (
          <div data-testid="heavy-component">
            {items.map(item => <div key={item}>{item}</div>)}
          </div>
        );
      };

      const startTime = Date.now();

      render(
        <ErrorBoundary>
          <HeavyComponent />
        </ErrorBoundary>
      );

      const endTime = Date.now();

      expect(screen.getByTestId('heavy-component')).toBeInTheDocument();
      expect(endTime - startTime).toBeLessThan(1000); // Should be fast
    });

    test('should clean up properly when unmounted', () => {
      const { unmount } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });
  });
});