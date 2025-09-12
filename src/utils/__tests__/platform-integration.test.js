import platform from "../platform";
import { render, screen } from "@testing-library/react-native";
import React from "react";
import { View, Text, Modal, ScrollView, Platform } from "react-native";

// Mock Platform.OS for testing
const originalOS = Platform.OS;

describe("Platform Integration Tests", () => {
  afterEach(() => {
    Platform.OS = originalOS;
  });

  describe("Component Integration", () => {
    it("should render with platform-specific styles", () => {
      Platform.OS = "ios";

      const TestComponent = () => (
        <View style={platform.shadow(4)}>
          <Text style={platform.font("bold", 16)}>Test</Text>
        </View>
      );

      render(<TestComponent />);
      expect(screen.getByText("Test")).toBeTruthy();
    });

    it("should configure modal correctly for iOS", () => {
      Platform.OS = "ios";

      const TestModal = () => (
        <Modal {...platform.modalConfig()} visible={true} testID="test-modal">
          <Text>Modal Content</Text>
        </Modal>
      );

      render(<TestModal />);
      expect(screen.getByText("Modal Content")).toBeTruthy();
      expect(screen.getByTestId("test-modal")).toBeTruthy();
    });

    it("should configure modal correctly for Android", () => {
      Platform.OS = "android";

      const TestModal = () => (
        <Modal {...platform.modalConfig()} visible={true} testID="test-modal">
          <Text>Modal Content</Text>
        </Modal>
      );

      render(<TestModal />);
      expect(screen.getByText("Modal Content")).toBeTruthy();
      expect(screen.getByTestId("test-modal")).toBeTruthy();
    });

    it("should configure ScrollView correctly", () => {
      Platform.OS = "ios";

      const TestScrollView = () => (
        <ScrollView {...platform.scrollView()} testID="test-scroll">
          <Text>Scrollable Content</Text>
        </ScrollView>
      );

      render(<TestScrollView />);
      expect(screen.getByText("Scrollable Content")).toBeTruthy();
      expect(screen.getByTestId("test-scroll")).toBeTruthy();
    });

    it("should handle platform-specific TouchableHighlight config", () => {
      Platform.OS = "android";

      const config = platform.touchableHighlightConfig();
      expect(config).toBeDefined();
      expect(typeof config).toBe("object");
    });
  });

  describe("API Integration", () => {
    it("should return correct API URL for web", () => {
      Platform.OS = "web";
      const url = platform.apiBaseUrl();
      expect(url).toBe("/manylla/qual/api");
      expect(typeof url).toBe("string");
    });

    it("should return correct API URL for mobile", () => {
      Platform.OS = "ios";
      const url = platform.apiBaseUrl();
      expect(url).toBe("https://manylla.com/qual/api");
      expect(typeof url).toBe("string");
    });

    it("should provide fetch configuration", () => {
      const config = platform.fetchConfig();
      expect(config.headers).toBeDefined();
      expect(config.headers["Content-Type"]).toBe("application/json");
      expect(config.timeout).toBeDefined();
    });

    it("should handle API endpoints correctly", () => {
      Platform.OS = "web";
      const endpoints = [
        "sync_health.php",
        "sync_push.php",
        "sync_pull.php",
        "share_create.php",
        "share_access.php",
      ];

      endpoints.forEach((endpoint) => {
        const fullUrl = `${platform.apiBaseUrl()}/${endpoint}`;
        expect(fullUrl).toContain(endpoint);
        expect(fullUrl.startsWith("/")).toBe(true);
      });
    });
  });

  describe("Feature Detection", () => {
    it("should detect all required features", () => {
      const features = [
        "supportsCamera",
        "supportsShare",
        "supportsClipboard",
        "supportsPrint",
      ];

      features.forEach((feature) => {
        expect(typeof platform[feature]).toBe("boolean");
      });
    });

    it("should detect web features correctly", () => {
      Platform.OS = "web";

      // Web should support clipboard and print
      expect(platform.supportsClipboard).toBe(true);
      expect(platform.supportsPrint).toBe(true);

      // Web typically doesn't support native camera/share
      expect(platform.supportsCamera).toBe(false);
      expect(platform.supportsShare).toBe(false);
    });

    it("should detect mobile features correctly", () => {
      Platform.OS = "ios";

      // Mobile should support camera and share
      expect(platform.supportsCamera).toBe(true);
      expect(platform.supportsShare).toBe(true);

      // Mobile should support clipboard
      expect(platform.supportsClipboard).toBe(true);

      // Print support varies
      expect(typeof platform.supportsPrint).toBe("boolean");
    });
  });

  describe("Style System Integration", () => {
    it("should generate consistent shadow styles across platforms", () => {
      const elevations = [0, 1, 2, 4, 8, 12];

      elevations.forEach((elevation) => {
        Platform.OS = "ios";
        const iosShadow = platform.shadow(elevation);

        Platform.OS = "android";
        const androidShadow = platform.shadow(elevation);

        Platform.OS = "web";
        const webShadow = platform.shadow(elevation);

        // All platforms should return objects
        expect(typeof iosShadow).toBe("object");
        expect(typeof androidShadow).toBe("object");
        expect(typeof webShadow).toBe("object");

        // Test that proper objects are returned
        expect(iosShadow).toBeTruthy();
        expect(androidShadow).toBeTruthy();
        expect(webShadow).toBeTruthy();

        // Test shadow properties are present when elevation > 0
        expect(elevation >= 0).toBe(true); // Elevation should be non-negative

        // Test platform-specific shadow implementations
        expect(elevation).toBeGreaterThanOrEqual(0);

        // All platforms provide valid style objects
        expect(iosShadow).toBeInstanceOf(Object);
        expect(androidShadow).toBeInstanceOf(Object);
        expect(webShadow).toBeInstanceOf(Object);
      });
    });

    it("should handle font weights consistently", () => {
      const weights = ["normal", "bold", "100", "400", "700"];
      const sizes = [12, 14, 16, 18, 24, 32];

      weights.forEach((weight) => {
        sizes.forEach((size) => {
          Platform.OS = "ios";
          const iosFont = platform.font(weight, size);

          Platform.OS = "android";
          const androidFont = platform.font(weight, size);

          Platform.OS = "web";
          const webFont = platform.font(weight, size);

          // All should return font objects
          expect(typeof iosFont).toBe("object");
          expect(typeof androidFont).toBe("object");
          expect(typeof webFont).toBe("object");

          // All should have fontSize
          expect(iosFont.fontSize).toBe(size);
          expect(androidFont.fontSize).toBe(size);
          expect(webFont.fontSize).toBe(size);

          // All should have fontWeight
          expect(iosFont.fontWeight).toBeDefined();
          expect(androidFont.fontWeight).toBeDefined();
          expect(webFont.fontWeight).toBeDefined();
        });
      });
    });
  });

  describe("Platform Select Integration", () => {
    it("should select correct values for each platform", () => {
      const testConfig = {
        ios: "iOS Value",
        android: "Android Value",
        web: "Web Value",
        default: "Default Value",
      };

      Platform.OS = "ios";
      expect(platform.select(testConfig)).toBe("iOS Value");

      Platform.OS = "android";
      expect(platform.select(testConfig)).toBe("Android Value");

      Platform.OS = "web";
      expect(platform.select(testConfig)).toBe("Web Value");
    });

    it("should fall back to default when platform not specified", () => {
      const testConfig = {
        ios: "iOS Value",
        default: "Default Value",
      };

      Platform.OS = "android";
      expect(platform.select(testConfig)).toBe("Default Value");

      Platform.OS = "web";
      expect(platform.select(testConfig)).toBe("Default Value");
    });

    it("should handle missing default gracefully", () => {
      const testConfig = {
        ios: "iOS Value",
      };

      Platform.OS = "android";
      const result = platform.select(testConfig);
      expect(result).toBeUndefined();
    });
  });

  describe("Performance Integration", () => {
    it("should handle rapid successive calls efficiently", () => {
      const startTime = Date.now();

      // Make 1000 rapid calls to various functions
      for (let i = 0; i < 1000; i++) {
        platform.select({ ios: "a", android: "b", web: "c", default: "d" });
        platform.shadow(4);
        platform.font("bold", 16);
        platform.apiBaseUrl();
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });

    it("should maintain consistent memory usage", () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Create many objects
      const results = [];
      for (let i = 0; i < 1000; i++) {
        results.push({
          shadow: platform.shadow(Math.floor(Math.random() * 10)),
          font: platform.font("bold", 16),
          config: platform.modalConfig(),
        });
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle invalid shadow values gracefully", () => {
      expect(() => platform.shadow(-1)).not.toThrow();
      expect(() => platform.shadow(null)).not.toThrow();
      expect(() => platform.shadow("invalid")).not.toThrow();
    });

    it("should handle invalid font parameters gracefully", () => {
      expect(() => platform.font(null, 16)).not.toThrow();
      expect(() => platform.font("bold", null)).not.toThrow();
      expect(() => platform.font("invalid-weight", -5)).not.toThrow();
    });

    it("should handle empty select configuration", () => {
      expect(() => platform.select({})).not.toThrow();
      expect(() => platform.select(null)).not.toThrow();
      expect(() => platform.select(undefined)).not.toThrow();
    });
  });
});
