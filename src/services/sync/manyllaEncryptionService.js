import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import random bytes polyfill for React Native
import 'react-native-get-random-values';
import nacl from 'tweetnacl';
import pako from 'pako';

// Base64 encoding from tweetnacl-util (this works fine)
const util = require('tweetnacl-util');
const encodeBase64 = (arr) => util.encodeBase64(arr);
const decodeBase64 = (str) => util.decodeBase64(str);

const ENCRYPTION_VERSION = 2;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;
const COMPRESSION_THRESHOLD = 1024;

// UTF-8 encoding - use manual implementation for iOS compatibility
let encodeUTF8;
let decodeUTF8;

// Always use manual implementation like StackMap does
// console.log('[ManyllaEncryption] Using manual UTF-8 implementation for all platforms');

// Manual UTF-8 encoding that works reliably on all platforms
encodeUTF8 = (str) => {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    if (char < 0x80) {
      bytes.push(char);
    } else if (char < 0x800) {
      bytes.push(0xc0 | (char >> 6));
      bytes.push(0x80 | (char & 0x3f));
    } else if (char < 0xd800 || char >= 0xe000) {
      bytes.push(0xe0 | (char >> 12));
      bytes.push(0x80 | ((char >> 6) & 0x3f));
      bytes.push(0x80 | (char & 0x3f));
    } else {
      // Surrogate pair
      i++;
      const char2 = str.charCodeAt(i);
      const codePoint = 0x10000 + (((char & 0x3ff) << 10) | (char2 & 0x3ff));
      bytes.push(0xf0 | (codePoint >> 18));
      bytes.push(0x80 | ((codePoint >> 12) & 0x3f));
      bytes.push(0x80 | ((codePoint >> 6) & 0x3f));
      bytes.push(0x80 | (codePoint & 0x3f));
    }
  }
  return new Uint8Array(bytes);
};

decodeUTF8 = (arr) => {
  const bytes = Array.from(arr);
  let result = '';
  let i = 0;
  
  while (i < bytes.length) {
    const byte1 = bytes[i++];
    if (byte1 < 0x80) {
      result += String.fromCharCode(byte1);
    } else if ((byte1 & 0xe0) === 0xc0) {
      const byte2 = bytes[i++];
      result += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
    } else if ((byte1 & 0xf0) === 0xe0) {
      const byte2 = bytes[i++];
      const byte3 = bytes[i++];
      result += String.fromCharCode(
        ((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f)
      );
    } else if ((byte1 & 0xf8) === 0xf0) {
      const byte2 = bytes[i++];
      const byte3 = bytes[i++];
      const byte4 = bytes[i++];
      const codePoint =
        ((byte1 & 0x07) << 18) |
        ((byte2 & 0x3f) << 12) |
        ((byte3 & 0x3f) << 6) |
        (byte4 & 0x3f);
      const high = Math.floor((codePoint - 0x10000) / 0x400) + 0xd800;
      const low = ((codePoint - 0x10000) % 0x400) + 0xdc00;
      result += String.fromCharCode(high, low);
    }
  }
  return result;
};

// Cross-platform storage using AsyncStorage
const SecureStorage = {
  async getItem(key) {
    try {
      return await AsyncStorage.getItem(`secure_${key}`);
    } catch (error) {
      console.error('Storage error:', error);
      return null;
    }
  },

  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(`secure_${key}`, value);
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  },

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(`secure_${key}`);
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  }
};

class ManyllaEncryptionService {
  constructor() {
    this.masterKey = null;
    this.syncId = null;
    // Match StackMap's iteration count
    this.KEY_DERIVATION_ITERATIONS = 100000;
  }

