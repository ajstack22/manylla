import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import pako from 'pako';

const ENCRYPTION_VERSION = 2;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;
const COMPRESSION_THRESHOLD = 1024;

// Web-compatible storage
const SecureStorage = {
  async getItem(key) {
    try {
      return localStorage.getItem(`secure_${key}`);
    } catch (error) {
      console.error('Storage error:', error);
      return null;
    }
  },

  async setItem(key, value) {
    try {
      localStorage.setItem(`secure_${key}`, value);
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  },

  async removeItem(key) {
    try {
      localStorage.removeItem(`secure_${key}`);
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
  }

  /**
   * Generate a recovery phrase using child-friendly words
   */
  generateRecoveryPhrase() {
    // Simple word list for POC - in production, use curated child-friendly BIP39 subset
    const words = [
      'happy', 'sunny', 'friend', 'play', 'smile', 'rainbow',
      'garden', 'flower', 'butterfly', 'gentle', 'caring', 'helper',
      'bright', 'warm', 'safe', 'love', 'hope', 'dream',
      'star', 'moon', 'cloud', 'tree', 'bird', 'song'
    ];
    
    const phrase = [];
    const randomBytes = nacl.randomBytes(16);
    
    // Generate 12 words from random bytes
    for (let i = 0; i < 12; i++) {
      const index = randomBytes[i % randomBytes.length] % words.length;
      phrase.push(words[index]);
    }
    
    return phrase.join(' ');
  }

  /**
   * Derive encryption key from recovery phrase
   */
  async deriveKeyFromPhrase(recoveryPhrase, salt = null) {
    if (!salt) {
      salt = nacl.randomBytes(SALT_LENGTH);
    } else if (typeof salt === 'string') {
      salt = util.decodeBase64(salt);
    }

    const phraseBytes = util.decodeUTF8(recoveryPhrase);
    const combined = new Uint8Array(phraseBytes.length + salt.length);
    combined.set(phraseBytes);
    combined.set(salt, phraseBytes.length);
    
    // Hash multiple times for key stretching
    let key = nacl.hash(combined);
    for (let i = 0; i < 1000; i++) {
      key = nacl.hash(key);
    }
    
    // Derive sync ID from first 16 bytes
    const syncId = util.encodeBase64(key.slice(0, 16))
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 32)
      .toLowerCase();
    
    return {
      key: key.slice(0, KEY_LENGTH),
      salt: util.encodeBase64(salt),
      syncId
    };
  }

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
    let dataBytes = util.decodeUTF8(dataString);
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
    
    return util.encodeBase64(combined);
  }

  /**
   * Decrypt Manylla profile data
   */
  decryptData(encryptedData) {
    if (!this.masterKey) {
      throw new Error('Encryption not initialized');
    }

    const combined = util.decodeBase64(encryptedData);
    
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

    const dataString = util.encodeUTF8(dataBytes);
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
    const dataBytes = util.decodeUTF8(data);
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
      
      const recoveryPhrase = util.encodeUTF8(decrypted);
      await this.initialize(recoveryPhrase, salt);
      
      return true;
    } catch (error) {
      console.error('Failed to restore encryption:', error);
      return false;
    }
  }
}

export default new ManyllaEncryptionService();