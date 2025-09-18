/* eslint-disable */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import DatePicker from '../DatePicker';

// Mock React Native modules
jest.mock('react-native', () => ({
  TextInput: ({ value, onChangeText, testID, ...props }) => (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChangeText && onChangeText(e.target.value)}
      data-testid={testID}
      {...props}
    />
  ),
}));

// Mock platform utils
jest.mock('../../../utils/platformStyles', () => ({
  getTextStyle: () => ({ fontSize: 16 }),
}));

jest.mock('../../../utils/platform', () => ({
  isWeb: true,
  isAndroid: false,
}));

describe('DatePicker', () => {
  test('renders without crashing', () => {
    render(<DatePicker />);
    const input = screen.getByDisplayValue('');
    expect(input).toBeInTheDocument();
  });

  test('renders with initial value', () => {
    const testDate = '2023-12-25';
    render(<DatePicker value={testDate} />);

    const input = screen.getByDisplayValue(testDate);
    expect(input).toHaveValue(testDate);
  });

  test('calls onChange when value changes', () => {
    const mockOnChange = jest.fn();
    render(<DatePicker onChange={mockOnChange} />);

    const input = screen.getByDisplayValue('');
    fireEvent.change(input, { target: { value: '2023-12-25' } });

    expect(mockOnChange).toHaveBeenCalledWith('2023-12-25');
  });

  test('handles null/undefined value gracefully', () => {
    render(<DatePicker value={null} />);
    const input = screen.getByDisplayValue('');
    expect(input).toHaveValue('');
  });

  test('passes through additional props', () => {
    render(<DatePicker placeholder="Select date" />);
    const input = screen.getByDisplayValue('');
    expect(input).toHaveAttribute('placeholder', 'Select date');
  });

  test('applies web styling', () => {
    render(<DatePicker />);
    const input = screen.getByDisplayValue('');
    expect(input).toHaveStyle({
      padding: '12px 15px',
      fontSize: '16px',
      borderRadius: '8px',
      border: '1px solid #E0E0E0',
      backgroundColor: '#FFFFFF',
      width: '100%',
    });
  });

  test('does not call onChange when onChange is not provided', () => {
    render(<DatePicker />);
    const input = screen.getByDisplayValue('');

    // Should not throw error
    expect(() => {
      fireEvent.change(input, { target: { value: '2023-12-25' } });
    }).not.toThrow();
  });

  test('updates value when controlled', () => {
    const TestComponent = () => {
      const [value, setValue] = React.useState('2023-01-01');
      return (
        <DatePicker
          value={value}
          onChange={setValue}
        />
      );
    };

    render(<TestComponent />);
    const input = screen.getByDisplayValue('2023-01-01');

    fireEvent.change(input, { target: { value: '2023-12-25' } });
    expect(input).toHaveValue('2023-12-25');
  });
});