  /**
   * Generate a recovery phrase - now using 32-char hex like StackMap
   */
  generateRecoveryPhrase() {
    const bytes = nacl.randomBytes(16);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Derive encryption key from recovery phrase using nacl.hash iterations (like StackMap)
   */
  async deriveKeyFromPhrase(recoveryPhrase, salt = null) {
    // Use fixed salt for sync ID generation (like StackMap)
    const fixedSalt = 'ManyllaSyncSalt2025';
    
    if (!salt) {
      salt = nacl.randomBytes(SALT_LENGTH);
    } else if (typeof salt === 'string') {
      salt = util.decodeBase64(salt);
    }

    // Manual UTF-8 encoding for cross-platform compatibility
    const phraseBytes = encodeUTF8(recoveryPhrase + fixedSalt);
    
    // Use nacl.hash iterations like StackMap (not PBKDF2)
    let key = phraseBytes;
    for (let i = 0; i < this.KEY_DERIVATION_ITERATIONS; i++) {
      key = nacl.hash(key);
    }
    
    // Derive sync ID from first 16 bytes (same as StackMap)
    const syncId = util.encodeBase64(key.slice(0, 16))
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 32)
      .toLowerCase();
    
    // Derive actual encryption key
    const encKeyBytes = encodeUTF8(recoveryPhrase);
    const encSaltedBytes = new Uint8Array(encKeyBytes.length + salt.length);
    encSaltedBytes.set(encKeyBytes);
    encSaltedBytes.set(salt, encKeyBytes.length);
    
    let encKey = encSaltedBytes;
    for (let i = 0; i < this.KEY_DERIVATION_ITERATIONS; i++) {
      encKey = nacl.hash(encKey);
    }
    
    return {
      key: encKey.slice(0, KEY_LENGTH),
      salt: util.encodeBase64(salt),
      syncId
    };
  }
  
  // UTF-8 methods removed - using global functions instead

  /**
   * Initialize encryption with a recovery phrase
   */
  async initialize(recoveryPhrase, existingSalt = null) {
    const { key, salt, syncId } = await this.deriveKeyFromPhrase(recoveryPhrase, existingSalt);
    
    this.masterKey = key;
    this.syncId = syncId;
    
    // Store salt and encrypted recovery phrase
    await SecureStorage.setItem('manylla_salt', salt);
    await SecureStorage.setItem('manylla_sync_id', syncId);
    
    // Store encrypted recovery phrase (encrypted with device-specific key)
    const deviceKey = await this.getDeviceKey();
    const encryptedPhrase = await this.encryptWithKey(recoveryPhrase, deviceKey);
    await SecureStorage.setItem('manylla_recovery', encryptedPhrase);
    
    return { syncId, salt };
  }

  /**
   * Encrypt Manylla profile data
   */
  encryptData(data) {
    if (!this.masterKey) {
      throw new Error('Encryption not initialized');
    }

    const dataString = JSON.stringify(data);
    let dataBytes = encodeUTF8(dataString);
    let isCompressed = false;

    // Compress if data is large enough
    if (dataBytes.length > COMPRESSION_THRESHOLD) {
      try {
        const compressed = pako.deflate(dataBytes);
        if (compressed.length < dataBytes.length * 0.9) {
          dataBytes = compressed;
          isCompressed = true;
        }
      } catch (error) {
        console.warn('Compression failed:', error);
      }
    }

    // Generate nonce
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    
    // Create metadata
    const metadata = new Uint8Array(2);
    metadata[0] = ENCRYPTION_VERSION;
    metadata[1] = isCompressed ? 1 : 0;
    
    // Encrypt
    const encrypted = nacl.secretbox(dataBytes, nonce, this.masterKey);
    
    // Combine metadata + nonce + ciphertext
    const combined = new Uint8Array(metadata.length + nonce.length + encrypted.length);
    combined.set(metadata);
    combined.set(nonce, metadata.length);
    combined.set(encrypted, metadata.length + nonce.length);
    
    // Add integrity check (HMAC) for medical data
    const hmac = nacl.auth(combined, this.masterKey);
    
    // Return with HMAC
    return {
      data: util.encodeBase64(combined),
      hmac: util.encodeBase64(hmac)
    };
  }

