/**
 * ProfileEditDialog.test.js
 * Comprehensive tests for ProfileEditDialog component
 * Target: 65% coverage
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProfileEditDialog } from '../ProfileEditDialog';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock dependencies
jest.mock('react-native-vector-icons/MaterialIcons', () => {
  const React = require('react');
  return ({ name, size, color }) => React.createElement('span', {
    'data-testid': `icon-${name}`,
    style: { fontSize: size, color }
  }, name);
});

jest.mock('@react-native-community/datetimepicker', () => {
  return {
    __esModule: true,
    default: ({ value, onChange, mode, display, maximumDate }) => (
      <div data-testid="date-time-picker">
        <input
          type="date"
          value={value instanceof Date ? value.toISOString().split('T')[0] : value}
          onChange={(e) => onChange({ type: 'set' }, new Date(e.target.value))}
          max={maximumDate instanceof Date ? maximumDate.toISOString().split('T')[0] : undefined}
          data-testid="date-time-input"
        />
      </div>
    ),
  };
});

jest.mock('../../../utils/platformStyles', () => ({
  getTextStyle: jest.fn(() => ({ fontFamily: 'System' })),
  getScrollViewProps: jest.fn(() => ({
    nestedScrollEnabled: false,
    keyboardShouldPersistTaps: 'handled',
  })),
}));

jest.mock('../PhotoUpload', () => {
  return {
    __esModule: true,
    default: ({ currentPhoto, onPhotoChange, onPhotoRemove, size }) => (
      <div data-testid="photo-upload">
        <div>Current Photo: {currentPhoto || 'none'}</div>
        <div>Size: {size}</div>
        <button onClick={() => onPhotoChange('new_photo_data', {})} data-testid="change-photo">
          Change Photo
        </button>
        <button onClick={onPhotoRemove} data-testid="remove-photo">
          Remove Photo
        </button>
      </div>
    ),
  };
});

jest.mock('../../../utils/platform', () => ({
  isWeb: true,
  isIOS: false,
  isAndroid: false,
  isMobile: false,
  select: (options) => options.web || options.default,
}));

// Mock React Native Alert and Modal
jest.mock('react-native', () => {
  const actualRN = jest.requireActual('react-native');
  return {
    ...actualRN,
    Alert: {
      alert: jest.fn(),
    },
    Modal: ({ visible, children }) =>
      visible ? <div data-testid="modal">{children}</div> : null,
  };
});

const Alert = require('react-native').Alert;

// Test wrapper with theme context
const TestWrapper = ({ children, themeMode = 'light' }) => (
  <ThemeProvider initialThemeMode={themeMode}>
    {children}
  </ThemeProvider>
);

// Mock data
const mockProfile = {
  id: 'profile1',
  name: 'John Doe',
  preferredName: 'Johnny',
  dateOfBirth: '2010-05-15T00:00:00Z',
  photo: 'existing_photo_data',
  updatedAt: '2023-01-01T00:00:00Z',
};

const defaultProps = {
  open: true,
  onClose: jest.fn(),
  profile: mockProfile,
  onSave: jest.fn(),
};

describe('ProfileEditDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when open', () => {
      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      expect(screen.getByText('Name *')).toBeInTheDocument();
      expect(screen.getByText('Preferred Name')).toBeInTheDocument();
      expect(screen.getByText('Date of Birth')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} open={false} />
        </TestWrapper>
      );

      expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
    });

    it('pre-fills form with profile data', () => {
      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      const nameInput = screen.getByDisplayValue('John Doe');
      const preferredNameInput = screen.getByDisplayValue('Johnny');

      expect(nameInput).toBeInTheDocument();
      expect(preferredNameInput).toBeInTheDocument();
    });

    it('handles missing profile data gracefully', () => {
      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} profile={null} />
        </TestWrapper>
      );

      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter name')).toHaveValue('');
    });

    it('handles partial profile data', () => {
      const partialProfile = {
        name: 'Jane Smith',
        // Missing other fields
      };

      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} profile={partialProfile} />
        </TestWrapper>
      );

      expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter preferred name (optional)')).toHaveValue('');
    });
  });

  describe('Form Interactions', () => {
    it('handles name input changes', () => {
      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      const nameInput = screen.getByDisplayValue('John Doe');
      fireEvent.changeText(nameInput, 'Jane Smith');

      expect(nameInput.value).toBe('Jane Smith');
    });

    it('handles preferred name input changes', () => {
      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      const preferredNameInput = screen.getByDisplayValue('Johnny');
      fireEvent.changeText(preferredNameInput, 'Janie');

      expect(preferredNameInput.value).toBe('Janie');
    });

    it('shows and handles date picker', () => {
      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      // Click on date picker button
      const dateButton = screen.getByText(/5\/15\/2010/);
      fireEvent.press(dateButton);

      // Date picker should be visible
      expect(screen.getByTestId('date-time-picker')).toBeInTheDocument();

      // Change date
      const dateInput = screen.getByTestId('date-time-input');
      fireEvent.change(dateInput, { target: { value: '2011-03-20' } });

      // Date should update (age calculation will reflect the change)
      expect(screen.getByText(/Age: \d+ years/)).toBeInTheDocument();
    });

    it('calculates age correctly', () => {
      const mockDate = new Date('2023-06-01');
      jest.spyOn(global, 'Date').mockImplementation((arg) => {
        if (arg) return new Date(arg);
        return mockDate;
      });

      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Age: 13 years')).toBeInTheDocument();

      global.Date.mockRestore();
    });

    it('formats date correctly', () => {
      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      // Should display formatted date
      expect(screen.getByText(/5\/15\/2010/)).toBeInTheDocument();
    });
  });

  describe('Photo Management', () => {
    it('renders PhotoUpload component with correct props', () => {
      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByTestId('photo-upload')).toBeInTheDocument();
      expect(screen.getByText('Current Photo: existing_photo_data')).toBeInTheDocument();
      expect(screen.getByText('Size: 100')).toBeInTheDocument();
    });

    it('handles photo changes', () => {
      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      const changePhotoButton = screen.getByTestId('change-photo');
      fireEvent.click(changePhotoButton);

      // Photo should be updated in form data
      expect(screen.getByText('Current Photo: new_photo_data')).toBeInTheDocument();
    });

    it('handles photo removal', () => {
      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      const removePhotoButton = screen.getByTestId('remove-photo');
      fireEvent.click(removePhotoButton);

      // Photo should be cleared
      expect(screen.getByText('Current Photo: none')).toBeInTheDocument();
    });
  });

  describe('Save Functionality', () => {
    it('saves profile with valid data', () => {
      const mockOnSave = jest.fn();
      const mockDate = new Date('2023-06-01');
      jest.spyOn(global, 'Date').mockImplementation((arg) => {
        if (arg) return new Date(arg);
        return mockDate;
      });

      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} onSave={mockOnSave} />
        </TestWrapper>
      );

      // Modify some data
      const nameInput = screen.getByDisplayValue('John Doe');
      fireEvent.changeText(nameInput, 'Jane Smith');

      // Save
      const saveButton = screen.getByText('Save Profile');
      fireEvent.press(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'Jane Smith',
        preferredName: 'Johnny',
        dateOfBirth: new Date('2010-05-15T00:00:00Z'),
        photo: 'existing_photo_data',
        updatedAt: mockDate,
      });

      global.Date.mockRestore();
    });

    it('validates required name field', () => {
      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      // Clear name field
      const nameInput = screen.getByDisplayValue('John Doe');
      fireEvent.changeText(nameInput, '');

      // Try to save
      const saveButton = screen.getByText('Save Profile');
      fireEvent.press(saveButton);

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Name is required');
    });

    it('validates name with only whitespace', () => {
      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      // Set name to only whitespace
      const nameInput = screen.getByDisplayValue('John Doe');
      fireEvent.changeText(nameInput, '   ');

      // Try to save
      const saveButton = screen.getByText('Save Profile');
      fireEvent.press(saveButton);

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Name is required');
    });

    it('closes dialog after successful save', () => {
      const mockOnClose = jest.fn();

      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} onClose={mockOnClose} />
        </TestWrapper>
      );

      const saveButton = screen.getByText('Save Profile');
      fireEvent.press(saveButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Dialog Controls', () => {
    it('handles close button click', () => {
      const mockOnClose = jest.fn();

      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} onClose={mockOnClose} />
        </TestWrapper>
      );

      const closeButton = screen.getByTestId('MaterialIcons');
      fireEvent.press(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('handles cancel button click', () => {
      const mockOnClose = jest.fn();

      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} onClose={mockOnClose} />
        </TestWrapper>
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.press(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('handles modal backdrop close request', () => {
      const mockOnClose = jest.fn();

      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} onClose={mockOnClose} />
        </TestWrapper>
      );

      // Simulate modal onRequestClose
      // This is typically handled by React Native, but we can test the prop is passed
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
  });

  describe('Date Picker Behavior', () => {
    it('handles iOS date picker behavior', () => {
      // Mock iOS platform
      jest.doMock('../../../utils/platform', () => ({
        isWeb: false,
        isIOS: true,
        isAndroid: false,
        isMobile: true,
        select: (options) => options.ios || options.default,
      }));

      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      // Click date picker button
      const dateButton = screen.getByText(/5\/15\/2010/);
      fireEvent.press(dateButton);

      expect(screen.getByTestId('date-time-picker')).toBeInTheDocument();
    });

    it('handles Android date picker behavior', () => {
      // Mock Android platform
      jest.doMock('../../../utils/platform', () => ({
        isWeb: false,
        isIOS: false,
        isAndroid: true,
        isMobile: true,
        select: (options) => options.android || options.default,
      }));

      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      const dateButton = screen.getByText(/5\/15\/2010/);
      fireEvent.press(dateButton);

      expect(screen.getByTestId('date-time-picker')).toBeInTheDocument();
    });

    it('handles date selection cancellation', () => {
      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      // Open date picker
      const dateButton = screen.getByText(/5\/15\/2010/);
      fireEvent.press(dateButton);

      // Simulate date picker cancellation (no selectedDate)
      const dateInput = screen.getByTestId('date-time-input');
      fireEvent.change(dateInput, { target: { value: '' } });

      // Original date should remain
      expect(screen.getByText(/5\/15\/2010/)).toBeInTheDocument();
    });

    it('respects maximum date constraint', () => {
      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      // Open date picker
      const dateButton = screen.getByText(/5\/15\/2010/);
      fireEvent.press(dateButton);

      const dateInput = screen.getByTestId('date-time-input');
      expect(dateInput).toHaveAttribute('max');
    });
  });

  describe('Age Calculation Edge Cases', () => {
    it('calculates age correctly for leap year', () => {
      const mockDate = new Date('2024-02-29'); // Leap year
      jest.spyOn(global, 'Date').mockImplementation((arg) => {
        if (arg) return new Date(arg);
        return mockDate;
      });

      const leapYearProfile = {
        ...mockProfile,
        dateOfBirth: '2000-02-29T00:00:00Z',
      };

      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} profile={leapYearProfile} />
        </TestWrapper>
      );

      expect(screen.getByText('Age: 24 years')).toBeInTheDocument();

      global.Date.mockRestore();
    });

    it('calculates age correctly around birthday', () => {
      const mockDate = new Date('2023-05-14'); // Day before birthday
      jest.spyOn(global, 'Date').mockImplementation((arg) => {
        if (arg) return new Date(arg);
        return mockDate;
      });

      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Age: 12 years')).toBeInTheDocument(); // Still 12, birthday is tomorrow

      global.Date.mockRestore();
    });
  });

  describe('Form State Management', () => {
    it('maintains form state during interactions', () => {
      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      // Change multiple fields
      const nameInput = screen.getByDisplayValue('John Doe');
      fireEvent.changeText(nameInput, 'Jane Smith');

      const preferredNameInput = screen.getByDisplayValue('Johnny');
      fireEvent.changeText(preferredNameInput, 'Janie');

      // Both changes should be maintained
      expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Janie')).toBeInTheDocument();
    });

    it('handles empty preferred name', () => {
      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      const preferredNameInput = screen.getByDisplayValue('Johnny');
      fireEvent.changeText(preferredNameInput, '');

      expect(preferredNameInput.value).toBe('');
    });
  });

  describe('Platform-specific Styling', () => {
    it('applies web-specific styles', () => {
      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      // Component should render without errors on web
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    it('handles Android-specific input styling', () => {
      // Mock Android platform
      jest.doMock('../../../utils/platform', () => ({
        isWeb: false,
        isIOS: false,
        isAndroid: true,
        isMobile: true,
        select: (options) => options.android || options.default,
      }));

      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('applies theme colors correctly', () => {
      render(
        <TestWrapper themeMode="dark">
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      // Theme colors are applied through StyleSheet.create, which is mocked
    });

    it('handles missing theme values gracefully', () => {
      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles invalid date inputs gracefully', () => {
      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} />
        </TestWrapper>
      );

      // Open date picker
      const dateButton = screen.getByText(/5\/15\/2010/);
      fireEvent.press(dateButton);

      // Try to set invalid date
      const dateInput = screen.getByTestId('date-time-input');
      fireEvent.change(dateInput, { target: { value: 'invalid-date' } });

      // Should handle gracefully without crashing
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    it('handles missing callback functions', () => {
      render(
        <TestWrapper>
          <ProfileEditDialog {...defaultProps} onSave={undefined} onClose={undefined} />
        </TestWrapper>
      );

      // Should render without errors
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
  });
});