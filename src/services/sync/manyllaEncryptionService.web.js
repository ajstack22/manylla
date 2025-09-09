import nacl from "tweetnacl";
import pako from "pako";

// Base64 encoding from tweetnacl-util
const util = require("tweetnacl-util");
const encodeBase64 = (arr) => util.encodeBase64(arr);
const decodeBase64 = (str) => util.decodeBase64(str);

class ManyllaEncryptionService {
  constructor() {
    this.key = null;
    this.initialized = false;
  }

  init(recoveryPhrase) {
    if (!recoveryPhrase || recoveryPhrase.length !== 32) {
      throw new Error("Recovery phrase must be exactly 32 characters");
    }

    // Convert recovery phrase to bytes
    const phraseBytes = new TextEncoder().encode(recoveryPhrase);

    // Hash with 100,000 iterations to derive key
    let hash = nacl.hash(phraseBytes);
    for (let i = 0; i < 99999; i++) {
      hash = nacl.hash(hash);
    }

    // Use first 32 bytes as encryption key
    this.key = hash.slice(0, 32);
    this.initialized = true;

    return true;
  }

  encrypt(data) {
    if (!this.initialized || !this.key) {
      throw new Error("Encryption not initialized. Call init() first.");
    }

    try {
      // Convert data to JSON string
      const jsonStr = JSON.stringify(data);

      // Manual UTF-8 encoding for compatibility
      const utf8Bytes = new TextEncoder().encode(jsonStr);

      // Compress with pako
      const compressed = pako.deflate(utf8Bytes);

      // Generate nonce
      const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);

      // Encrypt
      const encrypted = nacl.secretbox(compressed, nonce, this.key);

      // Combine nonce and encrypted data
      const combined = new Uint8Array(nonce.length + encrypted.length);
      combined.set(nonce);
      combined.set(encrypted, nonce.length);

      // Encode to base64
      return encodeBase64(combined);
    } catch (error) {
      console.error("Encryption error:", error);
      throw new Error(`Failed to encrypt data: ${error.message}`);
    }
  }

  decrypt(encryptedData) {
    if (!this.initialized || !this.key) {
      throw new Error("Encryption not initialized. Call init() first.");
    }

    try {
      // Decode from base64
      const combined = decodeBase64(encryptedData);

      // Extract nonce and encrypted data
      const nonce = combined.slice(0, nacl.secretbox.nonceLength);
      const encrypted = combined.slice(nacl.secretbox.nonceLength);

      // Decrypt
      const decrypted = nacl.secretbox.open(encrypted, nonce, this.key);
      if (!decrypted) {
        throw new Error("Failed to decrypt - invalid key or corrupted data");
      }

      // Decompress with pako
      const decompressed = pako.inflate(decrypted);

      // Manual UTF-8 decoding for compatibility
      const jsonStr = new TextDecoder().decode(decompressed);

      // Parse JSON
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error(`Failed to decrypt data: ${error.message}`);
    }
  }

  generateRecoveryPhrase() {
    // Generate 16 random bytes and convert to hex (32 characters)
    const bytes = nacl.randomBytes(16);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  }

  isInitialized() {
    return this.initialized;
  }

  // Generate a share key for temporary sharing
  generateShareKey() {
    const bytes = nacl.randomBytes(32);
    return encodeBase64(bytes);
  }

  // Encrypt data with a specific share key
  encryptForShare(data, shareKey) {
    try {
      const key = decodeBase64(shareKey);
      const jsonStr = JSON.stringify(data);
      const utf8Bytes = new TextEncoder().encode(jsonStr);
      const compressed = pako.deflate(utf8Bytes);
      const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
      const encrypted = nacl.secretbox(compressed, nonce, key);
      const combined = new Uint8Array(nonce.length + encrypted.length);
      combined.set(nonce);
      combined.set(encrypted, nonce.length);
      return encodeBase64(combined);
    } catch (error) {
      console.error("Share encryption error:", error);
      throw new Error(`Failed to encrypt for share: ${error.message}`);
    }
  }

  // Decrypt data with a specific share key
  decryptFromShare(encryptedData, shareKey) {
    try {
      const key = decodeBase64(shareKey);
      const combined = decodeBase64(encryptedData);
      const nonce = combined.slice(0, nacl.secretbox.nonceLength);
      const encrypted = combined.slice(nacl.secretbox.nonceLength);
      const decrypted = nacl.secretbox.open(encrypted, nonce, key);
      if (!decrypted) {
        throw new Error("Failed to decrypt - invalid key or corrupted data");
      }
      const decompressed = pako.inflate(decrypted);
      const jsonStr = new TextDecoder().decode(decompressed);
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Share decryption error:", error);
      throw new Error(`Failed to decrypt from share: ${error.message}`);
    }
  }
}

export default new ManyllaEncryptionService();
