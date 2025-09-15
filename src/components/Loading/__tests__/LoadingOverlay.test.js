import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LoadingOverlay } from "../LoadingOverlay";

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
      ⟳
    </div>
  ),
  Modal: ({
    children,
    visible,
    transparent,
    animationType,
    statusBarTranslucent,
  }) =>
    visible ? (
      <div
        data-testid="modal"
        data-transparent={transparent}
        data-animation={animationType}
        data-status-bar-translucent={statusBarTranslucent}
      >
        {children}
      </div>
    ) : null,
  StyleSheet: {
    create: (styles) => styles,
  },
}));

describe("LoadingOverlay", () => {
  describe("Basic Rendering", () => {
    it("should not render when open is false", () => {
      render(<LoadingOverlay open={false} />);

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("activity-indicator"),
      ).not.toBeInTheDocument();
    });

    it("should render when open is true", () => {
      render(<LoadingOverlay open={true} />);

      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should render with correct modal properties", () => {
      render(<LoadingOverlay open={true} />);

      const modal = screen.getByTestId("modal");
      expect(modal).toHaveAttribute("data-transparent", "true");
      expect(modal).toHaveAttribute("data-animation", "fade");
      expect(modal).toHaveAttribute("data-status-bar-translucent", "true");
    });

    it("should render ActivityIndicator with correct properties", () => {
      render(<LoadingOverlay open={true} />);

      const spinner = screen.getByTestId("activity-indicator");
      expect(spinner).toHaveAttribute("data-size", "large");
      expect(spinner).toHaveAttribute("data-color", "#FFFFFF");
    });
  });

  describe("Custom Messages", () => {
    it("should render default message when no message prop provided", () => {
      render(<LoadingOverlay open={true} />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should render custom message when provided", () => {
      const customMessage = "Processing your request...";
      render(<LoadingOverlay open={true} message={customMessage} />);

      expect(screen.getByText(customMessage)).toBeInTheDocument();
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    it("should not render message when message is empty string", () => {
      render(<LoadingOverlay open={true} message="" />);

      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    it("should not render message when message is null", () => {
      render(<LoadingOverlay open={true} message={null} />);

      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    it("should render default message when message is undefined", () => {
      render(<LoadingOverlay open={true} message={undefined} />);

      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("should have correct container structure", () => {
      render(<LoadingOverlay open={true} />);

      const modal = screen.getByTestId("modal");
      expect(modal).toBeInTheDocument();

      // Should have backdrop and content container
      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();
      expect(screen.getByText("Loading...")).toBeInTheDocument();

      // Content container should have spinner and message
      const spinner = screen.getByTestId("activity-indicator");
      const message = screen.getByText("Loading...");
      expect(spinner).toBeInTheDocument();
      expect(message).toBeInTheDocument();
    });

    it("should apply correct styling to components", () => {
      render(<LoadingOverlay open={true} />);

      const spinner = screen.getByTestId("activity-indicator");
      const message = screen.getByText("Loading...");

      // Check spinner styles
      expect(spinner.style.marginBottom).toBe("8px");

      // Check message styles
      expect(message.style.fontSize).toBe("16px");
      expect(message.style.textAlign).toBe("center");
      // Color might be in different formats in JSDOM
      expect(message.style.color).toMatch(
        /(#FFFFFF|rgb\(255,\s*255,\s*255\)|white)/,
      );
    });
  });

  describe("Open/Close Behavior", () => {
    it("should toggle visibility based on open prop", () => {
      const { rerender } = render(<LoadingOverlay open={false} />);

      // Initially not visible
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();

      // Rerender as open
      rerender(<LoadingOverlay open={true} />);
      expect(screen.getByTestId("modal")).toBeInTheDocument();

      // Rerender as closed again
      rerender(<LoadingOverlay open={false} />);
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("should maintain message when toggling visibility", () => {
      const customMessage = "Custom loading message";
      const { rerender } = render(
        <LoadingOverlay open={false} message={customMessage} />,
      );

      // Initially not visible
      expect(screen.queryByText(customMessage)).not.toBeInTheDocument();

      // Rerender as open
      rerender(<LoadingOverlay open={true} message={customMessage} />);
      expect(screen.getByText(customMessage)).toBeInTheDocument();

      // Rerender as closed
      rerender(<LoadingOverlay open={false} message={customMessage} />);
      expect(screen.queryByText(customMessage)).not.toBeInTheDocument();

      // Reopen with same message
      rerender(<LoadingOverlay open={true} message={customMessage} />);
      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long messages", () => {
      const longMessage = "A".repeat(200);
      render(<LoadingOverlay open={true} message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();
    });

    it("should handle special characters in message", () => {
      const specialMessage = "🎯 Processing data... ⚡ Almost done! 🚀";
      render(<LoadingOverlay open={true} message={specialMessage} />);

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    it("should handle boolean open prop variations", () => {
      // Test with explicit true
      const { rerender } = render(<LoadingOverlay open={true} />);
      expect(screen.getByTestId("modal")).toBeInTheDocument();

      // Test with explicit false
      rerender(<LoadingOverlay open={false} />);
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();

      // Test with truthy value
      rerender(<LoadingOverlay open={1} />);
      expect(screen.getByTestId("modal")).toBeInTheDocument();

      // Test with falsy value
      rerender(<LoadingOverlay open={0} />);
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should render accessible spinner and message", () => {
      render(<LoadingOverlay open={true} message="Loading content" />);

      // Spinner should be present
      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();

      // Message should be readable by screen readers
      expect(screen.getByText("Loading content")).toBeInTheDocument();
    });

    it("should provide spinner even without message", () => {
      render(<LoadingOverlay open={true} message={null} />);

      // Should still have the spinner for visual feedback
      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("should render consistently with same props", () => {
      const message = "Consistent test";
      const { rerender } = render(
        <LoadingOverlay open={true} message={message} />,
      );

      expect(screen.getByText(message)).toBeInTheDocument();
      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();

      // Re-render with same props
      rerender(<LoadingOverlay open={true} message={message} />);

      expect(screen.getByText(message)).toBeInTheDocument();
      expect(screen.getByTestId("activity-indicator")).toBeInTheDocument();
    });

    it("should handle rapid open/close changes", () => {
      const { rerender } = render(<LoadingOverlay open={false} />);

      // Rapid toggling
      rerender(<LoadingOverlay open={true} />);
      expect(screen.getByTestId("modal")).toBeInTheDocument();

      rerender(<LoadingOverlay open={false} />);
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();

      rerender(<LoadingOverlay open={true} />);
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });
  });
});
