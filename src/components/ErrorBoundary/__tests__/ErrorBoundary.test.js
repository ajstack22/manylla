/* eslint-disable */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

// Mock React Native modules
jest.mock('react-native', () => ({
  View: ({ children, ...props }) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }) => <span {...props}>{children}</span>,
  TouchableOpacity: ({ onPress, children, ...props }) => (
    <button onClick={onPress} {...props}>{children}</button>
  ),
  ScrollView: ({ children, ...props }) => <div {...props}>{children}</div>,
  StyleSheet: {
    create: (styles) => styles,
  },
}));

// Mock hooks and utils
jest.mock('../../../hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    logError: jest.fn(),
    resetError: jest.fn(),
    recoverError: jest.fn(),
    errorCount: 1,
    isRecovering: false,
  }),
}));

jest.mock('../ErrorFallback', () => ({
  ErrorFallback: ({ error, resetError }) => (
    <div>
      <span>Error occurred: {error?.message || 'Unknown error'}</span>
      <button onClick={resetError}>Reset Error</button>
    </div>
  ),
}));

jest.mock('../ErrorRecovery', () => ({
  ErrorRecovery: ({ onRecover }) => (
    <div>
      <button onClick={() => onRecover(() => Promise.resolve())}>Recover</button>
    </div>
  ),
}));

jest.mock('../../../utils/errors', () => ({
  ErrorHandler: {
    normalize: (error) => error,
    log: jest.fn(),
    getUserMessage: (error) => error?.message || 'Something went wrong',
  },
}));

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  test('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('catches errors and shows fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error occurred: Test error')).toBeInTheDocument();
    expect(screen.getByText('Reset Error')).toBeInTheDocument();
  });

  test('reset functionality works', () => {
    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);

      return (
        <div>
          <ErrorBoundary>
            <ThrowError shouldThrow={shouldThrow} />
          </ErrorBoundary>
          <button onClick={() => setShouldThrow(false)}>Fix Error</button>
        </div>
      );
    };

    render(<TestComponent />);

    // Error should be caught
    expect(screen.getByText('Error occurred: Test error')).toBeInTheDocument();

    // Click reset button
    const resetButton = screen.getByText('Reset Error');
    fireEvent.click(resetButton);

    // Fix the error and the boundary should reset
    const fixButton = screen.getByText('Fix Error');
    fireEvent.click(fixButton);
  });

  test('handles custom fallback component', () => {
    const CustomFallback = ({ error, resetError }) => (
      <div>
        <span>Custom error: {error.message}</span>
        <button onClick={resetError}>Custom Reset</button>
      </div>
    );

    render(
      <ErrorBoundary FallbackComponent={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error: Test error')).toBeInTheDocument();
    expect(screen.getByText('Custom Reset')).toBeInTheDocument();
  });

  test('shows recovery options when configured', () => {
    render(
      <ErrorBoundary showRecovery={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error occurred: Test error')).toBeInTheDocument();
  });

  test('hides recovery options when disabled', () => {
    render(
      <ErrorBoundary showRecovery={false}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error occurred: Test error')).toBeInTheDocument();
    // Recovery options should not be present
  });

  test('handles multiple children', () => {
    render(
      <ErrorBoundary>
        <div>Child 1</div>
        <div>Child 2</div>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  test('catches errors from any child component', () => {
    render(
      <ErrorBoundary>
        <div>Safe component</div>
        <ThrowError shouldThrow={true} />
        <div>Another safe component</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Error occurred: Test error')).toBeInTheDocument();
    expect(screen.queryByText('Safe component')).not.toBeInTheDocument();
  });
});