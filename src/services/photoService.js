/**
 * PhotoService - Handles photo processing, encryption, and decryption
 * Integrates with ManyllaEncryptionService for zero-knowledge photo storage
 */
import manyllaEncryptionService from './sync/manyllaEncryptionService';
import { processImage, validateImage, createThumbnail, IMAGE_CONFIG } from '../utils/imageUtils';

// Photo-specific configuration
const PHOTO_CONFIG = {
  THUMBNAIL_SIZE: 120,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds
  MAX_CONCURRENT_OPERATIONS: 3
};

class PhotoService {
  constructor() {
    this.decryptionCache = new Map();
    this.activeOperations = 0;
    this.operationQueue = [];
  }

  /**
   * Process and encrypt a photo for storage
   * @param {File|string|Object} imageInput - Raw image input
   * @returns {Promise<Object>} Encrypted photo result
   */
  async processAndEncryptPhoto(imageInput) {
    try {
      this.activeOperations++;

      // Validate encryption service is initialized
      if (!manyllaEncryptionService.isInitialized()) {
        throw new Error('Encryption service not initialized');
      }

      // Process the image (resize, optimize)
      const processResult = await processImage(imageInput);
      if (!processResult.success) {
        throw new Error(processResult.error);
      }

      // Create thumbnail for UI performance
      const thumbnail = await createThumbnail(processResult.dataUrl, PHOTO_CONFIG.THUMBNAIL_SIZE);

      // Encrypt both full image and thumbnail
      const encryptedPhoto = await this.encryptPhotoData(processResult.dataUrl);
      const encryptedThumbnail = await this.encryptPhotoData(thumbnail);

      return {
        success: true,
        encrypted: encryptedPhoto,
        encryptedThumbnail: encryptedThumbnail,
        metadata: {
          originalSize: processResult.originalSize,
          processedSize: processResult.processedSize,
          compressionRatio: processResult.compressionRatio,
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    } finally {
      this.activeOperations--;
      this.processQueue();
    }
  }

  /**
   * Encrypt photo data using the encryption service
   * @param {string} photoDataUrl - Photo data URL
   * @returns {Promise<string>} Encrypted photo string
   */
  async encryptPhotoData(photoDataUrl) {
    if (!manyllaEncryptionService.isInitialized()) {
      throw new Error('Encryption service not initialized');
    }

    // Create photo data object
    const photoData = {
      dataUrl: photoDataUrl,
      timestamp: new Date().toISOString(),
      type: 'photo'
    };

    // Encrypt using the existing encryption service
    return manyllaEncryptionService.encryptData(photoData);
  }

  /**
   * Decrypt and return photo data URL
   * @param {string} encryptedPhoto - Encrypted photo string
   * @param {boolean} useCache - Whether to use decryption cache
   * @returns {Promise<string>} Decrypted photo data URL
   */
  async decryptPhoto(encryptedPhoto, useCache = true) {
    try {
      if (!encryptedPhoto) {
        return null;
      }

      if (!manyllaEncryptionService.isInitialized()) {
        throw new Error('Encryption service not initialized');
      }

      // Check cache first
      const cacheKey = this.getCacheKey(encryptedPhoto);
      if (useCache && this.decryptionCache.has(cacheKey)) {
        const cached = this.decryptionCache.get(cacheKey);

        // Check if cache entry is still valid
        if (Date.now() - cached.timestamp < PHOTO_CONFIG.CACHE_DURATION) {
          return cached.dataUrl;
        } else {
          // Remove expired cache entry
          this.decryptionCache.delete(cacheKey);
        }
      }

      // Decrypt photo data
      const photoData = manyllaEncryptionService.decryptData(encryptedPhoto);

      if (!photoData || !photoData.dataUrl) {
        throw new Error('Invalid photo data after decryption');
      }

      // Cache the decrypted data URL
      if (useCache) {
        this.decryptionCache.set(cacheKey, {
          dataUrl: photoData.dataUrl,
          timestamp: Date.now()
        });
      }

      return photoData.dataUrl;
    } catch (error) {
      console.warn('Photo decryption failed:', error.message);
      return null;
    }
  }

  /**
   * Validate and prepare photo for upload
   * @param {File|string|Object} imageInput - Raw image input
   * @returns {Object} Validation result
   */
  validatePhoto(imageInput) {
    return validateImage(imageInput);
  }

  /**
   * Get estimated processing time for an image
   * @param {number} fileSize - File size in bytes
   * @returns {number} Estimated processing time in milliseconds
   */
  getEstimatedProcessingTime(fileSize) {
    // Base processing time: 500ms
    // Additional time based on file size: 1ms per KB
    const baseTime = 500;
    const sizeTime = (fileSize / 1024) * 1;
    return Math.min(baseTime + sizeTime, 3000); // Cap at 3 seconds
  }

  /**
   * Check if photo processing is safe given current system load
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {boolean} True if safe to process
   */
  canProcessPhoto(width, height) {
    // Check memory safety
    const memoryUsage = width * height * 4; // 4 bytes per pixel
    const maxMemory = 50 * 1024 * 1024; // 50MB limit

    // Check concurrent operations
    const maxConcurrent = PHOTO_CONFIG.MAX_CONCURRENT_OPERATIONS;

    return memoryUsage <= maxMemory && this.activeOperations < maxConcurrent;
  }

  /**
   * Queue a photo operation if system is busy
   * @param {Function} operation - Operation to queue
   * @returns {Promise} Operation promise
   */
  queueOperation(operation) {
    return new Promise((resolve, reject) => {
      this.operationQueue.push({ operation, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Process queued operations
   */
  processQueue() {
    while (this.operationQueue.length > 0 && this.activeOperations < PHOTO_CONFIG.MAX_CONCURRENT_OPERATIONS) {
      const { operation, resolve, reject } = this.operationQueue.shift();

      operation()
        .then(resolve)
        .catch(reject);
    }
  }

  /**
   * Generate cache key for encrypted photo
   * @param {string} encryptedPhoto - Encrypted photo string
   * @returns {string} Cache key
   */
  getCacheKey(encryptedPhoto) {
    // Use first 32 characters as cache key (should be unique enough)
    return encryptedPhoto.substring(0, 32);
  }

  /**
   * Clear decryption cache
   * @param {string} [specificKey] - Clear specific key or all if not provided
   */
  clearCache(specificKey = null) {
    if (specificKey) {
      this.decryptionCache.delete(specificKey);
    } else {
      this.decryptionCache.clear();
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    const totalEntries = this.decryptionCache.size;
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [key, cached] of this.decryptionCache.entries()) {
      if (Date.now() - cached.timestamp < PHOTO_CONFIG.CACHE_DURATION) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries,
      validEntries,
      expiredEntries,
      activeOperations: this.activeOperations,
      queuedOperations: this.operationQueue.length
    };
  }

  /**
   * Clean expired cache entries
   */
  cleanExpiredCache() {
    const now = Date.now();
    for (const [key, cached] of this.decryptionCache.entries()) {
      if (now - cached.timestamp >= PHOTO_CONFIG.CACHE_DURATION) {
        this.decryptionCache.delete(key);
      }
    }
  }

  /**
   * Migrate legacy photo format (if needed)
   * @param {string} legacyPhoto - Legacy photo data
   * @returns {Promise<Object>} Migration result
   */
  async migrateLegacyPhoto(legacyPhoto) {
    try {
      // If it's already a data URL, encrypt it
      if (typeof legacyPhoto === 'string' && legacyPhoto.startsWith('data:image/')) {
        return await this.processAndEncryptPhoto(legacyPhoto);
      }

      // If it's a URL, we can't migrate it automatically
      if (typeof legacyPhoto === 'string' && (legacyPhoto.startsWith('http') || legacyPhoto.startsWith('/'))) {
        return {
          success: false,
          error: 'Cannot migrate URL-based photos automatically',
          requiresManualMigration: true,
          legacyUrl: legacyPhoto
        };
      }

      return {
        success: false,
        error: 'Unknown legacy photo format'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if a photo is encrypted (vs legacy format)
   * @param {string} photoData - Photo data to check
   * @returns {boolean} True if encrypted
   */
  isPhotoEncrypted(photoData) {
    if (!photoData || typeof photoData !== 'string') {
      return false;
    }

    // Encrypted photos are base64 encoded and don't start with data: or http:
    return !photoData.startsWith('data:') &&
           !photoData.startsWith('http') &&
           !photoData.startsWith('/') &&
           photoData.length > 50; // Encrypted data should be reasonably long
  }

  /**
   * Get photo storage statistics
   * @param {Array} profiles - Array of profiles to analyze
   * @returns {Object} Storage statistics
   */
  getStorageStats(profiles) {
    let totalPhotos = 0;
    let encryptedPhotos = 0;
    let legacyPhotos = 0;
    let estimatedSize = 0;

    for (const profile of profiles) {
      if (profile.photo) {
        totalPhotos++;

        if (this.isPhotoEncrypted(profile.photo)) {
          encryptedPhotos++;
          // Estimate size from base64 length
          estimatedSize += (profile.photo.length * 3) / 4;
        } else {
          legacyPhotos++;
        }
      }
    }

    return {
      totalPhotos,
      encryptedPhotos,
      legacyPhotos,
      estimatedSize,
      encryptionPercentage: totalPhotos > 0 ? (encryptedPhotos / totalPhotos) * 100 : 0
    };
  }
}

// Create and export singleton instance
const photoService = new PhotoService();

// Set up periodic cache cleanup
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    photoService.cleanExpiredCache();
  }, PHOTO_CONFIG.CACHE_DURATION);
}

export default photoService;
export { PHOTO_CONFIG };