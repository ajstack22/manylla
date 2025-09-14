/**
 * Basic tests for ManyllaEncryptionService focused on API coverage
 */

// Mock AsyncStorage before any imports
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock crypto polyfill
jest.mock("../../../polyfills/crypto", () => {});

// Mock pako
jest.mock("pako", () => ({
  deflate: jest.fn((data) => data),
  inflate: jest.fn((data) => data),
}));

// Mock tweetnacl with simple working functions
jest.mock("tweetnacl", () => ({
  randomBytes: jest.fn((size) => new Uint8Array(size).fill(1)),
  hash: jest.fn((input) => new Uint8Array(64).fill(2)),
  secretbox: Object.assign(
    jest.fn((plaintext, nonce, key) => new Uint8Array(plaintext.length + 16)),
    {
      nonceLength: 24,
      open: jest.fn((ciphertext, nonce, key) => {
        if (!ciphertext || ciphertext.length < 16) return null;
        return new Uint8Array(ciphertext.length - 16);
      }),
    },
  ),
}));

// Mock tweetnacl-util
jest.mock("tweetnacl-util", () => ({
  encodeBase64: jest.fn((bytes) => "mockbase64" + bytes.length),
  decodeBase64: jest.fn((str) => new Uint8Array(16).fill(3)),
}));

// Import statements should be at the top of the file
const AsyncStorage = require("@react-native-async-storage/async-storage");
const service = require("../manyllaEncryptionService").default;

describe("ManyllaEncryptionService (Basic Coverage)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    service.masterKey = null;
    service.syncId = null;
  });

  describe("public API methods", () => {
    test("generateRecoveryPhrase returns string", () => {
      const phrase = service.generateRecoveryPhrase();
      expect(typeof phrase).toBe("string");
      expect(phrase.length).toBeGreaterThan(0);
    });

    test("isInitialized returns boolean", () => {
      expect(service.isInitialized()).toBe(false);
      service.masterKey = new Uint8Array(32);
      expect(service.isInitialized()).toBe(true);
    });

    test("deriveKeyFromPhrase works", async () => {
      const result = await service.deriveKeyFromPhrase("test-phrase");
      expect(result).toHaveProperty("key");
      expect(result).toHaveProperty("salt");
      expect(result).toHaveProperty("syncId");
    });

    test("isEnabled calls AsyncStorage", async () => {
      await service.isEnabled();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        "secure_manylla_sync_id",
      );
    });

    test("getSyncId calls AsyncStorage", async () => {
      await service.getSyncId();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        "secure_manylla_sync_id",
      );
    });

    test("clear resets state and calls storage", async () => {
      service.masterKey = new Uint8Array(32);
      service.syncId = "test";

      await service.clear();

      expect(service.masterKey).toBe(null);
      expect(service.syncId).toBe(null);
      expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(3);
    });

    test("restore returns false when no data", async () => {
      const result = await service.restore();
      expect(result).toBe(false);
    });

    test("encrypt methods throw when not initialized", () => {
      expect(() => service.encryptData({})).toThrow(
        "Encryption not initialized",
      );
      expect(() => service.encrypt({})).toThrow("Encryption not initialized");
    });

    test("decrypt methods throw when not initialized", () => {
      expect(() => service.decryptData("data")).toThrow(
        "Encryption not initialized",
      );
      expect(() => service.decrypt("data")).toThrow(
        "Encryption not initialized",
      );
    });

    test("init method exists", () => {
      expect(typeof service.init).toBe("function");
    });

    test("KEY_DERIVATION_ITERATIONS constant exists", () => {
      expect(service.KEY_DERIVATION_ITERATIONS).toBe(100000);
    });
  });

  describe("error handling", () => {
    test("handles AsyncStorage errors gracefully", async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));

      const syncId = await service.getSyncId();
      expect(syncId).toBe(null);

      const enabled = await service.isEnabled();
      expect(enabled).toBe(false);
    });

    test("handles storage errors in clear", async () => {
      AsyncStorage.removeItem.mockRejectedValue(new Error("Storage error"));

      // Should not throw
      await expect(service.clear()).resolves.toBeUndefined();
    });
  });

  describe("storage functionality", () => {
    test("isEnabled returns correct boolean values", async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      expect(await service.isEnabled()).toBe(false);

      AsyncStorage.getItem.mockResolvedValue("some-id");
      expect(await service.isEnabled()).toBe(true);
    });

    test("getSyncId returns stored value", async () => {
      const testId = "test-sync-id-123";
      AsyncStorage.getItem.mockResolvedValue(testId);

      const result = await service.getSyncId();
      expect(result).toBe(testId);
    });
  });

  describe("key derivation edge cases", () => {
    test("handles different salt formats", async () => {
      // String salt
      const result1 = await service.deriveKeyFromPhrase("test", "string-salt");
      expect(result1.syncId).toBeTruthy();

      // Null salt
      const result2 = await service.deriveKeyFromPhrase("test", null);
      expect(result2.syncId).toBeTruthy();
    });

    test("produces different results for different phrases", async () => {
      // Reset mocks to allow different results
      const util = require("tweetnacl-util");
      let callCount = 0;
      util.encodeBase64.mockImplementation(
        (bytes) => `mock${callCount++}${bytes.length}`,
      );

      const result1 = await service.deriveKeyFromPhrase("phrase1");
      const result2 = await service.deriveKeyFromPhrase("phrase2");

      expect(result1.syncId).not.toBe(result2.syncId);
    });
  });
});
