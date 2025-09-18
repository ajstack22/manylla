/* eslint-disable */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorFallback } from '../ErrorFallback';

// Mock React Native modules
jest.mock('react-native', () => ({
  View: ({ children, style, ...props }) => (
    <div data-testid="view" style={style} {...props}>{children}</div>
  ),
  Text: ({ children, style, ...props }) => (
    <span data-testid="text" style={style} {...props}>{children}</span>
  ),
  TouchableOpacity: ({ onPress, children, style, ...props }) => (
    <button onClick={onPress} style={style} data-testid="touchable" {...props}>{children}</button>
  ),
  ScrollView: ({ children, ...props }) => (
    <div data-testid="scrollview" {...props}>{children}</div>
  ),
  StyleSheet: {
    create: (styles) => styles,
  },
}));

// Mock platform utils
jest.mock('../../../utils/platformStyles', () => ({
  getScrollViewProps: () => ({ testId: 'mocked-scrollview' }),
}));

jest.mock('../../../utils/platform', () => ({
  isWeb: true,
  isIOS: false,
  select: (options) => options.web || options.default,
}));

// Mock theme context
const mockTheme = {
  colors: {
    background: {
      default: '#FFFFFF',
      paper: '#F8F8F8',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
      disabled: '#999999',
    },
    primary: {
      main: '#A08670',
    },
    action: {
      disabled: '#CCCCCC',
    },
    warning: {
      main: '#FF9800',
    },
  },
  theme: 'light',
};

const mockDarkTheme = {
  colors: {
    background: {
      default: '#000000',
      paper: '#1A1A1A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
      disabled: '#999999',
    },
    primary: {
      main: '#A08670',
    },
    action: {
      disabled: '#CCCCCC',
    },
    warning: {
      main: '#FF9800',
    },
  },
  theme: 'dark',
};

jest.mock('../../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => mockTheme),
}));

// Mock error display hook
const mockErrorDisplay = {
  userMessage: 'Test error message',
  showDetails: false,
  reportSent: false,
  sendReport: jest.fn(),
  toggleDetails: jest.fn(),
};

jest.mock('../../../hooks/useErrorDisplay', () => ({
  useErrorDisplay: jest.fn(() => mockErrorDisplay),
}));

// Helper to create mock error objects
const createMockError = (overrides = {}) => ({
  message: 'Test error message',
  stack: 'Error: Test error message\n    at TestComponent',
  code: 'TEST_ERROR',
  ...overrides,
});

const createMockErrorInfo = (overrides = {}) => ({
  componentStack: '\n    in TestComponent\n    in ErrorBoundary',
  ...overrides,
});

// Mock window.location.reload
const mockReload = jest.fn();

// Store original location
const originalLocation = window.location;

beforeAll(() => {
  delete window.location;
  window.location = { reload: mockReload };
});

afterAll(() => {
  window.location = originalLocation;
});

