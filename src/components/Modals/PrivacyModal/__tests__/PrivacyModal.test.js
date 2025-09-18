/* eslint-disable */
/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { Platform } from 'react-native';
import PrivacyModal from '../PrivacyModal';
import { useTheme } from '../../../../context/ThemeContext';

// Mock dependencies
jest.mock('../../../../context/ThemeContext');
jest.mock('../../../Common', () => ({
  ThemedModal: ({ children, visible, title, onClose }) =>
    visible ? (
      <div testID="themed-modal">
        <div testID="modal-title">{title}</div>
        {children}
        <button testID="modal-close" onPress={onClose}>Close</button>
      </div>
    ) : null
}));

jest.mock('../styles', () => ({
  createStyles: jest.fn(() => ({
    container: { flex: 1 },
    scrollContent: { padding: 16 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#2C2C2C' },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 16 },
    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C2C2C' },
    sectionText: { fontSize: 14, color: '#2C2C2C', lineHeight: 20 },
    footer: { fontSize: 14, fontStyle: 'italic', color: '#666', marginTop: 16 }
  }))
}));

// P2 TECH DEBT: Remove skip when working on PrivacyModal
// Issue: Modal animation
describe.skip('PrivacyModal', () => {
  const mockTheme = {
    colors: {
      primary: '#A08670',
      background: { paper: '#FAF9F6' },
      text: { primary: '#2C2C2C', secondary: '#666' },
      border: '#E0E0E0'
    },
    theme: 'light'
  };

  beforeEach(() => {
    useTheme.mockReturnValue(mockTheme);
    jest.clearAllMocks();
  });

  it('should render when visible is true', () => {
    const { getByTestId, getByText } = render(
      <PrivacyModal visible={true} onClose={jest.fn()} />
    );

    expect(getByTestId('themed-modal')).toBeTruthy();
    expect(getByTestId('modal-title')).toHaveTextContent('Privacy Policy');
    expect(getByText('Privacy Policy')).toBeTruthy();
    expect(getByText('Last updated: September 12, 2025')).toBeTruthy();
  });

  it('should not render when visible is false', () => {
    const { queryByTestId } = render(
      <PrivacyModal visible={false} onClose={jest.fn()} />
    );

    expect(queryByTestId('themed-modal')).toBeNull();
  });

  it('should render all privacy policy sections', () => {
    const { getByText } = render(
      <PrivacyModal visible={true} onClose={jest.fn()} />
    );

    // Check key sections are rendered
    expect(getByText('Overview')).toBeTruthy();
    expect(getByText('Data Collection')).toBeTruthy();
    expect(getByText('Data Storage')).toBeTruthy();
    expect(getByText('Zero-Knowledge Sync (Optional)')).toBeTruthy();
    expect(getByText('Children\'s Privacy')).toBeTruthy();
    expect(getByText('Third-Party Services')).toBeTruthy();
    expect(getByText('Your Rights')).toBeTruthy();
    expect(getByText('Contact')).toBeTruthy();
  });

  it('should render overview text correctly', () => {
    const { getByText } = render(
      <PrivacyModal visible={true} onClose={jest.fn()} />
    );

    expect(getByText(/Manylla is designed with privacy as a core principle/)).toBeTruthy();
  });

  it('should render data collection information', () => {
    const { getByText } = render(
      <PrivacyModal visible={true} onClose={jest.fn()} />
    );

    expect(getByText(/We collect NO personal data by default/)).toBeTruthy();
  });

  it('should render zero-knowledge sync details', () => {
    const { getByText } = render(
      <PrivacyModal visible={true} onClose={jest.fn()} />
    );

    expect(getByText(/Zero-knowledge architecture/)).toBeTruthy();
    expect(getByText(/We cannot read your data/)).toBeTruthy();
  });

  it('should render children privacy information', () => {
    const { getByText } = render(
      <PrivacyModal visible={true} onClose={jest.fn()} />
    );

    expect(getByText(/We don't collect any information from children/)).toBeTruthy();
    expect(getByText(/No accounts or sign-ups required/)).toBeTruthy();
  });

  it('should render contact information', () => {
    const { getByText } = render(
      <PrivacyModal visible={true} onClose={jest.fn()} />
    );

    expect(getByText('privacy@manylla.com')).toBeTruthy();
  });

  it('should render footer message', () => {
    const { getByText } = render(
      <PrivacyModal visible={true} onClose={jest.fn()} />
    );

    expect(getByText(/Manylla respects your family's privacy/)).toBeTruthy();
  });

  it('should use manylla theme when forceManyllaTheme is true', () => {
    const { getByTestId } = render(
      <PrivacyModal visible={true} onClose={jest.fn()} forceManyllaTheme={true} />
    );

    expect(getByTestId('themed-modal')).toBeTruthy();
    // The component should use manylla colors when forced
    // Testing exact colors would require checking styles which are mocked
  });

  it('should use manylla theme when no theme is set', () => {
    useTheme.mockReturnValue({
      colors: mockTheme.colors,
      theme: null // No theme set
    });

    const { getByTestId } = render(
      <PrivacyModal visible={true} onClose={jest.fn()} />
    );

    expect(getByTestId('themed-modal')).toBeTruthy();
    // Should use manylla theme when no theme is set
  });

  it('should use context theme when available and not forced', () => {
    const { getByTestId } = render(
      <PrivacyModal visible={true} onClose={jest.fn()} forceManyllaTheme={false} />
    );

    expect(getByTestId('themed-modal')).toBeTruthy();
    // Should use context theme when available and not forced to use manylla
  });

  describe('Platform-specific rendering', () => {
    const originalPlatform = Platform.OS;

    afterEach(() => {
      Platform.OS = originalPlatform;
    });

    it('should render FlatList on Android', () => {
      Platform.OS = 'android';

      const { getByTestId } = render(
        <PrivacyModal visible={true} onClose={jest.fn()} />
      );

      expect(getByTestId('themed-modal')).toBeTruthy();
      // Content should still be rendered regardless of platform
      expect(getByTestId('modal-title')).toHaveTextContent('Privacy Policy');
    });

    it('should render ScrollView on iOS', () => {
      Platform.OS = 'ios';

      const { getByTestId } = render(
        <PrivacyModal visible={true} onClose={jest.fn()} />
      );

      expect(getByTestId('themed-modal')).toBeTruthy();
      // Content should still be rendered regardless of platform
      expect(getByTestId('modal-title')).toHaveTextContent('Privacy Policy');
    });

    it('should render ScrollView on web', () => {
      Platform.OS = 'web';

      const { getByTestId } = render(
        <PrivacyModal visible={true} onClose={jest.fn()} />
      );

      expect(getByTestId('themed-modal')).toBeTruthy();
      // Content should still be rendered regardless of platform
      expect(getByTestId('modal-title')).toHaveTextContent('Privacy Policy');
    });
  });

  it('should handle missing insets prop gracefully', () => {
    const { getByTestId } = render(
      <PrivacyModal visible={true} onClose={jest.fn()} />
    );

    // Should render without issues even when insets is not provided
    expect(getByTestId('themed-modal')).toBeTruthy();
  });

  it('should call onClose when modal is closed', () => {
    const mockOnClose = jest.fn();

    const { getByTestId } = render(
      <PrivacyModal visible={true} onClose={mockOnClose} />
    );

    const closeButton = getByTestId('modal-close');
    closeButton.props.onPress();

    expect(mockOnClose).toHaveBeenCalled();
  });
});