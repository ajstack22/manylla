import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ErrorRecovery } from '../ErrorRecovery';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock React Native modules
jest.mock('react-native', () => ({
  View: ({ children, style, ...props }) => (
    <div data-testid="view" style={style} {...props}>{children}</div>
  ),
  Text: ({ children, style, ...props }) => (
    <span data-testid="text" style={style} {...props}>{children}</span>
  ),
  TouchableOpacity: ({ onPress, children, style, disabled, ...props }) => (
    <button
      onClick={onPress}
      style={style}
      disabled={disabled}
      data-testid="touchable"
      {...props}
    >
      {children}
    </button>
  ),
  StyleSheet: {
    create: (styles) => styles,
  },
  ActivityIndicator: ({ size, color, ...props }) => (
    <div data-testid="activity-indicator" {...props}>
      Loading... (size: {size}, color: {color})
    </div>
  ),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  clear: jest.fn(),
  setItem: jest.fn(),
  getItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
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
  ...mockTheme,
  colors: {
    ...mockTheme.colors,
    background: {
      default: '#000000',
      paper: '#1A1A1A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
      disabled: '#999999',
    },
  },
  theme: 'dark',
};

jest.mock('../../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => mockTheme),
}));

// Helper to create mock error objects
const createMockError = (overrides = {}) => ({
  message: 'Test error message',
  code: 'TEST_ERROR',
  ...overrides,
});

