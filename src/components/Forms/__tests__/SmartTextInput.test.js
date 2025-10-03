/* eslint-disable */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SmartTextInput from '../SmartTextInput';

// Mock platform
jest.mock('../../../utils/platform', () => ({
  isWeb: false,
  isIOS: false,
  isAndroid: true,
}));

// P2 TECH DEBT: Remove skip when working on SmartTextInput
// Issue: Platform-specific behavior
describe('SmartTextInput - APR Smoke Tests', () => {
  const defaultProps = {
    value: '',
    onChangeText: jest.fn(),
    placeholder: 'Enter text',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { getByPlaceholderText } = render(<SmartTextInput {...defaultProps} />);
    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('should handle text input', () => {
    const { getByPlaceholderText } = render(<SmartTextInput {...defaultProps} />);
    const input = getByPlaceholderText('Enter text');

    fireEvent.changeText(input, 'Test input');
    expect(defaultProps.onChangeText).toHaveBeenCalledWith('Test input');
  });

  it('should display initial value', () => {
    const props = { ...defaultProps, value: 'Initial value' };
    const { getByDisplayValue } = render(<SmartTextInput {...props} />);

    expect(getByDisplayValue('Initial value')).toBeTruthy();
  });

  it('should handle multiline mode', () => {
    const props = { ...defaultProps, multiline: true, numberOfLines: 4 };
    const { getByPlaceholderText } = render(<SmartTextInput {...props} />);

    const input = getByPlaceholderText('Enter text');
    expect(input.props.multiline).toBe(true);
    expect(input.props.numberOfLines).toBe(4);
  });

  it('should handle disabled state', () => {
    const props = { ...defaultProps, editable: false };
    const { getByPlaceholderText } = render(<SmartTextInput {...props} />);

    const input = getByPlaceholderText('Enter text');
    expect(input.props.editable).toBe(false);
  });

  it('should handle auto-suggestions', async () => {
    const suggestions = ['Option 1', 'Option 2', 'Option 3'];
    const props = { ...defaultProps, suggestions };

    const { getByPlaceholderText } = render(<SmartTextInput {...props} />);
    const input = getByPlaceholderText('Enter text');

    fireEvent.changeText(input, 'Opt');

    await waitFor(() => {
      // Suggestions logic would be tested here
      expect(defaultProps.onChangeText).toHaveBeenCalledWith('Opt');
    });
  });

  it('should handle maxLength restriction', () => {
    const props = { ...defaultProps, maxLength: 10 };
    const { getByPlaceholderText } = render(<SmartTextInput {...props} />);

    const input = getByPlaceholderText('Enter text');
    expect(input.props.maxLength).toBe(10);
  });

  it('should apply custom styles', () => {
    const customStyle = { backgroundColor: '#F4E4C1' };
    const props = { ...defaultProps, style: customStyle };

    const { getByPlaceholderText } = render(<SmartTextInput {...props} />);
    const input = getByPlaceholderText('Enter text');

    expect(input.props.style).toEqual(expect.objectContaining(customStyle));
  });
});