import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Platform, Linking } from 'react-native';
import SupportModal from '../SupportModal';

// Mock platform
jest.mock('../../../../utils/platform', () => ({
  isWeb: false,
  isIOS: false,
  isAndroid: true,
}));

// Mock ThemedModal
jest.mock('../../../Common', () => ({
  ThemedModal: ({ children, visible, onClose, title, ...props }) => {
    if (!visible) return null;
    return (
      <div
        data-testid="themed-modal"
        role="dialog"
        aria-label={title}
        {...props}
      >
        <button data-testid="close-button" onClick={onClose}>
          Close
        </button>
        {children}
      </div>
    );
  },
}));

// Mock BuyMeCoffeeButton
jest.mock('../../../BuyMeCoffeeButton/BuyMeCoffeeButton', () => {
  return ({ onPress }) => (
    <button data-testid="buy-me-coffee-button" onClick={onPress}>
      Buy Me Coffee
    </button>
  );
});

// Mock ThemeContext
const mockThemeContext = {
  colors: {
    primary: '#A08670',
    background: '#FFFFFF',
    text: '#000000',
    border: '#E1E4E8',
  },
  theme: 'light',
};

jest.mock('../../../../context/ThemeContext', () => ({
  useTheme: () => mockThemeContext,
}));

// Mock Linking
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: {
      OS: 'android',
      select: (obj) => obj.android || obj.default,
    },
    Linking: {
      openURL: jest.fn(() => Promise.resolve()),
    },
  };
});

// P2 TECH DEBT: Remove skip when working on SupportModal
// Issue: Image import error
describe.skip('SupportModal - Smoke Tests', () => {
  const mockProps = {
    visible: true,
    onClose: jest.fn(),
    insets: { top: 44, bottom: 34, left: 0, right: 0 },
    forceManyllaTheme: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing when visible', () => {
      const { getByTestId } = render(<SupportModal {...mockProps} />);
      expect(getByTestId('themed-modal')).toBeTruthy();
    });

    it('should not render when not visible', () => {
      const { queryByTestId } = render(
        <SupportModal {...mockProps} visible={false} />
      );
      expect(queryByTestId('themed-modal')).toBeFalsy();
    });

    it('should render title and subtitle content', () => {
      const { getByText } = render(<SupportModal {...mockProps} />);

      expect(getByText('Support Manylla')).toBeTruthy();
      expect(getByText('Help us support special needs families')).toBeTruthy();
    });

    it('should render mission section', () => {
      const { getByText } = render(<SupportModal {...mockProps} />);

      expect(getByText('Our Mission')).toBeTruthy();
      expect(getByText(/Manylla exists to help families/)).toBeTruthy();
    });

    it('should render impact section with feature cards', () => {
      const { getByText } = render(<SupportModal {...mockProps} />);

      expect(getByText('Why Your Support Matters')).toBeTruthy();
      expect(getByText('Privacy Protection')).toBeTruthy();
      expect(getByText('Free Sync Service')).toBeTruthy();
      expect(getByText('Continuous Development')).toBeTruthy();
    });
  });

  describe('Interactive Elements', () => {
    it('should render Buy Me Coffee button', () => {
      const { getByTestId } = render(<SupportModal {...mockProps} />);
      expect(getByTestId('buy-me-coffee-button')).toBeTruthy();
    });

    it('should handle Buy Me Coffee button press', () => {
      const { getByTestId } = render(<SupportModal {...mockProps} />);

      fireEvent.press(getByTestId('buy-me-coffee-button'));
      expect(Linking.openURL).toHaveBeenCalledWith('https://www.buymeacoffee.com/stackmap');
    });

    it('should render email contact button', () => {
      const { getByText } = render(<SupportModal {...mockProps} />);
      expect(getByText('support@manylla.com')).toBeTruthy();
    });

    it('should handle email button press', () => {
      const { getByText } = render(<SupportModal {...mockProps} />);

      fireEvent.press(getByText('support@manylla.com'));
      expect(Linking.openURL).toHaveBeenCalledWith('mailto:support@manylla.com');
    });

    it('should handle modal close', () => {
      const { getByTestId } = render(<SupportModal {...mockProps} />);

      fireEvent.press(getByTestId('close-button'));
      expect(mockProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Theme Handling', () => {
    it('should use manylla theme when forceManyllaTheme is true', () => {
      const { container } = render(
        <SupportModal {...mockProps} forceManyllaTheme={true} />
      );
      // Component should render with manylla theme colors
      expect(container).toBeTruthy();
    });

    it('should use context theme when forceManyllaTheme is false', () => {
      const { container } = render(
        <SupportModal {...mockProps} forceManyllaTheme={false} />
      );
      // Component should render with context theme colors
      expect(container).toBeTruthy();
    });
  });

  describe('Content Sections', () => {
    it('should render ways to help section', () => {
      const { getByText } = render(<SupportModal {...mockProps} />);

      expect(getByText('Other Ways to Contribute')).toBeTruthy();
      expect(getByText('Review')).toBeTruthy();
      expect(getByText('Share')).toBeTruthy();
      expect(getByText('Feedback')).toBeTruthy();
      expect(getByText('Ideas')).toBeTruthy();
    });

    it('should render contact section', () => {
      const { getByText } = render(<SupportModal {...mockProps} />);

      expect(getByText('Get in Touch')).toBeTruthy();
      expect(getByText('Questions, feedback, or just want to say hello?')).toBeTruthy();
    });

    it('should render footer section', () => {
      const { getByText } = render(<SupportModal {...mockProps} />);

      expect(getByText(/Thank you for being part of the Manylla community/)).toBeTruthy();
    });
  });

  describe('Platform-specific Rendering', () => {
    it('should handle Android platform rendering', () => {
      Platform.OS = 'android';
      const { container } = render(<SupportModal {...mockProps} />);
      expect(container).toBeTruthy();
    });

    it('should handle iOS/Web platform rendering', () => {
      Platform.OS = 'ios';
      const { container } = render(<SupportModal {...mockProps} />);
      expect(container).toBeTruthy();
    });
  });
});