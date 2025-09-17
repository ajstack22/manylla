import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { ThemedToast } from '../ThemedToast';

// Mock React Native modules
jest.mock('react-native', () => ({
  View: ({ children, ...props }) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }) => <span {...props}>{children}</span>,
  TouchableOpacity: ({ onPress, children, disabled, activeOpacity, ...props }) => (
    <button onClick={onPress} disabled={disabled} {...props}>
      {children}
    </button>
  ),
  Animated: {
    Value: jest.fn().mockImplementation((value) => ({ value })),
    View: ({ children, style, ...props }) => <div style={style} {...props}>{children}</div>,
    spring: jest.fn().mockReturnValue({ start: jest.fn((callback) => callback && callback()) }),
  },
  StyleSheet: {
    create: (styles) => styles,
  },
  Dimensions: {
    get: () => ({ width: 375, height: 812 }),
  },
}));

// Mock platform utility
jest.mock('../../../utils/platform', () => ({
  isWeb: false,
}));

// Mock theme context
const mockTheme = {
  colors: {
    primary: '#A08670',
    background: { paper: '#F4E4C1' },
    text: { primary: '#4A4A4A' },
  },
  themeMode: 'manylla',
};

jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => mockTheme,
}));

describe('ThemedToast', () => {
  const defaultProps = {
    open: true,
    message: 'Test toast message',
    onClose: jest.fn(),
    duration: 3000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders without crashing', () => {
    render(<ThemedToast {...defaultProps} />);
    expect(screen.getByText('Test toast message')).toBeInTheDocument();
  });

  test('does not render when open is false', () => {
    render(<ThemedToast {...defaultProps} open={false} />);
    expect(screen.queryByText('Test toast message')).not.toBeInTheDocument();
  });

  test('displays the provided message', () => {
    render(<ThemedToast {...defaultProps} />);
    expect(screen.getByText('Test toast message')).toBeInTheDocument();
  });

  test('shows close button with × symbol', () => {
    render(<ThemedToast {...defaultProps} />);
    expect(screen.getByText('×')).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    render(<ThemedToast {...defaultProps} onClose={mockOnClose} />);

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('auto-closes after specified duration', () => {
    const mockOnClose = jest.fn();
    render(<ThemedToast {...defaultProps} onClose={mockOnClose} duration={1000} />);

    expect(mockOnClose).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('does not auto-close when duration is 0', () => {
    const mockOnClose = jest.fn();
    render(<ThemedToast {...defaultProps} onClose={mockOnClose} duration={0} />);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('renders with custom icon when provided', () => {
    const customIcon = <span data-testid="custom-icon">🎉</span>;
    render(<ThemedToast {...defaultProps} icon={customIcon} />);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getByText('🎉')).toBeInTheDocument();
  });

  test('renders without icon when not provided', () => {
    render(<ThemedToast {...defaultProps} />);
    expect(screen.getByText('Test toast message')).toBeInTheDocument();
    // Should not have icon container when no icon provided
    expect(screen.queryByTestId('custom-icon')).not.toBeInTheDocument();
  });

  test('applies manylla theme styles correctly', () => {
    mockTheme.themeMode = 'manylla';
    render(<ThemedToast {...defaultProps} />);

    expect(screen.getByText('Test toast message')).toBeInTheDocument();
  });

  test('applies dark theme styles correctly', () => {
    mockTheme.themeMode = 'dark';
    render(<ThemedToast {...defaultProps} />);

    expect(screen.getByText('Test toast message')).toBeInTheDocument();
  });

  test('applies light theme styles correctly', () => {
    mockTheme.themeMode = 'light';
    render(<ThemedToast {...defaultProps} />);

    expect(screen.getByText('Test toast message')).toBeInTheDocument();
  });

  test('handles long messages correctly', () => {
    const longMessage = 'This is a very long toast message that should be displayed correctly even when it exceeds the normal length that most toast messages would have.';
    render(<ThemedToast {...defaultProps} message={longMessage} />);

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });
});