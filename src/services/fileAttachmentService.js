/**
 * FileAttachmentService - Handles file upload, download, and management
 * Integrates with backend API and ChunkedEncryptionService
 * Implements zero-knowledge file attachments with chunked upload/download
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import chunkedEncryptionService from './ChunkedEncryptionService';
import manyllaEncryptionService from './sync/manyllaEncryptionService';
import { v4 as uuidv4 } from 'uuid';

// API configuration
const API_BASE_URL = 'https://manylla.com/qual/api';

// Service configuration
const FILE_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks
  MAX_CONCURRENT_UPLOADS: 3,
  USER_QUOTA: 500 * 1024 * 1024, // 500MB per user
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  SUPPORTED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/heic',
    'image/heif'
  ]
};

/**
 * FileAttachmentService class
 * Main service for file attachment operations
 */
class FileAttachmentService {
  constructor() {
    this.uploadQueue = [];
    this.downloadCache = new Map();
    this.activeUploads = new Map();
    this.activeDownloads = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Upload a file with encryption and chunking
   * @param {Object} file - File object with uri, name, size, type properties
   * @param {string} syncId - Sync ID for the user
   * @param {Function} progressCallback - Progress callback
   * @returns {Promise<Object>} File metadata object
   */
  async uploadFile(file, syncId, progressCallback) {
    try {
      // Generate unique file ID
      const fileId = uuidv4();

      // Validate file
      await this.validateFile(file);

      // Pre-validate with server (check quota)
      await this.preValidateUpload(syncId, file.size);

      // Calculate file hash for deduplication
      const fileHash = await chunkedEncryptionService.calculateFileHash(file);

      // Create attachment metadata
      const metadata = await this.createAttachmentMetadata(file, fileId, fileHash);

      // Upload file with chunking and encryption
      await this.uploadFileChunked(file, syncId, fileId, metadata, progressCallback);

      // Clear any cached data for this sync ID
      this.clearCacheForSyncId(syncId);

      return metadata;
    } catch (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Download and decrypt a file
   * @param {string} fileId - File ID
   * @param {string} syncId - Sync ID
   * @param {Function} progressCallback - Progress callback
   * @returns {Promise<Blob|string>} File blob or data URI
   */
  async downloadFile(fileId, syncId, progressCallback) {
    try {
      // Check cache first
      const cacheKey = `${syncId}_${fileId}`;
      const cached = this.downloadCache.get(cacheKey);

      if (cached && cached.timestamp > Date.now() - this.cacheTimeout) {
        return cached.data;
      }

      // Track active download
      this.activeDownloads.set(fileId, true);

      // Download file from server
      const encryptedChunks = await this.downloadFileChunked(fileId, syncId, progressCallback);

      // Get file metadata for size info
      const metadata = await this.getFileMetadata(fileId, syncId);

      // Decrypt chunks
      const decryptedChunks = [];
      const decryptGenerator = chunkedEncryptionService.decryptFileStreaming(
        encryptedChunks,
        metadata.size,
        progressCallback
      );

      for await (const chunk of decryptGenerator) {
        decryptedChunks.push(chunk);
      }

      // Combine chunks into blob
      const fileBlob = new Blob(decryptedChunks, { type: metadata.mimeType });

      // Cache the result
      this.downloadCache.set(cacheKey, {
        data: fileBlob,
        timestamp: Date.now()
      });

      // Clear active download
      this.activeDownloads.delete(fileId);

      return fileBlob;
    } catch (error) {
      this.activeDownloads.delete(fileId);
      throw new Error(`File download failed: ${error.message}`);
    }
  }

  /**
   * Delete a file (mark as deleted, don't immediately remove)
   * @param {string} fileId - File ID
   * @param {string} syncId - Sync ID
   * @returns {Promise<void>}
   */
  async deleteFile(fileId, syncId) {
    try {
      const response = await fetch(`${API_BASE_URL}/file_delete.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file_id: fileId,
          sync_id: syncId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Delete failed');
      }

      // Clear from cache
      const cacheKey = `${syncId}_${fileId}`;
      this.downloadCache.delete(cacheKey);

      return true;
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Validate file before upload
   * @param {Object} file - File object
   * @private
   */
  async validateFile(file) {
    // Check file size
    if (file.size > FILE_CONFIG.MAX_FILE_SIZE) {
      throw new Error(`File exceeds maximum size of ${FILE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // Check file type
    const isSupported = FILE_CONFIG.SUPPORTED_TYPES.some(type => {
      if (file.type) {
        return file.type === type || file.type.startsWith(type.split('/')[0] + '/');
      }
      // Fallback: check extension
      const ext = file.name?.split('.').pop()?.toLowerCase();
      return this.getTypeFromExtension(ext) === type;
    });

    if (!isSupported) {
      throw new Error('File type not supported');
    }

    // Additional validation can be added here (magic bytes, etc.)
    return true;
  }

  /**
   * Pre-validate upload with server (check quota)
   * @param {string} syncId - Sync ID
   * @param {number} fileSize - File size in bytes
   * @private
   */
  async preValidateUpload(syncId, fileSize) {
    try {
      const response = await fetch(`${API_BASE_URL}/file_validate.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sync_id: syncId,
          file_size: fileSize
        })
      });

      const result = await response.json();

      if (!result.allowed) {
        if (result.reason === 'quota_exceeded') {
          throw new Error(`Storage quota exceeded. Used: ${this.formatBytes(result.quota_used)} of ${this.formatBytes(result.quota_total)}`);
        }
        throw new Error(result.reason || 'Upload not allowed');
      }

      return result;
    } catch (error) {
      throw new Error(`Validation failed: ${error.message}`);
    }
  }

  /**
   * Upload file in chunks
   * @param {Object} file - File object
   * @param {string} syncId - Sync ID
   * @param {string} fileId - Unique file ID
   * @param {Object} metadata - File metadata
   * @param {Function} progressCallback - Progress callback
   * @private
   */
  async uploadFileChunked(file, syncId, fileId, metadata, progressCallback) {
    const totalChunks = Math.ceil(file.size / FILE_CONFIG.CHUNK_SIZE);

    // Check for resume capability
    const uploadState = await chunkedEncryptionService.getUploadState(fileId);
    const startChunk = uploadState?.lastChunkIndex + 1 || 0;

    if (startChunk > 0 && progressCallback) {
      progressCallback({
        step: 'resuming',
        message: `Resuming upload from chunk ${startChunk}/${totalChunks}`
      });
    }

    // Upload chunk function
    const uploadChunk = async (encryptedChunk, chunkIndex, totalChunks) => {
      const formData = new FormData();
      formData.append('sync_id', syncId);
      formData.append('file_id', fileId);
      formData.append('chunk_index', chunkIndex);
      formData.append('total_chunks', totalChunks);
      formData.append('chunk_data', encryptedChunk.data);
      formData.append('chunk_nonce', encryptedChunk.nonce);

      if (chunkIndex === 0) {
        // Include metadata with first chunk
        formData.append('encrypted_metadata', metadata.encryptedMeta);
        formData.append('file_hash', metadata.fileHash);
        formData.append('file_size', file.size);
      }

      const response = await fetch(`${API_BASE_URL}/file_upload.php`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Upload failed for chunk ${chunkIndex}`);
      }

      return response.json();
    };

    // Use ChunkedEncryptionService for resumable upload
    await chunkedEncryptionService.uploadFileWithResume(
      file,
      fileId,
      uploadChunk,
      progressCallback
    );
  }

  /**
   * Download file in chunks
   * @param {string} fileId - File ID
   * @param {string} syncId - Sync ID
   * @param {Function} progressCallback - Progress callback
   * @returns {AsyncGenerator} Async generator yielding encrypted chunks
   * @private
   */
  async* downloadFileChunked(fileId, syncId, progressCallback) {
    // First, get file info to know total chunks
    const fileInfo = await this.getFileMetadata(fileId, syncId);
    const totalChunks = Math.ceil(fileInfo.size / FILE_CONFIG.CHUNK_SIZE);

    // Download chunks
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const response = await fetch(`${API_BASE_URL}/file_download.php?` + new URLSearchParams({
        sync_id: syncId,
        file_id: fileId,
        chunk_index: chunkIndex
      }));

      if (!response.ok) {
        throw new Error(`Failed to download chunk ${chunkIndex}`);
      }

      const chunkData = await response.json();

      // Report progress
      if (progressCallback) {
        progressCallback({
          step: 'downloading',
          current: chunkIndex + 1,
          total: totalChunks,
          percent: Math.round(((chunkIndex + 1) / totalChunks) * 100)
        });
      }

      yield chunkData;
    }
  }

  /**
   * Get file metadata from server
   * @param {string} fileId - File ID
   * @param {string} syncId - Sync ID
   * @returns {Promise<Object>} File metadata
   * @private
   */
  async getFileMetadata(fileId, syncId) {
    const response = await fetch(`${API_BASE_URL}/file_info.php?` + new URLSearchParams({
      sync_id: syncId,
      file_id: fileId
    }));

    if (!response.ok) {
      throw new Error('Failed to get file metadata');
    }

    const metadata = await response.json();

    // Decrypt the encrypted metadata
    if (metadata.encryptedMeta) {
      const decryptedMeta = await manyllaEncryptionService.decryptData(metadata.encryptedMeta);
      return {
        ...metadata,
        ...decryptedMeta
      };
    }

    return metadata;
  }

  /**
   * Create attachment metadata
   * @param {Object} file - File object
   * @param {string} fileId - Unique file ID
   * @param {string} fileHash - File hash
   * @returns {Promise<Object>} Attachment metadata
   * @private
   */
  async createAttachmentMetadata(file, fileId, fileHash) {
    const metadata = {
      originalFilename: file.name,
      mimeType: file.type || this.getTypeFromExtension(file.name),
      uploadDate: new Date().toISOString(),
      size: file.size
    };

    // Encrypt metadata
    const encryptedMeta = await manyllaEncryptionService.encryptData(metadata);

    return {
      id: fileId,
      fileHash,
      size: file.size,
      encryptedMeta,
      uploadDate: metadata.uploadDate,
      version: 1
    };
  }

  /**
   * Select file from device
   * Platform-specific implementation
   * @returns {Promise<Object>} Selected file object
   */
  async selectFile() {
    if (Platform.OS === 'web') {
      return this.selectFileWeb();
    } else if (Platform.OS === 'ios') {
      return this.selectFileIOS();
    } else if (Platform.OS === 'android') {
      return this.selectFileAndroid();
    } else {
      throw new Error('Platform not supported');
    }
  }

  /**
   * Select file on web platform
   * @private
   */
  async selectFileWeb() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = FILE_CONFIG.SUPPORTED_TYPES.join(',');

      input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        resolve({
          uri: file,
          name: file.name,
          size: file.size,
          type: file.type
        });
      };

      input.click();
    });
  }

