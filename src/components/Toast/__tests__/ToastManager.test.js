/**
 * Tests for ToastManager
 * Comprehensive test coverage for toast display, queue management, and error handling
 */

import ToastManager, {
  showToast,
  showErrorToast,
  showSuccessToast,
  showWarningToast,
  showInfoToast,
  hideToast,
  hideAllToasts,
} from "../ToastManager";
import { ErrorHandler } from "../../../utils/errors";

// Mock ErrorHandler
jest.mock("../../../utils/errors", () => ({
  ErrorHandler: {
    normalize: jest.fn(),
    getUserMessage: jest.fn(),
    isRecoverable: jest.fn(),
    log: jest.fn(),
  },
}));

// Mock timers for testing auto-hide functionality
jest.useFakeTimers();

describe("ToastManager", () => {
  let mockToastComponent;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();

    // Reset ToastManager state
    ToastManager.queue = [];
    ToastManager.currentToast = null;
    ToastManager.idCounter = 0;

    // Create mock toast component
    mockToastComponent = {
      show: jest.fn(),
      hide: jest.fn(),
    };

    ToastManager.setToastRef(mockToastComponent);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  describe("Toast component registration", () => {
    it("should register toast component reference", () => {
      const mockRef = { show: jest.fn(), hide: jest.fn() };
      ToastManager.setToastRef(mockRef);
      expect(ToastManager.toastComponent).toBe(mockRef);
    });
  });

  describe("ID generation", () => {
    it("should generate unique IDs", () => {
      const id1 = ToastManager.generateId();
      const id2 = ToastManager.generateId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^toast_\d+_\d+$/);
      expect(id2).toMatch(/^toast_\d+_\d+$/);
    });

    it("should increment counter for each ID", () => {
      const id1 = ToastManager.generateId();
      const id2 = ToastManager.generateId();

      expect(id1).toContain("toast_1_");
      expect(id2).toContain("toast_2_");
    });
  });

  describe("Basic toast display", () => {
    it("should show toast with default options", () => {
      const toastId = ToastManager.show("Test message");

      expect(toastId).toBeDefined();
      expect(ToastManager.queue).toHaveLength(0); // Should be processed immediately
      expect(ToastManager.currentToast).toBeDefined();
      expect(ToastManager.currentToast.message).toBe("Test message");
      expect(ToastManager.currentToast.type).toBe("info");
      expect(mockToastComponent.show).toHaveBeenCalledWith(ToastManager.currentToast);
    });

    it("should show toast with custom type", () => {
      ToastManager.show("Success message", "success");

      expect(ToastManager.currentToast.type).toBe("success");
      expect(ToastManager.currentToast.message).toBe("Success message");
    });

    it("should show toast with custom options", () => {
      const options = {
        duration: 1000,
        persistent: true,
        action: { label: "Action", handler: jest.fn() },
        icon: "🔥",
      };

      ToastManager.show("Custom toast", "warning", options);

      expect(ToastManager.currentToast.duration).toBe(1000);
      expect(ToastManager.currentToast.persistent).toBe(true);
      expect(ToastManager.currentToast.action).toBe(options.action);
      expect(ToastManager.currentToast.icon).toBe("🔥");
    });
  });

  describe("Toast types and default durations", () => {
    it("should set correct duration for error type", () => {
      ToastManager.show("Error", "error");
      expect(ToastManager.currentToast.duration).toBe(5000);
    });

    it("should set correct duration for warning type", () => {
      ToastManager.show("Warning", "warning");
      expect(ToastManager.currentToast.duration).toBe(4000);
    });

    it("should set correct duration for success type", () => {
      ToastManager.show("Success", "success");
      expect(ToastManager.currentToast.duration).toBe(3000);
    });

    it("should set correct duration for info type", () => {
      ToastManager.show("Info", "info");
      expect(ToastManager.currentToast.duration).toBe(3000);
    });
  });

  describe("Default icons", () => {
    it("should set correct icon for each type", () => {
      const iconTests = [
        { type: "error", expected: "❌" },
        { type: "warning", expected: "⚠️" },
        { type: "success", expected: "✅" },
        { type: "info", expected: "ℹ️" },
      ];

      iconTests.forEach(({ type, expected }) => {
        ToastManager.show("Test", type);
        expect(ToastManager.currentToast.icon).toBe(expected);
        ToastManager.hideAll(); // Clear for next test
      });
    });
  });

  describe("Queue management", () => {
    it("should queue multiple toasts", () => {
      ToastManager.show("First");
      ToastManager.show("Second");
      ToastManager.show("Third");

      expect(ToastManager.currentToast.message).toBe("First");
      expect(ToastManager.queue).toHaveLength(2);
      expect(ToastManager.queue[0].message).toBe("Second");
      expect(ToastManager.queue[1].message).toBe("Third");
    });

    it("should process queue when current toast is hidden", () => {
      const firstId = ToastManager.show("First");
      ToastManager.show("Second");

      expect(ToastManager.currentToast.message).toBe("First");
      expect(ToastManager.queue).toHaveLength(1);

      ToastManager.hide(firstId);

      expect(ToastManager.currentToast.message).toBe("Second");
      expect(ToastManager.queue).toHaveLength(0);
    });

    it("should not process queue if toast is already showing", () => {
      ToastManager.show("First");
      const processQueueSpy = jest.spyOn(ToastManager, "processQueue");

      ToastManager.show("Second");

      // processQueue is called when adding to queue, but should not show second toast yet
      expect(ToastManager.currentToast.message).toBe("First");
      expect(processQueueSpy).toHaveBeenCalled();
    });
  });

  describe("Auto-hide functionality", () => {
    it("should auto-hide non-persistent toasts", () => {
      const toastId = ToastManager.show("Auto-hide test", "info", { duration: 1000 });

      expect(ToastManager.currentToast).toBeDefined();

      jest.advanceTimersByTime(1000);

      expect(ToastManager.currentToast).toBeNull();
      expect(mockToastComponent.hide).toHaveBeenCalled();
    });

    it("should not auto-hide persistent toasts", () => {
      ToastManager.show("Persistent test", "info", { persistent: true, duration: 1000 });

      expect(ToastManager.currentToast).toBeDefined();

      jest.advanceTimersByTime(1000);

      expect(ToastManager.currentToast).toBeDefined();
      expect(mockToastComponent.hide).not.toHaveBeenCalled();
    });

    it("should not auto-hide if duration is 0", () => {
      ToastManager.show("No auto-hide", "info", { duration: 0 });

      expect(ToastManager.currentToast).toBeDefined();

      jest.advanceTimersByTime(5000);

      expect(ToastManager.currentToast).toBeDefined();
    });

    it("should not auto-hide if toast was manually hidden", () => {
      const toastId = ToastManager.show("Manual hide test", "info", { duration: 1000 });

      ToastManager.hide(toastId);

      jest.advanceTimersByTime(1000);

      // Should not call hide again
      expect(mockToastComponent.hide).toHaveBeenCalledTimes(1);
    });
  });

  describe("Manual hide functionality", () => {
    it("should hide specific toast by ID", () => {
      const toastId = ToastManager.show("Hide me");

      expect(ToastManager.currentToast).toBeDefined();

      ToastManager.hide(toastId);

      expect(ToastManager.currentToast).toBeNull();
      expect(mockToastComponent.hide).toHaveBeenCalled();
    });

    it("should remove toast from queue by ID", () => {
      ToastManager.show("First");
      const secondId = ToastManager.show("Second");
      ToastManager.show("Third");

      expect(ToastManager.queue).toHaveLength(2);

      ToastManager.hide(secondId);

      expect(ToastManager.queue).toHaveLength(1);
      expect(ToastManager.queue[0].message).toBe("Third");
    });

    it("should hide all toasts", () => {
      ToastManager.show("First");
      ToastManager.show("Second");
      ToastManager.show("Third");

      expect(ToastManager.currentToast).toBeDefined();
      expect(ToastManager.queue).toHaveLength(2);

      ToastManager.hideAll();

      expect(ToastManager.currentToast).toBeNull();
      expect(ToastManager.queue).toHaveLength(0);
      expect(mockToastComponent.hide).toHaveBeenCalled();
    });
  });

  describe("Error toast handling", () => {
    beforeEach(() => {
      ErrorHandler.normalize.mockReturnValue({
        message: "Normalized error",
        userMessage: "User-friendly error",
        recoverable: true,
      });
      ErrorHandler.getUserMessage.mockReturnValue("User-friendly error");
      ErrorHandler.isRecoverable.mockReturnValue(true);
    });

    it("should show error toast with normalized error", () => {
      const error = new Error("Test error");
      const toastId = ToastManager.showError(error);

      expect(ErrorHandler.normalize).toHaveBeenCalledWith(error);
      expect(ErrorHandler.getUserMessage).toHaveBeenCalled();
      expect(ErrorHandler.log).toHaveBeenCalled();
      expect(ToastManager.currentToast.type).toBe("error");
      expect(ToastManager.currentToast.message).toBe("User-friendly error");
    });

    it("should make error toast persistent for non-recoverable errors", () => {
      ErrorHandler.isRecoverable.mockReturnValue(false);

      ToastManager.showError(new Error("Critical error"));

      expect(ToastManager.currentToast.persistent).toBe(true);
    });

    it("should add retry action for recoverable errors", () => {
      ErrorHandler.isRecoverable.mockReturnValue(true);
      ErrorHandler.normalize.mockReturnValue({
        message: "Recoverable error",
        userMessage: "Try again",
        recoverable: true,
      });

      const retryFn = jest.fn();
      ToastManager.showError(new Error("Recoverable error"), { onRetry: retryFn });

      expect(ToastManager.currentToast.action).toBeDefined();
      expect(ToastManager.currentToast.action.label).toBe("Retry");
      expect(ToastManager.currentToast.action.handler).toBe(retryFn);
    });

    it("should respect custom action over retry action", () => {
      const customAction = { label: "Custom", handler: jest.fn() };

      ToastManager.showError(new Error("Test"), { action: customAction });

      expect(ToastManager.currentToast.action).toBe(customAction);
    });
  });

  describe("Convenience methods", () => {
    it("should show success toast", () => {
      ToastManager.showSuccess("Success message");

      expect(ToastManager.currentToast.type).toBe("success");
      expect(ToastManager.currentToast.message).toBe("Success message");
    });

    it("should show warning toast", () => {
      ToastManager.showWarning("Warning message");

      expect(ToastManager.currentToast.type).toBe("warning");
      expect(ToastManager.currentToast.message).toBe("Warning message");
    });

    it("should show info toast", () => {
      ToastManager.showInfo("Info message");

      expect(ToastManager.currentToast.type).toBe("info");
      expect(ToastManager.currentToast.message).toBe("Info message");
    });

    it("should show toast with retry action", () => {
      const retryFn = jest.fn();
      ToastManager.showWithRetry("Retry message", retryFn);

      expect(ToastManager.currentToast.type).toBe("warning");
      expect(ToastManager.currentToast.message).toBe("Retry message");
      expect(ToastManager.currentToast.persistent).toBe(true);
      expect(ToastManager.currentToast.action.label).toBe("Retry");
      expect(ToastManager.currentToast.action.handler).toBe(retryFn);
    });
  });

  describe("Exported convenience functions", () => {
    it("should call ToastManager.show through showToast", () => {
      const spy = jest.spyOn(ToastManager, "show");
      showToast("Test message", "info", { duration: 1000 });

      expect(spy).toHaveBeenCalledWith("Test message", "info", { duration: 1000 });
    });

    it("should call ToastManager.showError through showErrorToast", () => {
      const spy = jest.spyOn(ToastManager, "showError");
      const error = new Error("Test");
      showErrorToast(error, { onRetry: jest.fn() });

      expect(spy).toHaveBeenCalledWith(error, { onRetry: expect.any(Function) });
    });

    it("should call ToastManager.showSuccess through showSuccessToast", () => {
      const spy = jest.spyOn(ToastManager, "showSuccess");
      showSuccessToast("Success");

      expect(spy).toHaveBeenCalledWith("Success", {});
    });

    it("should call ToastManager.showWarning through showWarningToast", () => {
      const spy = jest.spyOn(ToastManager, "showWarning");
      showWarningToast("Warning");

      expect(spy).toHaveBeenCalledWith("Warning", {});
    });

    it("should call ToastManager.showInfo through showInfoToast", () => {
      const spy = jest.spyOn(ToastManager, "showInfo");
      showInfoToast("Info");

      expect(spy).toHaveBeenCalledWith("Info", {});
    });

    it("should call ToastManager.hide through hideToast", () => {
      const spy = jest.spyOn(ToastManager, "hide");
      hideToast("toast_1");

      expect(spy).toHaveBeenCalledWith("toast_1");
    });

    it("should call ToastManager.hideAll through hideAllToasts", () => {
      const spy = jest.spyOn(ToastManager, "hideAll");
      hideAllToasts();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    it("should handle missing toast component gracefully", () => {
      ToastManager.setToastRef(null);

      expect(() => {
        ToastManager.show("Test");
      }).not.toThrow();

      expect(ToastManager.currentToast).toBeDefined();
    });

    it("should handle hide when no current toast", () => {
      expect(() => {
        ToastManager.hide("nonexistent");
      }).not.toThrow();
    });

    it("should handle hideAll when no toasts", () => {
      expect(() => {
        ToastManager.hideAll();
      }).not.toThrow();
    });

    it("should handle processQueue when queue is empty", () => {
      ToastManager.currentToast = null;
      ToastManager.queue = [];

      expect(() => {
        ToastManager.processQueue();
      }).not.toThrow();
    });

    it("should include timestamp in toast object", () => {
      const beforeTime = Date.now();
      ToastManager.show("Test");
      const afterTime = Date.now();

      expect(ToastManager.currentToast.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(ToastManager.currentToast.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe("Options merging", () => {
    it("should merge custom options with defaults", () => {
      ToastManager.showWithRetry("Test", jest.fn(), { duration: 2000 });

      expect(ToastManager.currentToast.duration).toBe(2000);
      expect(ToastManager.currentToast.persistent).toBe(true);
      expect(ToastManager.currentToast.action).toBeDefined();
    });

    it("should preserve custom action in showError when provided", () => {
      const customAction = { label: "Custom", handler: jest.fn() };
      ErrorHandler.normalize.mockReturnValue({
        recoverable: false, // Not recoverable, so onRetry won't be used
        message: "Error",
        userMessage: "Error message",
      });

      ToastManager.showError(new Error("Test"), {
        onRetry: jest.fn(),
        action: customAction
      });

      expect(ToastManager.currentToast.action).toBe(customAction);
    });

    it("should prefer onRetry over custom action for recoverable errors", () => {
      const customAction = { label: "Custom", handler: jest.fn() };
      const retryFn = jest.fn();
      ErrorHandler.normalize.mockReturnValue({
        recoverable: true, // Recoverable, so onRetry will be used
        message: "Error",
        userMessage: "Error message",
      });

      ToastManager.showError(new Error("Test"), {
        onRetry: retryFn,
        action: customAction
      });

      expect(ToastManager.currentToast.action.label).toBe("Retry");
      expect(ToastManager.currentToast.action.handler).toBe(retryFn);
    });
  });
});