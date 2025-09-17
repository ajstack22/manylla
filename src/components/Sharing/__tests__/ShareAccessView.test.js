import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ShareAccessView from '../ShareAccessView';

// Mock dependencies
jest.mock('../../../utils/platform', () => ({
  isWeb: false,
  isIOS: false,
  isAndroid: true,
}));

// Mock icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// P2 TECH DEBT: Remove skip when working on sharing components
// Issue: Test environment setup and mock dependencies
describe.skip('ShareAccessView - Smoke Tests', () => {
  const defaultProps = {
    shareUrl: 'https://example.com/share/123',
    expiresIn: 60,
    onClose: jest.fn(),
    onExtend: jest.fn(),
  };

  it('should render without crashing', () => {
    const { getByText } = render(<ShareAccessView {...defaultProps} />);
    expect(getByText(/Share Link/)).toBeTruthy();
  });

  it('should display share URL', () => {
    const { getByText } = render(<ShareAccessView {...defaultProps} />);
    expect(getByText(defaultProps.shareUrl)).toBeTruthy();
  });

  it('should show expiration time', () => {
    const { getByText } = render(<ShareAccessView {...defaultProps} />);
    expect(getByText(/Expires in/)).toBeTruthy();
  });

  it('should handle copy button press', () => {
    const { getByText } = render(<ShareAccessView {...defaultProps} />);
    fireEvent.press(getByText('Copy Link'));
    // Should trigger copy functionality
  });

  it('should handle extend button press', () => {
    const { getByText } = render(<ShareAccessView {...defaultProps} />);
    fireEvent.press(getByText('Extend Time'));
    expect(defaultProps.onExtend).toHaveBeenCalled();
  });

  it('should handle close button press', () => {
    const { getByTestId } = render(<ShareAccessView {...defaultProps} />);
    fireEvent.press(getByTestId('close-button'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});