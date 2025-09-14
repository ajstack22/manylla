import {
  validateImage,
  calculateDimensions,
  resizeImage,
  processImage,
  dataUrlToBlob,
  getImageDimensions,
  estimateMemoryUsage,
  isProcessingSafe,
  createThumbnail,
  IMAGE_CONFIG
} from '../imageUtils';
import platform from '../platform';

// Mock platform
jest.mock('../platform', () => ({
  isWeb: true,
  isIOS: false,
  isAndroid: false
}));

// Mock global Image, Canvas, and FileReader for web environment
const mockImage = {
  width: 800,
  height: 600,
  onload: null,
  onerror: null,
  set src(value) {
    // Simulate successful image loading
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
};

const mockCanvas = {
  width: 0,
  height: 0,
  getContext: jest.fn(() => ({
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
    drawImage: jest.fn(),
  })),
  toDataURL: jest.fn(() => 'data:image/jpeg;base64,mocked_canvas_data')
};

const mockFileReader = {
  onloadend: null,
  onerror: null,
  result: 'data:image/jpeg;base64,mocked_file_data',
  readAsDataURL: jest.fn(function() {
    setTimeout(() => {
      if (this.onloadend) this.onloadend();
    }, 0);
  })
};

// Mock DOM APIs
global.Image = jest.fn(() => mockImage);
global.document = {
  createElement: jest.fn((tag) => {
    if (tag === 'canvas') return mockCanvas;
    return {};
  })
};
global.FileReader = jest.fn(() => mockFileReader);
global.fetch = jest.fn(() =>
  Promise.resolve({
    blob: () => Promise.resolve(new Blob())
  })
);

describe('imageUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock image dimensions
    mockImage.width = 800;
    mockImage.height = 600;
    platform.isWeb = true;
  });

  describe('IMAGE_CONFIG', () => {
    it('should have correct configuration values', () => {
      expect(IMAGE_CONFIG.MAX_DIMENSION).toBe(800);
      expect(IMAGE_CONFIG.JPEG_QUALITY).toBe(0.85);
      expect(IMAGE_CONFIG.MAX_FILE_SIZE).toBe(2 * 1024 * 1024);
      expect(IMAGE_CONFIG.TARGET_SIZE).toBe(500 * 1024);
      expect(IMAGE_CONFIG.ALLOWED_TYPES).toContain('image/jpeg');
      expect(IMAGE_CONFIG.ALLOWED_TYPES).toContain('image/png');
      expect(IMAGE_CONFIG.ALLOWED_EXTENSIONS).toContain('.jpg');
    });
  });

  describe('validateImage', () => {
    it('should reject null or undefined input', () => {
      expect(validateImage(null)).toEqual({
        isValid: false,
        error: 'No file provided'
      });

      expect(validateImage(undefined)).toEqual({
        isValid: false,
        error: 'No file provided'
      });
    });

    it('should validate mobile image picker result', () => {
      const mobileImage = {
        type: 'image/jpeg',
        fileSize: 1024 * 1024 // 1MB
      };

      const result = validateImage(mobileImage);

      expect(result.isValid).toBe(true);
    });

    it('should reject mobile image with invalid type', () => {
      const mobileImage = {
        type: 'image/gif',
        fileSize: 1024 * 1024
      };

      const result = validateImage(mobileImage);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should reject mobile image with large file size', () => {
      const mobileImage = {
        type: 'image/jpeg',
        fileSize: 3 * 1024 * 1024 // 3MB (exceeds 2MB limit)
      };

      const result = validateImage(mobileImage);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File size too large');
    });

    it('should validate web File object', () => {
      const webFile = {
        type: 'image/png',
        size: 1024 * 1024 // 1MB
      };

      const result = validateImage(webFile);

      expect(result.isValid).toBe(true);
    });

    it('should reject web File with invalid type', () => {
      const webFile = {
        type: 'image/bmp',
        size: 1024 * 1024
      };

      const result = validateImage(webFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should validate base64 data URLs', () => {
      const dataUrl = 'data:image/jpeg;base64,' + 'x'.repeat(1000); // Small base64

      const result = validateImage(dataUrl);

      expect(result.isValid).toBe(true);
    });

    it('should reject large base64 data URLs', () => {
      const largeBase64 = 'x'.repeat(3 * 1024 * 1024); // ~3MB when decoded
      const dataUrl = 'data:image/jpeg;base64,' + largeBase64;

      const result = validateImage(dataUrl);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File size too large');
    });

    it('should reject invalid file formats', () => {
      const invalidFile = { someProperty: 'value' };

      const result = validateImage(invalidFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid file format');
    });

    it('should handle different case variations', () => {
      const upperCaseFile = {
        type: 'IMAGE/JPEG',
        size: 1024 * 1024
      };

      const result = validateImage(upperCaseFile);

      expect(result.isValid).toBe(true);
    });
  });

  describe('calculateDimensions', () => {
    it('should return original dimensions if within max', () => {
      const result = calculateDimensions(600, 400, 800);

      expect(result).toEqual({ width: 600, height: 400 });
    });

    it('should scale down landscape images', () => {
      const result = calculateDimensions(1200, 800, 600);

      expect(result.width).toBe(600);
      expect(result.height).toBe(400); // Maintains aspect ratio
    });

    it('should scale down portrait images', () => {
      const result = calculateDimensions(800, 1200, 600);

      expect(result.width).toBe(400); // Maintains aspect ratio
      expect(result.height).toBe(600);
    });

    it('should handle square images', () => {
      const result = calculateDimensions(1000, 1000, 600);

      expect(result.width).toBe(600);
      expect(result.height).toBe(600);
    });

    it('should use default max dimension', () => {
      const result = calculateDimensions(1000, 800);

      expect(result.width).toBe(IMAGE_CONFIG.MAX_DIMENSION);
      expect(result.height).toBe(640); // Maintains aspect ratio
    });

    it('should handle edge case of 0 dimensions', () => {
      const result = calculateDimensions(0, 0, 800);

      expect(result.width).toBe(0);
      expect(result.height).toBe(0);
    });

    it('should round dimensions properly', () => {
      const result = calculateDimensions(1001, 800, 600);

      expect(Number.isInteger(result.width)).toBe(true);
      expect(Number.isInteger(result.height)).toBe(true);
    });
  });

  describe('resizeImage', () => {
    it('should resolve immediately on mobile platforms', async () => {
      platform.isWeb = false;
      const dataUrl = 'data:image/jpeg;base64,test_data';

      const result = await resizeImage(dataUrl);

      expect(result).toBe(dataUrl);
    });

    it('should resize image on web platform', async () => {
      platform.isWeb = true;
      const dataUrl = 'data:image/jpeg;base64,test_data';

      const result = await resizeImage(dataUrl);

      expect(global.Image).toHaveBeenCalled();
      expect(mockCanvas.getContext).toHaveBeenCalled();
      expect(result).toBe('data:image/jpeg;base64,mocked_canvas_data');
    });

    it('should return original if already small enough', async () => {
      platform.isWeb = true;
      mockImage.width = 600;
      mockImage.height = 400;
      const dataUrl = 'data:image/jpeg;base64,test_data';

      const result = await resizeImage(dataUrl, 800);

      expect(result).toBe(dataUrl);
    });

    it('should handle image load errors', async () => {
      platform.isWeb = true;
      const dataUrl = 'data:image/jpeg;base64,test_data';

      // Mock image load error
      mockImage.src = function(value) {
        setTimeout(() => {
          if (this.onerror) this.onerror();
        }, 0);
      };

      await expect(resizeImage(dataUrl)).rejects.toThrow('Failed to load image');
    });

    it('should handle canvas errors', async () => {
      platform.isWeb = true;
      const dataUrl = 'data:image/jpeg;base64,test_data';

      // Mock canvas error
      mockCanvas.toDataURL.mockImplementation(() => {
        throw new Error('Canvas error');
      });

      await expect(resizeImage(dataUrl)).rejects.toThrow('Failed to resize image');
    });

    it('should use higher quality for PNG images', async () => {
      platform.isWeb = true;
      const pngDataUrl = 'data:image/PNG;base64,test_data';

      await resizeImage(pngDataUrl);

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.9);
    });

    it('should use configured quality for JPEG images', async () => {
      platform.isWeb = true;
      const jpegDataUrl = 'data:image/jpeg;base64,test_data';

      await resizeImage(jpegDataUrl);

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', IMAGE_CONFIG.JPEG_QUALITY);
    });
  });

  describe('processImage', () => {
    it('should process a valid File object', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg', size: 1024 });
      Object.defineProperty(file, 'size', { value: 1024 });

      const result = await processImage(file);

      expect(result.success).toBe(true);
      expect(result.dataUrl).toBe('data:image/jpeg;base64,mocked_canvas_data');
      expect(result.originalSize).toBe(1024);
      expect(typeof result.processedSize).toBe('number');
    });

    it('should process a data URL string', async () => {
      const dataUrl = 'data:image/jpeg;base64,' + 'x'.repeat(1000);

      const result = await processImage(dataUrl);

      expect(result.success).toBe(true);
      expect(result.dataUrl).toBeDefined();
      expect(result.originalSize).toBeGreaterThan(0);
    });

    it('should process mobile picker result', async () => {
      const mobileResult = {
        base64: 'test_base64_data',
        type: 'image/jpeg',
        fileSize: 2048
      };

      const result = await processImage(mobileResult);

      expect(result.success).toBe(true);
      expect(result.originalSize).toBe(2048);
    });

    it('should handle validation errors', async () => {
      const invalidFile = {
        type: 'image/gif',
        size: 1024
      };

      const result = await processImage(invalidFile);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should handle file reading errors', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      // Mock FileReader error
      mockFileReader.readAsDataURL = function() {
        setTimeout(() => {
          if (this.onerror) this.onerror();
        }, 0);
      };

      const result = await processImage(file);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to read file');
    });

    it('should calculate compression ratio', async () => {
      const dataUrl = 'data:image/jpeg;base64,' + 'x'.repeat(2000);

      const result = await processImage(dataUrl);

      expect(result.success).toBe(true);
      expect(result.compressionRatio).toBeGreaterThan(0);
      expect(result.compressionRatio).toBeLessThanOrEqual(1);
    });

    it('should handle invalid input format', async () => {
      const invalidInput = { randomProperty: 'value' };

      const result = await processImage(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid image input format');
    });
  });

  describe('dataUrlToBlob', () => {
    it('should convert data URL to blob on web', async () => {
      platform.isWeb = true;
      const dataUrl = 'data:image/jpeg;base64,test_data';

      const blob = await dataUrlToBlob(dataUrl);

      expect(global.fetch).toHaveBeenCalledWith(dataUrl);
      expect(blob).toBeInstanceOf(Blob);
    });

    it('should throw error on mobile platforms', async () => {
      platform.isWeb = false;
      const dataUrl = 'data:image/jpeg;base64,test_data';

      await expect(dataUrlToBlob(dataUrl)).rejects.toThrow('Blob conversion only supported on web');
    });
  });

  describe('getImageDimensions', () => {
    it('should return image dimensions', async () => {
      mockImage.width = 1024;
      mockImage.height = 768;
      const dataUrl = 'data:image/jpeg;base64,test_data';

      const dimensions = await getImageDimensions(dataUrl);

      expect(dimensions).toEqual({ width: 1024, height: 768 });
    });

    it('should handle image load errors', async () => {
      const dataUrl = 'data:image/jpeg;base64,test_data';

      // Mock image load error
      const originalSrcSetter = Object.getOwnPropertyDescriptor(mockImage, 'src').set;
      Object.defineProperty(mockImage, 'src', {
        set: function(value) {
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 0);
        }
      });

      await expect(getImageDimensions(dataUrl)).rejects.toThrow('Failed to load image');

      // Restore original setter
      Object.defineProperty(mockImage, 'src', { set: originalSrcSetter });
    });
  });

  describe('estimateMemoryUsage', () => {
    it('should calculate memory usage correctly', () => {
      const usage = estimateMemoryUsage(1000, 800);

      expect(usage).toBe(1000 * 800 * 4); // 4 bytes per pixel
    });

    it('should handle zero dimensions', () => {
      const usage = estimateMemoryUsage(0, 0);

      expect(usage).toBe(0);
    });

    it('should handle large dimensions', () => {
      const usage = estimateMemoryUsage(5000, 4000);

      expect(usage).toBe(5000 * 4000 * 4);
    });
  });

  describe('isProcessingSafe', () => {
    it('should return true for safe dimensions', () => {
      const safe = isProcessingSafe(1000, 800);

      expect(safe).toBe(true);
    });

    it('should return false for unsafe dimensions', () => {
      const unsafe = isProcessingSafe(10000, 10000); // Would use ~400MB

      expect(unsafe).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isProcessingSafe(0, 0)).toBe(true);
      expect(isProcessingSafe(3500, 3571)).toBe(true); // Just under 50MB limit
      expect(isProcessingSafe(3500, 3572)).toBe(false); // Just over 50MB limit
    });
  });

  describe('createThumbnail', () => {
    it('should create thumbnail on web platform', async () => {
      platform.isWeb = true;
      mockImage.width = 1000;
      mockImage.height = 800;
      const dataUrl = 'data:image/jpeg;base64,test_data';

      const thumbnail = await createThumbnail(dataUrl, 150);

      expect(mockCanvas.getContext).toHaveBeenCalled();
      expect(thumbnail).toBe('data:image/jpeg;base64,mocked_canvas_data');
    });

    it('should use resizeImage on mobile platforms', async () => {
      platform.isWeb = false;
      const dataUrl = 'data:image/jpeg;base64,test_data';

      const thumbnail = await createThumbnail(dataUrl, 120);

      expect(thumbnail).toBe(dataUrl); // Mock returns input on mobile
    });

    it('should handle square crop for rectangular images', async () => {
      platform.isWeb = true;
      mockImage.width = 1200;
      mockImage.height = 800;
      const dataUrl = 'data:image/jpeg;base64,test_data';

      const mockCtx = mockCanvas.getContext();

      await createThumbnail(dataUrl, 120);

      expect(mockCtx.drawImage).toHaveBeenCalledWith(
        mockImage, 200, 0, 800, 800, 0, 0, 120, 120
      );
    });

    it('should handle thumbnail creation errors', async () => {
      platform.isWeb = true;
      const dataUrl = 'data:image/jpeg;base64,test_data';

      mockCanvas.toDataURL.mockImplementation(() => {
        throw new Error('Thumbnail error');
      });

      await expect(createThumbnail(dataUrl)).rejects.toThrow('Failed to create thumbnail');
    });

    it('should handle image load errors for thumbnails', async () => {
      platform.isWeb = true;
      const dataUrl = 'data:image/jpeg;base64,test_data';

      // Mock image load error
      const originalSrcSetter = Object.getOwnPropertyDescriptor(mockImage, 'src').set;
      Object.defineProperty(mockImage, 'src', {
        set: function(value) {
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 0);
        }
      });

      await expect(createThumbnail(dataUrl)).rejects.toThrow('Failed to load image for thumbnail');

      // Restore original setter
      Object.defineProperty(mockImage, 'src', { set: originalSrcSetter });
    });

    it('should use default size if not specified', async () => {
      platform.isWeb = true;
      mockImage.width = 500;
      mockImage.height = 500;
      const dataUrl = 'data:image/jpeg;base64,test_data';

      await createThumbnail(dataUrl); // No size specified

      const mockCtx = mockCanvas.getContext();
      expect(mockCtx.drawImage).toHaveBeenCalledWith(
        mockImage, 0, 0, 500, 500, 0, 0, 120, 120 // Default size 120
      );
    });

    it('should handle portrait images correctly', async () => {
      platform.isWeb = true;
      mockImage.width = 600;
      mockImage.height = 1000;
      const dataUrl = 'data:image/jpeg;base64,test_data';

      const mockCtx = mockCanvas.getContext();

      await createThumbnail(dataUrl, 100);

      expect(mockCtx.drawImage).toHaveBeenCalledWith(
        mockImage, 0, 200, 600, 600, 0, 0, 100, 100
      );
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty data URLs', () => {
      const result = validateImage('data:image/jpeg;base64,');

      expect(result.isValid).toBe(true); // Empty base64 is still valid format
    });

    it('should handle malformed data URLs', () => {
      const result = validateImage('data:not-an-image');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid file format');
    });

    it('should handle very small images', () => {
      const dimensions = calculateDimensions(1, 1, 800);

      expect(dimensions).toEqual({ width: 1, height: 1 });
    });

    it('should handle extreme aspect ratios', () => {
      const dimensions = calculateDimensions(10000, 10, 800);

      expect(dimensions.width).toBe(800);
      expect(dimensions.height).toBe(1); // Rounded from 0.8
    });

    it('should handle FileReader progress events', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      // Mock FileReader with progress event
      mockFileReader.readAsDataURL = function() {
        // Simulate progress
        setTimeout(() => {
          if (this.onloadend) this.onloadend();
        }, 0);
      };

      const result = await processImage(file);

      expect(result.success).toBe(true);
    });

    it('should handle network errors in fetch for blob conversion', async () => {
      platform.isWeb = true;
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const dataUrl = 'data:image/jpeg;base64,test_data';

      await expect(dataUrlToBlob(dataUrl)).rejects.toThrow('Network error');
    });
  });

  describe('memory and performance', () => {
    it('should identify memory-intensive operations', () => {
      // Test various image sizes
      expect(isProcessingSafe(1000, 1000)).toBe(true); // 4MB
      expect(isProcessingSafe(2000, 2000)).toBe(true); // 16MB
      expect(isProcessingSafe(3000, 3000)).toBe(true); // 36MB
      expect(isProcessingSafe(4000, 4000)).toBe(false); // 64MB - exceeds 50MB limit
    });

    it('should calculate accurate memory usage', () => {
      expect(estimateMemoryUsage(100, 100)).toBe(40000); // 40KB
      expect(estimateMemoryUsage(1920, 1080)).toBe(8294400); // ~8.3MB
      expect(estimateMemoryUsage(4096, 4096)).toBe(67108864); // 64MB
    });

    it('should handle canvas creation efficiently', async () => {
      platform.isWeb = true;
      const dataUrl = 'data:image/jpeg;base64,test_data';

      await resizeImage(dataUrl);

      expect(global.document.createElement).toHaveBeenCalledWith('canvas');
      expect(mockCanvas.width).toBeGreaterThan(0);
      expect(mockCanvas.height).toBeGreaterThan(0);
    });
  });
});