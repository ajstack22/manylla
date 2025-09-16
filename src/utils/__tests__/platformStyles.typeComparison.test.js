import { getFontFamily } from "../platformStyles";
import platform from "../platform";

// Mock the platform
jest.mock("../platform", () => ({
  isAndroid: false,
  isWeb: false,
  isIOS: true,
}));

describe("Type Comparison Fixes - Font Weight", () => {
  describe("getFontFamily", () => {
    beforeEach(() => {
      // Reset to default for each test
      platform.isAndroid = false;
    });

    it('should handle string font weight "700" correctly on Android', () => {
      platform.isAndroid = true;
      const result = getFontFamily("700");
      expect(result).toBe("System");
    });

    it("should handle numeric font weight 700 correctly on Android", () => {
      platform.isAndroid = true;
      const result = getFontFamily(700);
      expect(result).toBe("System");
    });

    it('should handle string font weight "600" correctly on Android', () => {
      platform.isAndroid = true;
      const result = getFontFamily("600");
      expect(result).toBe("System");
    });

    it("should handle numeric font weight 600 correctly on Android", () => {
      platform.isAndroid = true;
      const result = getFontFamily(600);
      expect(result).toBe("System");
    });

    it('should handle string "bold" correctly on Android', () => {
      platform.isAndroid = true;
      const result = getFontFamily("bold");
      expect(result).toBe("System");
    });

    it("should handle regular font weights on Android", () => {
      platform.isAndroid = true;
      expect(getFontFamily("400")).toBe("System");
      expect(getFontFamily(400)).toBe("System");
      expect(getFontFamily("normal")).toBe("System");
    });

    it("should return System for all weights on non-Android platforms", () => {
      platform.isAndroid = false;
      expect(getFontFamily("700")).toBe("System");
      expect(getFontFamily(700)).toBe("System");
      expect(getFontFamily("bold")).toBe("System");
      expect(getFontFamily("400")).toBe("System");
    });

    // Edge cases that would have failed before the fix
    it("should not fail when comparing different types (the original bug)", () => {
      platform.isAndroid = true;

      // These should all work correctly now
      expect(() => getFontFamily(700)).not.toThrow();
      expect(() => getFontFamily("700")).not.toThrow();
      expect(() => getFontFamily(600)).not.toThrow();
      expect(() => getFontFamily("600")).not.toThrow();

      // Results should be consistent regardless of type
      expect(getFontFamily(700)).toBe(getFontFamily("700"));
      expect(getFontFamily(600)).toBe(getFontFamily("600"));
    });
  });
});
