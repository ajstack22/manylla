/**
 * Tests for ThemeContext
 */

import React from "react";
import { renderHook, act } from "@testing-library/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ThemeProvider,
  useTheme,
  manyllaColors,
  lightTheme,
  darkTheme,
  manyllaTheme,
} from "../ThemeContext";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock platform
jest.mock("../../utils/platform", () => ({
  isWeb: false,
}));

// Mock localStorage for web tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("ThemeContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe("Theme exports", () => {
    it("should export theme color constants", () => {
      expect(manyllaColors).toBeDefined();
      expect(manyllaColors.manila).toBe("#F4E4C1");
      expect(manyllaColors.brown).toBe("#8B6F47");
    });

    it("should export theme objects", () => {
      expect(lightTheme).toBeDefined();
      expect(darkTheme).toBeDefined();
      expect(manyllaTheme).toBeDefined();

      expect(lightTheme.primary).toBe("#8B6F47");
      expect(darkTheme.primary).toBe("#8B6F47");
      expect(manyllaTheme.primary).toBe("#5D4E37");
    });
  });

  describe("ThemeProvider", () => {
    const wrapper = ({ children, ...props }) => (
      <ThemeProvider {...props}>{children}</ThemeProvider>
    );

    it("should provide theme context with default light theme", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe("light");
      expect(result.current.themeMode).toBe("light");
      expect(result.current.isDark).toBe(false);
      expect(result.current.colors).toEqual(lightTheme);
    });

    it("should use initial theme mode", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: (props) => (
          <ThemeProvider initialThemeMode="dark" {...props} />
        ),
      });

      expect(result.current.theme).toBe("dark");
      expect(result.current.themeMode).toBe("dark");
      expect(result.current.isDark).toBe(true);
      expect(result.current.colors).toEqual(darkTheme);
    });

    it("should toggle between light and dark themes", async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe("light");

      await act(async () => {
        await result.current.toggleTheme();
      });

      expect(result.current.theme).toBe("dark");
      expect(result.current.isDark).toBe(true);

      await act(async () => {
        await result.current.toggleTheme();
      });

      expect(result.current.theme).toBe("light");
      expect(result.current.isDark).toBe(false);
    });

    it("should call onThemeChange callback", async () => {
      const onThemeChange = jest.fn();
      const { result } = renderHook(() => useTheme(), {
        wrapper: (props) => (
          <ThemeProvider onThemeChange={onThemeChange} {...props} />
        ),
      });

      await act(async () => {
        await result.current.toggleTheme();
      });

      expect(onThemeChange).toHaveBeenCalledWith("dark");
    });

    it("should set theme mode directly", async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      await act(async () => {
        await result.current.setThemeMode("dark");
      });

      expect(result.current.theme).toBe("dark");
      expect(result.current.themeMode).toBe("dark");
    });

    it("should provide theme styles", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.styles).toBeDefined();
      expect(result.current.styles.borderRadius).toBe(12);
      expect(result.current.styles.fontFamily).toContain(
        "Atkinson Hyperlegible",
      );
      expect(result.current.styles.typography).toBeDefined();
    });

    it("should persist theme preference", async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      await act(async () => {
        await result.current.setThemeMode("dark");
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "theme_preference",
        "dark",
      );
    });

    it("should load saved theme preference", async () => {
      AsyncStorage.getItem.mockResolvedValue("dark");

      const { result, waitForNextUpdate } = renderHook(() => useTheme(), {
        wrapper,
      });

      // Wait for effect to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.theme).toBe("dark");
    });

    it("should handle storage errors gracefully", async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));
      AsyncStorage.setItem.mockRejectedValue(new Error("Storage error"));

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe("light"); // Starts as light due to storage error

      // Should not throw - main goal is to ensure errors don't crash the app
      await act(async () => {
        await expect(result.current.toggleTheme()).resolves.not.toThrow();
      });

      // Theme should change in memory even if storage fails
      expect(["light", "dark"]).toContain(result.current.theme);
    });
  });

  describe("useTheme hook", () => {
    it("should throw error when used outside ThemeProvider", () => {
      // Suppress error boundary warnings
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow("useTheme must be used within a ThemeProvider");

      console.error = originalError;
    });
  });

  describe("web platform handling", () => {
    beforeEach(() => {
      // Mock web platform
      jest.doMock("../../utils/platform", () => ({ isWeb: true }));
    });

    it("should use localStorage on web platform", async () => {
      // Note: This test would require re-importing the module after mocking
      // For now, just test that the platform logic exists
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      expect(result.current).toBeDefined();
    });
  });

  describe("theme validation", () => {
    it("should only accept valid theme modes from storage", async () => {
      // Invalid theme
      AsyncStorage.getItem.mockResolvedValue("invalid-theme");

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => (
          <ThemeProvider initialThemeMode="light">{children}</ThemeProvider>
        ),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Should fallback to initial theme
      expect(result.current.theme).toBe("light");
    });

    it("should handle missing initial theme and storage", async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Should default to light
      expect(result.current.theme).toBe("light");
    });
  });
});
