/* eslint-disable */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

// Mock React Native modules
jest.mock('react-native', () => ({
  View: ({ children, ...props }) => <div data-testid="view" {...props}>{children}</div>,
  Text: ({ children, ...props }) => <span data-testid="text" {...props}>{children}</span>,
  TouchableOpacity: ({ onPress, children, ...props }) => (
    <button onClick={onPress} data-testid="touchable" {...props}>{children}</button>
  ),
  ScrollView: ({ children, ...props }) => <div data-testid="scrollview" {...props}>{children}</div>,
  StyleSheet: {
    create: (styles) => styles,
  },
}));

// Mock hooks and utilities
const mockErrorHandler = {
  logError: jest.fn(),
  resetError: jest.fn(),
  recoverError: jest.fn(),
  errorCount: 1,
  isRecovering: false,
  getErrorMessage: jest.fn().mockReturnValue('Test error message'),
  sendErrorReport: jest.fn(),
};

jest.mock('../../../hooks/useErrorHandler', () => ({
  useErrorHandler: () => mockErrorHandler,
}));

jest.mock('../ErrorFallback', () => ({
  ErrorFallback: ({ error, resetError, errorCount, onRecover, isRecovering }) => (
    <div data-testid="error-fallback">
      <span>Error: {error?.message || 'Unknown error'}</span>
      <span>Error Count: {errorCount}</span>
      <span>Is Recovering: {isRecovering ? 'true' : 'false'}</span>
      <button onClick={resetError} data-testid="fallback-reset">Reset</button>
      <button onClick={() => onRecover()} data-testid="fallback-recover">Recover</button>
    </div>
  ),
}));

jest.mock('../ErrorRecovery', () => ({
  ErrorRecovery: ({ error, onRecover, isRecovering }) => (
    <div data-testid="error-recovery">
      <span>Recovery for: {error?.message}</span>
      <span>Recovering: {isRecovering ? 'true' : 'false'}</span>
      <button
        onClick={() => onRecover(() => Promise.resolve())}
        data-testid="recovery-action"
      >
        Perform Recovery
      </button>
    </div>
  ),
}));

jest.mock('../../../utils/errors', () => ({
  ErrorHandler: {
    normalize: (error) => ({
      ...error,
      normalized: true,
      code: error.code || 'UNKNOWN_ERROR',
      userMessage: error.userMessage || 'Something went wrong',
    }),
    log: jest.fn(),
    getUserMessage: (error) => error?.userMessage || error?.message || 'Something went wrong',
  },
}));

// Test component that can throw errors
const ThrowError = ({ shouldThrow, errorMessage = 'Test error', errorCode }) => {
  if (shouldThrow) {
    const error = new Error(errorMessage);
    if (errorCode) error.code = errorCode;
    throw error;
  }
  return <div data-testid="no-error">No error</div>;
};

// Component that can be controlled for multiple errors
const ControlledErrorComponent = ({ errorCount }) => {
  if (errorCount > 0) {
    throw new Error(`Error number ${errorCount}`);
  }
  return <div data-testid="controlled-component">Working fine</div>;
};

