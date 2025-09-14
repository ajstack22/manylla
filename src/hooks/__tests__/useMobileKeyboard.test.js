/**
 * Tests for useMobileKeyboard hook
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
jest.mock("../../utils/platform", () => ({
  isIOS: false,
  isWeb: false,
}));

describe("useMobileKeyboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with default values", () => {
    Dimensions.get.mockReturnValue({ width: 400 });

    const { result } = renderHook(() => useMobileKeyboard());

    expect(result.current.isKeyboardVisible).toBe(false);
    expect(result.current.keyboardHeight).toBe(0);
    expect(result.current.isMobile).toBe(true);
    expect(result.current.keyboardPadding).toBe(0);
    expect(result.current.stickyStyles).toEqual({});
  });

  it("should detect desktop vs mobile based on screen width", () => {
    // Test mobile
    Dimensions.get.mockReturnValue({ width: 400 });
    const { result: mobileResult } = renderHook(() => useMobileKeyboard());
    expect(mobileResult.current.isMobile).toBe(true);

    // Test desktop
    Dimensions.get.mockReturnValue({ width: 800 });
    const { result: desktopResult } = renderHook(() => useMobileKeyboard());
    expect(desktopResult.current.isMobile).toBe(false);
  });

  it("should accept options for scroll behavior", () => {
    Dimensions.get.mockReturnValue({ width: 400 });

    const options = { scrollIntoView: false, scrollOffset: 200 };
    const { result } = renderHook(() => useMobileKeyboard(options));

    // Hook should still work with options
    expect(result.current.isKeyboardVisible).toBe(false);
  });

  it("should register keyboard listeners on mobile", () => {
    Dimensions.get.mockReturnValue({ width: 400 });

    renderHook(() => useMobileKeyboard());

    expect(Keyboard.addListener).toHaveBeenCalledWith(
      "keyboardDidShow",
      expect.any(Function),
    );
    expect(Keyboard.addListener).toHaveBeenCalledWith(
      "keyboardDidHide",
      expect.any(Function),
    );
  });

  it("should not register keyboard listeners on desktop", () => {
    Dimensions.get.mockReturnValue({ width: 800 });

    renderHook(() => useMobileKeyboard());

    expect(Keyboard.addListener).not.toHaveBeenCalled();
  });

  it("should simulate keyboard show/hide on mobile", () => {
    Dimensions.get.mockReturnValue({ width: 400 });

    let showCallback;
    let hideCallback;

    Keyboard.addListener.mockImplementation((event, callback) => {
      if (event === "keyboardDidShow") {
        showCallback = callback;
      } else if (event === "keyboardDidHide") {
        hideCallback = callback;
      }
      return { remove: jest.fn() };
    });

    const { result } = renderHook(() => useMobileKeyboard());

    // Initially hidden
    expect(result.current.isKeyboardVisible).toBe(false);
    expect(result.current.keyboardHeight).toBe(0);

    // Simulate keyboard show
    act(() => {
      showCallback({ endCoordinates: { height: 300 } });
    });

    expect(result.current.isKeyboardVisible).toBe(true);
    expect(result.current.keyboardHeight).toBe(300);
    expect(result.current.keyboardPadding).toBe(300);
    expect(result.current.stickyStyles).toEqual({
      position: "absolute",
      bottom: 300,
      left: 0,
      right: 0,
      zIndex: 1000,
    });

    // Simulate keyboard hide
    act(() => {
      hideCallback();
    });

    expect(result.current.isKeyboardVisible).toBe(false);
    expect(result.current.keyboardHeight).toBe(0);
    expect(result.current.keyboardPadding).toBe(0);
    expect(result.current.stickyStyles).toEqual({});
  });

  it("should cleanup listeners on unmount", () => {
    Dimensions.get.mockReturnValue({ width: 400 });

    const mockRemove = jest.fn();
    Keyboard.addListener.mockReturnValue({ remove: mockRemove });

    const { unmount } = renderHook(() => useMobileKeyboard());

    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });
});