  /**
   * Select file on iOS
   * @private
   */
  async selectFileIOS() {
    try {
      const DocumentPicker = require('react-native-document-picker').default;

      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.images,
          DocumentPicker.types.plainText,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx
        ],
        copyTo: 'documentDirectory', // Copy to app storage for access
        mode: 'import'
      });

      // Handle single selection (not multi)
      const file = Array.isArray(result) ? result[0] : result;

      return {
        uri: file.fileCopyUri || file.uri,
        name: file.name,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        throw new Error('File selection cancelled');
      }
      throw error;
    }
  }

  /**
   * Select file on Android
   * @private
   */
  async selectFileAndroid() {
    try {
      const DocumentPicker = require('react-native-document-picker').default;
      const { PermissionsAndroid } = require('react-native');

      // Request storage permission for Android
      if (Platform.Version >= 23) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'Manylla needs access to your storage to attach files',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel'
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error('Storage permission denied');
        }
      }

      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory' // Copy to cache for access
      });

      const file = Array.isArray(result) ? result[0] : result;

      return {
        uri: file.fileCopyUri || file.uri,
        name: file.name,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      const DocumentPicker = require('react-native-document-picker').default;
      if (DocumentPicker.isCancel(error)) {
        throw new Error('File selection cancelled');
      }
      throw error;
    }
  }

  /**
   * Get MIME type from file extension
   * @param {string} extension - File extension
   * @returns {string} MIME type
   * @private
   */
  getTypeFromExtension(extension) {
    const types = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      heic: 'image/heic',
      heif: 'image/heif'
    };

    return types[extension?.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Format bytes to human readable string
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string
   * @private
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Clear download cache for a sync ID
   * @param {string} syncId - Sync ID
   * @private
   */
  clearCacheForSyncId(syncId) {
    for (const [key, _] of this.downloadCache) {
      if (key.startsWith(syncId)) {
        this.downloadCache.delete(key);
      }
    }
  }

  /**
   * Queue a file for upload
   * Used for retry mechanism
   * @param {Object} file - File object
   * @param {string} syncId - Sync ID
   * @returns {Promise<Object>} Upload promise
   */
  async queueFileUpload(file, syncId) {
    return new Promise((resolve, reject) => {
      this.uploadQueue.push({
        file,
        syncId,
        resolve,
        reject,
        retries: 0
      });

      this.processUploadQueue();
    });
  }

  /**
   * Process upload queue
   * @private
   */
  async processUploadQueue() {
    while (this.uploadQueue.length > 0 && this.activeUploads.size < FILE_CONFIG.MAX_CONCURRENT_UPLOADS) {
      const upload = this.uploadQueue.shift();
      if (!upload) break;

      const uploadId = uuidv4();
      this.activeUploads.set(uploadId, upload);

      try {
        const result = await this.uploadFile(upload.file, upload.syncId);
        upload.resolve(result);
        this.activeUploads.delete(uploadId);
      } catch (error) {
        if (upload.retries < FILE_CONFIG.RETRY_ATTEMPTS) {
          upload.retries++;
          // Re-queue with exponential backoff
          setTimeout(() => {
            this.uploadQueue.push(upload);
            this.processUploadQueue();
          }, FILE_CONFIG.RETRY_DELAY * Math.pow(2, upload.retries));
        } else {
          upload.reject(error);
          this.activeUploads.delete(uploadId);
        }
      }
    }
  }

  /**
   * Check if service is ready
   * @returns {boolean} Whether service is ready
   */
  isReady() {
    return manyllaEncryptionService.isInitialized();
  }

  /**
   * Get current upload queue size
   * @returns {number} Queue size
   */
  getQueueSize() {
    return this.uploadQueue.length + this.activeUploads.size;
  }

  /**
   * Cancel all pending uploads
   */
  cancelAllUploads() {
    // Reject all queued uploads
    while (this.uploadQueue.length > 0) {
      const upload = this.uploadQueue.shift();
      if (upload) {
        upload.reject(new Error('Upload cancelled'));
      }
    }

    // Clear active uploads
    this.activeUploads.clear();
  }
}

// Export singleton instance
const fileAttachmentService = new FileAttachmentService();
export default fileAttachmentService;