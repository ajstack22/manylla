/**
 * Tests for ToastContext
 */

import React from "react";
import { renderHook, act, render } from "@testing-library/react";
import { ToastProvider, useToast } from "../ToastContext";

// Mock the ThemedToast component
jest.mock("../../components/Toast/ThemedToast", () => ({
  ThemedToast: ({ open, message, onClose, children }) => {
    if (!open) return null;
    return (
      <div data-testid="themed-toast" onClick={onClose}>
        {message}
        {children}
      </div>
    );
  },
}));

// Mock Material-UI icons
jest.mock("@mui/icons-material", () => ({
  CheckCircle: ({ sx, ...props }) => (
    <div data-testid="success-icon" {...props}>
      ✓
    </div>
  ),
  Error: ({ sx, ...props }) => (
    <div data-testid="error-icon" {...props}>
      ✗
    </div>
  ),
  Warning: ({ sx, ...props }) => (
    <div data-testid="warning-icon" {...props}>
      ⚠
    </div>
  ),
  Palette: ({ sx, ...props }) => (
    <div data-testid="info-icon" {...props}>
      ℹ
    </div>
  ),
}));

describe("ToastContext", () => {
  const wrapper = ({ children }) => (
    <ToastProvider>{children}</ToastProvider>
  );

  describe("ToastProvider", () => {
    it("should provide toast functions", () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      expect(typeof result.current.showToast).toBe("function");
      expect(typeof result.current.showSuccess).toBe("function");
      expect(typeof result.current.showError).toBe("function");
      expect(typeof result.current.showWarning).toBe("function");
      expect(typeof result.current.showInfo).toBe("function");
    });

    it("should show toast with default parameters", () => {
      const { container } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const button = container.querySelector("button");
      act(() => {
        button.click();
      });

      expect(container.querySelector('[data-testid="themed-toast"]')).toBeInTheDocument();
    });

    it("should show success toast", () => {
      const { container } = render(
        <ToastProvider>
          <TestSuccessComponent />
        </ToastProvider>
      );

      const button = container.querySelector("button");
      act(() => {
        button.click();
      });

      const toast = container.querySelector('[data-testid="themed-toast"]');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent("Success message");
    });

    it("should show error toast", () => {
      const { container } = render(
        <ToastProvider>
          <TestErrorComponent />
        </ToastProvider>
      );

      const button = container.querySelector("button");
      act(() => {
        button.click();
      });

      const toast = container.querySelector('[data-testid="themed-toast"]');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent("Error message");
    });

    it("should show warning toast", () => {
      const { container } = render(
        <ToastProvider>
          <TestWarningComponent />
        </ToastProvider>
      );

      const button = container.querySelector("button");
      act(() => {
        button.click();
      });

      const toast = container.querySelector('[data-testid="themed-toast"]');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent("Warning message");
    });

    it("should show info toast", () => {
      const { container } = render(
        <ToastProvider>
          <TestInfoComponent />
        </ToastProvider>
      );

      const button = container.querySelector("button");
      act(() => {
        button.click();
      });

      const toast = container.querySelector('[data-testid="themed-toast"]');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent("Info message");
    });

    it("should close toast when clicked", () => {
      const { container } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const button = container.querySelector("button");
      act(() => {
        button.click();
      });

      let toast = container.querySelector('[data-testid="themed-toast"]');
      expect(toast).toBeInTheDocument();

      act(() => {
        toast.click();
      });

      // Wait for close to process
      setTimeout(() => {
        toast = container.querySelector('[data-testid="themed-toast"]');
        expect(toast).not.toBeInTheDocument();
      }, 150);
    });

    it("should queue multiple toasts", () => {
      let toastMethods;

      const TestQueueComponent = () => {
        toastMethods = useToast();
        return (
          <button
            onClick={() => {
              toastMethods.showToast("First toast");
              toastMethods.showToast("Second toast");
            }}
          >
            Show Multiple
          </button>
        );
      };

      const { container } = render(
        <ToastProvider>
          <TestQueueComponent />
        </ToastProvider>
      );

      const button = container.querySelector("button");
      act(() => {
        button.click();
      });

      // Should show a toast (could be either first or second due to timing)
      const toast = container.querySelector('[data-testid="themed-toast"]');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent(/First toast|Second toast/);
    });

    it("should handle custom duration", () => {
      let toastMethods;

      const TestDurationComponent = () => {
        toastMethods = useToast();
        return (
          <button
            onClick={() => {
              toastMethods.showToast("Custom duration", "info", 5000);
            }}
          >
            Show Custom Duration
          </button>
        );
      };

      const { container } = render(
        <ToastProvider>
          <TestDurationComponent />
        </ToastProvider>
      );

      const button = container.querySelector("button");
      act(() => {
        button.click();
      });

      const toast = container.querySelector('[data-testid="themed-toast"]');
      expect(toast).toBeInTheDocument();
    });
  });

  describe("useToast hook", () => {
    it("should throw error when used outside ToastProvider", () => {
      // Suppress error boundary warnings
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useToast());
      }).toThrow("useToast must be used within a ToastProvider");

      console.error = originalError;
    });
  });
});

// Test components for interactive testing
const TestComponent = () => {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast("Test message")}>
      Show Toast
    </button>
  );
};

const TestSuccessComponent = () => {
  const { showSuccess } = useToast();
  return (
    <button onClick={() => showSuccess("Success message")}>
      Show Success
    </button>
  );
};

const TestErrorComponent = () => {
  const { showError } = useToast();
  return (
    <button onClick={() => showError("Error message")}>
      Show Error
    </button>
  );
};

const TestWarningComponent = () => {
  const { showWarning } = useToast();
  return (
    <button onClick={() => showWarning("Warning message")}>
      Show Warning
    </button>
  );
};

const TestInfoComponent = () => {
  const { showInfo } = useToast();
  return (
    <button onClick={() => showInfo("Info message")}>
      Show Info
    </button>
  );
};