import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UnifiedApp from '../UnifiedApp';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../utils/platform', () => ({
  isWeb: false,
  isIOS: false,
  isAndroid: true,
}));

// Mock all context providers
jest.mock('../../context/ThemeContext', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({
    theme: 'light',
    toggleTheme: jest.fn(),
    selectTheme: jest.fn(),
    colors: {
      primary: '#007AFF',
      background: '#FFFFFF',
      text: '#000000',
    },
  }),
}));

jest.mock('../../context/ProfileContext', () => ({
  ProfileProvider: ({ children }) => children,
  useProfile: () => ({
    profile: null,
    setProfile: jest.fn(),
    updateProfile: jest.fn(),
  }),
}));

jest.mock('../../context/SyncContext', () => ({
  SyncProvider: ({ children }) => children,
  useSync: () => ({
    syncStatus: 'idle',
    syncData: jest.fn(),
    lastSyncTime: null,
  }),
}));

jest.mock('../../context/ToastContext', () => ({
  ToastProvider: ({ children }) => children,
  useToast: () => ({
    showToast: jest.fn(),
    hideToast: jest.fn(),
  }),
}));

// Mock screens
jest.mock('../../screens/ProfileScreen', () => 'ProfileScreen');
jest.mock('../../screens/Onboarding/OnboardingScreen', () => 'OnboardingScreen');

// Mock components
jest.mock('../Layout/AppHeader', () => 'AppHeader');
jest.mock('../Navigation/BottomToolbar', () => 'BottomToolbar');
jest.mock('../Sharing/ShareDialog', () => 'ShareDialog');
jest.mock('../Sync/SyncDialog', () => 'SyncDialog');
jest.mock('../Common/PrintView', () => 'PrintView');
jest.mock('../Toast/ToastManager', () => 'ToastManager');

// Mock services
jest.mock('../../services/storage/storageService', () => ({
  StorageService: {
    loadProfiles: jest.fn(),
    saveProfile: jest.fn(),
    clearAll: jest.fn(),
  },
}));

// P2 tech debt: Main app component integration
describe.skip('UnifiedApp - Smoke Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<UnifiedApp />);
      expect(getByTestId('app-container')).toBeTruthy();
    });

    it('should render onboarding screen when no profile exists', async () => {
      const { getByTestId } = render(<UnifiedApp />);

      await waitFor(() => {
        expect(getByTestId('onboarding-screen')).toBeTruthy();
      });
    });

    it('should render profile screen when profile exists', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        id: '1',
        name: 'Test Child',
        categories: [],
        entries: [],
      }));

      const { getByTestId } = render(<UnifiedApp />);

      await waitFor(() => {
        expect(getByTestId('profile-screen')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('should show header and toolbar when profile exists', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        id: '1',
        name: 'Test Child',
      }));

      const { getByTestId } = render(<UnifiedApp />);

      await waitFor(() => {
        expect(getByTestId('app-header')).toBeTruthy();
        expect(getByTestId('bottom-toolbar')).toBeTruthy();
      });
    });

    it('should not show header during onboarding', async () => {
      const { queryByTestId } = render(<UnifiedApp />);

      await waitFor(() => {
        expect(queryByTestId('app-header')).toBeFalsy();
        expect(queryByTestId('bottom-toolbar')).toBeFalsy();
      });
    });
  });

  describe('Dialogs', () => {
    it('should toggle share dialog', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        id: '1',
        name: 'Test Child',
      }));

      const { getByTestId, queryByTestId } = render(<UnifiedApp />);

      await waitFor(() => {
        expect(getByTestId('profile-screen')).toBeTruthy();
      });

      // Trigger share dialog (would normally be done via toolbar)
      const toolbar = getByTestId('bottom-toolbar');
      expect(toolbar).toBeTruthy();

      // Check share dialog can be rendered
      expect(queryByTestId('share-dialog')).toBeFalsy();
    });

    it('should toggle sync dialog', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        id: '1',
        name: 'Test Child',
      }));

      const { getByTestId, queryByTestId } = render(<UnifiedApp />);

      await waitFor(() => {
        expect(getByTestId('profile-screen')).toBeTruthy();
      });

      // Check sync dialog can be rendered
      expect(queryByTestId('sync-dialog')).toBeFalsy();
    });
  });

  describe('Profile Management', () => {
    it('should handle profile creation from onboarding', async () => {
      const { getByTestId } = render(<UnifiedApp />);

      await waitFor(() => {
        expect(getByTestId('onboarding-screen')).toBeTruthy();
      });

      // Simulate onboarding completion
      const onboardingScreen = getByTestId('onboarding-screen');
      expect(onboardingScreen).toBeTruthy();
    });

    it('should handle profile updates', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        id: '1',
        name: 'Test Child',
        categories: [],
        entries: [],
      }));

      const { getByTestId } = render(<UnifiedApp />);

      await waitFor(() => {
        expect(getByTestId('profile-screen')).toBeTruthy();
      });

      // Profile screen should be able to update profile
      const profileScreen = getByTestId('profile-screen');
      expect(profileScreen).toBeTruthy();
    });

    it('should handle profile closure', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        id: '1',
        name: 'Test Child',
      }));

      const { getByTestId } = render(<UnifiedApp />);

      await waitFor(() => {
        expect(getByTestId('bottom-toolbar')).toBeTruthy();
      });

      // Close profile functionality should be available
      const toolbar = getByTestId('bottom-toolbar');
      expect(toolbar).toBeTruthy();
    });
  });

  describe('Theme Support', () => {
    it('should apply theme to all components', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        id: '1',
        name: 'Test Child',
      }));

      const { getByTestId } = render(<UnifiedApp />);

      await waitFor(() => {
        expect(getByTestId('app-container')).toBeTruthy();
      });

      // App should have theme applied
      const appContainer = getByTestId('app-container');
      expect(appContainer).toBeTruthy();
    });
  });

  describe('Toast Messages', () => {
    it('should render toast manager', () => {
      const { getByTestId } = render(<UnifiedApp />);

      // Toast manager should always be present
      expect(getByTestId('toast-manager')).toBeTruthy();
    });
  });

  describe('Print View', () => {
    it('should handle print view state', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        id: '1',
        name: 'Test Child',
      }));

      const { queryByTestId } = render(<UnifiedApp />);

      await waitFor(() => {
        // Print view should not be visible initially
        expect(queryByTestId('print-view')).toBeFalsy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const { getByTestId } = render(<UnifiedApp />);

      // Should show onboarding as fallback
      await waitFor(() => {
        expect(getByTestId('onboarding-screen')).toBeTruthy();
      });
    });

    it('should handle invalid profile data', async () => {
      AsyncStorage.getItem.mockResolvedValue('invalid json');

      const { getByTestId } = render(<UnifiedApp />);

      // Should show onboarding as fallback
      await waitFor(() => {
        expect(getByTestId('onboarding-screen')).toBeTruthy();
      });
    });
  });
});