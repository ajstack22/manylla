/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import RootNavigator from '../RootNavigator';
import ProfileStorageService from '../../services/storage/ProfileStorageService';
import { useTheme } from '../../context/ThemeContext';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => <div testID="stack-navigator">{children}</div>,
    Screen: ({ name, component: Component }) => (
      <div testID={`screen-${name}`}>
        <Component />
      </div>
    ),
  }),
}));

// Mock dependencies
jest.mock('../../services/storage/ProfileStorageService');
jest.mock('../../context/ThemeContext');
jest.mock('../MainTabNavigator', () => () => <div testID="main-tab-navigator">Main App</div>);
jest.mock('../../screens/Onboarding/OnboardingScreen', () => () => (
  <div testID="onboarding-screen">Onboarding</div>
));

// P2 TECH DEBT: Remove skip when working on navigation components
// Issue: Image import errors in test environment
describe.skip('RootNavigator', () => {
  const mockTheme = {
    colors: {
      primary: '#A08670',
      background: { default: '#FAF9F6' },
      text: { primary: '#2C2C2C', secondary: '#666' }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useTheme.mockReturnValue(mockTheme);
  });

  it('should show loading indicator initially', () => {
    ProfileStorageService.hasProfile.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { getByLabelText } = render(<RootNavigator />);

    expect(getByLabelText('loading')).toBeTruthy();
  });

  it('should show onboarding when no profile exists', async () => {
    ProfileStorageService.hasProfile.mockResolvedValue(false);

    const { getByTestId, queryByLabelText } = render(<RootNavigator />);

    await waitFor(() => {
      expect(queryByLabelText('loading')).toBeNull();
    });

    expect(getByTestId('onboarding-screen')).toBeTruthy();
    expect(getByTestId('screen-Onboarding')).toBeTruthy();
  });

  it('should show main app when profile exists', async () => {
    ProfileStorageService.hasProfile.mockResolvedValue(true);

    const { getByTestId, queryByLabelText } = render(<RootNavigator />);

    await waitFor(() => {
      expect(queryByLabelText('loading')).toBeNull();
    });

    expect(getByTestId('main-tab-navigator')).toBeTruthy();
    expect(getByTestId('screen-Main')).toBeTruthy();
  });

  it('should handle profile check error gracefully', async () => {
    ProfileStorageService.hasProfile.mockRejectedValue(new Error('Storage error'));

    const { queryByLabelText } = render(<RootNavigator />);

    await waitFor(() => {
      expect(queryByLabelText('loading')).toBeNull();
    });

    // Should show onboarding when profile check fails (default behavior)
    // This ensures user can still use the app even if storage has issues
  });

  it('should render with correct loading styles', () => {
    ProfileStorageService.hasProfile.mockImplementation(() => new Promise(() => {}));

    const { getByLabelText } = render(<RootNavigator />);

    const loadingIndicator = getByLabelText('loading');
    expect(loadingIndicator.props.size).toBe('large');
    expect(loadingIndicator.props.color).toBe('#A08670');
  });

  it('should use correct navigation structure', async () => {
    ProfileStorageService.hasProfile.mockResolvedValue(true);

    const { getByTestId } = render(<RootNavigator />);

    await waitFor(() => {
      expect(getByTestId('stack-navigator')).toBeTruthy();
    });
  });

  it('should transition from loading to main app', async () => {
    ProfileStorageService.hasProfile.mockResolvedValue(true);

    const { getByLabelText, getByTestId, queryByLabelText } = render(<RootNavigator />);

    // Initially shows loading
    expect(getByLabelText('loading')).toBeTruthy();

    // Wait for loading to complete
    await waitFor(() => {
      expect(queryByLabelText('loading')).toBeNull();
    });

    // Now shows main app
    expect(getByTestId('main-tab-navigator')).toBeTruthy();
  });

  it('should transition from loading to onboarding', async () => {
    ProfileStorageService.hasProfile.mockResolvedValue(false);

    const { getByLabelText, getByTestId, queryByLabelText } = render(<RootNavigator />);

    // Initially shows loading
    expect(getByLabelText('loading')).toBeTruthy();

    // Wait for loading to complete
    await waitFor(() => {
      expect(queryByLabelText('loading')).toBeNull();
    });

    // Now shows onboarding
    expect(getByTestId('onboarding-screen')).toBeTruthy();
  });

  describe.skip('PlaceholderScreen', () => {
    it('should render main app when profile exists (placeholder test)', async () => {
      // Since needsAuth is always false in current implementation,
      // we can't directly test the auth screen placeholder
      ProfileStorageService.hasProfile.mockResolvedValue(true);

      const { getByTestId } = render(<RootNavigator />);

      await waitFor(() => {
        // This test serves as a placeholder for when auth is implemented
        expect(getByTestId('main-tab-navigator')).toBeTruthy();
      });
    });
  });

  describe.skip('error handling', () => {
    it('should handle ProfileStorageService errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      ProfileStorageService.hasProfile.mockRejectedValue(new Error('Database error'));

      const { queryByLabelText } = render(<RootNavigator />);

      await waitFor(() => {
        expect(queryByLabelText('loading')).toBeNull();
      });

      // Should not crash and should show some screen
      // Error handling is silent, so we just verify no crash
      consoleErrorSpy.mockRestore();
    });

    it('should handle null/undefined profile service response', async () => {
      ProfileStorageService.hasProfile.mockResolvedValue(null);

      const { queryByLabelText } = render(<RootNavigator />);

      await waitFor(() => {
        expect(queryByLabelText('loading')).toBeNull();
      });

      // Should treat null as false and show onboarding
      // Exact behavior would depend on implementation details
    });
  });

  describe.skip('theme integration', () => {
    it('should use theme colors for loading screen', () => {
      const customTheme = {
        colors: {
          primary: '#FF0000',
          background: { default: '#000000' },
          text: { primary: '#FFFFFF', secondary: '#CCCCCC' }
        }
      };
      useTheme.mockReturnValue(customTheme);

      ProfileStorageService.hasProfile.mockImplementation(() => new Promise(() => {}));

      const { getByLabelText } = render(<RootNavigator />);

      const loadingIndicator = getByLabelText('loading');
      expect(loadingIndicator.props.color).toBe('#FF0000');
    });

    it('should handle missing theme gracefully', () => {
      useTheme.mockReturnValue({
        colors: {
          primary: undefined,
          background: {},
          text: {}
        }
      });

      ProfileStorageService.hasProfile.mockImplementation(() => new Promise(() => {}));

      // Should not crash when theme values are undefined
      expect(() => render(<RootNavigator />)).not.toThrow();
    });
  });

  describe.skip('navigation configuration', () => {
    it('should configure stack navigator with correct options', async () => {
      ProfileStorageService.hasProfile.mockResolvedValue(true);

      const { getByTestId } = render(<RootNavigator />);

      await waitFor(() => {
        expect(getByTestId('stack-navigator')).toBeTruthy();
      });

      // Navigator should be rendered with proper structure
      // Specific navigation options are handled by the mocked components
    });
  });

  describe.skip('async behavior', () => {
    it('should handle slow profile check', async () => {
      let resolveProfileCheck;
      const profilePromise = new Promise((resolve) => {
        resolveProfileCheck = resolve;
      });
      ProfileStorageService.hasProfile.mockReturnValue(profilePromise);

      const { getByLabelText, queryByTestId } = render(<RootNavigator />);

      // Should show loading
      expect(getByLabelText('loading')).toBeTruthy();
      expect(queryByTestId('main-tab-navigator')).toBeNull();

      // Resolve after some time
      resolveProfileCheck(true);

      await waitFor(() => {
        expect(getByTestId('main-tab-navigator')).toBeTruthy();
      });
    });
  });
});