  /**
   * Decrypt Manylla profile data
   */
  decryptData(encryptedPayload) {
    if (!this.masterKey) {
      throw new Error('Encryption not initialized');
    }

    // Only support new format with HMAC
    if (typeof encryptedPayload === 'string') {
      throw new Error('Invalid encrypted data format - HMAC required');
    }
    
    // Verify integrity first
    const combined = util.decodeBase64(encryptedPayload.data);
    const hmac = util.decodeBase64(encryptedPayload.hmac);
    
    if (!nacl.auth.verify(hmac, combined, this.masterKey)) {
      throw new Error('Data integrity check failed - data may have been tampered with');
    }
    
    // Extract metadata
    const version = combined[0];
    const isCompressed = combined[1] === 1;
    
    // Extract nonce and ciphertext
    const nonce = combined.slice(2, 2 + nacl.secretbox.nonceLength);
    const ciphertext = combined.slice(2 + nacl.secretbox.nonceLength);
    
    // Decrypt
    const decrypted = nacl.secretbox.open(ciphertext, nonce, this.masterKey);
    if (!decrypted) {
      throw new Error('Decryption failed - invalid key or corrupted data');
    }

    let dataBytes = decrypted;
    
    // Decompress if needed
    if (isCompressed) {
      try {
        dataBytes = pako.inflate(decrypted);
      } catch (error) {
        console.error('Decompression failed:', error);
        throw new Error('Failed to decompress data');
      }
    }

    const dataString = decodeUTF8(dataBytes);
    return JSON.parse(dataString);
  }

  /**
   * Get or generate device-specific key
   */
  async getDeviceKey() {
    let deviceKey = await SecureStorage.getItem('manylla_device_key');
    
    if (!deviceKey) {
      const keyBytes = nacl.randomBytes(KEY_LENGTH);
      deviceKey = util.encodeBase64(keyBytes);
      await SecureStorage.setItem('manylla_device_key', deviceKey);
    }
    
    return util.decodeBase64(deviceKey);
  }

  /**
   * Encrypt with a specific key (for device-specific encryption)
   */
  async encryptWithKey(data, key) {
    const dataBytes = encodeUTF8(data);
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const encrypted = nacl.secretbox(dataBytes, nonce, key);
    
    const combined = new Uint8Array(nonce.length + encrypted.length);
    combined.set(nonce);
    combined.set(encrypted, nonce.length);
    
    return util.encodeBase64(combined);
  }

  /**
   * Check if sync is enabled
   */
  async isEnabled() {
    const syncId = await SecureStorage.getItem('manylla_sync_id');
    return !!syncId;
  }

  /**
   * Get stored sync ID
   */
  async getSyncId() {
    return SecureStorage.getItem('manylla_sync_id');
  }

  /**
   * Clear all sync data
   */
  async clear() {
    this.masterKey = null;
    this.syncId = null;
    
    await SecureStorage.removeItem('manylla_salt');
    await SecureStorage.removeItem('manylla_sync_id');
    await SecureStorage.removeItem('manylla_recovery');
  }

  /**
   * Restore from stored recovery phrase
   */
  async restore() {
    const encryptedPhrase = await SecureStorage.getItem('manylla_recovery');
    const salt = await SecureStorage.getItem('manylla_salt');
    
    if (!encryptedPhrase || !salt) {
      return false;
    }

    try {
      // Decrypt recovery phrase with device key
      const deviceKey = await this.getDeviceKey();
      const combined = util.decodeBase64(encryptedPhrase);
      const nonce = combined.slice(0, nacl.secretbox.nonceLength);
      const ciphertext = combined.slice(nacl.secretbox.nonceLength);
      
      const decrypted = nacl.secretbox.open(ciphertext, nonce, deviceKey);
      if (!decrypted) {
        return false;
      }
      
      const recoveryPhrase = decodeUTF8(decrypted);
      await this.initialize(recoveryPhrase, salt);
      
      return true;
    } catch (error) {
      console.error('Failed to restore encryption:', error);
      return false;
    }
  }
}

export default new ManyllaEncryptionService();