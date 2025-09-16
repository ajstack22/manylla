import { font } from "../platform";

// Mock React Native Platform
jest.mock("react-native", () => ({
  Platform: {
    OS: "android", // Set to android for our tests
  },
  Dimensions: {
    get: () => ({ width: 400, height: 800 }),
  },
}));

describe("Type Comparison Fixes - Platform Font Weight", () => {
  describe("font function", () => {
    // All tests run on Android due to Platform.OS mock

    it('should handle string font weight "700" correctly on Android', () => {
      const style = font("700");

      expect(style.fontWeight).toBe("bold");
      expect(style.fontFamily).toBeDefined();
    });

    it("should handle numeric font weight 700 correctly on Android", () => {
      const style = font(700);

      expect(style.fontWeight).toBe("bold");
      expect(style.fontFamily).toBeDefined();
    });

    it('should handle string font weight "800" correctly on Android', () => {
      const style = font("800");

      expect(style.fontWeight).toBe("bold");
      expect(style.fontFamily).toBeDefined();
    });

    it("should handle numeric font weight 800 correctly on Android", () => {
      const style = font(800);

      expect(style.fontWeight).toBe("bold");
      expect(style.fontFamily).toBeDefined();
    });

    it('should handle string "bold" correctly on Android', () => {
      const style = font("bold");

      expect(style.fontWeight).toBe("bold");
      expect(style.fontFamily).toBeDefined();
    });

    it("should handle normal font weights correctly on Android", () => {
      expect(font("400").fontWeight).toBe("normal");
      expect(font(400).fontWeight).toBe("normal");
      expect(font("normal").fontWeight).toBe("normal");
    });

    // Edge cases that test the type comparison fix
    it("should produce consistent results regardless of weight type (the original bug fix)", () => {
      const style1 = font(700);
      const style2 = font("700");

      // Results should be identical regardless of whether weight is passed as number or string
      expect(style1.fontWeight).toBe(style2.fontWeight);
      expect(style1.fontFamily).toBe(style2.fontFamily);
    });

    it("should handle edge case weights correctly", () => {
      // Test weights that should not trigger bold
      const normalStyle = font("500");
      expect(normalStyle.fontWeight).toBe("normal");

      const normalStyleNum = font(500);
      expect(normalStyleNum.fontWeight).toBe("normal");

      // Results should be consistent
      expect(normalStyle.fontWeight).toBe(normalStyleNum.fontWeight);
    });
  });
});
