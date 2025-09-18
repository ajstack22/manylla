/* eslint-disable */
/**
 * Smoke tests for RichTextInput component
 * Tests basic functionality of rich text input with formatting toolbar
 */
import React from 'react';
import { render } from '@testing-library/react';
import { RichTextInput } from '../RichTextInput';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock platform styles
jest.mock('../../../utils/platformStyles', () => ({
  getTextStyle: jest.fn(() => ({ color: '#000000' })),
}));

// Mock platform utilities
jest.mock('../../../utils/platform', () => ({
  isAndroid: false,
  isIOS: false,
  isWeb: true,
}));

describe('RichTextInput', () => {
  const defaultProps = {
    label: 'Description',
    value: 'Test text content',
    onChange: jest.fn(),
    placeholder: 'Enter description here',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { container } = render(
      <RichTextInput {...defaultProps} />
    );

    expect(container).toBeInTheDocument();
  });

  it('should render with required prop', () => {
    const { container } = render(
      <RichTextInput {...defaultProps} required />
    );

    expect(container).toBeInTheDocument();
  });

  it('should render with helper text', () => {
    const { container } = render(
      <RichTextInput
        {...defaultProps}
        helperText="This is helper text"
      />
    );

    expect(container).toBeInTheDocument();
  });

  it('should handle multiline prop', () => {
    const { container } = render(
      <RichTextInput {...defaultProps} multiline={false} />
    );

    expect(container).toBeInTheDocument();
  });

  it('should handle autoFocus prop', () => {
    const { container } = render(
      <RichTextInput {...defaultProps} autoFocus />
    );

    expect(container).toBeInTheDocument();
  });

  it('should handle empty value', () => {
    const { container } = render(
      <RichTextInput
        {...defaultProps}
        value=""
        placeholder="Enter description here"
      />
    );

    expect(container).toBeInTheDocument();
  });

  it('should render with custom rows', () => {
    const { container } = render(
      <RichTextInput {...defaultProps} multiline rows={5} />
    );

    expect(container).toBeInTheDocument();
  });
});