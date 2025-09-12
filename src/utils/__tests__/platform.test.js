import platform from "../platform";
import { Platform } from "react-native";

describe("Platform Abstraction", () => {
  describe("Core Detection", () => {
    it("should detect web platform", () => {
      Platform.OS = "web";
      expect(platform.isWeb).toBe(true);
      expect(platform.isMobile).toBe(false);
    });

    it("should detect iOS platform", () => {
      Platform.OS = "ios";
      expect(platform.isIOS).toBe(true);
      expect(platform.isMobile).toBe(true);
    });

    it("should detect Android platform", () => {
      Platform.OS = "android";
      expect(platform.isAndroid).toBe(true);
      expect(platform.isMobile).toBe(true);
    });
  });

  describe("Style Helpers", () => {
    it("should generate correct shadows", () => {
      Platform.OS = "ios";
      const shadow = platform.shadow(4);
      expect(shadow.shadowOffset).toBeDefined();
      expect(shadow.shadowOpacity).toBeDefined();

      Platform.OS = "android";
      const androidShadow = platform.shadow(4);
      expect(androidShadow.elevation).toBe(4);
    });

    it("should handle font correctly", () => {
      Platform.OS = "android";
      const font = platform.font("bold", 16);
      expect(font.fontFamily).toBe("sans-serif");
      expect(font.fontWeight).toBe("bold");
    });
  });

  describe("API Configuration", () => {
    it("should return correct API URL", () => {
      Platform.OS = "web";
      expect(platform.apiBaseUrl()).toBe("/manylla/qual/api");

      Platform.OS = "ios";
      expect(platform.apiBaseUrl()).toBe("https://manylla.com/qual/api");
    });
  });
});
