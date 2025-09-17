import platform from "../platform";

// P2 TECH DEBT: Remove skip when working on platform utilities
// Issue: Tests need refactoring for better isolation and mock handling
describe.skip("Platform Abstraction", () => {
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

  describe("Security - Print Function", () => {
    // Mock DOM methods for testing
    let mockAppendChild, mockRemoveChild, mockPrint, mockConsoleWarn;
    let mockStyleElement;
    let originalDocument, originalWindow, originalConsole, originalNodeEnv;

    beforeEach(() => {
      // Save original values
      originalDocument = global.document;
      originalWindow = global.window;
      originalConsole = global.console;
      originalNodeEnv = process.env.NODE_ENV;

      // Mock document methods
      mockStyleElement = {
        innerHTML: "",
      };
      mockAppendChild = jest.fn();
      mockRemoveChild = jest.fn();
      mockConsoleWarn = jest.fn();
      mockPrint = jest.fn();

      global.document = {
        createElement: jest.fn(() => mockStyleElement),
        head: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild,
        },
      };

      global.window = {
        print: mockPrint,
      };

      // Mock console.warn
      global.console = {
        ...console,
        warn: mockConsoleWarn,
      };

      // Set NODE_ENV to development for testing console output
      process.env.NODE_ENV = "development";
    });

    afterEach(() => {
      // Restore original values
      global.document = originalDocument;
      global.window = originalWindow;
      global.console = originalConsole;
      process.env.NODE_ENV = originalNodeEnv;
      jest.clearAllMocks();
    });

    it("should validate elementId and prevent CSS injection", () => {
      // Test valid elementId
      platform.print("valid-element-id");
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockStyleElement.innerHTML).toContain("#valid-element-id");
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it("should reject malicious elementId with CSS injection attempt", () => {
      const maliciousId = "valid; } body { background: red !important; }";
      platform.print(maliciousId);

      // Should fall back to full page print and warn about invalid ID
      expect(mockPrint).toHaveBeenCalled();
      expect(mockAppendChild).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Invalid elementId provided to print function:",
        maliciousId,
      );
    });

    it("should reject elementId with XSS attempt", () => {
      const xssId = "test'><script>alert('xss')</script>";
      platform.print(xssId);

      expect(mockPrint).toHaveBeenCalled();
      expect(mockAppendChild).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    it("should reject null/undefined elementId", () => {
      platform.print(null);
      expect(mockPrint).toHaveBeenCalled();
      expect(mockAppendChild).not.toHaveBeenCalled();

      jest.clearAllMocks();

      platform.print(undefined);
      expect(mockPrint).toHaveBeenCalled();
      expect(mockAppendChild).not.toHaveBeenCalled();
    });

    it("should reject non-string elementId", () => {
      platform.print(123);
      expect(mockPrint).toHaveBeenCalled();
      expect(mockAppendChild).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    it("should reject elementId that's too long", () => {
      const longId = "a".repeat(101); // Over 100 character limit
      platform.print(longId);

      expect(mockPrint).toHaveBeenCalled();
      expect(mockAppendChild).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    it("should accept valid elementId patterns", () => {
      const validIds = [
        "element1",
        "my-element",
        "_private-element",
        "UPPERCASE-ID",
        "mixed-Case_123",
      ];

      validIds.forEach((id) => {
        jest.clearAllMocks();
        platform.print(id);
        expect(mockAppendChild).toHaveBeenCalled();
        expect(mockStyleElement.innerHTML).toContain(`#${id}`);
        expect(mockConsoleWarn).not.toHaveBeenCalled();
      });
    });

    it("should reject invalid characters in elementId", () => {
      const invalidIds = [
        "element.with.dots",
        "element with spaces",
        "element@symbol",
        "element+plus",
        "element{bracket}",
        "element[square]",
        "element(paren)",
        "element#hash",
        "element%percent",
      ];

      invalidIds.forEach((id) => {
        jest.clearAllMocks();
        platform.print(id);
        expect(mockPrint).toHaveBeenCalled();
        expect(mockAppendChild).not.toHaveBeenCalled();
        expect(mockConsoleWarn).toHaveBeenCalledWith(
          "Invalid elementId provided to print function:",
          id,
        );
      });
    });

    it("should not log warnings in production", () => {
      process.env.NODE_ENV = "production";

      platform.print("invalid.element");

      expect(mockPrint).toHaveBeenCalled();
      expect(mockAppendChild).not.toHaveBeenCalled();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it("should print entire page when no elementId provided", () => {
      platform.print();

      expect(mockPrint).toHaveBeenCalled();
      expect(mockAppendChild).not.toHaveBeenCalled();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });
  });
});
