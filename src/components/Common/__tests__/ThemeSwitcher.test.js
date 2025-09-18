/* eslint-disable */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ThemeSwitcher, ThemeSwitcherIcon } from '../ThemeSwitcher';

// Mock React Native modules
jest.mock('react-native', () => ({
  View: ({ children, ...props }) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }) => <span {...props}>{children}</span>,
  TouchableOpacity: ({ onPress, children, disabled, activeOpacity, hitSlop, ...props }) => (
    <button onClick={onPress} disabled={disabled} {...props}>
      {children}
    </button>
  ),
  StyleSheet: {
    create: (styles) => styles,
  },
}));

// Mock platform utility
jest.mock('../../../utils/platform', () => ({
  isWeb: true,
}));

// Mock theme context
const mockTheme = {
  themeMode: 'light',
  toggleTheme: jest.fn(),
  colors: {
    text: { primary: '#4A4A4A' },
    background: { paper: '#F4E4C1' },
    border: '#E0E0E0',
  },
};

jest.mock('../../../context', () => ({
  useTheme: () => mockTheme,
}));

// Mock icon components
jest.mock('../IconProvider', () => ({
  DarkModeIcon: ({ size, color }) => <div data-testid="dark-mode-icon" style={{ color }}>🌙</div>,
  LightModeIcon: ({ size, color }) => <div data-testid="light-mode-icon" style={{ color }}>☀️</div>,
  PaletteIcon: ({ size, color }) => <div data-testid="palette-icon" style={{ color }}>🎨</div>,
}));

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTheme.themeMode = 'light';
  });

  test('renders without crashing', () => {
    render(<ThemeSwitcher />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('displays light mode icon and label when in light theme', () => {
    mockTheme.themeMode = 'light';
    render(<ThemeSwitcher />);

    expect(screen.getByTestId('light-mode-icon')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
  });

  test('displays dark mode icon and label when in dark theme', () => {
    mockTheme.themeMode = 'dark';
    render(<ThemeSwitcher />);

    expect(screen.getByTestId('dark-mode-icon')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  test('displays manylla icon and label when in manylla theme', () => {
    mockTheme.themeMode = 'manylla';
    render(<ThemeSwitcher />);

    expect(screen.getByTestId('palette-icon')).toBeInTheDocument();
    expect(screen.getByText('Manylla')).toBeInTheDocument();
  });

  test('displays default palette icon for unknown theme', () => {
    mockTheme.themeMode = 'unknown';
    render(<ThemeSwitcher />);

    expect(screen.getByTestId('palette-icon')).toBeInTheDocument();
    expect(screen.getByText('Theme')).toBeInTheDocument();
  });

  test('calls toggleTheme when clicked', () => {
    render(<ThemeSwitcher />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockTheme.toggleTheme).toHaveBeenCalledTimes(1);
  });

  test('accepts custom style prop', () => {
    const customStyle = { margin: 10 };
    render(<ThemeSwitcher style={customStyle} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('uses theme colors for styling', () => {
    render(<ThemeSwitcher />);

    expect(screen.getByTestId('light-mode-icon')).toBeInTheDocument();
  });
});

describe('ThemeSwitcherIcon', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTheme.themeMode = 'light';
  });

  test('renders without crashing', () => {
    render(<ThemeSwitcherIcon />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('displays correct icon for light theme', () => {
    mockTheme.themeMode = 'light';
    render(<ThemeSwitcherIcon />);

    expect(screen.getByTestId('light-mode-icon')).toBeInTheDocument();
  });

  test('displays correct icon for dark theme', () => {
    mockTheme.themeMode = 'dark';
    render(<ThemeSwitcherIcon />);

    expect(screen.getByTestId('dark-mode-icon')).toBeInTheDocument();
  });

  test('displays correct icon for manylla theme', () => {
    mockTheme.themeMode = 'manylla';
    render(<ThemeSwitcherIcon />);

    expect(screen.getByTestId('palette-icon')).toBeInTheDocument();
  });

  test('uses default palette icon for unknown theme', () => {
    mockTheme.themeMode = 'unknown';
    render(<ThemeSwitcherIcon />);

    expect(screen.getByTestId('palette-icon')).toBeInTheDocument();
  });

  test('calls toggleTheme when clicked', () => {
    render(<ThemeSwitcherIcon />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockTheme.toggleTheme).toHaveBeenCalledTimes(1);
  });

  test('accepts custom size prop', () => {
    render(<ThemeSwitcherIcon size={32} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('accepts custom color prop', () => {
    render(<ThemeSwitcherIcon color="#FF5722" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('accepts custom style prop', () => {
    const customStyle = { padding: 5 };
    render(<ThemeSwitcherIcon style={customStyle} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('uses theme color when no custom color provided', () => {
    render(<ThemeSwitcherIcon />);
    expect(screen.getByTestId('light-mode-icon')).toBeInTheDocument();
  });

  test('handles all theme modes correctly', () => {
    const themes = ['light', 'dark', 'manylla'];

    themes.forEach(theme => {
      mockTheme.themeMode = theme;
      const { rerender } = render(<ThemeSwitcherIcon />);

      const expectedIcon = theme === 'light' ? 'light-mode-icon' :
                          theme === 'dark' ? 'dark-mode-icon' : 'palette-icon';
      expect(screen.getByTestId(expectedIcon)).toBeInTheDocument();

      rerender(<ThemeSwitcherIcon />);
    });
  });
});