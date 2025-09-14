/**
 * Image processing utilities for photo upload feature
 * Handles resizing, optimization, validation, and format conversion
 */
import platform from "./platform";

// Configuration constants based on story requirements
export const IMAGE_CONFIG = {
  MAX_DIMENSION: 800,
  JPEG_QUALITY: 0.85,
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
  TARGET_SIZE: 500 * 1024, // ~500KB after processing
  ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png"],
};

/**
 * Validate image file type and size
 * @param {File|Object} file - File object or mobile image result
 * @returns {Object} Validation result with isValid and error message
 */
export const validateImage = (file) => {
  if (!file) {
    return { isValid: false, error: "No file provided" };
  }

  // Handle mobile image picker result
  if (file.type && file.fileSize) {
    if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return {
        isValid: false,
        error: "Invalid file type. Only JPG and PNG are allowed.",
      };
    }

    if (file.fileSize > IMAGE_CONFIG.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size too large. Maximum ${IMAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB allowed.`,
      };
    }

    return { isValid: true };
  }

  // Handle web File object
  if (file.type) {
    if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return {
        isValid: false,
        error: "Invalid file type. Only JPG and PNG are allowed.",
      };
    }

    if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size too large. Maximum ${IMAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB allowed.`,
      };
    }

    return { isValid: true };
  }

  // Handle base64 data URLs
  if (typeof file === "string" && file.startsWith("data:image/")) {
    const base64Data = file.split(",")[1];
    const sizeInBytes = (base64Data.length * 3) / 4;

    if (sizeInBytes > IMAGE_CONFIG.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size too large. Maximum ${IMAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB allowed.`,
      };
    }

    return { isValid: true };
  }

  return { isValid: false, error: "Invalid file format" };
};

/**
 * Create a canvas element (web only)
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {HTMLCanvasElement} Canvas element
 */
const createCanvas = (width, height) => {
  if (!platform.isWeb) {
    throw new Error("Canvas operations only supported on web");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

/**
 * Calculate new dimensions maintaining aspect ratio
 * @param {number} width - Original width
 * @param {number} height - Original height
 * @param {number} maxDimension - Maximum allowed dimension
 * @returns {Object} New dimensions {width, height}
 */
export const calculateDimensions = (
  width,
  height,
  maxDimension = IMAGE_CONFIG.MAX_DIMENSION,
) => {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  const aspectRatio = width / height;

  if (width > height) {
    return {
      width: maxDimension,
      height: Math.round(maxDimension / aspectRatio),
    };
  } else {
    return {
      width: Math.round(maxDimension * aspectRatio),
      height: maxDimension,
    };
  }
};

/**
 * Resize image maintaining aspect ratio (web only)
 * @param {string} dataUrl - Image data URL
 * @param {number} maxDimension - Maximum dimension
 * @returns {Promise<string>} Resized image data URL
 */
export const resizeImage = (
  dataUrl,
  maxDimension = IMAGE_CONFIG.MAX_DIMENSION,
) => {
  return new Promise((resolve, reject) => {
    if (!platform.isWeb) {
      // On mobile, react-native-image-picker handles resizing
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        const { width: newWidth, height: newHeight } = calculateDimensions(
          img.width,
          img.height,
          maxDimension,
        );

        // If image is already small enough, return as-is
        if (newWidth === img.width && newHeight === img.height) {
          resolve(dataUrl);
          return;
        }

        const canvas = createCanvas(newWidth, newHeight);
        const ctx = canvas.getContext("2d");

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw resized image
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Convert to JPEG with quality optimization
        const quality = dataUrl.toLowerCase().includes("png")
          ? 0.9
          : IMAGE_CONFIG.JPEG_QUALITY;
        const resizedDataUrl = canvas.toDataURL("image/jpeg", quality);

        resolve(resizedDataUrl);
      } catch (error) {
        reject(new Error(`Failed to resize image: ${error.message}`));
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = dataUrl;
  });
};

/**
 * Process image: validate, resize, and optimize
 * @param {File|string|Object} imageInput - File, data URL, or mobile picker result
 * @returns {Promise<Object>} Processed image result
 */
export const processImage = async (imageInput) => {
  try {
    // Validate input
    const validation = validateImage(imageInput);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    let dataUrl;
    let originalSize = 0;

    // Convert to data URL if needed
    if (typeof imageInput === "string") {
      dataUrl = imageInput;
      // Estimate size from base64
      if (imageInput.includes(",")) {
        const base64Data = imageInput.split(",")[1];
        originalSize = (base64Data.length * 3) / 4;
      }
    } else if (imageInput.base64) {
      // Mobile picker result with base64
      dataUrl = `data:${imageInput.type};base64,${imageInput.base64}`;
      originalSize = imageInput.fileSize || 0;
    } else if (imageInput instanceof File) {
      // Web File object
      originalSize = imageInput.size;
      dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(imageInput);
      });
    } else {
      throw new Error("Invalid image input format");
    }

    // Resize image
    const resizedDataUrl = await resizeImage(dataUrl);

    // Calculate final size
    const finalSize = resizedDataUrl.includes(",")
      ? (resizedDataUrl.split(",")[1].length * 3) / 4
      : 0;

    return {
      dataUrl: resizedDataUrl,
      originalSize,
      processedSize: finalSize,
      compressionRatio: originalSize > 0 ? finalSize / originalSize : 0,
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Convert data URL to blob (web only)
 * @param {string} dataUrl - Image data URL
 * @returns {Promise<Blob>} Image blob
 */
export const dataUrlToBlob = async (dataUrl) => {
  if (!platform.isWeb) {
    throw new Error("Blob conversion only supported on web");
  }

  const response = await fetch(dataUrl);
  return response.blob();
};

/**
 * Get image dimensions from data URL
 * @param {string} dataUrl - Image data URL
 * @returns {Promise<Object>} Image dimensions {width, height}
 */
export const getImageDimensions = (dataUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    img.src = dataUrl;
  });
};

/**
 * Estimate memory usage for image processing
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {number} Estimated memory usage in bytes
 */
export const estimateMemoryUsage = (width, height) => {
  // 4 bytes per pixel (RGBA) for canvas operations
  return width * height * 4;
};

/**
 * Check if image processing is memory safe
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {boolean} True if safe to process
 */
export const isProcessingSafe = (width, height) => {
  const memoryUsage = estimateMemoryUsage(width, height);
  const MAX_SAFE_MEMORY = 50 * 1024 * 1024; // 50MB as specified in requirements
  return memoryUsage <= MAX_SAFE_MEMORY;
};

/**
 * Create optimized thumbnail
 * @param {string} dataUrl - Image data URL
 * @param {number} size - Thumbnail size (square)
 * @returns {Promise<string>} Thumbnail data URL
 */
export const createThumbnail = async (dataUrl, size = 120) => {
  if (!platform.isWeb) {
    // On mobile, just resize normally
    return resizeImage(dataUrl, size);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext("2d");

        // Calculate crop dimensions for center crop
        const minDim = Math.min(img.width, img.height);
        const cropX = (img.width - minDim) / 2;
        const cropY = (img.height - minDim) / 2;

        // Enable image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw cropped and resized image
        ctx.drawImage(img, cropX, cropY, minDim, minDim, 0, 0, size, size);

        const thumbnailDataUrl = canvas.toDataURL("image/jpeg", 0.8);
        resolve(thumbnailDataUrl);
      } catch (error) {
        reject(new Error(`Failed to create thumbnail: ${error.message}`));
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image for thumbnail"));
    };

    img.src = dataUrl;
  });
};

export default {
  validateImage,
  calculateDimensions,
  resizeImage,
  processImage,
  dataUrlToBlob,
  getImageDimensions,
  estimateMemoryUsage,
  isProcessingSafe,
  createThumbnail,
  IMAGE_CONFIG,
};
