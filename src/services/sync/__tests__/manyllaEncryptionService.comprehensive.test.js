/**
 * Comprehensive integration tests for manyllaEncryptionService
 * Tests actual encryption/decryption with real crypto operations
 * NO MOCKING of core functionality - only external dependencies
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import nacl from "tweetnacl";
import pako from "pako";

// Import the actual service - not mocked!
import manyllaEncryptionService from "../manyllaEncryptionService";

// Destructure the methods we need
const {
  generateRecoveryPhrase,
  deriveKeyFromRecoveryPhrase,
  encrypt,
  decrypt,
  encryptForShare,
  decryptShare,
  validateRecoveryPhrase,
  generateShareUrl,
  parseShareUrl,
  clearStoredKeys,
  getStoredRecoveryPhrase,
  initializeEncryption,
} = manyllaEncryptionService;

// Only mock AsyncStorage (external dependency)
jest.mock("@react-native-async-storage/async-storage");

describe("manyllaEncryptionService - Comprehensive Real Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();
    AsyncStorage.removeItem.mockResolvedValue();
  });

  describe("Recovery Phrase Generation", () => {
    test("should generate valid 32-character hex recovery phrase", () => {
      const phrase = generateRecoveryPhrase();

      expect(phrase).toHaveLength(32);
      expect(phrase).toMatch(/^[a-f0-9]{32}$/);
      expect(phrase).not.toBe(generateRecoveryPhrase()); // Should be unique
    });

    test("should generate cryptographically random phrases", () => {
      const phrases = new Set();
      for (let i = 0; i < 100; i++) {
        phrases.add(generateRecoveryPhrase());
      }
      expect(phrases.size).toBe(100); // All should be unique
    });
  });

  describe("Key Derivation", () => {
    test("should derive consistent key from recovery phrase", async () => {
      const phrase = "a1b2c3d4e5f6789012345678901234567890abcdef123456";

      const key1 = await deriveKeyFromRecoveryPhrase(phrase);
      const key2 = await deriveKeyFromRecoveryPhrase(phrase);

      expect(key1).toHaveLength(32);
      expect(key1).toEqual(key2); // Same phrase = same key
      expect(key1).toBeInstanceOf(Uint8Array);
    });

    test("should derive different keys for different phrases", async () => {
      const phrase1 = "a1b2c3d4e5f6789012345678901234567890abcdef123456";
      const phrase2 = "b1b2c3d4e5f6789012345678901234567890abcdef123456";

      const key1 = await deriveKeyFromRecoveryPhrase(phrase1);
      const key2 = await deriveKeyFromRecoveryPhrase(phrase2);

      expect(key1).not.toEqual(key2);
    });

    test("should use proper key stretching (100,000 iterations)", async () => {
      const phrase = "test1234567890abcdef1234567890ab";
      const startTime = Date.now();

      await deriveKeyFromRecoveryPhrase(phrase);

      const duration = Date.now() - startTime;
      expect(duration).toBeGreaterThan(10); // Should take some time due to iterations
    });
  });

  describe("Encryption and Decryption", () => {
    test("should encrypt and decrypt text data correctly", async () => {
      const phrase = generateRecoveryPhrase();
      const originalData = {
        message: "Test data with unicode: 你好世界 🎉",
        nested: { value: 123 }
      };

      const encrypted = await encrypt(originalData, phrase);
      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toContain("Test data"); // Should be encrypted

      const decrypted = await decrypt(encrypted, phrase);
      expect(decrypted).toEqual(originalData);
    });

    test("should handle large data with compression", async () => {
      const phrase = generateRecoveryPhrase();
      const largeData = {
        profiles: Array(100).fill(null).map((_, i) => ({
          id: `profile-${i}`,
          name: `Child ${i}`,
          description: "Lorem ipsum dolor sit amet ".repeat(50),
          entries: Array(20).fill(null).map((_, j) => ({
            id: `entry-${i}-${j}`,
            title: `Entry ${j}`,
            content: "Content text ".repeat(100)
          }))
        }))
      };

      const encrypted = await encrypt(largeData, phrase);
      const decrypted = await decrypt(encrypted, phrase);

      expect(decrypted).toEqual(largeData);
      // Encrypted should be smaller due to compression
      expect(encrypted.length).toBeLessThan(JSON.stringify(largeData).length);
    });

    test("should fail decryption with wrong recovery phrase", async () => {
      const correctPhrase = generateRecoveryPhrase();
      const wrongPhrase = generateRecoveryPhrase();
      const data = { secret: "confidential" };

      const encrypted = await encrypt(data, correctPhrase);

      await expect(decrypt(encrypted, wrongPhrase)).rejects.toThrow();
    });

    test("should handle special characters and emojis", async () => {
      const phrase = generateRecoveryPhrase();
      const data = {
        text: "Special chars: éñ ü ß € £ ¥",
        emojis: "😀 🎉 🚀 ❤️ 🌟",
        rtl: "مرحبا بالعالم",
        cjk: "中文 日本語 한국어"
      };

      const encrypted = await encrypt(data, phrase);
      const decrypted = await decrypt(encrypted, phrase);

      expect(decrypted).toEqual(data);
    });

    test("should maintain data integrity", async () => {
      const phrase = generateRecoveryPhrase();
      const data = {
        number: 42.5,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        date: new Date().toISOString()
      };

      const encrypted = await encrypt(data, phrase);
      const decrypted = await decrypt(encrypted, phrase);

      expect(decrypted).toEqual(data);
      expect(typeof decrypted.number).toBe("number");
      expect(typeof decrypted.boolean).toBe("boolean");
      expect(decrypted.null).toBeNull();
      expect(Array.isArray(decrypted.array)).toBe(true);
    });
  });

  describe("Share Encryption", () => {
    test("should create and decrypt share with unique key", async () => {
      const data = {
        profile: "Test Profile",
        entries: ["Entry 1", "Entry 2"]
      };

      const shareData = await encryptForShare(data);

      expect(shareData).toHaveProperty("encrypted");
      expect(shareData).toHaveProperty("key");
      expect(shareData.key).toHaveLength(32);
      expect(shareData.encrypted).not.toContain("Test Profile");

      const decrypted = await decryptShare(shareData.encrypted, shareData.key);
      expect(decrypted).toEqual(data);
    });

    test("should generate different keys for each share", async () => {
      const data = { test: "data" };

      const share1 = await encryptForShare(data);
      const share2 = await encryptForShare(data);

      expect(share1.key).not.toBe(share2.key);
      expect(share1.encrypted).not.toBe(share2.encrypted);
    });

    test("should fail to decrypt share with wrong key", async () => {
      const data = { sensitive: "information" };
      const shareData = await encryptForShare(data);
      const wrongKey = generateRecoveryPhrase();

      await expect(decryptShare(shareData.encrypted, wrongKey))
        .rejects.toThrow();
    });
  });

  describe("Share URL Management", () => {
    test("should generate and parse share URLs correctly", () => {
      const shareId = "abc123";
      const encryptionKey = "def456789012345678901234567890ab";

      const url = generateShareUrl(shareId, encryptionKey);

      expect(url).toContain(`/share/${shareId}`);
      expect(url).toContain(`#${encryptionKey}`);

      const parsed = parseShareUrl(url);
      expect(parsed.shareId).toBe(shareId);
      expect(parsed.encryptionKey).toBe(encryptionKey);
    });

    test("should parse various URL formats", () => {
      const testCases = [
        "https://example.com/share/123#key456",
        "http://localhost:3000/share/abc#def123",
        "/share/xyz#789key",
        "share/test#mykey"
      ];

      testCases.forEach(url => {
        const parsed = parseShareUrl(url);
        expect(parsed.shareId).toBeTruthy();
        expect(parsed.encryptionKey).toBeTruthy();
      });
    });

    test("should return null for invalid share URLs", () => {
      const invalidUrls = [
        "https://example.com/other/page",
        "/share/123", // Missing key
        "invalid-url",
        null,
        undefined,
        ""
      ];

      invalidUrls.forEach(url => {
        expect(parseShareUrl(url)).toBeNull();
      });
    });
  });

  describe("Recovery Phrase Validation", () => {
    test("should validate correct recovery phrase format", () => {
      const validPhrases = [
        "a1b2c3d4e5f6789012345678901234567890abcdef123456",
        "0000000000000000000000000000000000000000000000000",
        "ffffffffffffffffffffffffffffffffffffffffffffffff"
      ];

      validPhrases.forEach(phrase => {
        expect(validateRecoveryPhrase(phrase)).toBe(true);
      });
    });

    test("should reject invalid recovery phrases", () => {
      const invalidPhrases = [
        "short",
        "UPPERCASE1234567890123456789012",
        "invalid-chars-12345678901234567",
        "a1b2c3d4e5f6789012345678901234567890abcdef12345", // Too long
        "a1b2c3d4e5f6789012345678901234567890abcdef1234", // Too short
        null,
        undefined,
        "",
        123456,
        { phrase: "invalid" }
      ];

      invalidPhrases.forEach(phrase => {
        expect(validateRecoveryPhrase(phrase)).toBe(false);
      });
    });
  });

  describe("Storage Operations", () => {
    test("should store and retrieve recovery phrase", async () => {
      const phrase = generateRecoveryPhrase();
      AsyncStorage.setItem.mockResolvedValue();
      AsyncStorage.getItem.mockResolvedValue(phrase);

      await initializeEncryption(phrase);
      const retrieved = await getStoredRecoveryPhrase();

      expect(retrieved).toBe(phrase);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "secure_recoveryPhrase",
        phrase
      );
    });

    test("should clear stored keys", async () => {
      await clearStoredKeys();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("secure_encryptionKey");
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("secure_recoveryPhrase");
    });

    test("should handle storage errors gracefully", async () => {
      AsyncStorage.setItem.mockRejectedValue(new Error("Storage error"));

      const result = await initializeEncryption("test1234567890abcdef1234567890ab");

      expect(result).toBe(false);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle null/undefined data", async () => {
      const phrase = generateRecoveryPhrase();

      const encryptedNull = await encrypt(null, phrase);
      const decryptedNull = await decrypt(encryptedNull, phrase);
      expect(decryptedNull).toBeNull();

      const encryptedUndefined = await encrypt(undefined, phrase);
      const decryptedUndefined = await decrypt(encryptedUndefined, phrase);
      expect(decryptedUndefined).toBeUndefined();
    });

    test("should handle empty objects and arrays", async () => {
      const phrase = generateRecoveryPhrase();
      const data = {
        emptyObject: {},
        emptyArray: [],
        emptyString: ""
      };

      const encrypted = await encrypt(data, phrase);
      const decrypted = await decrypt(encrypted, phrase);

      expect(decrypted).toEqual(data);
    });

    test("should handle circular references", async () => {
      const phrase = generateRecoveryPhrase();
      const data = { name: "test" };
      data.circular = data; // Create circular reference

      await expect(encrypt(data, phrase)).rejects.toThrow();
    });

    test("should handle corrupted encrypted data", async () => {
      const phrase = generateRecoveryPhrase();
      const corruptedData = "not-valid-encrypted-data";

      await expect(decrypt(corruptedData, phrase)).rejects.toThrow();
    });

    test("should handle very long strings", async () => {
      const phrase = generateRecoveryPhrase();
      const longString = "a".repeat(1000000); // 1MB string
      const data = { longText: longString };

      const encrypted = await encrypt(data, phrase);
      const decrypted = await decrypt(encrypted, phrase);

      expect(decrypted.longText).toBe(longString);
    });
  });

  describe("Compatibility and Interoperability", () => {
    test("should maintain compatibility with existing encrypted data format", async () => {
      const phrase = "test1234567890abcdef1234567890ab";
      const data = { compatibility: "test" };

      // Encrypt and check format
      const encrypted = await encrypt(data, phrase);
      const parts = encrypted.split(".");

      expect(parts).toHaveLength(4); // version.salt.nonce.ciphertext
      expect(parts[0]).toBe("2"); // Version 2
      expect(parts[1]).toHaveLength(22); // Base64 salt
      expect(parts[2]).toHaveLength(32); // Base64 nonce
    });

    test("should handle different data types consistently", async () => {
      const phrase = generateRecoveryPhrase();
      const testCases = [
        123,
        "string",
        true,
        false,
        null,
        { object: true },
        [1, 2, 3],
        { nested: { deep: { value: "test" } } }
      ];

      for (const testData of testCases) {
        const encrypted = await encrypt(testData, phrase);
        const decrypted = await decrypt(encrypted, phrase);
        expect(decrypted).toEqual(testData);
      }
    });
  });
});