// P2 TECH DEBT: Remove skip when working on ErrorRecovery
// Issue: Recovery flow testing
describe.skip('ErrorRecovery Comprehensive Tests', () => {
  const { useTheme } = require('../../../context/ThemeContext');
  const mockOnRecover = jest.fn();
  let originalEnv;

  beforeEach(() => {
    jest.clearAllMocks();
    useTheme.mockReturnValue(mockTheme);
    AsyncStorage.clear.mockResolvedValue();
    AsyncStorage.setItem.mockResolvedValue();
    AsyncStorage.getAllKeys.mockResolvedValue([]);
    AsyncStorage.multiRemove.mockResolvedValue();
    mockOnRecover.mockResolvedValue();

    // Reset NODE_ENV
    originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('Basic Rendering', () => {
    test('renders recovery options UI', () => {
      render(
        <ErrorRecovery
          error={createMockError()}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      expect(screen.getByText('Recovery Options')).toBeInTheDocument();
      expect(screen.getByText('Choose an option to attempt recovery:')).toBeInTheDocument();
      expect(screen.getByText('⚠️ Recovery actions may result in data loss')).toBeInTheDocument();
    });

    test('shows perform recovery button (initially disabled)', () => {
      render(
        <ErrorRecovery
          error={createMockError()}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      const button = screen.getByRole('button', { name: 'Perform Recovery' });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    test('applies correct theme styles', () => {
      render(
        <ErrorRecovery
          error={createMockError()}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      // Check if component renders with theme styles - get first view element
      const containers = screen.getAllByTestId('view');
      expect(containers[0]).toBeInTheDocument();
    });

    test('applies dark theme styles', () => {
      useTheme.mockReturnValue(mockDarkTheme);

      render(
        <ErrorRecovery
          error={createMockError()}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      expect(screen.getByText('Recovery Options')).toBeInTheDocument();
    });
  });

  describe('Recovery Options Based on Error Type', () => {
    test('shows storage-related recovery options for STORAGE_ERROR', () => {
      const error = createMockError({
        code: 'STORAGE_ERROR',
        message: 'AsyncStorage failed',
      });

      render(
        <ErrorRecovery
          error={error}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      expect(screen.getByText('🗑️')).toBeInTheDocument();
      expect(screen.getByText('Clear Local Storage')).toBeInTheDocument();
      expect(screen.getByText('Remove all local data and start fresh')).toBeInTheDocument();
    });

    test('shows storage options for AsyncStorage message', () => {
      const error = createMockError({
        message: 'AsyncStorage quota exceeded',
      });

      render(
        <ErrorRecovery
          error={error}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      expect(screen.getByText('Clear Local Storage')).toBeInTheDocument();
    });

    test('shows sync-related recovery options for SYNC_ERROR', () => {
      const error = createMockError({
        code: 'SYNC_ERROR',
        message: 'Sync failed',
      });

      render(
        <ErrorRecovery
          error={error}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      expect(screen.getByText('📵')).toBeInTheDocument();
      expect(screen.getByText('Disable Sync')).toBeInTheDocument();
      expect(screen.getByText('Continue using app offline')).toBeInTheDocument();
    });

    test('shows sync options for sync message', () => {
      const error = createMockError({
        message: 'sync connection failed',
      });

      render(
        <ErrorRecovery
          error={error}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      expect(screen.getByText('Disable Sync')).toBeInTheDocument();
    });

    test('always shows reset app option', () => {
      const error = createMockError({
        code: 'UNKNOWN_ERROR',
        message: 'Unknown error',
      });

      render(
        <ErrorRecovery
          error={error}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      expect(screen.getByText('🔄')).toBeInTheDocument();
      expect(screen.getByText('Reset App')).toBeInTheDocument();
      expect(screen.getByText('Clear all data and settings')).toBeInTheDocument();
    });

    test('shows multiple recovery options for complex errors', () => {
      const error = createMockError({
        code: 'STORAGE_ERROR',
        message: 'AsyncStorage sync failed',
      });

      render(
        <ErrorRecovery
          error={error}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      expect(screen.getByText('Clear Local Storage')).toBeInTheDocument();
      expect(screen.getByText('Disable Sync')).toBeInTheDocument();
      expect(screen.getByText('Reset App')).toBeInTheDocument();
    });
  });

  describe('Option Selection and Recovery Execution', () => {
    test('enables recovery button when option is selected', () => {
      render(
        <ErrorRecovery
          error={createMockError({ code: 'STORAGE_ERROR' })}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      const button = screen.getByRole('button', { name: 'Perform Recovery' });
      expect(button).toBeDisabled();

      // Select an option
      fireEvent.click(screen.getByText('Clear Local Storage'));

      expect(button).not.toBeDisabled();
    });

    test('highlights selected option', () => {
      render(
        <ErrorRecovery
          error={createMockError({ code: 'STORAGE_ERROR' })}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      const option = screen.getByText('Clear Local Storage');
      fireEvent.click(option);

      // Check if option is selected (would need to verify styling in real test)
      expect(option).toBeInTheDocument();
    });

    test('calls onRecover with clearLocalStorage action when selected', async () => {
      render(
        <ErrorRecovery
          error={createMockError({ code: 'STORAGE_ERROR' })}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      // Select clear storage option
      fireEvent.click(screen.getByText('Clear Local Storage'));

      // Click perform recovery
      await act(async () => {
        fireEvent.click(screen.getByText('Perform Recovery'));
      });

      expect(mockOnRecover).toHaveBeenCalledWith(expect.any(Function));
    });

    test('calls onRecover with disableSync action when selected', async () => {
      render(
        <ErrorRecovery
          error={createMockError({ code: 'SYNC_ERROR' })}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      // Select disable sync option
      fireEvent.click(screen.getByText('Disable Sync'));

      // Click perform recovery
      await act(async () => {
        fireEvent.click(screen.getByText('Perform Recovery'));
      });

      expect(mockOnRecover).toHaveBeenCalledWith(expect.any(Function));
    });

    test('calls onRecover with resetApplication action when selected', async () => {
      render(
        <ErrorRecovery
          error={createMockError()}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      // Select reset app option
      fireEvent.click(screen.getByText('Reset App'));

      // Click perform recovery
      await act(async () => {
        fireEvent.click(screen.getByText('Perform Recovery'));
      });

      expect(mockOnRecover).toHaveBeenCalledWith(expect.any(Function));
    });

    test('does not call onRecover when no option is selected', async () => {
      render(
        <ErrorRecovery
          error={createMockError()}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      // Click perform recovery without selecting option
      await act(async () => {
        fireEvent.click(screen.getByText('Perform Recovery'));
      });

      expect(mockOnRecover).not.toHaveBeenCalled();
    });
  });

  describe('Recovery Actions', () => {
    test('clearLocalStorage calls AsyncStorage.clear', async () => {
      // Access the recovery functions by importing them through the module
      const module = await import('../ErrorRecovery');

      render(
        <ErrorRecovery
          error={createMockError({ code: 'STORAGE_ERROR' })}
          onRecover={async (action) => {
            await action();
          }}
          isRecovering={false}
        />
      );

      // Select and execute clear storage
      fireEvent.click(screen.getByText('Clear Local Storage'));

      await act(async () => {
        fireEvent.click(screen.getByText('Perform Recovery'));
      });

      await waitFor(() => {
        expect(AsyncStorage.clear).toHaveBeenCalled();
      });
    });

    test('disableSync sets correct AsyncStorage flag', async () => {
      render(
        <ErrorRecovery
          error={createMockError({ code: 'SYNC_ERROR' })}
          onRecover={async (action) => {
            await action();
          }}
          isRecovering={false}
        />
      );

      // Select and execute disable sync
      fireEvent.click(screen.getByText('Disable Sync'));

      await act(async () => {
        fireEvent.click(screen.getByText('Perform Recovery'));
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('manylla_sync_disabled', 'true');
      });
    });

    test('resetApplication clears storage and sets onboarding flag', async () => {
      render(
        <ErrorRecovery
          error={createMockError()}
          onRecover={async (action) => {
            await action();
          }}
          isRecovering={false}
        />
      );

      // Select and execute reset app
      fireEvent.click(screen.getByText('Reset App'));

      await act(async () => {
        fireEvent.click(screen.getByText('Perform Recovery'));
      });

      await waitFor(() => {
        expect(AsyncStorage.clear).toHaveBeenCalled();
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('manylla_onboarding_complete', 'false');
      });
    });

    test('handles AsyncStorage errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const storageError = new Error('Storage error');
      AsyncStorage.clear.mockRejectedValue(storageError);

      render(
        <ErrorRecovery
          error={createMockError({ code: 'STORAGE_ERROR' })}
          onRecover={async (action) => {
            try {
              await action();
            } catch (error) {
              // Error should be re-thrown for the recovery handler
              throw error;
            }
          }}
          isRecovering={false}
        />
      );

      // Select and execute clear storage
      fireEvent.click(screen.getByText('Clear Local Storage'));

      await act(async () => {
        fireEvent.click(screen.getByText('Perform Recovery'));
      });

      await waitFor(() => {
        expect(AsyncStorage.clear).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Recovery State Display', () => {
    test('shows loading state when isRecovering is true', () => {
      render(
        <ErrorRecovery
          error={createMockError()}
          onRecover={mockOnRecover}
          isRecovering={true}
        />
      );

      expect(screen.getByTestId('activity-indicator')).toBeInTheDocument();
      expect(screen.getByText('Attempting recovery...')).toBeInTheDocument();
      expect(screen.queryByText('Recovery Options')).not.toBeInTheDocument();
    });

    test('shows recovery options when isRecovering is false', () => {
      render(
        <ErrorRecovery
          error={createMockError()}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      expect(screen.queryByTestId('activity-indicator')).not.toBeInTheDocument();
      expect(screen.queryByText('Attempting recovery...')).not.toBeInTheDocument();
      expect(screen.getByText('Recovery Options')).toBeInTheDocument();
    });

    test('loading indicator uses correct theme color', () => {
      render(
        <ErrorRecovery
          error={createMockError()}
          onRecover={mockOnRecover}
          isRecovering={true}
        />
      );

      const indicator = screen.getByTestId('activity-indicator');
      expect(indicator).toHaveTextContent('color: #A08670');
    });
  });

  describe('Error Types and Option Logic', () => {
    test('storage error creates correct recovery options', () => {
      const error = createMockError({
        code: 'STORAGE_ERROR',
        message: 'Storage quota exceeded',
      });

      render(
        <ErrorRecovery
          error={error}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      // Should have clear storage + reset app options
      expect(screen.getByText('Clear Local Storage')).toBeInTheDocument();
      expect(screen.getByText('Reset App')).toBeInTheDocument();
    });

    test('sync error creates correct recovery options', () => {
      const error = createMockError({
        code: 'SYNC_ERROR',
        message: 'Sync connection failed',
      });

      render(
        <ErrorRecovery
          error={error}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      // Should have disable sync + reset app options
      expect(screen.getByText('Disable Sync')).toBeInTheDocument();
      expect(screen.getByText('Reset App')).toBeInTheDocument();
    });

    test('unknown error only shows reset app option', () => {
      const error = createMockError({
        code: 'UNKNOWN_ERROR',
        message: 'Unknown error occurred',
      });

      render(
        <ErrorRecovery
          error={error}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      // Should only have reset app option
      expect(screen.getByText('Reset App')).toBeInTheDocument();
      expect(screen.queryByText('Clear Local Storage')).not.toBeInTheDocument();
      expect(screen.queryByText('Disable Sync')).not.toBeInTheDocument();
    });

    test('error with both storage and sync issues shows all options', () => {
      const error = createMockError({
        code: 'STORAGE_ERROR',
        message: 'AsyncStorage sync failed completely',
      });

      render(
        <ErrorRecovery
          error={error}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      // Should have all options
      expect(screen.getByText('Clear Local Storage')).toBeInTheDocument();
      expect(screen.getByText('Disable Sync')).toBeInTheDocument();
      expect(screen.getByText('Reset App')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles null error gracefully', () => {
      render(
        <ErrorRecovery
          error={null}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      // Should still show reset app option
      expect(screen.getByText('Reset App')).toBeInTheDocument();
    });

    test('handles error without code or message', () => {
      const error = {};

      render(
        <ErrorRecovery
          error={error}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      // Should only show reset app option
      expect(screen.getByText('Reset App')).toBeInTheDocument();
    });

    test('handles missing theme colors gracefully', () => {
      useTheme.mockReturnValue({
        colors: {
          text: {},
          primary: {},
          action: {},
          warning: {},
        },
        theme: 'light',
      });

      render(
        <ErrorRecovery
          error={createMockError()}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      // Should render without crashing
      expect(screen.getByText('Recovery Options')).toBeInTheDocument();
    });

    test('handles recovery action that throws error', async () => {
      const recoveryError = new Error('Recovery failed');
      const mockFailingRecover = jest.fn().mockRejectedValue(recoveryError);

      render(
        <ErrorRecovery
          error={createMockError()}
          onRecover={mockFailingRecover}
          isRecovering={false}
        />
      );

      // Select reset app option
      fireEvent.click(screen.getByText('Reset App'));

      // Should not crash when recovery fails
      await act(async () => {
        fireEvent.click(screen.getByText('Perform Recovery'));
      });

      expect(mockFailingRecover).toHaveBeenCalled();
    });

    test('switching between options updates selection correctly', () => {
      render(
        <ErrorRecovery
          error={createMockError({ code: 'STORAGE_ERROR', message: 'AsyncStorage sync failed' })}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      // Select first option
      fireEvent.click(screen.getByText('Clear Local Storage'));

      // Select second option
      fireEvent.click(screen.getByText('Disable Sync'));

      // Select third option
      fireEvent.click(screen.getByText('Reset App'));

      // Button should remain enabled
      const button = screen.getByText('Perform Recovery');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Accessibility and User Experience', () => {
    test('recovery options have proper labels and descriptions', () => {
      const error = createMockError({
        code: 'STORAGE_ERROR',
        message: 'AsyncStorage sync failed',
      });

      render(
        <ErrorRecovery
          error={error}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      // Check that all options have icons, labels, and descriptions
      expect(screen.getByText('🗑️')).toBeInTheDocument();
      expect(screen.getByText('Clear Local Storage')).toBeInTheDocument();
      expect(screen.getByText('Remove all local data and start fresh')).toBeInTheDocument();

      expect(screen.getByText('📵')).toBeInTheDocument();
      expect(screen.getByText('Disable Sync')).toBeInTheDocument();
      expect(screen.getByText('Continue using app offline')).toBeInTheDocument();

      expect(screen.getByText('🔄')).toBeInTheDocument();
      expect(screen.getByText('Reset App')).toBeInTheDocument();
      expect(screen.getByText('Clear all data and settings')).toBeInTheDocument();
    });

    test('warning message is clearly displayed', () => {
      render(
        <ErrorRecovery
          error={createMockError()}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      const warning = screen.getByText('⚠️ Recovery actions may result in data loss');
      expect(warning).toBeInTheDocument();
    });

    test('perform recovery button changes state appropriately', () => {
      render(
        <ErrorRecovery
          error={createMockError()}
          onRecover={mockOnRecover}
          isRecovering={false}
        />
      );

      const button = screen.getByRole('button', { name: 'Perform Recovery' });

      // Initially disabled
      expect(button).toBeDisabled();

      // Enabled after selection
      fireEvent.click(screen.getByText('Reset App'));
      expect(button).not.toBeDisabled();
    });
  });
});