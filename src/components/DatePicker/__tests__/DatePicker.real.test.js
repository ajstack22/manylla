/**
 * Real integration tests for DatePicker
 * Tests actual date picking behavior across platforms
 * Focus: Real behavior testing as required by Story S029
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DatePicker from '../DatePicker';

// Mock platform utilities
jest.mock('../../../utils/platform', () => ({
  isWeb: true,
  isMobile: false,
  isNative: false,
}));

describe('DatePicker Real Integration', () => {
  const defaultProps = {
    date: new Date('2023-06-15'),
    onDateChange: jest.fn(),
    label: 'Select Date',
  };

  beforeEach(() => {
    defaultProps.onDateChange.mockClear();
  });

  describe('Basic Rendering and Interaction', () => {
    test('should render date picker on web platform', () => {
      render(<DatePicker {...defaultProps} />);

      expect(screen.getByLabelText(/select date/i)).toBeInTheDocument();
    });

    test('should display current date value', () => {
      render(<DatePicker {...defaultProps} />);

      const input = screen.getByDisplayValue('2023-06-15');
      expect(input).toBeInTheDocument();
    });

    test('should handle date changes', () => {
      render(<DatePicker {...defaultProps} />);

      const dateInput = screen.getByLabelText(/select date/i);
      fireEvent.change(dateInput, { target: { value: '2023-12-25' } });

      expect(defaultProps.onDateChange).toHaveBeenCalledWith(new Date('2023-12-25'));
    });

    test('should handle invalid date input gracefully', () => {
      render(<DatePicker {...defaultProps} />);

      const dateInput = screen.getByLabelText(/select date/i);
      fireEvent.change(dateInput, { target: { value: 'invalid-date' } });

      // Should not call onDateChange for invalid dates
      expect(defaultProps.onDateChange).not.toHaveBeenCalled();
    });
  });

  describe('Props and Configuration', () => {
    test('should handle minimum date constraints', () => {
      const minDate = new Date('2023-01-01');
      render(<DatePicker {...defaultProps} minDate={minDate} />);

      const dateInput = screen.getByLabelText(/select date/i);
      expect(dateInput).toHaveAttribute('min', '2023-01-01');
    });

    test('should handle maximum date constraints', () => {
      const maxDate = new Date('2023-12-31');
      render(<DatePicker {...defaultProps} maxDate={maxDate} />);

      const dateInput = screen.getByLabelText(/select date/i);
      expect(dateInput).toHaveAttribute('max', '2023-12-31');
    });

    test('should handle disabled state', () => {
      render(<DatePicker {...defaultProps} disabled={true} />);

      const dateInput = screen.getByLabelText(/select date/i);
      expect(dateInput).toBeDisabled();
    });

    test('should handle required state', () => {
      render(<DatePicker {...defaultProps} required={true} />);

      const dateInput = screen.getByLabelText(/select date/i);
      expect(dateInput).toBeRequired();
    });
  });

  describe('Date Formatting and Validation', () => {
    test('should format dates correctly for display', () => {
      const testDate = new Date('2023-03-15');
      render(<DatePicker {...defaultProps} date={testDate} />);

      expect(screen.getByDisplayValue('2023-03-15')).toBeInTheDocument();
    });

    test('should handle edge dates correctly', () => {
      // Test leap year
      const leapYearDate = new Date('2024-02-29');
      render(<DatePicker {...defaultProps} date={leapYearDate} />);

      expect(screen.getByDisplayValue('2024-02-29')).toBeInTheDocument();
    });

    test('should handle timezone considerations', () => {
      const utcDate = new Date('2023-06-15T12:00:00Z');
      render(<DatePicker {...defaultProps} date={utcDate} />);

      // Should display the date correctly regardless of timezone
      const dateInput = screen.getByLabelText(/select date/i);
      expect(dateInput.value).toMatch(/2023-06-15/);
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      render(<DatePicker {...defaultProps} label="Birth Date" />);

      const dateInput = screen.getByLabelText('Birth Date');
      expect(dateInput).toHaveAttribute('type', 'date');
    });

    test('should be keyboard accessible', () => {
      render(<DatePicker {...defaultProps} />);

      const dateInput = screen.getByLabelText(/select date/i);
      dateInput.focus();

      expect(document.activeElement).toBe(dateInput);
    });

    test('should support screen readers', () => {
      render(<DatePicker {...defaultProps} ariaLabel="Select birth date" />);

      const dateInput = screen.getByLabelText('Select birth date');
      expect(dateInput).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('should handle null date gracefully', () => {
      render(<DatePicker {...defaultProps} date={null} />);

      const dateInput = screen.getByLabelText(/select date/i);
      expect(dateInput.value).toBe('');
    });

    test('should handle undefined date gracefully', () => {
      render(<DatePicker {...defaultProps} date={undefined} />);

      const dateInput = screen.getByLabelText(/select date/i);
      expect(dateInput.value).toBe('');
    });

    test('should handle missing onDateChange prop', () => {
      const { onDateChange, ...propsWithoutCallback } = defaultProps;

      expect(() => {
        render(<DatePicker {...propsWithoutCallback} />);
      }).not.toThrow();
    });
  });

  describe('Real-world Usage Scenarios', () => {
    test('should handle birth date selection', () => {
      const birthDateProps = {
        ...defaultProps,
        label: 'Birth Date',
        maxDate: new Date(), // Cannot be in future
        minDate: new Date('1900-01-01'), // Reasonable minimum
      };

      render(<DatePicker {...birthDateProps} />);

      const dateInput = screen.getByLabelText(/birth date/i);
      fireEvent.change(dateInput, { target: { value: '2015-03-20' } });

      expect(defaultProps.onDateChange).toHaveBeenCalledWith(new Date('2015-03-20'));
    });

    test('should handle appointment date selection', () => {
      const appointmentProps = {
        ...defaultProps,
        label: 'Appointment Date',
        minDate: new Date(), // Cannot be in past
      };

      render(<DatePicker {...appointmentProps} />);

      const today = new Date().toISOString().split('T')[0];
      const dateInput = screen.getByLabelText(/appointment date/i);

      expect(dateInput).toHaveAttribute('min', today);
    });

    test('should handle form integration', () => {
      const FormWrapper = () => {
        const [selectedDate, setSelectedDate] = React.useState(new Date('2023-06-15'));

        return (
          <form>
            <DatePicker
              date={selectedDate}
              onDateChange={setSelectedDate}
              label="Event Date"
              required
            />
            <button type="submit">Submit</button>
          </form>
        );
      };

      render(<FormWrapper />);

      const dateInput = screen.getByLabelText(/event date/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      expect(dateInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
      expect(dateInput).toBeRequired();
    });
  });

  describe('Performance', () => {
    test('should render quickly with valid date', () => {
      const startTime = Date.now();
      render(<DatePicker {...defaultProps} />);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(50);
    });

    test('should handle rapid date changes efficiently', () => {
      render(<DatePicker {...defaultProps} />);

      const dateInput = screen.getByLabelText(/select date/i);

      // Rapid changes
      fireEvent.change(dateInput, { target: { value: '2023-01-01' } });
      fireEvent.change(dateInput, { target: { value: '2023-02-01' } });
      fireEvent.change(dateInput, { target: { value: '2023-03-01' } });

      // Should have called onDateChange for each valid change
      expect(defaultProps.onDateChange).toHaveBeenCalledTimes(3);
    });
  });
});