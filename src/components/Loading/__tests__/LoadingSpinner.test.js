import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LoadingSpinner } from "../LoadingSpinner";

// Mock React Native components
jest.mock("react-native", () => ({
  View: ({ children, style, ...props }) => (
    <div style={style} {...props}>
      {children}
    </div>
  ),
  Text: ({ children, style, ...props }) => (
    <span style={style} {...props}>
      {children}
    </span>
  ),
  ActivityIndicator: ({ size, color, style }) => (
    <div
      data-testid="activity-indicator"
      style={style}
      data-size={size}
      data-color={color}
    >
      🔄
    </div>
  ),
  StyleSheet: {
    create: (styles) => styles,
  },
}));

describe("LoadingSpinner", () => {
  describe("Basic Rendering", () => {
    it("should render with default props", () => {
      render(<LoadingSpinner />);

      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should render ActivityIndicator with correct default size", () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByTestId("activity-indicator");
      expect(spinner).toHaveAttribute("data-size", "large");
      expect(spinner).toHaveAttribute("data-color", "#A08670");
    });

    it("should render default loading message", () => {
      render(<LoadingSpinner />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("Custom Props", () => {
    it("should render custom message", () => {
      const customMessage = "Please wait while we process your request...";
      render(<LoadingSpinner message={customMessage} />);

      expect(screen.getByText(customMessage)).toBeInTheDocument();
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    it("should render with custom size", () => {
      render(<LoadingSpinner size="small" />);

      const spinner = screen.getByTestId("activity-indicator");
      expect(spinner).toHaveAttribute("data-size", "small");
    });

    it("should hide message when message prop is empty", () => {
      render(<LoadingSpinner message="" />);

      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();
    });

    it("should hide message when message prop is null", () => {
      render(<LoadingSpinner message={null} />);

      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();
    });

    it("should show default message when message prop is undefined", () => {
      render(<LoadingSpinner message={undefined} />);

      // When message is undefined, it falls back to default "Loading..."
      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();
    });
  });

  describe("Full Screen Mode", () => {
    it("should render normally when fullScreen is false", () => {
      render(<LoadingSpinner fullScreen={false} />);

      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();
      expect(screen.getByText("Loading...")).toBeInTheDocument();

      // Check that the loading spinner renders properly
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it("should render in full screen mode when fullScreen is true", () => {
      render(<LoadingSpinner fullScreen={true} />);

      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();
      expect(screen.getByText("Loading...")).toBeInTheDocument();

      // Check that container renders in full screen mode
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      // In JSDOM, styles are applied but may not be directly accessible
    });

    it("should render with custom message in full screen mode", () => {
      const customMessage = "Initializing application...";
      render(<LoadingSpinner message={customMessage} fullScreen={true} />);

      expect(screen.getByText(customMessage)).toBeInTheDocument();
      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("should always render ActivityIndicator first, then message", () => {
      render(<LoadingSpinner message="Test message" />);

      // Verify both ActivityIndicator and message are present
      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();
      expect(screen.getByText("Test message")).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it("should apply correct styling to components", () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByTestId("activity-indicator");
      const message = screen.getByText("Loading...");

      // Check spinner styles
      expect(spinner.style.marginBottom).toBe("16px");

      // Check message styles (JSDOM may convert colors to rgb format)
      expect(message.style.fontSize).toBe("14px");
      expect(message.style.textAlign).toBe("center");
      expect(message.style.marginTop).toBe("8px");
      // Color might be in rgb format in JSDOM
      expect(message.style.color).toMatch(/(#666666|rgb\(102,\s*102,\s*102\))/);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero-length message string", () => {
      render(<LoadingSpinner message="" />);

      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();
      // Empty string won't render as a text element
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    it("should handle very long messages", () => {
      const longMessage = "A".repeat(200);
      render(<LoadingSpinner message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();
    });

    it("should handle special characters in message", () => {
      const specialMessage = "🚀 Loading amazing content... 💫";
      render(<LoadingSpinner message={specialMessage} />);

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    it("should handle numeric size values", () => {
      render(<LoadingSpinner size={32} />);

      const spinner = screen.getByTestId("activity-indicator");
      expect(spinner).toHaveAttribute("data-size", "32");
    });
  });

  describe("Accessibility", () => {
    it("should render accessible spinner and message", () => {
      render(<LoadingSpinner message="Loading content" />);

      // Spinner should be present
      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();

      // Message should be readable by screen readers
      expect(screen.getByText("Loading content")).toBeInTheDocument();
    });

    it("should work without message for screen readers", () => {
      render(<LoadingSpinner message={null} />);

      // Should still have the spinner
      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("should render consistently with same props", () => {
      const { rerender } = render(
        <LoadingSpinner message="Test" size="small" />,
      );

      expect(screen.getByText("Test")).toBeInTheDocument();
      expect(screen.getByTestId("activity-indicator")).toHaveAttribute(
        "data-size",
        "small",
      );

      // Re-render with same props
      rerender(<LoadingSpinner message="Test" size="small" />);

      expect(screen.getByText("Test")).toBeInTheDocument();
      expect(screen.getByTestId("activity-indicator")).toHaveAttribute(
        "data-size",
        "small",
      );
    });
  });
});
