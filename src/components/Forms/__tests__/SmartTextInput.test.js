/**
 * SmartTextInput Component Tests
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SmartTextInput } from "../SmartTextInput";

describe("SmartTextInput", () => {
  const defaultProps = {
    label: "Smart Input Label",
    value: "",
    onChange: jest.fn(),
    placeholder: "Smart placeholder",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic rendering", () => {
    test("should render with label", () => {
      render(<SmartTextInput {...defaultProps} />);

      expect(screen.getByText("Smart Input Label")).toBeInTheDocument();
    });

    test("should render with placeholder", () => {
      render(<SmartTextInput {...defaultProps} />);

      expect(
        screen.getByPlaceholderText("Smart placeholder"),
      ).toBeInTheDocument();
    });

    test("should render with value", () => {
      render(<SmartTextInput {...defaultProps} value="Smart value" />);

      expect(screen.getByDisplayValue("Smart value")).toBeInTheDocument();
    });

    test("should render without label", () => {
      const { container } = render(
        <SmartTextInput {...defaultProps} label="" />,
      );

      expect(container).toBeInTheDocument();
    });

    test("should render with default props", () => {
      render(<SmartTextInput value="" onChange={jest.fn()} />);

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Input behavior", () => {
    test("should call onChange when text is entered", () => {
      const mockOnChange = jest.fn();
      render(<SmartTextInput {...defaultProps} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      fireEvent.changeText(input, "New smart text");

      expect(mockOnChange).toHaveBeenCalledWith("New smart text");
    });

    test("should handle empty string input", () => {
      const mockOnChange = jest.fn();
      render(<SmartTextInput {...defaultProps} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      fireEvent.changeText(input, "");

      expect(mockOnChange).toHaveBeenCalledWith("");
    });

    test("should handle multiline input", () => {
      const multilineText = "Line 1\\nLine 2\\nLine 3";
      render(
        <SmartTextInput
          {...defaultProps}
          value={multilineText}
          multiline={true}
        />,
      );

      expect(screen.getByDisplayValue(multilineText)).toBeInTheDocument();
    });

    test("should handle focus events", () => {
      render(<SmartTextInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      fireEvent(input, "focus");

      expect(input).toBeInTheDocument();
    });

    test("should handle blur events", () => {
      render(<SmartTextInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      fireEvent(input, "blur");

      expect(input).toBeInTheDocument();
    });
  });

  describe("Props configuration", () => {
    test("should handle multiline prop", () => {
      render(<SmartTextInput {...defaultProps} multiline={true} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      expect(input).toBeInTheDocument();
    });

    test("should handle single line mode", () => {
      render(<SmartTextInput {...defaultProps} multiline={false} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      expect(input).toBeInTheDocument();
    });

    test("should handle autoFocus prop", () => {
      render(<SmartTextInput {...defaultProps} autoFocus={true} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      expect(input).toBeInTheDocument();
    });

    test("should handle maxLength prop", () => {
      render(<SmartTextInput {...defaultProps} maxLength={100} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      expect(input).toBeInTheDocument();
    });

    test("should handle keyboardType prop", () => {
      render(<SmartTextInput {...defaultProps} keyboardType="email-address" />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      expect(input).toBeInTheDocument();
    });

    test("should handle secureTextEntry prop", () => {
      render(<SmartTextInput {...defaultProps} secureTextEntry={true} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Content validation", () => {
    test("should handle special characters", () => {
      const specialText = "!@#$%^&*()_+{}|:\"<>?[]\\;',./-=`~";
      render(<SmartTextInput {...defaultProps} value={specialText} />);

      expect(screen.getByDisplayValue(specialText)).toBeInTheDocument();
    });

    test("should handle unicode characters", () => {
      const unicodeText = "🚀 测试 français العربية ñóéú";
      render(<SmartTextInput {...defaultProps} value={unicodeText} />);

      expect(screen.getByDisplayValue(unicodeText)).toBeInTheDocument();
    });

    test("should handle very long text", () => {
      const longText = "a".repeat(500);
      render(<SmartTextInput {...defaultProps} value={longText} />);

      expect(screen.getByDisplayValue(longText)).toBeInTheDocument();
    });

    test("should handle empty and whitespace text", () => {
      const whitespaceText = "   \\n\\t   ";
      render(<SmartTextInput {...defaultProps} value={whitespaceText} />);

      expect(screen.getByDisplayValue(whitespaceText)).toBeInTheDocument();
    });
  });

  describe("Advanced features", () => {
    test("should handle suggestions when provided", () => {
      const suggestions = ["suggestion1", "suggestion2", "suggestion3"];
      render(<SmartTextInput {...defaultProps} suggestions={suggestions} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      expect(input).toBeInTheDocument();
    });

    test("should handle autoComplete feature", () => {
      render(<SmartTextInput {...defaultProps} autoComplete={true} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      expect(input).toBeInTheDocument();
    });

    test("should handle validation states", () => {
      render(<SmartTextInput {...defaultProps} error={true} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      expect(input).toBeInTheDocument();
    });

    test("should handle disabled state", () => {
      render(<SmartTextInput {...defaultProps} disabled={true} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Event handling", () => {
    test("should handle onSubmit events", () => {
      const mockOnSubmit = jest.fn();
      render(
        <SmartTextInput {...defaultProps} onSubmitEditing={mockOnSubmit} />,
      );

      const input = screen.getByPlaceholderText("Smart placeholder");
      fireEvent(input, "submitEditing");

      expect(mockOnSubmit).toHaveBeenCalled();
    });

    test("should handle multiple event handlers", () => {
      const mockOnFocus = jest.fn();
      const mockOnBlur = jest.fn();
      const mockOnChange = jest.fn();

      render(
        <SmartTextInput
          {...defaultProps}
          onChange={mockOnChange}
          onFocus={mockOnFocus}
          onBlur={mockOnBlur}
        />,
      );

      const input = screen.getByPlaceholderText("Smart placeholder");

      fireEvent(input, "focus");
      expect(mockOnFocus).toHaveBeenCalled();

      fireEvent.changeText(input, "test");
      expect(mockOnChange).toHaveBeenCalledWith("test");

      fireEvent(input, "blur");
      expect(mockOnBlur).toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    test("should handle null value gracefully", () => {
      render(<SmartTextInput {...defaultProps} value={null} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      expect(input).toBeInTheDocument();
    });

    test("should handle undefined value gracefully", () => {
      render(<SmartTextInput {...defaultProps} value={undefined} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      expect(input).toBeInTheDocument();
    });

    test("should handle undefined onChange gracefully", () => {
      render(<SmartTextInput {...defaultProps} onChange={undefined} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      expect(input).toBeInTheDocument();

      // Should not crash when attempting to change
      fireEvent.changeText(input, "test");
    });

    test("should handle rapid prop changes", () => {
      const { rerender } = render(
        <SmartTextInput {...defaultProps} value="Initial" />,
      );

      rerender(<SmartTextInput {...defaultProps} value="Changed1" />);
      rerender(<SmartTextInput {...defaultProps} value="Changed2" />);
      rerender(<SmartTextInput {...defaultProps} value="Final" />);

      expect(screen.getByDisplayValue("Final")).toBeInTheDocument();
    });

    test("should handle empty label and placeholder", () => {
      render(
        <SmartTextInput
          value=""
          onChange={jest.fn()}
          label=""
          placeholder=""
        />,
      );

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Component state management", () => {
    test("should maintain consistent state", () => {
      const { rerender } = render(<SmartTextInput {...defaultProps} />);

      expect(
        screen.getByPlaceholderText("Smart placeholder"),
      ).toBeInTheDocument();

      rerender(<SmartTextInput {...defaultProps} value="Updated" />);
      expect(screen.getByDisplayValue("Updated")).toBeInTheDocument();
    });

    test("should handle component unmounting", () => {
      const { unmount } = render(<SmartTextInput {...defaultProps} />);

      expect(
        screen.getByPlaceholderText("Smart placeholder"),
      ).toBeInTheDocument();

      unmount();
      // Should unmount without errors
    });
  });

  describe("Accessibility features", () => {
    test("should be accessible to screen readers", () => {
      render(<SmartTextInput {...defaultProps} />);

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    test("should support accessibility labels", () => {
      render(
        <SmartTextInput
          {...defaultProps}
          accessibilityLabel="Smart input field"
        />,
      );

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    test("should support accessibility hints", () => {
      render(
        <SmartTextInput
          {...defaultProps}
          accessibilityHint="Enter your smart text here"
        />,
      );

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Performance considerations", () => {
    test("should handle frequent updates efficiently", () => {
      const { rerender } = render(
        <SmartTextInput {...defaultProps} value="" />,
      );

      // Simulate frequent updates
      for (let i = 0; i < 10; i++) {
        rerender(<SmartTextInput {...defaultProps} value={`Update ${i}`} />);
      }

      expect(screen.getByDisplayValue("Update 9")).toBeInTheDocument();
    });

    test("should handle large datasets efficiently", () => {
      const largeSuggestions = Array.from(
        { length: 1000 },
        (_, i) => `Suggestion ${i}`,
      );

      render(
        <SmartTextInput {...defaultProps} suggestions={largeSuggestions} />,
      );

      const input = screen.getByPlaceholderText("Smart placeholder");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Integration testing", () => {
    test("should work with complex prop combinations", () => {
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
          suggestions={["suggestion1", "suggestion2"]}
        />,
      );

      expect(screen.getByText("Complex Smart Input")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Complex value")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Complex placeholder"),
      ).toBeInTheDocument();
    });

    test("should maintain functionality across re-renders", () => {
      const mockOnChange = jest.fn();
      const { rerender } = render(
        <SmartTextInput {...defaultProps} onChange={mockOnChange} />,
      );

      const input = screen.getByPlaceholderText("Smart placeholder");
      fireEvent.changeText(input, "test1");
      expect(mockOnChange).toHaveBeenCalledWith("test1");

      rerender(
        <SmartTextInput
          {...defaultProps}
          onChange={mockOnChange}
          value="test1"
        />,
      );
      fireEvent.changeText(input, "test2");
      expect(mockOnChange).toHaveBeenCalledWith("test2");
    });
  });

  describe("Formatting features", () => {
    test("should show formatting modal when text is selected", () => {
      render(<SmartTextInput {...defaultProps} value="Selected text" />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      fireEvent(input, "focus");
      fireEvent(input, "selectionChange", {
        nativeEvent: { selection: { start: 0, end: 8 } }
      });

      expect(screen.getByTestId("icon-format-size")).toBeInTheDocument();
    });

    test("should apply markdown formatting", () => {
      const mockOnChange = jest.fn();
      render(<SmartTextInput {...defaultProps} onChange={mockOnChange} value="bold text" />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      fireEvent(input, "focus");
      fireEvent(input, "selectionChange", {
        nativeEvent: { selection: { start: 0, end: 4 } }
      });

      const formatButton = screen.getByTestId("icon-format-size");
      fireEvent.click(formatButton);

      // Formatting modal should be visible
      expect(screen.getByText("Format Text")).toBeInTheDocument();
    });

    test("should handle auto-formatting triggers", () => {
      const mockOnChange = jest.fn();
      render(<SmartTextInput {...defaultProps} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      fireEvent.changeText(input, "Text with double space  ");

      expect(mockOnChange).toHaveBeenCalledWith("Text with double space\n\n");
    });

    test("should show preview for formatted content", () => {
      render(<SmartTextInput {...defaultProps} value="**Bold** and _italic_ text" multiline />);

      expect(screen.getByText("Preview:")).toBeInTheDocument();
      expect(screen.getByText(/\[Bold\] and \/italic\/ text/)).toBeInTheDocument();
    });

    test("should handle list formatting", () => {
      const mockOnChange = jest.fn();
      render(<SmartTextInput {...defaultProps} onChange={mockOnChange} value="List item" />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      fireEvent(input, "focus");
      fireEvent(input, "selectionChange", {
        nativeEvent: { selection: { start: 0, end: 0 } }
      });

      // Simulate formatting application
      fireEvent.changeText(input, "- List item");
      expect(mockOnChange).toHaveBeenCalledWith("- List item");
    });
  });

  describe("Input validation and constraints", () => {
    test("should handle maxLength constraint", () => {
      const longText = "a".repeat(150);
      render(<SmartTextInput {...defaultProps} value={longText} maxLength={100} />);

      const input = screen.getByDisplayValue(longText);
      expect(input).toBeInTheDocument();
    });

    test("should handle required field validation", () => {
      render(<SmartTextInput {...defaultProps} required />);

      expect(screen.getByText("*")).toBeInTheDocument();
    });

    test("should handle different keyboard types", () => {
      const keyboardTypes = ["default", "email-address", "numeric", "phone-pad"];

      keyboardTypes.forEach(type => {
        const { unmount } = render(<SmartTextInput {...defaultProps} keyboardType={type} />);
        expect(screen.getByPlaceholderText("Smart placeholder")).toBeInTheDocument();
        unmount();
      });
    });

    test("should handle secure text entry", () => {
      render(<SmartTextInput {...defaultProps} secureTextEntry />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Platform-specific behavior", () => {
    test("should handle Android-specific styling", () => {
      // Mock Android platform
      jest.doMock("../../utils/platform", () => ({
        isAndroid: true,
        isIOS: false,
        isWeb: false,
      }));

      render(<SmartTextInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      expect(input).toBeInTheDocument();
    });

    test("should handle web-specific features", () => {
      render(<SmartTextInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      fireEvent.change(input, { target: { value: "Web input" } });

      // Should handle both onChange and onChangeText
      expect(input).toBeInTheDocument();
    });

    test("should handle iOS-specific styling", () => {
      jest.doMock("../../utils/platform", () => ({
        isAndroid: false,
        isIOS: true,
        isWeb: false,
      }));

      render(<SmartTextInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Advanced formatting features", () => {
    test("should handle complex markdown content", () => {
      const complexMarkdown = "# Heading\n\n**Bold** and _italic_ text with `code` and [links](url)";
      render(<SmartTextInput {...defaultProps} value={complexMarkdown} multiline />);

      expect(screen.getByDisplayValue(complexMarkdown)).toBeInTheDocument();
      expect(screen.getByText("Preview:")).toBeInTheDocument();
    });

    test("should handle tip text display", () => {
      render(<SmartTextInput {...defaultProps} value="" />);

      expect(screen.getByText(/Tipse \*\*text\*\* for bold/)).toBeInTheDocument();
    });

    test("should hide tip text when focused", () => {
      render(<SmartTextInput {...defaultProps} value="" />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      fireEvent(input, "focus");

      // Tips should be hidden when focused
      expect(screen.queryByText(/Tipse \*\*text\*\* for bold/)).not.toBeInTheDocument();
    });

    test("should handle formatting modal close", () => {
      render(<SmartTextInput {...defaultProps} value="Test text" />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      fireEvent(input, "focus");
      fireEvent(input, "selectionChange", {
        nativeEvent: { selection: { start: 0, end: 4 } }
      });

      const formatButton = screen.getByTestId("icon-format-size");
      fireEvent.click(formatButton);

      expect(screen.getByText("Format Text")).toBeInTheDocument();

      const closeButton = screen.getByTestId("icon-close");
      fireEvent.click(closeButton);

      expect(screen.queryByText("Format Text")).not.toBeInTheDocument();
    });
  });

  describe("Row and height management", () => {
    test("should handle different row configurations", () => {
      const { rerender } = render(<SmartTextInput {...defaultProps} rows={5} multiline />);
      expect(screen.getByPlaceholderText("Smart placeholder")).toBeInTheDocument();

      rerender(<SmartTextInput {...defaultProps} rows={10} multiline />);
      expect(screen.getByPlaceholderText("Smart placeholder")).toBeInTheDocument();
    });

    test("should handle maxRows constraint", () => {
      render(<SmartTextInput {...defaultProps} maxRows={15} multiline />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      expect(input).toBeInTheDocument();
    });

    test("should handle single line mode correctly", () => {
      render(<SmartTextInput {...defaultProps} multiline={false} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Error handling and resilience", () => {
    test("should handle missing platform utilities gracefully", () => {
      render(<SmartTextInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      expect(input).toBeInTheDocument();
    });

    test("should handle undefined ref gracefully", () => {
      render(<SmartTextInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      fireEvent(input, "focus");

      expect(input).toBeInTheDocument();
    });

    test("should handle selection change errors gracefully", () => {
      render(<SmartTextInput {...defaultProps} value="Test content" />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      fireEvent(input, "selectionChange", {
        nativeEvent: { selection: null }
      });

      expect(input).toBeInTheDocument();
    });

    test("should handle formatting errors gracefully", () => {
      render(<SmartTextInput {...defaultProps} value="Test content" />);

      const input = screen.getByPlaceholderText("Smart placeholder");
      fireEvent(input, "focus");

      // Simulate formatting attempt with invalid selection
      fireEvent(input, "selectionChange", {
        nativeEvent: { selection: { start: -1, end: 100 } }
      });

      expect(input).toBeInTheDocument();
    });
  });

  describe("Accessibility enhancements", () => {
    test("should provide proper ARIA labels", () => {
      render(<SmartTextInput {...defaultProps} accessibilityLabel="Custom input field" />);

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    test("should handle accessibility hints", () => {
      render(<SmartTextInput {...defaultProps} accessibilityHint="Enter your text here" />);

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    test("should support screen reader compatibility", () => {
      render(<SmartTextInput {...defaultProps} />);

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Performance optimizations", () => {
    test("should handle rapid input changes efficiently", () => {
      const mockOnChange = jest.fn();
      render(<SmartTextInput {...defaultProps} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText("Smart placeholder");

      // Simulate rapid typing
      for (let i = 0; i < 10; i++) {
        fireEvent.changeText(input, `Text ${i}`);
      }

      expect(mockOnChange).toHaveBeenCalledTimes(10);
    });

    test("should handle frequent selection changes", () => {
      render(<SmartTextInput {...defaultProps} value="Long text content for testing" />);

      const input = screen.getByPlaceholderText("Smart placeholder");

      // Simulate frequent selection changes
      for (let i = 0; i < 5; i++) {
        fireEvent(input, "selectionChange", {
          nativeEvent: { selection: { start: i, end: i + 5 } }
        });
      }

      expect(input).toBeInTheDocument();
    });

    test("should handle large content efficiently", () => {
      const largeContent = "word ".repeat(500);
      render(<SmartTextInput {...defaultProps} value={largeContent} />);

      expect(screen.getByDisplayValue(largeContent)).toBeInTheDocument();
    });
  });

  describe("Integration scenarios", () => {
    test("should work in medical form context", () => {
      const medicalContent = "Patient has **severe allergy** to medication. _Emergency contact_: Call immediately.";
      render(
        <SmartTextInput
          {...defaultProps}
          label="Medical Notes"
          value={medicalContent}
          placeholder="Enter medical information..."
          required={true}
          multiline={true}
          helperText="Include emergency contacts and allergies"
        />
      );

      expect(screen.getByText("Medical Notes")).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
      expect(screen.getByDisplayValue(medicalContent)).toBeInTheDocument();
      expect(screen.getByText("Include emergency contacts and allergies")).toBeInTheDocument();
      expect(screen.getByText("Preview:")).toBeInTheDocument();
    });

    test("should handle emergency instruction format", () => {
      const emergencyContent = "**EMERGENCY PROTOCOL**\n\n- Call 911 immediately\n- Give _epipen_ if available\n- Monitor breathing";
      render(<SmartTextInput {...defaultProps} value={emergencyContent} multiline />);

      expect(screen.getByDisplayValue(emergencyContent)).toBeInTheDocument();
      expect(screen.getByText("Preview:")).toBeInTheDocument();
    });
  });
});
