/* eslint-disable */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from '../OnboardingScreen';
import { ThemeProvider } from '../../../context/ThemeContext';
import { StorageService } from '../../../services/storage/storageService';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../../services/storage/storageService');
jest.mock('../../../utils/platform', () => ({
  isWeb: false,
  isIOS: false,
  isAndroid: true,
  isPWA: false,
}));

// Mock the Ellie image
jest.mock('../../../../public/assets/ellie.png', () => 'mocked-image');

const mockOnComplete = jest.fn();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

// P2 TECH DEBT: Remove skip when working on onboarding
// Issue: AsyncStorage mock configuration
describe.skip('OnboardingScreen - Smoke Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();
    StorageService.saveProfile = jest.fn().mockResolvedValue();
  });

  describe.skip('Rendering', () => {
    it('should render without crashing', () => {
      const { getByText } = renderWithTheme(
        <OnboardingScreen onComplete={mockOnComplete} />
      );
      expect(getByText(/Welcome to/i)).toBeTruthy();
    });
  });

  describe.skip('Navigation', () => {
    it('should allow starting fresh', () => {
      const { getByText } = renderWithTheme(
        <OnboardingScreen onComplete={mockOnComplete} />
      );

      const startButton = getByText(/Start Fresh/i);
      fireEvent.press(startButton);

      expect(getByText(/Child Information/i)).toBeTruthy();
    });

    it('should allow skipping with demo mode', () => {
      const { getByText } = renderWithTheme(
        <OnboardingScreen onComplete={mockOnComplete} />
      );

      const demoButton = getByText(/Try Demo/i);
      fireEvent.press(demoButton);

      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  describe.skip('Basic Form Input', () => {
    it('should accept child name input', () => {
      const { getByText, getByPlaceholderText } = renderWithTheme(
        <OnboardingScreen onComplete={mockOnComplete} />
      );

      fireEvent.press(getByText(/Start Fresh/i));

      const nameInput = getByPlaceholderText(/Enter name/i);
      fireEvent.changeText(nameInput, 'Test Child');

      expect(nameInput.props.value).toBe('Test Child');
    });

    it('should handle continue with valid data', async () => {
      const { getByText, getByPlaceholderText } = renderWithTheme(
        <OnboardingScreen onComplete={mockOnComplete} />
      );

      fireEvent.press(getByText(/Start Fresh/i));

      const nameInput = getByPlaceholderText(/Enter name/i);
      fireEvent.changeText(nameInput, 'Test Child');

      const continueButton = getByText(/Continue/i);
      fireEvent.press(continueButton);

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });
  });

  describe.skip('Access Code', () => {
    it('should handle access code input', () => {
      const { getByText, getByPlaceholderText } = renderWithTheme(
        <OnboardingScreen onComplete={mockOnComplete} />
      );

      const accessInput = getByPlaceholderText(/Enter access code/i);
      fireEvent.changeText(accessInput, 'TEST123');

      const joinButton = getByText(/Join with Access Code/i);
      fireEvent.press(joinButton);

      expect(mockOnComplete).toHaveBeenCalledWith(expect.objectContaining({
        mode: 'join',
        accessCode: 'TEST123'
      }));
    });
  });

  describe.skip('Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      StorageService.saveProfile.mockRejectedValue(new Error('Storage error'));

      const { getByText } = renderWithTheme(
        <OnboardingScreen />
      );

      const demoButton = getByText(/Try Demo/i);
      fireEvent.press(demoButton);

      // Should not crash even if storage fails
      await waitFor(() => {
        expect(StorageService.saveProfile).toHaveBeenCalled();
      });
    });
  });
});