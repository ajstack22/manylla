/**
 * ImagePicker - Cross-platform image selection component
 * Supports web file picker, mobile camera, and gallery access
 */
import React from 'react';
import { Alert, Platform } from 'react-native';
import { validateImage, IMAGE_CONFIG } from '../../utils/imageUtils';
import platform from '../../utils/platform';

// Mobile image picker availability check
let mobileImagePicker = null;
const getMobileImagePicker = () => {
  if (platform.isWeb) {
    return null;
  }

  // Only try to load on mobile platforms and only once
  if (mobileImagePicker === null && !platform.isWeb) {
    try {
      // Safe conditional import for mobile only
      mobileImagePicker = require('react-native-image-picker');
    } catch (error) {
      console.warn('react-native-image-picker not available:', error);
      mobileImagePicker = false; // Mark as unavailable
    }
  }

  return mobileImagePicker || null;
};

// Image picker configuration
const PICKER_CONFIG = {
  web: {
    accept: IMAGE_CONFIG.ALLOWED_TYPES.join(','),
    multiple: false
  },
  mobile: {
    mediaType: 'photo',
    includeBase64: true,
    maxHeight: IMAGE_CONFIG.MAX_DIMENSION * 2, // Give some headroom for processing
    maxWidth: IMAGE_CONFIG.MAX_DIMENSION * 2,
    quality: 0.9, // High quality for initial capture
    storageOptions: {
      skipBackup: true,
      path: 'images'
    }
  }
};

/**
 * ImagePicker utility class for cross-platform image selection
 */
export class ImagePicker {
  /**
   * Select image from file system (web) or gallery (mobile)
   * @param {Object} options - Selection options
   * @returns {Promise<Object>} Selected image result
   */
  static selectImage(options = {}) {
    if (platform.isWeb) {
      return ImagePicker._selectImageWeb(options);
    } else {
      return ImagePicker._selectImageMobile('gallery', options);
    }
  }

  /**
   * Capture photo using camera (mobile only)
   * @param {Object} options - Capture options
   * @returns {Promise<Object>} Captured image result
   */
  static capturePhoto(options = {}) {
    if (!platform.isMobile) {
      return Promise.reject(new Error('Camera capture only available on mobile devices'));
    }

    return ImagePicker._selectImageMobile('camera', options);
  }

  /**
   * Show selection dialog (mobile) or file picker (web)
   * @param {Object} options - Selection options
   * @returns {Promise<Object>} Selected image result
   */
  static showImagePicker(options = {}) {
    if (platform.isWeb) {
      return ImagePicker._selectImageWeb(options);
    } else {
      return ImagePicker._showMobileDialog(options);
    }
  }

  /**
   * Web file picker implementation
   * @private
   */
  static _selectImageWeb(options) {
    return new Promise((resolve, reject) => {
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = options.accept || PICKER_CONFIG.web.accept;
        input.multiple = options.multiple || PICKER_CONFIG.web.multiple;

        input.onchange = (event) => {
          const file = event.target.files[0];

          if (!file) {
            resolve({ cancelled: true });
            return;
          }

          // Validate file
          const validation = validateImage(file);
          if (!validation.isValid) {
            reject(new Error(validation.error));
            return;
          }

          // Read file as data URL
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              cancelled: false,
              dataUrl: reader.result,
              file: file,
              type: file.type,
              size: file.size,
              name: file.name,
              source: 'web-file-picker'
            });
          };

          reader.onerror = () => {
            reject(new Error('Failed to read selected file'));
          };

          reader.readAsDataURL(file);
        };

        input.oncancel = () => {
          resolve({ cancelled: true });
        };

