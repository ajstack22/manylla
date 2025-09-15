/**
 * SmartTextInput Component Tests
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SmartTextInput } from '../SmartTextInput';

describe('SmartTextInput', () => {
  const defaultProps = {
    label: 'Smart Input Label',
    value: '',
    onChange: jest.fn(),
    placeholder: 'Smart placeholder'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    test('should render with label', () => {
      render(<SmartTextInput {...defaultProps} />);

      expect(screen.getByText('Smart Input Label')).toBeInTheDocument();
    });

    test('should render with placeholder', () => {
      render(<SmartTextInput {...defaultProps} />);

      expect(screen.getByPlaceholderText('Smart placeholder')).toBeInTheDocument();
    });

    test('should render with value', () => {
      render(<SmartTextInput {...defaultProps} value="Smart value" />);

      expect(screen.getByDisplayValue('Smart value')).toBeInTheDocument();
    });

    test('should render without label', () => {
      const { container } = render(<SmartTextInput {...defaultProps} label="" />);

      expect(container).toBeInTheDocument();
    });

    test('should render with default props', () => {
      render(<SmartTextInput value="" onChange={jest.fn()} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Input behavior', () => {
    test('should call onChange when text is entered', () => {
      const mockOnChange = jest.fn();
      render(<SmartTextInput {...defaultProps} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Smart placeholder');
      fireEvent.changeText(input, 'New smart text');

      expect(mockOnChange).toHaveBeenCalledWith('New smart text');
    });

    test('should handle empty string input', () => {
      const mockOnChange = jest.fn();
      render(<SmartTextInput {...defaultProps} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Smart placeholder');
      fireEvent.changeText(input, '');

      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    test('should handle multiline input', () => {
      const multilineText = 'Line 1\\nLine 2\\nLine 3';
      render(<SmartTextInput {...defaultProps} value={multilineText} multiline={true} />);

      expect(screen.getByDisplayValue(multilineText)).toBeInTheDocument();
    });

    test('should handle focus events', () => {
      render(<SmartTextInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Smart placeholder');
      fireEvent(input, 'focus');

      expect(input).toBeInTheDocument();
    });

    test('should handle blur events', () => {
      render(<SmartTextInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Smart placeholder');
      fireEvent(input, 'blur');

      expect(input).toBeInTheDocument();
    });
  });

  describe('Props configuration', () => {
    test('should handle multiline prop', () => {
      render(<SmartTextInput {...defaultProps} multiline={true} />);

      const input = screen.getByPlaceholderText('Smart placeholder');
      expect(input).toBeInTheDocument();
    });

    test('should handle single line mode', () => {
      render(<SmartTextInput {...defaultProps} multiline={false} />);

      const input = screen.getByPlaceholderText('Smart placeholder');
      expect(input).toBeInTheDocument();
    });

    test('should handle autoFocus prop', () => {
      render(<SmartTextInput {...defaultProps} autoFocus={true} />);

      const input = screen.getByPlaceholderText('Smart placeholder');
      expect(input).toBeInTheDocument();
    });

    test('should handle maxLength prop', () => {
      render(<SmartTextInput {...defaultProps} maxLength={100} />);

      const input = screen.getByPlaceholderText('Smart placeholder');
      expect(input).toBeInTheDocument();
    });

    test('should handle keyboardType prop', () => {
      render(<SmartTextInput {...defaultProps} keyboardType="email-address" />);

      const input = screen.getByPlaceholderText('Smart placeholder');
      expect(input).toBeInTheDocument();
    });

    test('should handle secureTextEntry prop', () => {
      render(<SmartTextInput {...defaultProps} secureTextEntry={true} />);

      const input = screen.getByPlaceholderText('Smart placeholder');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Content validation', () => {
    test('should handle special characters', () => {
      const specialText = '!@#$%^&*()_+{}|:"<>?[]\\;\',./-=`~';
      render(<SmartTextInput {...defaultProps} value={specialText} />);

      expect(screen.getByDisplayValue(specialText)).toBeInTheDocument();
    });

    test('should handle unicode characters', () => {
      const unicodeText = '🚀 测试 français العربية ñóéú';
      render(<SmartTextInput {...defaultProps} value={unicodeText} />);

      expect(screen.getByDisplayValue(unicodeText)).toBeInTheDocument();
    });

    test('should handle very long text', () => {
      const longText = 'a'.repeat(500);
      render(<SmartTextInput {...defaultProps} value={longText} />);

      expect(screen.getByDisplayValue(longText)).toBeInTheDocument();
    });

    test('should handle empty and whitespace text', () => {
      const whitespaceText = '   \\n\\t   ';
      render(<SmartTextInput {...defaultProps} value={whitespaceText} />);

      expect(screen.getByDisplayValue(whitespaceText)).toBeInTheDocument();
    });
  });

  describe('Advanced features', () => {
    test('should handle suggestions when provided', () => {
      const suggestions = ['suggestion1', 'suggestion2', 'suggestion3'];
      render(<SmartTextInput {...defaultProps} suggestions={suggestions} />);

      const input = screen.getByPlaceholderText('Smart placeholder');
      expect(input).toBeInTheDocument();
    });

    test('should handle autoComplete feature', () => {
      render(<SmartTextInput {...defaultProps} autoComplete={true} />);

      const input = screen.getByPlaceholderText('Smart placeholder');
      expect(input).toBeInTheDocument();
    });

    test('should handle validation states', () => {
      render(<SmartTextInput {...defaultProps} error={true} />);

      const input = screen.getByPlaceholderText('Smart placeholder');
      expect(input).toBeInTheDocument();
    });

    test('should handle disabled state', () => {
      render(<SmartTextInput {...defaultProps} disabled={true} />);

      const input = screen.getByPlaceholderText('Smart placeholder');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Event handling', () => {
    test('should handle onSubmit events', () => {
      const mockOnSubmit = jest.fn();
      render(<SmartTextInput {...defaultProps} onSubmitEditing={mockOnSubmit} />);

      const input = screen.getByPlaceholderText('Smart placeholder');
      fireEvent(input, 'submitEditing');

      expect(mockOnSubmit).toHaveBeenCalled();
    });

    test('should handle multiple event handlers', () => {
      const mockOnFocus = jest.fn();
      const mockOnBlur = jest.fn();
      const mockOnChange = jest.fn();

      render(
        <SmartTextInput
          {...defaultProps}
          onChange={mockOnChange}
          onFocus={mockOnFocus}
          onBlur={mockOnBlur}
        />
      );

      const input = screen.getByPlaceholderText('Smart placeholder');

      fireEvent(input, 'focus');
      expect(mockOnFocus).toHaveBeenCalled();

      fireEvent.changeText(input, 'test');
      expect(mockOnChange).toHaveBeenCalledWith('test');

      fireEvent(input, 'blur');
      expect(mockOnBlur).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    test('should handle null value gracefully', () => {
      render(<SmartTextInput {...defaultProps} value={null} />);

      const input = screen.getByPlaceholderText('Smart placeholder');
      expect(input).toBeInTheDocument();
    });

    test('should handle undefined value gracefully', () => {
      render(<SmartTextInput {...defaultProps} value={undefined} />);

      const input = screen.getByPlaceholderText('Smart placeholder');
      expect(input).toBeInTheDocument();
    });

    test('should handle undefined onChange gracefully', () => {
      render(<SmartTextInput {...defaultProps} onChange={undefined} />);

      const input = screen.getByPlaceholderText('Smart placeholder');
      expect(input).toBeInTheDocument();

      // Should not crash when attempting to change
      fireEvent.changeText(input, 'test');
    });

    test('should handle rapid prop changes', () => {
      const { rerender } = render(<SmartTextInput {...defaultProps} value="Initial" />);

      rerender(<SmartTextInput {...defaultProps} value="Changed1" />);
      rerender(<SmartTextInput {...defaultProps} value="Changed2" />);
      rerender(<SmartTextInput {...defaultProps} value="Final" />);

      expect(screen.getByDisplayValue('Final')).toBeInTheDocument();
    });

    test('should handle empty label and placeholder', () => {
      render(<SmartTextInput value="" onChange={jest.fn()} label="" placeholder="" />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Component state management', () => {
    test('should maintain consistent state', () => {
      const { rerender } = render(<SmartTextInput {...defaultProps} />);

      expect(screen.getByPlaceholderText('Smart placeholder')).toBeInTheDocument();

      rerender(<SmartTextInput {...defaultProps} value="Updated" />);
      expect(screen.getByDisplayValue('Updated')).toBeInTheDocument();
    });

    test('should handle component unmounting', () => {
      const { unmount } = render(<SmartTextInput {...defaultProps} />);

      expect(screen.getByPlaceholderText('Smart placeholder')).toBeInTheDocument();

      unmount();
      // Should unmount without errors
    });
  });

  describe('Accessibility features', () => {
    test('should be accessible to screen readers', () => {
      render(<SmartTextInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    test('should support accessibility labels', () => {
      render(<SmartTextInput {...defaultProps} accessibilityLabel="Smart input field" />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    test('should support accessibility hints', () => {
      render(<SmartTextInput {...defaultProps} accessibilityHint="Enter your smart text here" />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Performance considerations', () => {
    test('should handle frequent updates efficiently', () => {
      const { rerender } = render(<SmartTextInput {...defaultProps} value="" />);

      // Simulate frequent updates
      for (let i = 0; i < 10; i++) {
        rerender(<SmartTextInput {...defaultProps} value={`Update ${i}`} />);
      }

      expect(screen.getByDisplayValue('Update 9')).toBeInTheDocument();
    });

    test('should handle large datasets efficiently', () => {
      const largeSuggestions = Array.from({ length: 1000 }, (_, i) => `Suggestion ${i}`);

      render(<SmartTextInput {...defaultProps} suggestions={largeSuggestions} />);

      const input = screen.getByPlaceholderText('Smart placeholder');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Integration testing', () => {
    test('should work with complex prop combinations', () => {
      render(
        <SmartTextInput
          label="Complex Smart Input"
          value="Complex value"
          onChange={jest.fn()}
          placeholder="Complex placeholder"
          multiline={true}
          autoFocus={true}
          maxLength={200}
          keyboardType="default"
          autoComplete={true}
          suggestions={['suggestion1', 'suggestion2']}
        />
      );

      expect(screen.getByText('Complex Smart Input')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Complex value')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Complex placeholder')).toBeInTheDocument();
    });

    test('should maintain functionality across re-renders', () => {
      const mockOnChange = jest.fn();
      const { rerender } = render(<SmartTextInput {...defaultProps} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Smart placeholder');
      fireEvent.changeText(input, 'test1');
      expect(mockOnChange).toHaveBeenCalledWith('test1');

      rerender(<SmartTextInput {...defaultProps} onChange={mockOnChange} value="test1" />);
      fireEvent.changeText(input, 'test2');
      expect(mockOnChange).toHaveBeenCalledWith('test2');
    });
  });
});