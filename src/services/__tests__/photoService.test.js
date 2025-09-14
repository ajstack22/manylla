/**
 * PhotoService Tests - Basic test coverage for photo encryption/decryption
 * Tests the core functionality of photo processing and encryption
 */

// Mock React Native modules to avoid import issues in Jest
jest.mock("react-native", () => ({
  Platform: {
    OS: "web",
  },
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock the encryption service
const mockEncryptionService = {
  isInitialized: jest.fn(() => true),
  encryptData: jest.fn(),
  decryptData: jest.fn(),
};

// Mock image utils
jest.mock("../../utils/imageUtils", () => ({
  processImage: jest.fn(),
  validateImage: jest.fn(),
  createThumbnail: jest.fn(),
  IMAGE_CONFIG: {
    MAX_FILE_SIZE: 5 * 1024 * 1024,
    ALLOWED_TYPES: ["image/jpeg", "image/png"],
  },
}));

jest.mock("../sync/manyllaEncryptionService", () => mockEncryptionService);

// Import after mocks are set up
const photoService = require("../photoService").default;

describe("PhotoService", () => {
  const mockDataUrl =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";
  const mockThumbnail =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockEncryptionService.isInitialized.mockReturnValue(true);
  });

  describe("Encryption/Decryption", () => {
    it("should encrypt photo data successfully", async () => {
      const testPhotoDataUrl = mockDataUrl;
      const encryptedData = "encrypted_photo_data";

      mockEncryptionService.encryptData.mockResolvedValue(encryptedData);

      const result = await photoService.encryptPhotoData(testPhotoDataUrl);

      expect(mockEncryptionService.encryptData).toHaveBeenCalledWith(
        expect.objectContaining({
          dataUrl: testPhotoDataUrl,
          timestamp: expect.any(String),
          type: "photo",
        }),
      );
      expect(result).toBe(encryptedData);
    });

    it("should decrypt photo data successfully", async () => {
      const encryptedPhoto = "encrypted_photo_data";
      const decryptedData = { dataUrl: mockDataUrl, size: 1000, timestamp: "2025-09-14T06:51:24.976Z", type: "photo" };

      mockEncryptionService.decryptData.mockReturnValue(decryptedData);

      const result = await photoService.decryptPhoto(encryptedPhoto);

      expect(mockEncryptionService.decryptData).toHaveBeenCalledWith(
        encryptedPhoto,
      );
      expect(result).toBe(mockDataUrl);
    });

    it("should handle encryption service not initialized", async () => {
      mockEncryptionService.isInitialized.mockReturnValue(false);

      await expect(
        photoService.encryptPhotoData({ dataUrl: mockDataUrl }),
      ).rejects.toThrow("Encryption service not initialized");
    });

    it("should handle decryption service not initialized", async () => {
      mockEncryptionService.isInitialized.mockReturnValue(false);

      const result = await photoService.decryptPhoto("encrypted_data");
      expect(result).toBeNull();
    });

    it("should return null for empty encrypted photo", async () => {
      const result = await photoService.decryptPhoto("");
      expect(result).toBeNull();

      const result2 = await photoService.decryptPhoto(null);
      expect(result2).toBeNull();
    });

    it("should handle invalid decrypted data", async () => {
      mockEncryptionService.decryptData.mockReturnValue({ invalid: "data" });

      const result = await photoService.decryptPhoto("encrypted_data");
      expect(result).toBeNull();
    });
  });

  describe("Photo Processing", () => {
    it("should process and encrypt photo successfully", async () => {
      const {
        processImage,
        createThumbnail,
      } = require("../../utils/imageUtils");

      const mockFile = new File([""], "test.jpg", { type: "image/jpeg" });
      const processResult = {
        success: true,
        dataUrl: mockDataUrl,
        originalSize: 2000,
        processedSize: 1000,
      };

      processImage.mockResolvedValue(processResult);
      createThumbnail.mockResolvedValue(mockThumbnail);
      mockEncryptionService.encryptData
        .mockResolvedValueOnce("encrypted_photo")
        .mockResolvedValueOnce("encrypted_thumbnail");

      const result = await photoService.processAndEncryptPhoto(mockFile);

      expect(processImage).toHaveBeenCalledWith(mockFile);
      expect(createThumbnail).toHaveBeenCalledWith(mockDataUrl, 120);
      expect(mockEncryptionService.encryptData).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
      expect(result.encrypted).toBe("encrypted_photo");
      expect(result.encryptedThumbnail).toBe("encrypted_thumbnail");
    });

    it("should handle image processing failure", async () => {
      const { processImage } = require("../../utils/imageUtils");

      const mockFile = new File([""], "test.jpg", { type: "image/jpeg" });
      processImage.mockResolvedValue({
        success: false,
        error: "Image too large",
      });

      const result = await photoService.processAndEncryptPhoto(mockFile);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Image too large");
    });
  });

  describe("Photo Format Detection", () => {
    it("should detect encrypted photo format", () => {
      const encryptedPhotoString = "abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890"; // Long base64-like encrypted data
      const result = photoService.isPhotoEncrypted(encryptedPhotoString);

      expect(result).toBe(true);
    });

    it("should detect legacy photo format", () => {
      const legacyPhotoString = mockDataUrl;
      const result = photoService.isPhotoEncrypted(legacyPhotoString);

      expect(result).toBe(false);
    });

    it("should handle null/empty photo strings", () => {
      expect(photoService.isPhotoEncrypted(null)).toBe(false);
      expect(photoService.isPhotoEncrypted("")).toBe(false);
      expect(photoService.isPhotoEncrypted(undefined)).toBe(false);
    });
  });

  describe("Caching", () => {
    it("should cache decrypted photos", async () => {
      const encryptedPhoto = "abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890"; // Valid encrypted string
      const decryptedData = { dataUrl: mockDataUrl, size: 1000, timestamp: "2025-09-14T06:51:24.976Z", type: "photo" };

      mockEncryptionService.isInitialized.mockReturnValue(true);
      mockEncryptionService.decryptData.mockReturnValue(decryptedData);

      // First call should decrypt
      const result1 = await photoService.decryptPhoto(encryptedPhoto);
      expect(mockEncryptionService.decryptData).toHaveBeenCalledTimes(1);
      expect(result1).toBe(mockDataUrl);

      // Second call should use cache
      const result2 = await photoService.decryptPhoto(encryptedPhoto);
      expect(mockEncryptionService.decryptData).toHaveBeenCalledTimes(1); // Still only once
      expect(result2).toBe(mockDataUrl);
    });

    it("should bypass cache when requested", async () => {
      const encryptedPhoto = "wxyz1234567890abcdef1234567890abcdef1234567890abcdef1234567890"; // Different valid encrypted string
      const decryptedData = { dataUrl: mockDataUrl, size: 1000, timestamp: "2025-09-14T06:51:24.976Z", type: "photo" };

      mockEncryptionService.isInitialized.mockReturnValue(true);
      mockEncryptionService.decryptData.mockReturnValue(decryptedData);

      // First call with cache
      const result1 = await photoService.decryptPhoto(encryptedPhoto, true);
      expect(result1).toBe(mockDataUrl);
      expect(mockEncryptionService.decryptData).toHaveBeenCalledTimes(1);

      // Second call without cache
      const result2 = await photoService.decryptPhoto(encryptedPhoto, false);
      expect(result2).toBe(mockDataUrl);
      expect(mockEncryptionService.decryptData).toHaveBeenCalledTimes(2);
    });

    it("should clear cache", () => {
      // Add some cached data first
      const decryptedData = { dataUrl: mockDataUrl, size: 1000 };
      mockEncryptionService.decryptData.mockReturnValue(decryptedData);

      photoService.clearCache();

      // Verify cache is cleared (this is a basic test - in real implementation
      // we'd need to verify the internal cache Map is empty)
      expect(photoService.decryptionCache.size).toBe(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle encryption errors gracefully", async () => {
      const testPhotoData = { dataUrl: mockDataUrl, size: 1000 };
      mockEncryptionService.encryptData.mockRejectedValue(
        new Error("Encryption failed"),
      );

      await expect(
        photoService.encryptPhotoData(testPhotoData),
      ).rejects.toThrow("Encryption failed");
    });

    it("should handle decryption errors gracefully", async () => {
      mockEncryptionService.decryptData.mockImplementation(() => {
        throw new Error("Decryption failed");
      });

      const result = await photoService.decryptPhoto("encrypted_data");
      expect(result).toBeNull();
    });
  });
});