        // Trigger file picker
        input.click();
      } catch (error) {
        reject(new Error(`Web image picker error: ${error.message}`));
      }
    });
  }

  /**
   * Mobile image selection implementation
   * @private
   */
  static _selectImageMobile(source, options) {
    const picker = getMobileImagePicker();

    if (!picker) {
      return Promise.reject(new Error('Image picker not available on this platform'));
    }

    return new Promise((resolve, reject) => {
      const pickerOptions = {
        ...PICKER_CONFIG.mobile,
        ...options
      };

      const callback = (response) => {
        if (response.didCancel) {
          resolve({ cancelled: true });
          return;
        }

        if (response.errorCode || response.errorMessage) {
          reject(new Error(response.errorMessage || 'Image selection failed'));
          return;
        }

        const asset = response.assets && response.assets[0];
        if (!asset) {
          reject(new Error('No image selected'));
          return;
        }

        // Validate selected image
        const validation = validateImage({
          type: asset.type,
          fileSize: asset.fileSize
        });

        if (!validation.isValid) {
          reject(new Error(validation.error));
          return;
        }

        // Return standardized result
        resolve({
          cancelled: false,
          dataUrl: `data:${asset.type};base64,${asset.base64}`,
          uri: asset.uri,
          type: asset.type,
          size: asset.fileSize,
          width: asset.width,
          height: asset.height,
          fileName: asset.fileName,
          source: source,
          base64: asset.base64
        });
      };

      try {
        if (source === 'camera') {
          picker.launchCamera(pickerOptions, callback);
        } else {
          picker.launchImageLibrary(pickerOptions, callback);
        }
      } catch (error) {
        reject(new Error(`Mobile image picker error: ${error.message}`));
      }
    });
  }

  /**
   * Show mobile selection dialog
   * @private
   */
  static _showMobileDialog(options) {
    return new Promise((resolve, reject) => {
      Alert.alert(
        'Select Photo',
        'Choose how you want to select an image',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve({ cancelled: true })
          },
          {
            text: 'Take Photo',
            onPress: () => {
              ImagePicker._selectImageMobile('camera', options)
                .then(resolve)
                .catch(reject);
            }
          },
          {
            text: 'Choose from Gallery',
            onPress: () => {
              ImagePicker._selectImageMobile('gallery', options)
                .then(resolve)
                .catch(reject);
            }
          }
        ],
        { cancelable: true, onDismiss: () => resolve({ cancelled: true }) }
      );
    });
  }

  /**
   * Check if camera is available
   * @returns {boolean} True if camera is available
   */
  static isCameraAvailable() {
    if (!platform.isMobile) {
      return false;
    }

    // On mobile, assume camera is available (react-native-image-picker will handle permissions)
    return true;
  }

  /**
   * Check if gallery/file picker is available
   * @returns {boolean} True if gallery is available
   */
  static isGalleryAvailable() {
    return true; // Available on all platforms
  }

  /**
   * Request camera permissions (mobile only)
   * @returns {Promise<boolean>} Permission granted status
   */
  static async requestCameraPermission() {
    if (!platform.isMobile) {
      return false;
    }

    try {
      // react-native-image-picker handles permissions automatically
      return true;
    } catch (error) {
      console.warn('Camera permission request failed:', error);
      return false;
    }
  }

  /**
   * Request gallery permissions (mobile only)
   * @returns {Promise<boolean>} Permission granted status
   */
  static async requestGalleryPermission() {
    if (!platform.isMobile) {
      return true; // Web doesn't need explicit permissions
    }

    try {
      // react-native-image-picker handles permissions automatically
      return true;
    } catch (error) {
      console.warn('Gallery permission request failed:', error);
      return false;
    }
  }

  /**
   * Get available picker options for current platform
   * @returns {Object} Available options
   */
  static getAvailableOptions() {
    return {
      platform: Platform.OS,
      canSelectFromGallery: ImagePicker.isGalleryAvailable(),
      canTakePhoto: ImagePicker.isCameraAvailable(),
      supportsDragDrop: platform.isWeb,
      supportsMultipleSelection: platform.isWeb,
      maxFileSize: IMAGE_CONFIG.MAX_FILE_SIZE,
      allowedTypes: IMAGE_CONFIG.ALLOWED_TYPES,
      allowedExtensions: IMAGE_CONFIG.ALLOWED_EXTENSIONS
    };
  }

  /**
   * Validate image picker result
   * @param {Object} result - Picker result to validate
   * @returns {Object} Validation result
   */
  static validateResult(result) {
    if (!result || result.cancelled) {
      return { isValid: false, error: 'No image selected' };
    }

    if (!result.dataUrl && !result.uri) {
      return { isValid: false, error: 'Invalid image result' };
    }

    // Validate file size if available
    if (result.size && result.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File too large: ${(result.size / 1024 / 1024).toFixed(1)}MB (max ${IMAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB)`
      };
    }

    // Validate file type if available
    if (result.type && !IMAGE_CONFIG.ALLOWED_TYPES.includes(result.type.toLowerCase())) {
      return {
        isValid: false,
        error: `Unsupported file type: ${result.type}`
      };
    }

    return { isValid: true };
  }

  /**
   * Create a standardized error message for picker failures
   * @param {Error} error - The error that occurred
   * @param {string} operation - The operation that failed
   * @returns {string} User-friendly error message
   */
  static getErrorMessage(error, operation = 'select image') {
    const message = error.message || 'Unknown error';

    // Common error patterns and user-friendly messages
    if (message.includes('permission')) {
      return 'Permission denied. Please grant access to camera/photos in settings.';
    }

    if (message.includes('cancelled') || message.includes('canceled')) {
      return 'Operation was cancelled.';
    }

    if (message.includes('size')) {
      return 'The selected image is too large. Please choose a smaller image.';
    }

    if (message.includes('type') || message.includes('format')) {
      return 'Invalid image format. Please select a JPG or PNG image.';
    }

    if (message.includes('camera')) {
      return 'Camera is not available. Please try selecting from gallery instead.';
    }

    // Generic fallback
    return `Failed to ${operation}: ${message}`;
  }
}

export default ImagePicker;