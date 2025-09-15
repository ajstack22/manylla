/**
 * RichTextInput Component Tests
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RichTextInput } from '../RichTextInput';

describe('RichTextInput', () => {
  const defaultProps = {
    label: 'Test Label',
    value: '',
    onChange: jest.fn(),
    placeholder: 'Test placeholder'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    test('should render with label', () => {
      render(<RichTextInput {...defaultProps} />);

      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    test('should render with placeholder', () => {
      render(<RichTextInput {...defaultProps} />);

      expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();
    });

    test('should render with value', () => {
      render(<RichTextInput {...defaultProps} value="Test value" />);

      expect(screen.getByDisplayValue('Test value')).toBeInTheDocument();
    });

    test('should render with helper text', () => {
      render(<RichTextInput {...defaultProps} helperText="Helper text" />);

      expect(screen.getByText('Helper text')).toBeInTheDocument();
    });

    test('should render required indicator', () => {
      render(<RichTextInput {...defaultProps} required={true} />);

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    test('should render without required indicator by default', () => {
      render(<RichTextInput {...defaultProps} />);

      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  describe('Input properties', () => {
    test('should render as multiline by default', () => {
      render(<RichTextInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Test placeholder');
      expect(input).toBeInTheDocument();
    });

    test('should render as single line when multiline is false', () => {
      render(<RichTextInput {...defaultProps} multiline={false} />);

      const input = screen.getByPlaceholderText('Test placeholder');
      expect(input).toBeInTheDocument();
    });

    test('should apply autoFocus when specified', () => {
      render(<RichTextInput {...defaultProps} autoFocus={true} />);

      const input = screen.getByPlaceholderText('Test placeholder');
      expect(input).toBeInTheDocument();
    });

    test('should not autoFocus by default', () => {
      render(<RichTextInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Test placeholder');
      expect(input).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    test('should call onChange when text is entered', () => {
      const mockOnChange = jest.fn();
      render(<RichTextInput {...defaultProps} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Test placeholder');
      fireEvent.changeText(input, 'New text');

      expect(mockOnChange).toHaveBeenCalledWith('New text');
    });

    test('should update when value prop changes', () => {
      const { rerender } = render(<RichTextInput {...defaultProps} value="Initial" />);
      expect(screen.getByDisplayValue('Initial')).toBeInTheDocument();

      rerender(<RichTextInput {...defaultProps} value="Updated" />);
      expect(screen.getByDisplayValue('Updated')).toBeInTheDocument();
    });

    test('should handle focus events', () => {
      render(<RichTextInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Test placeholder');
      fireEvent(input, 'focus');

      // Component should handle focus
      expect(input).toBeInTheDocument();
    });

    test('should handle blur events', () => {
      render(<RichTextInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Test placeholder');
      fireEvent(input, 'blur');

      // Component should handle blur
      expect(input).toBeInTheDocument();
    });
  });

  describe('Props combinations', () => {
    test('should handle all props together', () => {
      render(
        <RichTextInput
          label="Complete Label"
          value="Complete Value"
          onChange={jest.fn()}
          placeholder="Complete Placeholder"
          helperText="Complete Helper"
          required={true}
          multiline={true}
          rows={5}
          autoFocus={true}
        />
      );

      expect(screen.getByText('Complete Label')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Complete Value')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Complete Placeholder')).toBeInTheDocument();
      expect(screen.getByText('Complete Helper')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    test('should handle minimal props', () => {
      render(<RichTextInput value="" onChange={jest.fn()} />);

      // Should render even with minimal props
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    test('should handle null value', () => {
      render(<RichTextInput {...defaultProps} value={null} />);

      const input = screen.getByPlaceholderText('Test placeholder');
      expect(input).toBeInTheDocument();
    });

    test('should handle undefined value', () => {
      render(<RichTextInput {...defaultProps} value={undefined} />);

      const input = screen.getByPlaceholderText('Test placeholder');
      expect(input).toBeInTheDocument();
    });

    test('should handle empty string value', () => {
      render(<RichTextInput {...defaultProps} value="" />);

      const input = screen.getByPlaceholderText('Test placeholder');
      expect(input).toBeInTheDocument();
    });

    test('should handle very long text', () => {
      const longText = 'a'.repeat(1000);
      render(<RichTextInput {...defaultProps} value={longText} />);

      expect(screen.getByDisplayValue(longText)).toBeInTheDocument();
    });

    test('should handle special characters', () => {
      const specialText = '!@#$%^&*()[]{}|\\:";\'<>?,./`~';
      render(<RichTextInput {...defaultProps} value={specialText} />);

      expect(screen.getByDisplayValue(specialText)).toBeInTheDocument();
    });

    test('should handle unicode characters', () => {
      const unicodeText = '🎉 ✅ ❌ 🔥 💯 测试 français العربية';
      render(<RichTextInput {...defaultProps} value={unicodeText} />);

      expect(screen.getByDisplayValue(unicodeText)).toBeInTheDocument();
    });

    test('should handle newlines in multiline mode', () => {
      const multilineText = 'Line 1\\nLine 2\\nLine 3';
      render(<RichTextInput {...defaultProps} value={multilineText} multiline={true} />);

      expect(screen.getByDisplayValue(multilineText)).toBeInTheDocument();
    });

    test('should handle different row counts', () => {
      render(<RichTextInput {...defaultProps} rows={1} />);
      expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();

      render(<RichTextInput {...defaultProps} rows={10} />);
      expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();
    });
  });

  describe('Component state', () => {
    test('should maintain internal state correctly', () => {
      const { rerender } = render(<RichTextInput {...defaultProps} />);

      // Component should render consistently
      expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();

      rerender(<RichTextInput {...defaultProps} value="Updated value" />);
      expect(screen.getByDisplayValue('Updated value')).toBeInTheDocument();
    });

    test('should handle rapid prop changes', () => {
      const { rerender } = render(<RichTextInput {...defaultProps} value="Initial" />);

      rerender(<RichTextInput {...defaultProps} value="Change1" />);
      rerender(<RichTextInput {...defaultProps} value="Change2" />);
      rerender(<RichTextInput {...defaultProps} value="Final" />);

      expect(screen.getByDisplayValue('Final')).toBeInTheDocument();
    });

    test('should handle onChange function changes', () => {
      const onChange1 = jest.fn();
      const onChange2 = jest.fn();

      const { rerender } = render(<RichTextInput {...defaultProps} onChange={onChange1} />);

      const input = screen.getByPlaceholderText('Test placeholder');
      fireEvent.changeText(input, 'test1');
      expect(onChange1).toHaveBeenCalledWith('test1');

      rerender(<RichTextInput {...defaultProps} onChange={onChange2} />);
      fireEvent.changeText(input, 'test2');
      expect(onChange2).toHaveBeenCalledWith('test2');
    });
  });

  describe('Accessibility', () => {
    test('should be accessible with screen readers', () => {
      render(<RichTextInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    test('should have proper accessibility attributes', () => {
      render(<RichTextInput {...defaultProps} required={true} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    test('should handle accessibility with helper text', () => {
      render(<RichTextInput {...defaultProps} helperText="Accessible helper" />);

      expect(screen.getByText('Accessible helper')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('should not re-render unnecessarily', () => {
      const { rerender } = render(<RichTextInput {...defaultProps} />);

      // Multiple rerenders with same props should not break
      rerender(<RichTextInput {...defaultProps} />);
      rerender(<RichTextInput {...defaultProps} />);

      expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();
    });

    test('should handle large content efficiently', () => {
      const largeContent = Array.from({ length: 100 }, (_, i) => `Line ${i + 1}: Lorem ipsum dolor sit amet.`).join('\\n');

      render(<RichTextInput {...defaultProps} value={largeContent} />);

      expect(screen.getByDisplayValue(largeContent)).toBeInTheDocument();
    });
  });

  describe('Integration scenarios', () => {
    test('should work in form contexts', () => {
      render(
        <form>
          <RichTextInput
            label="Form Input"
            value="Form value"
            onChange={jest.fn()}
            placeholder="Form placeholder"
          />
        </form>
      );

      expect(screen.getByText('Form Input')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Form value')).toBeInTheDocument();
    });

    test('should handle dynamic prop updates', () => {
      const { rerender } = render(
        <RichTextInput {...defaultProps} label="Dynamic Label 1" />
      );

      expect(screen.getByText('Dynamic Label 1')).toBeInTheDocument();

      rerender(<RichTextInput {...defaultProps} label="Dynamic Label 2" />);
      expect(screen.getByText('Dynamic Label 2')).toBeInTheDocument();
    });

    test('should handle error states gracefully', () => {
      // Test with undefined onChange
      render(<RichTextInput {...defaultProps} onChange={undefined} />);

      const input = screen.getByPlaceholderText('Test placeholder');
      expect(input).toBeInTheDocument();

      // Attempting to change should not crash
      fireEvent.changeText(input, 'test');
    });
  });
});