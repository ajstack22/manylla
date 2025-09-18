/* eslint-disable */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import BuyMeCoffeeButton from '../BuyMeCoffeeButton';

// Mock React Native modules
jest.mock('react-native', () => ({
  View: ({ children, ...props }) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }) => <span {...props}>{children}</span>,
  TouchableOpacity: ({ onPress, children, disabled, accessibilityRole, accessibilityLabel, ...props }) => (
    <button
      onClick={onPress}
      disabled={disabled}
      role={accessibilityRole}
      aria-label={accessibilityLabel}
      {...props}
    >
      {children}
    </button>
  ),
  StyleSheet: {
    create: (styles) => styles,
  },
  Platform: {
    OS: 'web',
    select: (options) => options.web || options.default,
  },
}));

describe('BuyMeCoffeeButton', () => {
  test('renders without crashing', () => {
    render(<BuyMeCoffeeButton />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('displays coffee emoji and text', () => {
    render(<BuyMeCoffeeButton />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('☕');
    expect(button).toHaveTextContent('Buy Me a Coffee');
  });

  test('calls onPress when clicked', () => {
    const mockOnPress = jest.fn();
    render(<BuyMeCoffeeButton onPress={mockOnPress} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  test('applies custom style prop', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<BuyMeCoffeeButton style={customStyle} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('is disabled when disabled prop is true', () => {
    render(<BuyMeCoffeeButton disabled={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  test('is enabled by default', () => {
    render(<BuyMeCoffeeButton />);

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  test('has accessibility attributes', () => {
    render(<BuyMeCoffeeButton />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('role', 'button');
    expect(button).toHaveAttribute('aria-label', 'Support us on Buy Me a Coffee');
  });

  test('does not call onPress when disabled', () => {
    const mockOnPress = jest.fn();
    render(<BuyMeCoffeeButton onPress={mockOnPress} disabled={true} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnPress).not.toHaveBeenCalled();
  });
});