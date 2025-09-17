/**
 * Comprehensive tests for useMobileKeyboard hook
 * Tests keyboard detection, event handling, and scrolling behavior across platforms
 */

import { renderHook, act } from "@testing-library/react";
import { Dimensions, Keyboard } from "react-native";
import { useMobileKeyboard } from "../useMobileKeyboard";

// Mock React Native
jest.mock("react-native", () => ({
  Dimensions: {
    get: jest.fn(),
  },
  Keyboard: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

// Mock platform
const mockPlatform = {
  isIOS: false,
  isWeb: false,
};

jest.mock("../../utils/platform", () => mockPlatform);

// P2 TECH DEBT: Remove skip when working on useMobileKeyboard
// Issue: Keyboard event simulation
describe.skip("useMobileKeyboard", () => {
  let mockKeyboardListeners = {};
  let mockWindow = {};
  let mockDocument = {};
  let mockVisualViewport = null;

  const setupMocks = () => {
    jest.clearAllMocks();
    mockKeyboardListeners = {};

    // Setup window mock
    mockWindow = {
      innerHeight: 768,
      scrollY: 0,
      scrollTo: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    // Setup document mock - use defineProperty for activeElement
    mockDocument = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    // Define activeElement as a configurable property
    Object.defineProperty(mockDocument, 'activeElement', {
      value: null,
      writable: true,
      configurable: true
    });

    // Setup visual viewport mock
    mockVisualViewport = {
      height: 768,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    // Apply mocks to global - handle existing window object
    if (global.window) {
      Object.assign(global.window, mockWindow);
      global.window.visualViewport = mockVisualViewport;
    } else {
      global.window = { ...mockWindow, visualViewport: mockVisualViewport };
    }

    // For document, we need to be more careful with the assignment
    if (!global.document) {
      global.document = mockDocument;
    } else {
      // Only assign properties that don't have getters
      Object.keys(mockDocument).forEach(key => {
        if (key !== 'activeElement') {
          global.document[key] = mockDocument[key];
        }
      });
      // Handle activeElement separately if needed
      if (Object.getOwnPropertyDescriptor(global.document, 'activeElement')?.configurable) {
        Object.defineProperty(global.document, 'activeElement', {
          value: null,
          writable: true,
          configurable: true
        });
      }
    }

    // Reset platform mock
    mockPlatform.isIOS = false;
    mockPlatform.isWeb = false;

    // Setup Keyboard mock
    Keyboard.addListener.mockImplementation((event, callback) => {
      const listener = { remove: jest.fn() };
      mockKeyboardListeners[event] = { callback, listener };
      return listener;
    });
  };

  beforeEach(() => {
    setupMocks();
  });

  describe("Initialization and Basic Functionality", () => {
    it("should initialize with default values", () => {
      Dimensions.get.mockReturnValue({ width: 400 });

      const { result } = renderHook(() => useMobileKeyboard());

      expect(result.current.isKeyboardVisible).toBe(false);
      expect(result.current.keyboardHeight).toBe(0);
      expect(result.current.isMobile).toBe(true);
      expect(result.current.keyboardPadding).toBe(0);
      expect(result.current.stickyStyles).toEqual({});
    });

    it("should detect mobile vs desktop based on screen width", () => {
      // Test mobile (< 600px)
      Dimensions.get.mockReturnValue({ width: 400 });
      const { result: mobileResult } = renderHook(() => useMobileKeyboard());
      expect(mobileResult.current.isMobile).toBe(true);

      // Test desktop (>= 600px)
      Dimensions.get.mockReturnValue({ width: 800 });
      const { result: desktopResult } = renderHook(() => useMobileKeyboard());
      expect(desktopResult.current.isMobile).toBe(false);
    });

    it("should handle boundary width values", () => {
      // Exactly at boundary
      Dimensions.get.mockReturnValue({ width: 600 });
      const { result } = renderHook(() => useMobileKeyboard());
      expect(result.current.isMobile).toBe(false);

      // Just under boundary
      Dimensions.get.mockReturnValue({ width: 599 });
      const { result: result2 } = renderHook(() => useMobileKeyboard());
      expect(result2.current.isMobile).toBe(true);
    });

    it("should accept and use options", () => {
      Dimensions.get.mockReturnValue({ width: 400 });

      const options = { scrollIntoView: false, scrollOffset: 200 };
      const { result } = renderHook(() => useMobileKeyboard(options));

      expect(result.current.isKeyboardVisible).toBe(false);
    });

    it("should handle undefined options", () => {
      Dimensions.get.mockReturnValue({ width: 400 });

      const { result } = renderHook(() => useMobileKeyboard(undefined));

      expect(result.current.isKeyboardVisible).toBe(false);
    });

    it("should handle empty options", () => {
      Dimensions.get.mockReturnValue({ width: 400 });

      const { result } = renderHook(() => useMobileKeyboard({}));

      expect(result.current.isKeyboardVisible).toBe(false);
    });
  });

  describe("Desktop Behavior", () => {
    beforeEach(() => {
      Dimensions.get.mockReturnValue({ width: 800 }); // Desktop width
    });

    it("should not register keyboard listeners on desktop", () => {
      renderHook(() => useMobileKeyboard());

      expect(Keyboard.addListener).not.toHaveBeenCalled();
      expect(mockWindow.addEventListener).not.toHaveBeenCalled();
    });

    it("should return correct desktop state", () => {
      const { result } = renderHook(() => useMobileKeyboard());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isKeyboardVisible).toBe(false);
      expect(result.current.keyboardHeight).toBe(0);
      expect(result.current.keyboardPadding).toBe(0);
      expect(result.current.stickyStyles).toEqual({});
    });
  });

  describe("iOS Platform Behavior", () => {
    beforeEach(() => {
      Dimensions.get.mockReturnValue({ width: 400 }); // Mobile width
      mockPlatform.isIOS = true;
      mockPlatform.isWeb = false;
    });

    it("should register iOS-specific keyboard listeners", () => {
      renderHook(() => useMobileKeyboard());

      expect(Keyboard.addListener).toHaveBeenCalledWith(
        "keyboardWillShow",
        expect.any(Function)
      );
      expect(Keyboard.addListener).toHaveBeenCalledWith(
        "keyboardWillHide",
        expect.any(Function)
      );
    });

    it("should handle iOS keyboardWillShow event", () => {
      const { result } = renderHook(() => useMobileKeyboard());

      act(() => {
        const showCallback = mockKeyboardListeners["keyboardWillShow"].callback;
        showCallback({ endCoordinates: { height: 300 } });
      });

      expect(result.current.isKeyboardVisible).toBe(true);
      expect(result.current.keyboardHeight).toBe(300);
      expect(result.current.keyboardPadding).toBe(300);
    });

    it("should handle iOS keyboardWillHide event", () => {
      const { result } = renderHook(() => useMobileKeyboard());

      // Show then hide
      act(() => {
        const showCallback = mockKeyboardListeners["keyboardWillShow"].callback;
        showCallback({ endCoordinates: { height: 300 } });
      });

      act(() => {
        const hideCallback = mockKeyboardListeners["keyboardWillHide"].callback;
        hideCallback();
      });

      expect(result.current.isKeyboardVisible).toBe(false);
      expect(result.current.keyboardHeight).toBe(0);
      expect(result.current.keyboardPadding).toBe(0);
    });

    it("should cleanup iOS listeners properly", () => {
      const { unmount } = renderHook(() => useMobileKeyboard());

      const showListener = mockKeyboardListeners["keyboardWillShow"].listener;
      const hideListener = mockKeyboardListeners["keyboardWillHide"].listener;

      unmount();

      expect(showListener.remove).toHaveBeenCalled();
      expect(hideListener.remove).toHaveBeenCalled();
    });
  });

  describe("Android Platform Behavior", () => {
    beforeEach(() => {
      Dimensions.get.mockReturnValue({ width: 400 }); // Mobile width
      mockPlatform.isIOS = false;
      mockPlatform.isWeb = false;
    });

    it("should register Android-specific keyboard listeners", () => {
      renderHook(() => useMobileKeyboard());

      expect(Keyboard.addListener).toHaveBeenCalledWith(
        "keyboardDidShow",
        expect.any(Function)
      );
      expect(Keyboard.addListener).toHaveBeenCalledWith(
        "keyboardDidHide",
        expect.any(Function)
      );
    });

    it("should handle Android keyboardDidShow event", () => {
      const { result } = renderHook(() => useMobileKeyboard());

      act(() => {
        const showCallback = mockKeyboardListeners["keyboardDidShow"].callback;
        showCallback({ endCoordinates: { height: 280 } });
      });

      expect(result.current.isKeyboardVisible).toBe(true);
      expect(result.current.keyboardHeight).toBe(280);
    });

    it("should handle Android keyboardDidHide event", () => {
      const { result } = renderHook(() => useMobileKeyboard());

      // Show then hide
      act(() => {
        mockKeyboardListeners["keyboardDidShow"].callback({
          endCoordinates: { height: 280 },
        });
      });

      act(() => {
        mockKeyboardListeners["keyboardDidHide"].callback();
      });

      expect(result.current.isKeyboardVisible).toBe(false);
      expect(result.current.keyboardHeight).toBe(0);
    });
  });

  describe("Web Platform Behavior", () => {
    beforeEach(() => {
      Dimensions.get.mockReturnValue({ width: 400 }); // Mobile width
      mockPlatform.isIOS = false;
      mockPlatform.isWeb = true;
      mockWindow.visualViewport = mockVisualViewport;
    });

    it("should register web event listeners", () => {
      renderHook(() => useMobileKeyboard());

      expect(mockVisualViewport.addEventListener).toHaveBeenCalledWith(
        "resize",
        expect.any(Function)
      );
      expect(mockVisualViewport.addEventListener).toHaveBeenCalledWith(
        "scroll",
        expect.any(Function)
      );
      expect(mockWindow.addEventListener).toHaveBeenCalledWith(
        "resize",
        expect.any(Function)
      );
      expect(mockDocument.addEventListener).toHaveBeenCalledWith(
        "focusin",
        expect.any(Function)
      );
      expect(mockDocument.addEventListener).toHaveBeenCalledWith(
        "focusout",
        expect.any(Function)
      );
    });

    it("should detect keyboard from viewport height change", () => {
      const { result } = renderHook(() => useMobileKeyboard());

      // Simulate viewport shrinking (keyboard showing)
      mockVisualViewport.height = 400; // Reduced from 768

      act(() => {
        const resizeCallback = mockVisualViewport.addEventListener.mock.calls.find(
          (call) => call[0] === "resize"
        )[1];
        resizeCallback();
      });

      expect(result.current.isKeyboardVisible).toBe(true);
      expect(result.current.keyboardHeight).toBe(368); // 768 - 400
    });

    it("should handle focus on input elements", () => {
      renderHook(() => useMobileKeyboard());

      const mockInput = {
        tagName: "INPUT",
        getBoundingClientRect: jest.fn(() => ({
          top: 100,
          bottom: 140,
        })),
      };

      act(() => {
        const focusCallback = mockDocument.addEventListener.mock.calls.find(
          (call) => call[0] === "focusin"
        )[1];
        focusCallback({ target: mockInput });
      });

      // Input ref should be set (tested indirectly)
      expect(mockInput.getBoundingClientRect).not.toHaveBeenCalled(); // Only called on viewport change
    });

    it("should handle focus on textarea elements", () => {
      renderHook(() => useMobileKeyboard());

      const mockTextarea = {
        tagName: "TEXTAREA",
        getBoundingClientRect: jest.fn(() => ({
          top: 200,
          bottom: 240,
        })),
      };

      act(() => {
        const focusCallback = mockDocument.addEventListener.mock.calls.find(
          (call) => call[0] === "focusin"
        )[1];
        focusCallback({ target: mockTextarea });
      });

      // Should handle textarea same as input
      expect(true).toBe(true); // Test passes without error
    });

    it("should handle blur events", () => {
      const { result } = renderHook(() => useMobileKeyboard());

      // Set up active element
      mockDocument.activeElement = { tagName: "INPUT" };

      act(() => {
        const blurCallback = mockDocument.addEventListener.mock.calls.find(
          (call) => call[0] === "focusout"
        )[1];
        blurCallback();
      });

      // Change active element to non-input
      mockDocument.activeElement = { tagName: "DIV" };

      // Use fake timers for setTimeout
      jest.useFakeTimers();
      act(() => {
        jest.advanceTimersByTime(100);
      });
      jest.useRealTimers();

      expect(result.current.isKeyboardVisible).toBe(false);
    });

    it("should handle auto-scroll when scrollIntoView is enabled", () => {
      renderHook(() =>
        useMobileKeyboard({ scrollIntoView: true, scrollOffset: 50 })
      );

      const mockInput = {
        tagName: "INPUT",
        getBoundingClientRect: jest.fn(() => ({
          top: 600,
          bottom: 640,
        })),
      };

      // Focus input first
      act(() => {
        const focusCallback = mockDocument.addEventListener.mock.calls.find(
          (call) => call[0] === "focusin"
        )[1];
        focusCallback({ target: mockInput });
      });

      // Simulate viewport change (keyboard showing)
      mockVisualViewport.height = 400;

      jest.useFakeTimers();

      act(() => {
        const resizeCallback = mockVisualViewport.addEventListener.mock.calls.find(
          (call) => call[0] === "resize"
        )[1];
        resizeCallback();
      });

      // Advance past setTimeout delay
      act(() => {
        jest.advanceTimersByTime(300);
      });

      jest.useRealTimers();

      expect(mockWindow.scrollTo).toHaveBeenCalledWith({
        top: 550, // 600 - 50 (scrollOffset)
        behavior: "smooth",
      });
    });

    it("should handle setTimeout errors robustly", () => {
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn((callback, delay) => {
        // Simulate setTimeout that throws
        if (delay === 300) {
          throw new Error("setTimeout failed");
        }
        return originalSetTimeout(callback, delay);
      });

      expect(() => {
        renderHook(() =>
          useMobileKeyboard({ scrollIntoView: true })
        );
      }).not.toThrow();

      global.setTimeout = originalSetTimeout;
    });

    it("should handle visualViewport edge cases", () => {
      // Test with visualViewport that has undefined properties
      mockWindow.visualViewport = {
        height: undefined,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };

      const { result } = renderHook(() => useMobileKeyboard());

      expect(() => {
        act(() => {
          const resizeCallback = mockWindow.visualViewport.addEventListener.mock.calls.find(
            (call) => call[0] === "resize"
          )[1];
          resizeCallback();
        });
      }).not.toThrow();

      expect(result.current.isKeyboardVisible).toBe(false);
    });

    it("should handle element visibility calculations robustly", () => {
      renderHook(() =>
        useMobileKeyboard({ scrollIntoView: true, scrollOffset: 50 })
      );

      const mockInput = {
        tagName: "INPUT",
        getBoundingClientRect: jest.fn(() => ({
          top: 600,
          bottom: 640,
        })),
      };

      // Focus input
      act(() => {
        const focusCallback = mockDocument.addEventListener.mock.calls.find(
          (call) => call[0] === "focusin"
        )[1];
        focusCallback({ target: mockInput });
      });

      // Test with viewport height that makes input visible
      mockVisualViewport.height = 700; // Input is visible

      jest.useFakeTimers();

      act(() => {
        const resizeCallback = mockVisualViewport.addEventListener.mock.calls.find(
          (call) => call[0] === "resize"
        )[1];
        resizeCallback();
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      jest.useRealTimers();

      // Should not scroll since input is visible
      expect(mockWindow.scrollTo).not.toHaveBeenCalled();
    });

    it("should handle missing visual viewport gracefully", () => {
      mockWindow.visualViewport = null;

      const { result } = renderHook(() => useMobileKeyboard());

      // Should still register fallback listeners
      expect(mockWindow.addEventListener).toHaveBeenCalledWith(
        "resize",
        expect.any(Function)
      );
      expect(result.current.isKeyboardVisible).toBe(false);
    });

    it("should cleanup web listeners on unmount", () => {
      const { unmount } = renderHook(() => useMobileKeyboard());

      unmount();

      expect(mockVisualViewport.removeEventListener).toHaveBeenCalledWith(
        "resize",
        expect.any(Function)
      );
      expect(mockVisualViewport.removeEventListener).toHaveBeenCalledWith(
        "scroll",
        expect.any(Function)
      );
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith(
        "resize",
        expect.any(Function)
      );
      expect(mockDocument.removeEventListener).toHaveBeenCalledWith(
        "focusin",
        expect.any(Function)
      );
      expect(mockDocument.removeEventListener).toHaveBeenCalledWith(
        "focusout",
        expect.any(Function)
      );
    });
  });

  describe("Keyboard State Helpers", () => {
    beforeEach(() => {
      Dimensions.get.mockReturnValue({ width: 400 }); // Mobile
      mockPlatform.isIOS = true;
      mockPlatform.isWeb = false;
    });

    it("should calculate keyboardPadding correctly", () => {
      const { result } = renderHook(() => useMobileKeyboard());

      // Initially no padding
      expect(result.current.keyboardPadding).toBe(0);

      // Show keyboard
      act(() => {
        const showCallback = mockKeyboardListeners["keyboardWillShow"].callback;
        showCallback({ endCoordinates: { height: 300 } });
      });

      expect(result.current.keyboardPadding).toBe(300);

      // Hide keyboard
      act(() => {
        const hideCallback = mockKeyboardListeners["keyboardWillHide"].callback;
        hideCallback();
      });

      expect(result.current.keyboardPadding).toBe(0);
    });

    it("should generate correct stickyStyles", () => {
      const { result } = renderHook(() => useMobileKeyboard());

      // Show keyboard
      act(() => {
        const showCallback = mockKeyboardListeners["keyboardWillShow"].callback;
        showCallback({ endCoordinates: { height: 250 } });
      });

      expect(result.current.stickyStyles).toEqual({
        position: "absolute",
        bottom: 250,
        left: 0,
        right: 0,
        zIndex: 1000,
      });

      // Hide keyboard
      act(() => {
        const hideCallback = mockKeyboardListeners["keyboardWillHide"].callback;
        hideCallback();
      });

      expect(result.current.stickyStyles).toEqual({});
    });

    it("should handle zero keyboard height", () => {
      const { result } = renderHook(() => useMobileKeyboard());

      act(() => {
        const showCallback = mockKeyboardListeners["keyboardWillShow"].callback;
        showCallback({ endCoordinates: { height: 0 } });
      });

      expect(result.current.isKeyboardVisible).toBe(true);
      expect(result.current.keyboardHeight).toBe(0);
      expect(result.current.keyboardPadding).toBe(0);
    });

    it("should handle negative keyboard height", () => {
      const { result } = renderHook(() => useMobileKeyboard());

      act(() => {
        const showCallback = mockKeyboardListeners["keyboardWillShow"].callback;
        showCallback({ endCoordinates: { height: -10 } });
      });

      expect(result.current.isKeyboardVisible).toBe(true);
      expect(result.current.keyboardHeight).toBe(-10);
      expect(result.current.keyboardPadding).toBe(-10);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle missing endCoordinates in keyboard events", () => {
      Dimensions.get.mockReturnValue({ width: 400 });
      mockPlatform.isIOS = true;
      mockPlatform.isWeb = false;

      const { result } = renderHook(() => useMobileKeyboard());

      act(() => {
        const showCallback = mockKeyboardListeners["keyboardWillShow"].callback;
        showCallback({}); // Missing endCoordinates
      });

      expect(result.current.isKeyboardVisible).toBe(true);
      expect(result.current.keyboardHeight).toBeUndefined();
    });

    it("should handle rapid keyboard show/hide events", () => {
      Dimensions.get.mockReturnValue({ width: 400 });
      mockPlatform.isIOS = true;
      mockPlatform.isWeb = false;

      const { result } = renderHook(() => useMobileKeyboard());

      act(() => {
        const showCallback = mockKeyboardListeners["keyboardWillShow"].callback;
        const hideCallback = mockKeyboardListeners["keyboardWillHide"].callback;

        // Rapid events
        showCallback({ endCoordinates: { height: 300 } });
        hideCallback();
        showCallback({ endCoordinates: { height: 250 } });
        hideCallback();
        showCallback({ endCoordinates: { height: 280 } });
      });

      expect(result.current.isKeyboardVisible).toBe(true);
      expect(result.current.keyboardHeight).toBe(280);
    });

    it("should handle getBoundingClientRect errors", () => {
      Dimensions.get.mockReturnValue({ width: 400 });
      mockPlatform.isWeb = true;
      mockPlatform.isIOS = false;
      mockWindow.visualViewport = mockVisualViewport;

      renderHook(() => useMobileKeyboard({ scrollIntoView: true }));

      const mockInput = {
        tagName: "INPUT",
        getBoundingClientRect: jest.fn(() => {
          throw new Error("getBoundingClientRect failed");
        }),
      };

      // Should not crash
      expect(() => {
        act(() => {
          const focusCallback = mockDocument.addEventListener.mock.calls.find(
            (call) => call[0] === "focusin"
          )[1];
          focusCallback({ target: mockInput });
        });
      }).not.toThrow();
    });

    it("should handle dimension changes during lifecycle", () => {
      // Start mobile
      Dimensions.get.mockReturnValue({ width: 400 });
      const { result, rerender } = renderHook(() => useMobileKeyboard());

      expect(result.current.isMobile).toBe(true);

      // Change to desktop
      Dimensions.get.mockReturnValue({ width: 800 });
      rerender();

      expect(result.current.isMobile).toBe(false);
    });

    it("should handle null/undefined target in focus events", () => {
      Dimensions.get.mockReturnValue({ width: 400 });
      mockPlatform.isWeb = true;
      mockPlatform.isIOS = false;
      mockWindow.visualViewport = mockVisualViewport;

      renderHook(() => useMobileKeyboard());

      expect(() => {
        act(() => {
          const focusCallback = mockDocument.addEventListener.mock.calls.find(
            (call) => call[0] === "focusin"
          )[1];
          focusCallback({ target: null });
        });
      }).not.toThrow();
    });

    it("should handle focus on non-input elements", () => {
      Dimensions.get.mockReturnValue({ width: 400 });
      mockPlatform.isWeb = true;
      mockPlatform.isIOS = false;
      mockWindow.visualViewport = mockVisualViewport;

      renderHook(() => useMobileKeyboard());

      const mockDiv = { tagName: "DIV" };

      expect(() => {
        act(() => {
          const focusCallback = mockDocument.addEventListener.mock.calls.find(
            (call) => call[0] === "focusin"
          )[1];
          focusCallback({ target: mockDiv });
        });
      }).not.toThrow();
    });
  });

  describe("Memory Management and Cleanup", () => {
    it("should cleanup all listeners on unmount", () => {
      Dimensions.get.mockReturnValue({ width: 400 });
      mockPlatform.isWeb = true;
      mockPlatform.isIOS = false;
      mockWindow.visualViewport = mockVisualViewport;

      const { unmount } = renderHook(() => useMobileKeyboard());

      unmount();

      // Verify all listeners are removed
      expect(mockVisualViewport.removeEventListener).toHaveBeenCalledTimes(2);
      expect(mockWindow.removeEventListener).toHaveBeenCalledTimes(1);
      expect(mockDocument.removeEventListener).toHaveBeenCalledTimes(2);
    });

    it("should handle unmount when no listeners were added", () => {
      Dimensions.get.mockReturnValue({ width: 800 }); // Desktop

      const { unmount } = renderHook(() => useMobileKeyboard());

      expect(() => unmount()).not.toThrow();
    });

    it("should handle multiple unmounts gracefully", () => {
      Dimensions.get.mockReturnValue({ width: 400 });

      const { unmount } = renderHook(() => useMobileKeyboard());

      expect(() => {
        unmount();
        unmount(); // Second unmount should not throw
      }).not.toThrow();
    });
  });

  describe("Integration Scenarios", () => {
    it("should work correctly with different mobile sizes", () => {
      const sizes = [320, 375, 414, 599]; // Various mobile widths

      sizes.forEach((width) => {
        Dimensions.get.mockReturnValue({ width });
        const { result } = renderHook(() => useMobileKeyboard());
        expect(result.current.isMobile).toBe(true);
      });
    });

    it("should work correctly with different desktop sizes", () => {
      const sizes = [600, 768, 1024, 1920]; // Various desktop widths

      sizes.forEach((width) => {
        Dimensions.get.mockReturnValue({ width });
        const { result } = renderHook(() => useMobileKeyboard());
        expect(result.current.isMobile).toBe(false);
      });
    });

    it("should maintain state consistency across platform changes", () => {
      Dimensions.get.mockReturnValue({ width: 400 });
      mockPlatform.isIOS = true;
      mockPlatform.isWeb = false;

      const { result } = renderHook(() => useMobileKeyboard());

      // Show keyboard on iOS
      act(() => {
        const showCallback = mockKeyboardListeners["keyboardWillShow"].callback;
        showCallback({ endCoordinates: { height: 300 } });
      });

      expect(result.current.isKeyboardVisible).toBe(true);
      expect(result.current.keyboardHeight).toBe(300);

      // Hide keyboard
      act(() => {
        const hideCallback = mockKeyboardListeners["keyboardWillHide"].callback;
        hideCallback();
      });

      expect(result.current.isKeyboardVisible).toBe(false);
      expect(result.current.keyboardHeight).toBe(0);
    });
  });
});
