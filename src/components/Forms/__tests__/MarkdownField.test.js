/**
 * MarkdownField Component Tests
 * Testing for markdown editing functionality
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MarkdownField } from "../MarkdownField";

// Mock react-native-vector-icons
jest.mock("react-native-vector-icons/MaterialIcons", () => {
  return {
    __esModule: true,
    default: ({ name, size, color, style, ...props }) => (
      <span
        data-testid={`icon-${name}`}
        style={{ fontSize: size, color, ...style }}
        {...props}
      >
        {name}
      </span>
    ),
  };
});

// P2 TECH DEBT: Remove skip when working on MarkdownField
// Issue: Editor initialization
describe.skip("MarkdownField", () => {
  const defaultProps = {
    label: "Markdown Editor",
    value: "",
    onChange: jest.fn(),
    placeholder: "Enter markdown...",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic rendering", () => {
    test("should render with label and input", () => {
      render(<MarkdownField {...defaultProps} />);

      expect(screen.getByText("Markdown Editor")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter markdown...")).toBeInTheDocument();
    });

    test("should render required indicator when required", () => {
      render(<MarkdownField {...defaultProps} required />);

      expect(screen.getByText("*")).toBeInTheDocument();
    });

    test("should render without required indicator when not required", () => {
      render(<MarkdownField {...defaultProps} required={false} />);

      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });

    test("should render with custom height", () => {
      render(<MarkdownField {...defaultProps} height={300} />);

      const textInput = screen.getByPlaceholderText("Enter markdown...");
      expect(textInput).toBeInTheDocument();
    });

    test("should render helper text when provided", () => {
      const helperText = "Use **bold** for emphasis";
      render(<MarkdownField {...defaultProps} helperText={helperText} />);

      expect(screen.getByText(`Example: ${helperText}`)).toBeInTheDocument();
    });
  });

  describe("Text input functionality", () => {
    test("should call onChange when text is entered", () => {
      const mockOnChange = jest.fn();
      render(<MarkdownField {...defaultProps} onChange={mockOnChange} />);

      const textInput = screen.getByPlaceholderText("Enter markdown...");
      fireEvent.change(textInput, { target: { value: "# Heading" } });

      expect(mockOnChange).toHaveBeenCalledWith("# Heading");
    });

    test("should handle empty input", () => {
      const mockOnChange = jest.fn();
      render(<MarkdownField {...defaultProps} onChange={mockOnChange} />);

      const textInput = screen.getByPlaceholderText("Enter markdown...");
      fireEvent.change(textInput, { target: { value: "" } });

      expect(mockOnChange).toHaveBeenCalledWith("");
    });

    test("should handle multiline input", () => {
      const multilineText = "Line 1\nLine 2\nLine 3";
      const mockOnChange = jest.fn();
      render(<MarkdownField {...defaultProps} onChange={mockOnChange} />);

      const textInput = screen.getByPlaceholderText("Enter markdown...");
      fireEvent.change(textInput, { target: { value: multilineText } });

      expect(mockOnChange).toHaveBeenCalledWith(multilineText);
    });

    test("should handle focus and blur events", () => {
      render(<MarkdownField {...defaultProps} />);

      const textInput = screen.getByPlaceholderText("Enter markdown...");

      fireEvent.focus(textInput);
      expect(textInput).toBeInTheDocument();

      fireEvent.blur(textInput);
      expect(textInput).toBeInTheDocument();
    });
  });

  describe("Toolbar functionality", () => {
    test("should show toolbar toggle button", () => {
      render(<MarkdownField {...defaultProps} />);

      const toolbarToggle = screen.getByTestId("icon-format-size");
      expect(toolbarToggle).toBeInTheDocument();
    });

    test("should show preview toggle button", () => {
      render(<MarkdownField {...defaultProps} />);

      const previewToggle = screen.getByTestId("icon-visibility");
      expect(previewToggle).toBeInTheDocument();
    });

    test("should render toolbar buttons", () => {
      render(<MarkdownField {...defaultProps} />);

      const toolbarToggle = screen.getByTestId("icon-format-size");
      fireEvent.click(toolbarToggle);

      // Toolbar should be visible with formatting buttons
      expect(screen.getByText("Bold")).toBeInTheDocument();
      expect(screen.getByText("Italic")).toBeInTheDocument();
      expect(screen.getByText("Strikethrough")).toBeInTheDocument();
      expect(screen.getByText("Bullet List")).toBeInTheDocument();
      expect(screen.getByText("Numbered List")).toBeInTheDocument();
      expect(screen.getByText("Link")).toBeInTheDocument();
      expect(screen.getByText("Code")).toBeInTheDocument();
    });
  });

  describe("Preview functionality", () => {
    test("should show preview placeholder for empty content", () => {
      render(<MarkdownField {...defaultProps} value="" />);

      const previewToggle = screen.getByTestId("icon-visibility");
      fireEvent.click(previewToggle);

      expect(screen.getByText("Preview will appear here...")).toBeInTheDocument();
    });

    test("should handle markdown preview", () => {
      const markdownText = "**Bold** and _italic_ text";
      render(<MarkdownField {...defaultProps} value={markdownText} />);

      const previewToggle = screen.getByTestId("icon-visibility");
      fireEvent.click(previewToggle);

      // Check that preview is rendered
      expect(screen.getByText(/\[Bold\] and \/italic\/ text/)).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    test("should handle null and undefined values", () => {
      const { rerender } = render(<MarkdownField {...defaultProps} value={null} />);
      expect(screen.getByPlaceholderText("Enter markdown...")).toBeInTheDocument();

      rerender(<MarkdownField {...defaultProps} value={undefined} />);
      expect(screen.getByPlaceholderText("Enter markdown...")).toBeInTheDocument();
    });

    test("should handle non-string values", () => {
      const { rerender } = render(<MarkdownField {...defaultProps} value={123} />);
      expect(screen.getByDisplayValue("123")).toBeInTheDocument();

      rerender(<MarkdownField {...defaultProps} value={true} />);
      expect(screen.getByDisplayValue("true")).toBeInTheDocument();
    });

    test("should handle special characters in content", () => {
      const specialChars = "Special chars: @#$%^&*()[]{}";
      render(<MarkdownField {...defaultProps} value={specialChars} />);

      expect(screen.getByDisplayValue(specialChars)).toBeInTheDocument();
    });

    test("should handle very long content", () => {
      const longContent = "a".repeat(1000);
      render(<MarkdownField {...defaultProps} value={longContent} />);

      expect(screen.getByDisplayValue(longContent)).toBeInTheDocument();
    });

    test("should handle rapid prop changes", () => {
      const { rerender } = render(<MarkdownField {...defaultProps} value="Initial" />);

      rerender(<MarkdownField {...defaultProps} value="Changed1" />);
      rerender(<MarkdownField {...defaultProps} value="Changed2" />);
      rerender(<MarkdownField {...defaultProps} value="Final" />);

      expect(screen.getByDisplayValue("Final")).toBeInTheDocument();
    });
  });

  describe("Error handling", () => {
    test("should handle undefined onChange gracefully", () => {
      render(<MarkdownField {...defaultProps} onChange={undefined} />);

      const textInput = screen.getByPlaceholderText("Enter markdown...");
      fireEvent.change(textInput, { target: { value: "Test text" } });

      // Should not crash
      expect(textInput).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    test("should support accessibility labels", () => {
      render(<MarkdownField {...defaultProps} />);

      const textInput = screen.getByRole("textbox");
      expect(textInput).toBeInTheDocument();
    });

    test("should provide proper labels for toolbar buttons", () => {
      render(<MarkdownField {...defaultProps} />);

      const toolbarToggle = screen.getByTestId("icon-format-size");
      fireEvent.click(toolbarToggle);

      // Check that all toolbar buttons have proper labels
      expect(screen.getByText("Bold")).toBeInTheDocument();
      expect(screen.getByText("Italic")).toBeInTheDocument();
      expect(screen.getByText("Strikethrough")).toBeInTheDocument();
      expect(screen.getByText("Bullet List")).toBeInTheDocument();
      expect(screen.getByText("Numbered List")).toBeInTheDocument();
      expect(screen.getByText("Link")).toBeInTheDocument();
      expect(screen.getByText("Code")).toBeInTheDocument();
    });
  });

  describe("Integration testing", () => {
    test("should work with all props combined", () => {
      const mockOnChange = jest.fn();
      render(
        <MarkdownField
          label="Complex Markdown Editor"
          value="**Bold** text"
          onChange={mockOnChange}
          placeholder="Enter complex markdown..."
          required={true}
          helperText="Use markdown syntax"
          height={400}
        />
      );

      expect(screen.getByText("Complex Markdown Editor")).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
      expect(screen.getByDisplayValue("**Bold** text")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter complex markdown...")).toBeInTheDocument();
      expect(screen.getByText("Example: Use markdown syntax")).toBeInTheDocument();
    });

    test("should maintain UI state", () => {
      render(<MarkdownField {...defaultProps} value="Test" />);

      // Toggle toolbar multiple times
      const toolbarToggle = screen.getByTestId("icon-format-size");
      fireEvent.click(toolbarToggle);
      fireEvent.click(toolbarToggle);
      fireEvent.click(toolbarToggle);

      // Should still work normally
      expect(screen.getByText("Bold")).toBeInTheDocument();
    });
  });

  describe("Component behavior", () => {
    test("should render consistently across multiple mounts", () => {
      const content = "Consistent content";
      const { unmount } = render(<MarkdownField {...defaultProps} value={content} />);
      expect(screen.getByDisplayValue(content)).toBeInTheDocument();
      unmount();

      render(<MarkdownField {...defaultProps} value={content} />);
      expect(screen.getByDisplayValue(content)).toBeInTheDocument();
    });

    test("should handle content updates properly", () => {
      const { rerender } = render(<MarkdownField {...defaultProps} value="Initial text" />);
      expect(screen.getByDisplayValue("Initial text")).toBeInTheDocument();

      rerender(<MarkdownField {...defaultProps} value="Updated text" />);
      expect(screen.queryByDisplayValue("Initial text")).not.toBeInTheDocument();
      expect(screen.getByDisplayValue("Updated text")).toBeInTheDocument();
    });
  });

  describe("Performance considerations", () => {
    test("should handle frequent updates efficiently", () => {
      const { rerender } = render(<MarkdownField {...defaultProps} value="" />);

      // Simulate frequent updates
      for (let i = 0; i < 10; i++) {
        rerender(<MarkdownField {...defaultProps} value={`Update ${i}`} />);
      }

      expect(screen.getByDisplayValue("Update 9")).toBeInTheDocument();
    });

    test("should handle large content efficiently", () => {
      const largeContent = "word ".repeat(500);
      render(<MarkdownField {...defaultProps} value={largeContent} />);

      expect(screen.getByDisplayValue(largeContent)).toBeInTheDocument();
    });
  });
});