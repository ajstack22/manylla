/* eslint-disable */
/**
 * Tests for useMobileDialog hook
 */

import { renderHook } from "@testing-library/react";
import { Dimensions } from "react-native";
import { useMobileDialog } from "../useMobileDialog";

// Mock React Native Dimensions
jest.mock("react-native", () => ({
  Dimensions: {
    get: jest.fn(),
  },
}));

// Mock platform
jest.mock("../../utils/platform", () => ({
  isIOS: true,
}));

describe("useMobileDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return mobile props for narrow screen", () => {
    // Mock narrow screen width
    Dimensions.get.mockReturnValue({ width: 400, height: 800 });

    const { result } = renderHook(() => useMobileDialog());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.dialogProps.fullScreen).toBe(true);
    expect(result.current.dialogProps.animationType).toBe("slide");
    expect(result.current.mobileDialogProps.fullScreen).toBe(true);
  });

  it("should return desktop props for wide screen", () => {
    // Mock wide screen width
    Dimensions.get.mockReturnValue({ width: 800, height: 600 });

    const { result } = renderHook(() => useMobileDialog());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.dialogProps.animationType).toBe("fade");
    expect(result.current.dialogProps.transparent).toBe(true);
    expect(result.current.mobileDialogProps.style.maxWidth).toBe(480);
  });

  it("should handle boundary case at 600px breakpoint", () => {
    // Test exactly at breakpoint
    Dimensions.get.mockReturnValue({ width: 600, height: 800 });

    const { result } = renderHook(() => useMobileDialog());

    expect(result.current.isMobile).toBe(false);
  });

  it("should handle boundary case just below 600px", () => {
    // Test just below breakpoint
    Dimensions.get.mockReturnValue({ width: 599, height: 800 });

    const { result } = renderHook(() => useMobileDialog());

    expect(result.current.isMobile).toBe(true);
  });

  it("should include iOS styling when platform.isIOS is true", () => {
    Dimensions.get.mockReturnValue({ width: 400, height: 800 });

    const { result } = renderHook(() => useMobileDialog());

    expect(result.current.dialogProps.style.borderRadius).toBe(12); // iOS value
    expect(result.current.mobileDialogProps.style.borderRadius).toBe(12);
  });
});
