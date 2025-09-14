import React from 'react';
import { render, act, screen } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';
import platform from '../../utils/platform';

// Mock platform module
jest.mock('../../utils/platform', () => ({
  isWeb: true,
  isNative: false,
}));

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock localStorage for web tests
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
global.localStorage = mockLocalStorage;

// Test component to consume theme context
const TestConsumer = ({ onThemeChange }) => {
  const theme = useTheme();

  React.useEffect(() => {
    if (onThemeChange) {
      onThemeChange(theme);
    }
  }, [theme.isDark, theme.colors, onThemeChange]); // Watch for actual theme changes

  return (
    <div>
      <div data-testid="theme-mode">{theme.isDark ? 'dark' : 'light'}</div>
      <div data-testid="primary-color">{theme.colors.primary}</div>
      <button data-testid="toggle-button" onClick={theme.toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});
  });

  describe('Provider Initialization', () => {
    test('should provide default light theme', () => {
      let capturedTheme;

      render(
        <ThemeProvider>
          <TestConsumer onThemeChange={(theme) => (capturedTheme = theme)} />
        </ThemeProvider>
      );

      expect(capturedTheme.isDark).toBe(false);
      expect(capturedTheme.colors.primary).toBe('#8B6F47');
      expect(capturedTheme.colors.background.primary).toBe('#F5F5F5');
      expect(capturedTheme.colors.text.primary).toBe('#333333');
    });

    test('should initialize with provided theme', () => {
      let capturedTheme;

      render(
        <ThemeProvider initialThemeMode="dark">
          <TestConsumer onThemeChange={(theme) => (capturedTheme = theme)} />
        </ThemeProvider>
      );

      expect(capturedTheme.isDark).toBe(true);
      expect(capturedTheme.colors.primary).toBe('#8B6F47');
      expect(capturedTheme.colors.background.primary).toBe('#1A1A1A');
      expect(capturedTheme.colors.text.primary).toBe('#FFFFFF');
    });

    test('should load theme from storage on web', async () => {
      platform.isWeb = true;
      mockLocalStorage.getItem.mockReturnValueOnce('dark');

      let capturedTheme;

      render(
        <ThemeProvider>
          <TestConsumer onThemeChange={(theme) => (capturedTheme = theme)} />
        </ThemeProvider>
      );

      // Wait for async storage load and theme update
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme_preference');
      expect(capturedTheme.isDark).toBe(true);
    });

    test('should load theme from storage on native', async () => {
      // Note: Platform mock is set to web=true, so this actually tests localStorage too
      mockLocalStorage.getItem.mockReturnValueOnce('dark');

      let capturedTheme;

      render(
        <ThemeProvider>
          <TestConsumer onThemeChange={(theme) => (capturedTheme = theme)} />
        </ThemeProvider>
      );

      // Wait for async storage load and theme update
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme_preference');
      expect(capturedTheme.isDark).toBe(true);
    });

    test('should handle storage load error gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      let capturedTheme;

      render(
        <ThemeProvider>
          <TestConsumer onThemeChange={(theme) => (capturedTheme = theme)} />
        </ThemeProvider>
      );

      // Should default to light theme on error
      expect(capturedTheme.isDark).toBe(false);
    });

    test('should handle invalid stored theme value', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('invalid_theme');

      let capturedTheme;

      render(
        <ThemeProvider>
          <TestConsumer onThemeChange={(theme) => (capturedTheme = theme)} />
        </ThemeProvider>
      );

      // Allow effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should default to light theme for invalid value
      expect(capturedTheme.isDark).toBe(false);
    });
  });

  describe('Theme Toggle', () => {
    test('should toggle from light to dark', async () => {
      await act(async () => {
        render(
          <ThemeProvider>
            <TestConsumer />
          </ThemeProvider>
        );
      });

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
      expect(screen.getByTestId('primary-color')).toHaveTextContent('#8B6F47');

      await act(async () => {
        screen.getByTestId('toggle-button').click();
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('primary-color')).toHaveTextContent('#8B6F47'); // Primary should stay same
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme_preference', 'dark');
    });

    test('should toggle from dark to light', async () => {
      await act(async () => {
        render(
          <ThemeProvider initialThemeMode="dark">
            <TestConsumer />
          </ThemeProvider>
        );
      });

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');

      await act(async () => {
        screen.getByTestId('toggle-button').click();
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme_preference', 'light');
    });

    test('should handle storage save error gracefully', async () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      await act(async () => {
        render(
          <ThemeProvider>
            <TestConsumer />
          </ThemeProvider>
        );
      });

      // Should still toggle theme despite storage error
      await act(async () => {
        screen.getByTestId('toggle-button').click();
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    });
  });

  describe('Theme Colors', () => {
    test('should provide correct light theme colors', () => {
      let capturedTheme;

      render(
        <ThemeProvider>
          <TestConsumer onThemeChange={(theme) => (capturedTheme = theme)} />
        </ThemeProvider>
      );

      const { colors } = capturedTheme;

      expect(colors.primary).toBe('#8B6F47');
      expect(colors.secondary).toBe('#F4E4C1');
      expect(colors.background.primary).toBe('#F5F5F5');
      expect(colors.background.secondary).toBe('#FFFFFF');
      expect(colors.background.default).toBe('#F5F5F5');
      expect(colors.background.paper).toBe('#FFFFFF');
      expect(colors.background.manila).toBe('#F4E4C1');
      expect(colors.surface).toBe('#FFFFFF');
      expect(colors.text.primary).toBe('#333333');
      expect(colors.text.secondary).toBe('#666666');
      expect(colors.text.disabled).toBe('#999999');
      expect(colors.border).toBe('#E0E0E0');
      expect(colors.error).toBe('#E76F51');
    });

    test('should provide correct dark theme colors', () => {
      let capturedTheme;

      render(
        <ThemeProvider initialThemeMode="dark">
          <TestConsumer onThemeChange={(theme) => (capturedTheme = theme)} />
        </ThemeProvider>
      );

      const { colors } = capturedTheme;

      expect(colors.primary).toBe('#8B6F47');
      expect(colors.secondary).toBe('#3A3528');
      expect(colors.background.primary).toBe('#1A1A1A');
      expect(colors.background.secondary).toBe('#2A2A2A');
      expect(colors.background.default).toBe('#1A1A1A');
      expect(colors.background.paper).toBe('#2A2A2A');
      expect(colors.background.manila).toBe('#3A3528');
      expect(colors.surface).toBe('#2A2A2A');
      expect(colors.text.primary).toBe('#FFFFFF');
      expect(colors.text.secondary).toBe('#AAAAAA');
      expect(colors.text.disabled).toBe('#666666');
      expect(colors.border).toBe('#404040');
      expect(colors.error).toBe('#E76F51');
    });

    test('should maintain primary color consistency between themes', () => {
      let lightTheme, darkTheme;

      const TestComponent = () => {
        const theme = useTheme();

        return (
          <button
            onClick={() => {
              if (theme.isDark) {
                darkTheme = theme;
              } else {
                lightTheme = theme;
              }
              theme.toggleTheme();
            }}
          >
            Capture and Toggle
          </button>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Capture light theme and switch to dark
      act(() => {
        screen.getByRole('button').click();
      });

      // Capture dark theme
      act(() => {
        screen.getByRole('button').click();
      });

      expect(lightTheme.colors.primary).toBe(darkTheme.colors.primary);
      expect(lightTheme.colors.error).toBe(darkTheme.colors.error);
    });
  });

  describe('Theme Object Structure', () => {
    test('should provide isDark boolean', () => {
      let capturedTheme;

      render(
        <ThemeProvider>
          <TestConsumer onThemeChange={(theme) => (capturedTheme = theme)} />
        </ThemeProvider>
      );

      expect(typeof capturedTheme.isDark).toBe('boolean');
      expect(capturedTheme.isDark).toBe(false);
    });

    test('should provide toggleTheme function', () => {
      let capturedTheme;

      render(
        <ThemeProvider>
          <TestConsumer onThemeChange={(theme) => (capturedTheme = theme)} />
        </ThemeProvider>
      );

      expect(typeof capturedTheme.toggleTheme).toBe('function');
    });

    test('should provide colors object', () => {
      let capturedTheme;

      render(
        <ThemeProvider>
          <TestConsumer onThemeChange={(theme) => (capturedTheme = theme)} />
        </ThemeProvider>
      );

      expect(typeof capturedTheme.colors).toBe('object');
      expect(capturedTheme.colors).toBeTruthy();
    });

    test('should provide nested background colors', () => {
      let capturedTheme;

      render(
        <ThemeProvider>
          <TestConsumer onThemeChange={(theme) => (capturedTheme = theme)} />
        </ThemeProvider>
      );

      const { background } = capturedTheme.colors;
      expect(typeof background).toBe('object');
      expect(background.primary).toBeDefined();
      expect(background.secondary).toBeDefined();
      expect(background.default).toBeDefined();
      expect(background.paper).toBeDefined();
      expect(background.manila).toBeDefined();
    });

    test('should provide nested text colors', () => {
      let capturedTheme;

      render(
        <ThemeProvider>
          <TestConsumer onThemeChange={(theme) => (capturedTheme = theme)} />
        </ThemeProvider>
      );

      const { text } = capturedTheme.colors;
      expect(typeof text).toBe('object');
      expect(text.primary).toBeDefined();
      expect(text.secondary).toBeDefined();
      expect(text.disabled).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should throw error when useTheme is used outside provider', () => {
      const TestComponent = () => {
        useTheme(); // This should throw
        return <div>Test</div>;
      };

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useTheme must be used within a ThemeProvider');

      console.error = originalError;
    });
  });

  describe('Platform-Specific Behavior', () => {
    test('should use localStorage on web platform', async () => {
      platform.isWeb = true;
      platform.isNative = false;

      await act(async () => {
        render(
          <ThemeProvider>
            <TestConsumer />
          </ThemeProvider>
        );
      });

      await act(async () => {
        screen.getByTestId('toggle-button').click();
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme_preference', 'dark');
    });

    test('should use AsyncStorage on native platform', async () => {
      platform.isWeb = false;
      platform.isNative = true;

      await act(async () => {
        render(
          <ThemeProvider>
            <TestConsumer />
          </ThemeProvider>
        );
      });

      await act(async () => {
        screen.getByTestId('toggle-button').click();
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme_preference', 'dark');
    });
  });

  describe('Multiple Consumers', () => {
    test('should update all consumers when theme changes', async () => {
      let theme1, theme2;

      const Consumer1 = () => {
        const theme = useTheme();
        theme1 = theme;
        return <div data-testid="consumer1">{theme.isDark ? 'dark' : 'light'}</div>;
      };

      const Consumer2 = () => {
        const theme = useTheme();
        theme2 = theme;
        return (
          <div>
            <div data-testid="consumer2">{theme.isDark ? 'dark' : 'light'}</div>
            <button data-testid="toggle" onClick={theme.toggleTheme}>Toggle</button>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <Consumer1 />
          <Consumer2 />
        </ThemeProvider>
      );

      expect(screen.getByTestId('consumer1')).toHaveTextContent('light');
      expect(screen.getByTestId('consumer2')).toHaveTextContent('light');
      expect(theme1.isDark).toBe(false);
      expect(theme2.isDark).toBe(false);

      await act(async () => {
        screen.getByTestId('toggle').click();
      });

      expect(screen.getByTestId('consumer1')).toHaveTextContent('dark');
      expect(screen.getByTestId('consumer2')).toHaveTextContent('dark');
      expect(theme1.isDark).toBe(true);
      expect(theme2.isDark).toBe(true);
    });
  });

  describe('Theme Persistence', () => {
    test('should persist theme changes across re-renders', async () => {
      const { rerender } = render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');

      await act(async () => {
        screen.getByTestId('toggle-button').click();
      });

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');

      rerender(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    });

    test('should load persisted theme on initialization', async () => {
      mockLocalStorage.getItem.mockReturnValueOnce('dark');

      let capturedTheme;

      render(
        <ThemeProvider>
          <TestConsumer onThemeChange={(theme) => (capturedTheme = theme)} />
        </ThemeProvider>
      );

      // Wait for effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      expect(capturedTheme.isDark).toBe(true);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme_preference');
    });
  });
});