// TODO: P2 - Comprehensive error boundary testing
describe.skip('ErrorBoundary Comprehensive Tests', () => {
  const originalError = console.error;

  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockErrorHandler.errorCount = 1;
    mockErrorHandler.isRecovering = false;
  });

  describe('Basic Error Boundary Functionality', () => {
    test('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div data-testid="test-content">Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    test('catches errors and shows fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Test error" />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
      expect(screen.getByText(/Error:.*Test error/)).toBeInTheDocument();
      expect(screen.getByTestId('fallback-reset')).toBeInTheDocument();
    });

    test('calls error handler on error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Handler test" />
        </ErrorBoundary>
      );

      expect(mockErrorHandler.logError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Handler test',
          normalized: true,
        }),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    test('normalizes errors before handling', () => {
      const { ErrorHandler } = require('../../../utils/errors');

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Normalization test" />
        </ErrorBoundary>
      );

      expect(ErrorHandler.normalize).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Normalization test',
        })
      );
    });

    test('logs errors through ErrorHandler', () => {
      const { ErrorHandler } = require('../../../utils/errors');

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Logging test" />
        </ErrorBoundary>
      );

      expect(ErrorHandler.log).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Logging test',
          normalized: true,
        }),
        expect.objectContaining({
          componentStack: expect.any(String),
          errorBoundary: true,
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe('Error Recovery and Reset', () => {
    test('reset functionality works', async () => {
      const TestComponent = () => {
        const [shouldThrow, setShouldThrow] = React.useState(true);

        return (
          <div>
            <ErrorBoundary>
              <ThrowError shouldThrow={shouldThrow} />
            </ErrorBoundary>
            <button onClick={() => setShouldThrow(false)} data-testid="fix-error">
              Fix Error
            </button>
          </div>
        );
      };

      render(<TestComponent />);

      // Error should be caught
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();

      // Click reset button
      const resetButton = screen.getByTestId('fallback-reset');
      fireEvent.click(resetButton);

      // Fix the error
      fireEvent.click(screen.getByTestId('fix-error'));

      // Should show normal content after reset and fix
      await waitFor(() => {
        expect(screen.getByTestId('no-error')).toBeInTheDocument();
      });
    });

    test('calls resetError handler on reset', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const resetButton = screen.getByTestId('fallback-reset');
      fireEvent.click(resetButton);

      expect(mockErrorHandler.resetError).toHaveBeenCalled();
    });
  });

  describe('Custom Fallback Component', () => {
    test('uses custom FallbackComponent when provided', () => {
      const CustomFallback = ({ error, resetError }) => (
        <div data-testid="custom-fallback">
          <span>Custom Error: {error.message}</span>
          <button onClick={resetError} data-testid="custom-reset">Custom Reset</button>
        </div>
      );

      render(
        <ErrorBoundary FallbackComponent={CustomFallback}>
          <ThrowError shouldThrow={true} errorMessage="Custom test" />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom Error: Custom test')).toBeInTheDocument();
      expect(screen.getByTestId('custom-reset')).toBeInTheDocument();
    });
  });

  describe('Recovery Options', () => {
    test('shows recovery options when errorCount > 1 and showRecovery is true', () => {
      mockErrorHandler.errorCount = 2;

      render(
        <ErrorBoundary showRecovery={true}>
          <ThrowError shouldThrow={true} errorMessage="Recovery test" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Show Recovery Options')).toBeInTheDocument();
    });

    test('hides recovery options when showRecovery is false', () => {
      mockErrorHandler.errorCount = 3;

      render(
        <ErrorBoundary showRecovery={false}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Show Recovery Options')).not.toBeInTheDocument();
    });

    test('shows recovery options only when error count > 1', () => {
      mockErrorHandler.errorCount = 1;

      render(
        <ErrorBoundary showRecovery={true}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Show Recovery Options')).not.toBeInTheDocument();
    });

    test('clicking recovery options shows ErrorRecovery component', () => {
      mockErrorHandler.errorCount = 2;

      render(
        <ErrorBoundary showRecovery={true}>
          <ThrowError shouldThrow={true} errorMessage="Recovery test" />
        </ErrorBoundary>
      );

      // Click to show recovery options
      fireEvent.click(screen.getByText('Show Recovery Options'));

      // Recovery component should be visible
      expect(screen.getByTestId('error-recovery')).toBeInTheDocument();
    });

    test('recovery action success resets error state', async () => {
      mockErrorHandler.errorCount = 2;
      const TestWrapper = () => {
        const [shouldThrow, setShouldThrow] = React.useState(true);

        return (
          <div>
            <button onClick={() => setShouldThrow(false)} data-testid="fix-underlying">
              Fix Underlying Issue
            </button>
            <ErrorBoundary showRecovery={true}>
              <ThrowError shouldThrow={shouldThrow} />
            </ErrorBoundary>
          </div>
        );
      };

      render(<TestWrapper />);

      // Show recovery options
      fireEvent.click(screen.getByText('Show Recovery Options'));

      // Fix the underlying issue first
      fireEvent.click(screen.getByTestId('fix-underlying'));

      // Perform recovery action
      await act(async () => {
        fireEvent.click(screen.getByTestId('recovery-action'));
      });

      // Should reset to normal state
      await waitFor(() => {
        expect(screen.getByTestId('no-error')).toBeInTheDocument();
      });
    });
  });

  describe('Error State Management', () => {
    test('passes error count to fallback component', () => {
      mockErrorHandler.errorCount = 3;

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Count: 3')).toBeInTheDocument();
    });

    test('passes isRecovering state to fallback', () => {
      mockErrorHandler.isRecovering = true;

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Is Recovering: true')).toBeInTheDocument();
    });

    test('handles recovery state changes', () => {
      mockErrorHandler.isRecovering = false;

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Is Recovering: false')).toBeInTheDocument();
    });
  });

  describe('Multiple Children and Error Isolation', () => {
    test('handles multiple children', () => {
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

    test('catches errors from any child component', () => {
      render(
        <ErrorBoundary>
          <div data-testid="safe-component">Safe component</div>
          <ThrowError shouldThrow={true} errorMessage="Child error" />
          <div data-testid="another-safe">Another safe component</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
      expect(screen.getByText(/Error:.*Child error/)).toBeInTheDocument();
      expect(screen.queryByTestId('safe-component')).not.toBeInTheDocument();
    });

    test('maintains error boundary isolation between instances', () => {
      render(
        <div>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} errorMessage="Boundary 1" />
          </ErrorBoundary>
          <ErrorBoundary>
            <div data-testid="boundary-2-content">Working content</div>
          </ErrorBoundary>
        </div>
      );

      // First boundary should show error
      expect(screen.getByText(/Error:.*Boundary 1/)).toBeInTheDocument();

      // Second boundary should work normally
      expect(screen.getByTestId('boundary-2-content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles null/undefined children', () => {
      render(
        <ErrorBoundary>
          {null}
          {undefined}
          <div data-testid="valid-child">Valid child</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('valid-child')).toBeInTheDocument();
    });

    test('handles errors with missing message', () => {
      const EmptyError = () => {
        throw new Error();
      };

      render(
        <ErrorBoundary>
          <EmptyError />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
      expect(screen.getByText(/Error:.*Unknown error/)).toBeInTheDocument();
    });

    test('handles errors with complex objects', () => {
      const ComplexError = () => {
        const error = new Error('Complex error');
        error.details = { nested: { data: 'test' } };
        error.code = 'COMPLEX_ERROR';
        throw error;
      };

      render(
        <ErrorBoundary>
          <ComplexError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Error:.*Complex error/)).toBeInTheDocument();
    });
  });

  describe('Default Export', () => {
    test('default export works with ErrorFallback', async () => {
      const { default: ErrorBoundaryWithFallback } = await import('../ErrorBoundary');

      render(
        <ErrorBoundaryWithFallback>
          <ThrowError shouldThrow={true} errorMessage="Default test" />
        </ErrorBoundaryWithFallback>
      );

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
      expect(screen.getByText(/Error:.*Default test/)).toBeInTheDocument();
    });
  });

  describe('Integration with Error System', () => {
    test('integrates with useErrorHandler hook', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Hook integration" />
        </ErrorBoundary>
      );

      // Should call error handler methods
      expect(mockErrorHandler.logError).toHaveBeenCalled();
    });

    test('passes correct props to ErrorFallback', () => {
      mockErrorHandler.errorCount = 5;
      mockErrorHandler.isRecovering = true;

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Props test" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Count: 5')).toBeInTheDocument();
      expect(screen.getByText('Is Recovering: true')).toBeInTheDocument();
    });

    test('handles recovery failure gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      mockErrorHandler.errorCount = 2;

      // Override ErrorRecovery mock to simulate failure
      jest.doMock('../ErrorRecovery', () => ({
        ErrorRecovery: ({ onRecover }) => (
          <div data-testid="failing-recovery">
            <button
              onClick={() => onRecover(() => Promise.reject(new Error('Recovery failed')))}
              data-testid="failing-recovery-action"
            >
              Failing Recovery
            </button>
          </div>
        ),
      }));

      render(
        <ErrorBoundary showRecovery={true}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Show recovery options
      fireEvent.click(screen.getByText('Show Recovery Options'));

      // Perform failing recovery action
      await act(async () => {
        fireEvent.click(screen.getByTestId('failing-recovery-action'));
      });

      // Should log warning in development
      expect(consoleSpy).toHaveBeenCalledWith('Error recovery failed:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
});