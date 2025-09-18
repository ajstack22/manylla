/* eslint-disable */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Header from '../Header';

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
  Image: ({ source, style, ...props }) => (
    <img src={source.uri} style={style} {...props} alt="Profile" />
  ),
  StyleSheet: {
    create: (styles) => styles,
  },
  Platform: {
    OS: 'web',
    select: (options) => options.web || options.default,
    isIOS: false,
  },
}));

// Mock platform utilities
jest.mock('../../../utils/platformStyles', () => ({
  getStatusBarHeight: () => 0,
}));

jest.mock('../../../utils/platform', () => ({
  select: (options) => options.web || options.default,
  isIOS: false,
}));

describe('Header', () => {
  const mockColors = {
    primary: '#A08670',
    background: { paper: '#F4E4C1' },
    divider: '#E0E0E0',
    action: { hover: 'rgba(0,0,0,0.04)' },
  };

  const mockProfile = {
    name: 'John Doe',
    preferredName: 'Johnny',
    photo: null,
  };

  const defaultProps = {
    colors: mockColors,
    theme: 'light',
    profile: null,
    onEditProfile: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('manylla')).toBeInTheDocument();
  });

  test('displays logo with correct text and avatar', () => {
    render(<Header {...defaultProps} />);

    expect(screen.getByText('manylla')).toBeInTheDocument();
    expect(screen.getByText('m')).toBeInTheDocument();
  });

  test('renders without profile when profile is null', () => {
    render(<Header {...defaultProps} />);

    expect(screen.getByText('manylla')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('renders profile button when profile is provided', () => {
    const props = { ...defaultProps, profile: mockProfile };
    render(<Header {...props} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Johnny')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument(); // Profile avatar placeholder
  });

  test('displays preferred name over regular name', () => {
    const props = { ...defaultProps, profile: mockProfile };
    render(<Header {...props} />);

    expect(screen.getByText('Johnny')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  test('displays regular name when no preferred name', () => {
    const profileWithoutPreferred = { ...mockProfile, preferredName: null };
    const props = { ...defaultProps, profile: profileWithoutPreferred };
    render(<Header {...props} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('calls onEditProfile when profile button is clicked', () => {
    const mockOnEditProfile = jest.fn();
    const props = { ...defaultProps, profile: mockProfile, onEditProfile: mockOnEditProfile };
    render(<Header {...props} />);

    const profileButton = screen.getByRole('button');
    fireEvent.click(profileButton);

    expect(mockOnEditProfile).toHaveBeenCalledTimes(1);
  });

  test('renders profile image when photo is provided', () => {
    const profileWithPhoto = { ...mockProfile, photo: 'https://example.com/photo.jpg' };
    const props = { ...defaultProps, profile: profileWithPhoto };
    render(<Header {...props} />);

    const image = screen.getByAltText('Profile');
    expect(image).toBeInTheDocument();
    expect(image.src).toBe('https://example.com/photo.jpg');
  });

  test('uses primary color from theme', () => {
    const customColors = { ...mockColors, primary: '#FF5722' };
    const props = { ...defaultProps, colors: customColors };
    render(<Header {...props} />);

    expect(screen.getByText('manylla')).toBeInTheDocument();
  });
});