// P2 TECH DEBT: Remove skip when working on ErrorFallback
// Issue: Error boundary simulation
describe.skip('ErrorFallback Comprehensive Tests', () => {
  const { useTheme } = require('../../../context/ThemeContext');
  const { useErrorDisplay } = require('../../../hooks/useErrorDisplay');
  let originalEnv;

  beforeEach(() => {
    jest.clearAllMocks();
    useTheme.mockReturnValue(mockTheme);
    useErrorDisplay.mockReturnValue(mockErrorDisplay);
    mockReload.mockClear();

    // Reset NODE_ENV
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('Basic Rendering', () => {
    test('renders error fallback with basic error info', () => {
      const error = createMockError();
      const errorInfo = createMockErrorInfo();

      render(
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      expect(screen.getByText('⚠️')).toBeInTheDocument();
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    test('displays user message from useErrorDisplay hook', () => {
      useErrorDisplay.mockReturnValue({
        ...mockErrorDisplay,
        userMessage: 'Custom user-friendly message',
      });

      render(
        <ErrorFallback
          error={createMockError()}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      expect(screen.getByText('Custom user-friendly message')).toBeInTheDocument();
    });

    test('applies correct styles based on theme', () => {
      const error = createMockError();

      render(
        <ErrorFallback
          error={error}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      // Check if container has correct background color
      const container = screen.getByTestId('view');
      expect(container).toHaveStyle({ backgroundColor: '#FFFFFF' });
    });

    test('applies dark theme styles correctly', () => {
      useTheme.mockReturnValue(mockDarkTheme);

      render(
        <ErrorFallback
          error={createMockError()}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      const container = screen.getByTestId('view');
      expect(container).toHaveStyle({ backgroundColor: '#000000' });
    });
  });

  describe('Error Count Handling', () => {
    test('shows warning for multiple errors (>2)', () => {
      render(
        <ErrorFallback
          error={createMockError()}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={3}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      expect(screen.getByText('Multiple errors detected. The app may be unstable.')).toBeInTheDocument();
    });

    test('does not show warning for single error', () => {
      render(
        <ErrorFallback
          error={createMockError()}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      expect(screen.queryByText('Multiple errors detected. The app may be unstable.')).not.toBeInTheDocument();
    });

    test('shows reload app button for multiple errors', () => {
      render(
        <ErrorFallback
          error={createMockError()}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={2}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      expect(screen.getByText('Reload App')).toBeInTheDocument();
    });

    test('reload app button calls window.location.reload', () => {
      // Mock the platform utility to return web
      const platformModule = require('../../../utils/platform');
      jest.spyOn(platformModule, 'isWeb', 'get').mockReturnValue(true);

      render(
        <ErrorFallback
          error={createMockError()}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={2}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      fireEvent.click(screen.getByText('Reload App'));
      expect(mockReload).toHaveBeenCalled();
    });
  });

  describe('Action Buttons', () => {
    test('try again button calls resetError', () => {
      const mockReset = jest.fn();

      render(
        <ErrorFallback
          error={createMockError()}
          errorInfo={createMockErrorInfo()}
          resetError={mockReset}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      fireEvent.click(screen.getByText('Try Again'));
      expect(mockReset).toHaveBeenCalled();
    });

    test('shows details button in development mode', () => {
      process.env.NODE_ENV = 'development';

      render(
        <ErrorFallback
          error={createMockError()}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      expect(screen.getByText('Show Details')).toBeInTheDocument();
    });

    test('shows details button when showDetails is true', () => {
      useErrorDisplay.mockReturnValue({
        ...mockErrorDisplay,
        showDetails: true,
      });

      render(
        <ErrorFallback
          error={createMockError()}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      expect(screen.getByText('Hide Details')).toBeInTheDocument();
    });

    test('details button calls toggleDetails', () => {
      const mockToggle = jest.fn();
      useErrorDisplay.mockReturnValue({
        ...mockErrorDisplay,
        toggleDetails: mockToggle,
      });

      process.env.NODE_ENV = 'development';

      render(
        <ErrorFallback
          error={createMockError()}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      fireEvent.click(screen.getByText('Show Details'));
      expect(mockToggle).toHaveBeenCalled();
    });
  });

  describe('Error Details Display', () => {
    test('shows error details when showDetails is true', () => {
      useErrorDisplay.mockReturnValue({
        ...mockErrorDisplay,
        showDetails: true,
      });

      const error = createMockError({
        message: 'Detailed error message',
        stack: 'Error: Detailed error message\n    at TestComponent\n    at ErrorBoundary',
      });

      render(
        <ErrorFallback
          error={error}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      expect(screen.getByText('Error Message:')).toBeInTheDocument();
      expect(screen.getByText('Detailed error message')).toBeInTheDocument();
    });

    test('shows stack trace in development mode', () => {
      process.env.NODE_ENV = 'development';
      useErrorDisplay.mockReturnValue({
        ...mockErrorDisplay,
        showDetails: true,
      });

      const error = createMockError({
        stack: 'Error: Stack trace test\n    at Component\n    at ErrorBoundary',
      });

      render(
        <ErrorFallback
          error={error}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      expect(screen.getByText('Stack Trace:')).toBeInTheDocument();
      expect(screen.getByText('Error: Stack trace test\n    at Component\n    at ErrorBoundary')).toBeInTheDocument();
    });

    test('shows component stack in development mode', () => {
      process.env.NODE_ENV = 'development';
      useErrorDisplay.mockReturnValue({
        ...mockErrorDisplay,
        showDetails: true,
      });

      const errorInfo = createMockErrorInfo({
        componentStack: '\n    in TestComponent\n    in ErrorBoundary\n    in App',
      });

      render(
        <ErrorFallback
          error={createMockError()}
          errorInfo={errorInfo}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      expect(screen.getByText('Component Stack:')).toBeInTheDocument();
      expect(screen.getByText(/in TestComponent.*in ErrorBoundary.*in App/s)).toBeInTheDocument();
    });

    test('hides stack trace in production mode', () => {
      process.env.NODE_ENV = 'production';
      useErrorDisplay.mockReturnValue({
        ...mockErrorDisplay,
        showDetails: true,
      });

      const error = createMockError({
        stack: 'Error: Production stack trace',
      });

      render(
        <ErrorFallback
          error={error}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      expect(screen.queryByText('Stack Trace:')).not.toBeInTheDocument();
    });
  });

  describe('Error Reporting', () => {
    test('shows error report button in development mode when not sent', () => {
      process.env.NODE_ENV = 'development';

      render(
        <ErrorFallback
          error={createMockError()}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      expect(screen.getByText('📤 Send Error Report')).toBeInTheDocument();
      expect(screen.getByText('Help us improve by reporting this error')).toBeInTheDocument();
    });

    test('calls sendReport when error report button is clicked', () => {
      const mockSendReport = jest.fn();
      useErrorDisplay.mockReturnValue({
        ...mockErrorDisplay,
        sendReport: mockSendReport,
      });

      process.env.NODE_ENV = 'development';

      render(
        <ErrorFallback
          error={createMockError()}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      fireEvent.click(screen.getByText('📤 Send Error Report'));
      expect(mockSendReport).toHaveBeenCalled();
    });

    test('shows success message when report is sent', () => {
      useErrorDisplay.mockReturnValue({
        ...mockErrorDisplay,
        reportSent: true,
      });

      process.env.NODE_ENV = 'development';

      render(
        <ErrorFallback
          error={createMockError()}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      expect(screen.getByText('✓ Error report sent successfully')).toBeInTheDocument();
      expect(screen.queryByText('📤 Send Error Report')).not.toBeInTheDocument();
    });

    test('hides error report button in production mode', () => {
      process.env.NODE_ENV = 'production';

      render(
        <ErrorFallback
          error={createMockError()}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      expect(screen.queryByText('📤 Send Error Report')).not.toBeInTheDocument();
    });
  });

  describe('Recovery State', () => {
    test('shows recovery indicator when isRecovering is true', () => {
      render(
        <ErrorFallback
          error={createMockError()}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={true}
        />
      );

      expect(screen.getByText('Attempting recovery...')).toBeInTheDocument();
    });

    test('hides recovery indicator when isRecovering is false', () => {
      render(
        <ErrorFallback
          error={createMockError()}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      expect(screen.queryByText('Attempting recovery...')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error States', () => {
    test('handles error without message', () => {
      const error = createMockError({ message: undefined });

      render(
        <ErrorFallback
          error={error}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      // Should still render without crashing
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    test('handles null error object', () => {
      render(
        <ErrorFallback
          error={null}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    test('handles error without stack trace', () => {
      useErrorDisplay.mockReturnValue({
        ...mockErrorDisplay,
        showDetails: true,
      });

      const error = createMockError({ stack: undefined });

      render(
        <ErrorFallback
          error={error}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      expect(screen.getByText('Error Message:')).toBeInTheDocument();
      expect(screen.queryByText('Stack Trace:')).not.toBeInTheDocument();
    });

    test('handles errorInfo without componentStack', () => {
      useErrorDisplay.mockReturnValue({
        ...mockErrorDisplay,
        showDetails: true,
      });

      const errorInfo = createMockErrorInfo({ componentStack: undefined });

      render(
        <ErrorFallback
          error={createMockError()}
          errorInfo={errorInfo}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      expect(screen.queryByText('Component Stack:')).not.toBeInTheDocument();
    });

    test('handles zero error count', () => {
      render(
        <ErrorFallback
          error={createMockError()}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={0}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      expect(screen.queryByText('Multiple errors detected')).not.toBeInTheDocument();
      expect(screen.queryByText('Reload App')).not.toBeInTheDocument();
    });

    test('handles missing theme colors gracefully', () => {
      useTheme.mockReturnValue({
        colors: {
          background: {},
          text: {},
          primary: {},
        },
        theme: 'light',
      });

      render(
        <ErrorFallback
          error={createMockError()}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      // Should render without crashing
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Integration with useErrorDisplay Hook', () => {
    test('passes error and errorInfo to useErrorDisplay', () => {
      const error = createMockError({ message: 'Hook integration test' });
      const errorInfo = createMockErrorInfo();

      render(
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      expect(useErrorDisplay).toHaveBeenCalledWith(error, errorInfo);
    });

    test('uses all returned values from useErrorDisplay', () => {
      const customErrorDisplay = {
        userMessage: 'Custom message from hook',
        showDetails: true,
        reportSent: true,
        sendReport: jest.fn(),
        toggleDetails: jest.fn(),
      };

      useErrorDisplay.mockReturnValue(customErrorDisplay);

      render(
        <ErrorFallback
          error={createMockError()}
          errorInfo={createMockErrorInfo()}
          resetError={jest.fn()}
          errorCount={1}
          onRecover={jest.fn()}
          isRecovering={false}
        />
      );

      expect(screen.getByText('Custom message from hook')).toBeInTheDocument();
      expect(screen.getByText('✓ Error report sent successfully')).toBeInTheDocument();
    });
  });
});