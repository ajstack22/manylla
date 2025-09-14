import platform from "../platform";

describe("Platform Abstraction", () => {
  // Use mocked Platform.OS for tests (as set in jest.setup.js)

  describe("Core Detection", () => {
    it("should detect web platform", () => {
      // Platform.OS is mocked as 'web' in jest.setup.js
      expect(platform.isWeb).toBe(true);
      expect(platform.isMobile).toBe(false);
    });
  });

  describe("Style Helpers", () => {
    it("should generate correct shadows for web", () => {
      const shadow = platform.shadow(4);
      expect(shadow.shadowOffset).toBeDefined();
      expect(shadow.shadowOpacity).toBeDefined();
      expect(shadow.shadowColor).toBe("#000");
    });

    it("should handle font correctly for web", () => {
      const font = platform.font("bold", 16);
      expect(font.fontFamily).toBe("System");
      expect(font.fontWeight).toBe("bold");
      expect(font.fontSize).toBe(16);
    });

    it("should handle different font weights", () => {
      const normal = platform.font("400", 14);
      expect(normal.fontWeight).toBe("400");

      const bold = platform.font("700", 16);
      expect(bold.fontWeight).toBe("700");
    });
  });

  describe("API Configuration", () => {
    it("should return correct API URL for web", () => {
      expect(platform.apiBaseUrl()).toBe("/manylla/qual/api");
    });
  });

  describe("Feature Detection", () => {
    it("should detect web features", () => {
      expect(platform.supportsLocalStorage).toBe(true);
      expect(platform.supportsTouch).toBe(false);
      expect(platform.supportsHover).toBe(true);
      expect(platform.supportsCamera).toBe(false);
    });
  });

  describe("Responsive Helpers", () => {
    it("should calculate responsive sizes", () => {
      const size = platform.responsiveSize(16);
      expect(typeof size).toBe("number");
      expect(size).toBeGreaterThan(0);
    });
  });

  describe("Component Configurations", () => {
    it("should provide modal config", () => {
      const config = platform.modalConfig();
      expect(config.animationType).toBe("none");
      expect(config.transparent).toBe(true);
    });

    it("should provide touchable config", () => {
      const config = platform.touchableConfig();
      expect(config.activeOpacity).toBe(0.7);
      expect(config.delayPressIn).toBe(0);
    });
  });
});
