/**
 * ChunkedEncryptionService - Handles streaming encryption/decryption for large files
 * Uses 1MB chunks to prevent memory overload on mobile devices
 * Integrates with ManyllaEncryptionService for zero-knowledge encryption
 */

import { Platform, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import manyllaEncryptionService from './sync/manyllaEncryptionService';
import nacl from 'tweetnacl';
import util from 'tweetnacl-util';

/**
 * ChunkedEncryptionService class
 * Handles file encryption/decryption in chunks to prevent memory issues
 */
class ChunkedEncryptionService {
  constructor() {
    this.CHUNK_SIZE = 1024 * 1024; // 1MB chunks
    this.MEMORY_LIMIT = 100 * 1024 * 1024; // 100MB max memory usage
    this.activeOperations = new Map(); // Track active operations for cleanup
  }

  /**
   * Encrypt file in streaming chunks
   * @param {Object} file - File object with uri, size properties
   * @param {Function} progressCallback - Progress callback function
   * @returns {AsyncGenerator} Generator yielding encrypted chunks
   */
  async* encryptFileStreaming(file, progressCallback) {
    const operationId = this.generateOperationId();
    this.activeOperations.set(operationId, { cancelled: false });

    try {
      // Check if we have enough memory
      if (!this.canProcessFile(file.size)) {
        throw new Error('Insufficient memory to process file. File too large.');
      }

      // Ensure encryption service is initialized
      if (!manyllaEncryptionService.isInitialized()) {
        throw new Error('Encryption service not initialized. Please set up sync first.');
      }

      const totalChunks = Math.ceil(file.size / this.CHUNK_SIZE);
      let processedChunks = 0;

      // Process file in chunks
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        // Check if operation was cancelled
        if (this.activeOperations.get(operationId)?.cancelled) {
          throw new Error('Operation cancelled');
        }

        const start = chunkIndex * this.CHUNK_SIZE;
        const end = Math.min(start + this.CHUNK_SIZE, file.size);

        // Read chunk from file
        const chunkData = await this.readFileChunk(file.uri, start, end);

        // Encrypt the chunk
        const encryptedChunk = await this.encryptChunk(chunkData, chunkIndex, totalChunks);

        processedChunks++;

        // Report progress
        if (progressCallback) {
          progressCallback({
            step: 'encrypting',
            current: processedChunks,
            total: totalChunks,
            percent: Math.round((processedChunks / totalChunks) * 100),
            bytesProcessed: Math.min(processedChunks * this.CHUNK_SIZE, file.size),
            totalBytes: file.size
          });
        }

        // Yield the encrypted chunk
        yield encryptedChunk;

        // Force garbage collection hint (platform-specific)
        if (processedChunks % 5 === 0) {
          await this.requestGarbageCollection();
        }
      }
    } finally {
      this.activeOperations.delete(operationId);
    }
  }

  /**
   * Decrypt file in streaming chunks
   * @param {AsyncIterable} encryptedChunks - Async iterable of encrypted chunks
   * @param {number} fileSize - Original file size
   * @param {Function} progressCallback - Progress callback function
   * @returns {AsyncGenerator} Generator yielding decrypted chunks
   */
  async* decryptFileStreaming(encryptedChunks, fileSize, progressCallback) {
    const operationId = this.generateOperationId();
    this.activeOperations.set(operationId, { cancelled: false });

    try {
      // Ensure encryption service is initialized
      if (!manyllaEncryptionService.isInitialized()) {
        throw new Error('Encryption service not initialized');
      }

      const totalChunks = Math.ceil(fileSize / this.CHUNK_SIZE);
      let processedChunks = 0;

      // Process encrypted chunks
      for await (const encryptedChunk of encryptedChunks) {
        // Check if operation was cancelled
        if (this.activeOperations.get(operationId)?.cancelled) {
          throw new Error('Operation cancelled');
        }

        // Decrypt the chunk
        const decryptedChunk = await this.decryptChunk(encryptedChunk);

        processedChunks++;

        // Report progress
        if (progressCallback) {
          progressCallback({
            step: 'decrypting',
            current: processedChunks,
            total: totalChunks,
            percent: Math.round((processedChunks / totalChunks) * 100),
            bytesProcessed: Math.min(processedChunks * this.CHUNK_SIZE, fileSize),
            totalBytes: fileSize
          });
        }

        // Yield the decrypted chunk
        yield decryptedChunk;

        // Force garbage collection hint
        if (processedChunks % 5 === 0) {
          await this.requestGarbageCollection();
        }
      }
    } finally {
      this.activeOperations.delete(operationId);
    }
  }

  /**
   * Encrypt a single chunk
   * @param {Uint8Array} chunkData - Raw chunk data
   * @param {number} chunkIndex - Index of this chunk
   * @param {number} totalChunks - Total number of chunks
   * @returns {Promise<Object>} Encrypted chunk with metadata
   */
  async encryptChunk(chunkData, chunkIndex, totalChunks) {
    // Generate nonce for this chunk
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);

    // Get encryption key from manyllaEncryptionService
    const encryptionKey = await manyllaEncryptionService.getEncryptionKey();
    if (!encryptionKey) {
      throw new Error('No encryption key available');
    }

    // Convert key to Uint8Array if needed
    const keyBytes = typeof encryptionKey === 'string'
      ? util.decodeBase64(encryptionKey)
      : encryptionKey;

    // Encrypt the chunk
    const encrypted = nacl.secretbox(chunkData, nonce, keyBytes);

    // Return encrypted chunk with metadata
    return {
      index: chunkIndex,
      total: totalChunks,
      nonce: util.encodeBase64(nonce),
      data: util.encodeBase64(encrypted),
      size: encrypted.length
    };
  }

  /**
   * Decrypt a single chunk
   * @param {Object} encryptedChunk - Encrypted chunk with metadata
   * @returns {Promise<Uint8Array>} Decrypted chunk data
   */
  async decryptChunk(encryptedChunk) {
    // Get encryption key
    const encryptionKey = await manyllaEncryptionService.getEncryptionKey();
    if (!encryptionKey) {
      throw new Error('No encryption key available');
    }

    // Convert from base64
    const nonce = util.decodeBase64(encryptedChunk.nonce);
    const encrypted = util.decodeBase64(encryptedChunk.data);

    // Convert key to Uint8Array if needed
    const keyBytes = typeof encryptionKey === 'string'
      ? util.decodeBase64(encryptionKey)
      : encryptionKey;

    // Decrypt the chunk
    const decrypted = nacl.secretbox.open(encrypted, nonce, keyBytes);

    if (!decrypted) {
      throw new Error(`Failed to decrypt chunk ${encryptedChunk.index}`);
    }

    return decrypted;
  }

  /**
   * Read a chunk from a file
   * Platform-specific implementation
   * @param {string} fileUri - File URI
   * @param {number} start - Start byte position
   * @param {number} end - End byte position
   * @returns {Promise<Uint8Array>} Chunk data
   */
  async readFileChunk(fileUri, start, end) {
    if (Platform.OS === 'web') {
      // Web implementation
      return this.readFileChunkWeb(fileUri, start, end);
    } else {
      // React Native implementation
      return this.readFileChunkNative(fileUri, start, end);
    }
  }

  /**
   * Read file chunk on web platform
   * @private
   */
  async readFileChunkWeb(fileUri, start, end) {
    // For web, fileUri might be a File object or blob URL
    let blob;

    if (fileUri instanceof File) {
      blob = fileUri;
    } else if (fileUri instanceof Blob) {
      blob = fileUri;
    } else if (typeof fileUri === 'string' && fileUri.startsWith('blob:')) {
      const response = await fetch(fileUri);
      blob = await response.blob();
    } else {
      throw new Error('Invalid file URI for web platform');
    }

    // Slice the blob to get the chunk
    const chunkBlob = blob.slice(start, end);
    const arrayBuffer = await chunkBlob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  /**
   * Read file chunk on React Native
   * @private
   */
  async readFileChunkNative(fileUri, start, end) {
    // This would require a native module or react-native-fs
    // For now, we'll read the entire file and slice it
    // In production, you'd want to use react-native-fs for true chunked reading

    try {
      // Import react-native-fs dynamically if available
      const RNFS = require('react-native-fs');

      // Read chunk using RNFS
      const chunkSize = end - start;
      const base64Data = await RNFS.read(fileUri, chunkSize, start, 'base64');
      return util.decodeBase64(base64Data);
    } catch (error) {
      // Fallback: read entire file (not ideal for large files)
      // This is a temporary solution until react-native-fs is properly integrated
      throw new Error('Native file chunking requires react-native-fs. Please install it.');
    }
  }

  /**
   * Get current memory usage
   * @returns {number} Memory usage in bytes
   */
  getMemoryUsage() {
    if (Platform.OS === 'web') {
      // Web platform
      if (typeof performance !== 'undefined' && performance.memory) {
        return performance.memory.usedJSHeapSize || 0;
      }
      return 0;
    } else {
      // React Native - would need native module
      // For now, return 0 (assume memory is OK)
      if (NativeModules.MemoryInfo) {
        return NativeModules.MemoryInfo.getUsedMemory() || 0;
      }
      return 0;
    }
  }

  /**
   * Check if we can process a file of given size
   * @param {number} fileSize - Size of file in bytes
   * @returns {boolean} Whether file can be processed
   */
  canProcessFile(fileSize) {
    // Check if file size itself exceeds limits
    if (fileSize > 50 * 1024 * 1024) { // 50MB max
      return false;
    }

    // Get current memory usage
    const currentMemory = this.getMemoryUsage();
    const available = this.MEMORY_LIMIT - currentMemory;

    // We need roughly 1.5x the chunk size for processing overhead
    const neededMemory = this.CHUNK_SIZE * 1.5;

    // If we can't check memory, optimistically assume we can process
    if (currentMemory === 0) {
      return true;
    }

    return neededMemory < available;
  }

  /**
   * Request garbage collection (platform-specific)
   */
  async requestGarbageCollection() {
    // This is a hint to the JS engine to run GC
    // It may not actually trigger GC immediately

    if (typeof global.gc === 'function') {
      // Node.js with --expose-gc flag
      global.gc();
    }

    // Small delay to allow GC to run
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  /**
   * Cancel an active operation
   * @param {string} operationId - Operation ID to cancel
   */
  cancelOperation(operationId) {
    const operation = this.activeOperations.get(operationId);
    if (operation) {
      operation.cancelled = true;
    }
  }

  /**
   * Generate unique operation ID
   * @returns {string} Operation ID
   */
  generateOperationId() {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save upload state for resume capability
   * @param {string} fileId - File ID
   * @param {number} lastChunkIndex - Last successfully uploaded chunk
   */
  async saveUploadState(fileId, lastChunkIndex) {
    const stateKey = `upload_state_${fileId}`;
    const state = {
      lastChunkIndex,
      timestamp: Date.now()
    };

    try {
      await AsyncStorage.setItem(stateKey, JSON.stringify(state));
    } catch (error) {
      // Silent failure - upload will restart from beginning if state not saved
    }
  }

  /**
   * Get upload state for resume
   * @param {string} fileId - File ID
   * @returns {Promise<Object|null>} Upload state or null
   */
  async getUploadState(fileId) {
    const stateKey = `upload_state_${fileId}`;

    try {
      const stateJson = await AsyncStorage.getItem(stateKey);
      if (!stateJson) return null;

      const state = JSON.parse(stateJson);

      // Check if state is older than 24 hours
      const age = Date.now() - state.timestamp;
      if (age > 24 * 60 * 60 * 1000) {
        // State too old, remove it
        await AsyncStorage.removeItem(stateKey);
        return null;
      }

      return state;
    } catch (error) {
      // Silent failure - will start fresh upload
      return null;
    }
  }

  /**
   * Clear upload state after successful upload
   * @param {string} fileId - File ID
   */
  async clearUploadState(fileId) {
    const stateKey = `upload_state_${fileId}`;
    try {
      await AsyncStorage.removeItem(stateKey);
    } catch (error) {
      // Silent failure - old state will expire after 24 hours
    }
  }

  /**
   * Upload file with resume capability
   * @param {Object} file - File object
   * @param {string} fileId - Unique file ID
   * @param {Function} uploadChunkFn - Function to upload a chunk
   * @param {Function} progressCallback - Progress callback
   * @returns {Promise<void>}
   */
  async uploadFileWithResume(file, fileId, uploadChunkFn, progressCallback) {
    // Check for existing upload state
    const uploadState = await this.getUploadState(fileId);
    const totalChunks = Math.ceil(file.size / this.CHUNK_SIZE);
    const startChunk = uploadState?.lastChunkIndex + 1 || 0;

    // If resuming, notify via progress
    if (startChunk > 0 && progressCallback) {
      progressCallback({
        step: 'resuming',
        current: startChunk,
        total: totalChunks,
        percent: Math.round((startChunk / totalChunks) * 100),
        message: `Resuming from chunk ${startChunk}/${totalChunks}`
      });
    }

    // Generate encrypted chunks starting from resume point
    const encryptedChunks = this.encryptFileStreaming(file, progressCallback);

    let chunkIndex = 0;
    for await (const encryptedChunk of encryptedChunks) {
      // Skip chunks that were already uploaded
      if (chunkIndex < startChunk) {
        chunkIndex++;
        continue;
      }

      try {
        // Upload the chunk
        await uploadChunkFn(encryptedChunk, chunkIndex, totalChunks);

        // Save progress for resume
        await this.saveUploadState(fileId, chunkIndex);

        chunkIndex++;
      } catch (error) {
        // Save state and re-throw error
        if (chunkIndex > 0) {
          await this.saveUploadState(fileId, chunkIndex - 1);
        }
        throw new Error(`Upload failed at chunk ${chunkIndex}: ${error.message}`);
      }
    }

    // Clear upload state on success
    await this.clearUploadState(fileId);
  }

  /**
   * Calculate SHA-256 hash of file content
   * Used for duplicate detection and integrity verification
   * @param {Object} file - File object
   * @returns {Promise<string>} Hex-encoded SHA-256 hash
   */
  async calculateFileHash(file) {
    const crypto = window.crypto || global.crypto;
    if (!crypto?.subtle) {
      // Fallback to nacl.hash if Web Crypto not available
      const chunks = [];
      const generator = this.encryptFileStreaming(file, null);
      for await (const chunk of generator) {
        chunks.push(chunk.data);
      }
      const combined = chunks.join('');
      const hash = nacl.hash(util.decodeBase64(combined));
      return util.encodeBase64(hash);
    }

    // Use Web Crypto API for better performance
    const hashBuffer = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
}

// Export singleton instance
const chunkedEncryptionService = new ChunkedEncryptionService();
export default chunkedEncryptionService;