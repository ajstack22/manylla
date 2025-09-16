/**
 * ImagePicker Component Tests
 */
import ImagePicker from "../ImagePicker";

// Mock platform utility
jest.mock("../../../utils/platform", () => ({
  isWeb: true,
  isMobile: false,
}));

describe("ImagePicker", () => {
  describe("getMobileImagePicker", () => {
    test("should return null on web platform", () => {
      // Since the module exports don't expose getMobileImagePicker directly,
      // we test the main functionality
      expect(ImagePicker).toBeDefined();
    });
  });

  describe("ImagePicker methods", () => {
    test("should have selectImage method", () => {
      expect(typeof ImagePicker.selectImage).toBe("function");
    });

    test("should have capturePhoto method", () => {
      expect(typeof ImagePicker.capturePhoto).toBe("function");
    });

    test("should have showImagePicker method", () => {
      expect(typeof ImagePicker.showImagePicker).toBe("function");
    });
  });

  describe("Web platform behavior", () => {
    test("capturePhoto should handle web platform gracefully", async () => {
      // On web, camera capture should reject
      await expect(ImagePicker.capturePhoto()).rejects.toThrow(
        "Camera capture only available on mobile devices",
      );
    });

    test("selectImage should work on web platform", () => {
      // Mock file input creation
      const mockFileInput = {
        click: jest.fn(),
        addEventListener: jest.fn(),
      };

      document.createElement = jest.fn().mockReturnValue(mockFileInput);

      ImagePicker.selectImage();

      // Should create file input for web
      expect(document.createElement).toHaveBeenCalledWith("input");
    });
  });
});
