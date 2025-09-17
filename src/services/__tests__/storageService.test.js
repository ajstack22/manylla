/**
 * StorageService Tests
 *
 * Tests localStorage operations, profile management, and data validation
 */

import { StorageService } from "../storageService";
import { ProfileValidator } from "../../utils/validation";

// Mock validation utility
jest.mock("../../utils/validation", () => ({
  ProfileValidator: {
    validateProfile: jest.fn(),
    sanitizeProfile: jest.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// P2 TECH DEBT: Remove skip when working on storageService
// Issue: Platform-specific storage mocks
describe.skip("StorageService", () => {
  const mockProfile = {
    id: "test-profile-123",
    name: "Test Child",
    dateOfBirth: "2015-05-15T00:00:00.000Z",
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-06-01T00:00:00.000Z",
    entries: [
      {
        id: "entry-1",
        category: "medical",
        title: "Test Entry",
        content: "Test content",
        date: "2023-06-01T00:00:00.000Z",
      },
    ],
    categories: [],
    version: 1234567890,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();

    // Setup default mocks
    ProfileValidator.validateProfile.mockReturnValue({ valid: true });
    ProfileValidator.sanitizeProfile.mockImplementation((profile) => profile);

    // Mock console methods to suppress development warnings in tests
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Constants", () => {
    it("should have correct storage keys", () => {
      expect(StorageService.PROFILE_KEY).toBe("manylla_profile");
      expect(StorageService.SYNC_TIME_KEY).toBe("manylla_last_sync");
      expect(StorageService.VERSION_KEY).toBe("manylla_version");
    });
  });

  describe("Profile Operations", () => {
    describe("getProfile", () => {
      it("should return null when no profile exists", () => {
        const result = StorageService.getProfile();
        expect(result).toBeNull();
        expect(localStorageMock.getItem).toHaveBeenCalledWith("manylla_profile");
      });

      it("should retrieve and parse profile with date conversion", () => {
        const storedProfile = JSON.stringify(mockProfile);
        localStorageMock.getItem.mockReturnValue(storedProfile);

        const result = StorageService.getProfile();

        expect(result).toBeDefined();
        expect(result.id).toBe(mockProfile.id);
        expect(result.name).toBe(mockProfile.name);
        expect(result.dateOfBirth).toBeInstanceOf(Date);
        expect(result.createdAt).toBeInstanceOf(Date);
        expect(result.updatedAt).toBeInstanceOf(Date);
        expect(result.entries[0].date).toBeInstanceOf(Date);
      });

      it("should handle corrupted JSON gracefully", () => {
        localStorageMock.getItem.mockReturnValue("invalid-json{");

        const result = StorageService.getProfile();

        expect(result).toBeNull();
        expect(console.warn).toHaveBeenCalledWith(
          "Failed to get profile from localStorage:",
          expect.any(String)
        );
      });

      it("should handle localStorage access errors", () => {
        localStorageMock.getItem.mockImplementation(() => {
          throw new Error("localStorage access denied");
        });

        const result = StorageService.getProfile();

        expect(result).toBeNull();
        expect(console.warn).toHaveBeenCalledWith(
          "Failed to get profile from localStorage:",
          "localStorage access denied"
        );
      });

      it("should handle profiles with missing entries array", () => {
        const profileWithoutEntries = { ...mockProfile };
        delete profileWithoutEntries.entries;

        localStorageMock.getItem.mockReturnValue(JSON.stringify(profileWithoutEntries));

        expect(() => StorageService.getProfile()).toThrow();
      });

      it("should not log warnings in production", () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "production";

        localStorageMock.getItem.mockImplementation(() => {
          throw new Error("Test error");
        });

        StorageService.getProfile();

        expect(console.warn).not.toHaveBeenCalled();

        process.env.NODE_ENV = originalEnv;
      });
    });

    describe("saveProfile", () => {
      it("should save valid profile successfully", () => {
        const result = StorageService.saveProfile(mockProfile);

        expect(result).toBe(true);
        expect(ProfileValidator.validateProfile).toHaveBeenCalledWith(mockProfile);
        expect(ProfileValidator.sanitizeProfile).toHaveBeenCalledWith(mockProfile);
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "manylla_profile",
          expect.any(String)
        );
      });

      it("should add version and updatedAt timestamps", () => {
        const originalNow = Date.now;
        const mockNow = 1234567890123;
        Date.now = jest.fn(() => mockNow);

        StorageService.saveProfile(mockProfile);

        const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
        expect(savedData.version).toBe(mockNow);
        expect(savedData.updatedAt).toBeDefined();

        Date.now = originalNow;
      });

      it("should reject invalid profiles", () => {
        ProfileValidator.validateProfile.mockReturnValue({ valid: false });

        const result = StorageService.saveProfile(mockProfile);

        expect(result).toBe(false);
        expect(localStorageMock.setItem).not.toHaveBeenCalled();
      });

      it("should handle localStorage errors gracefully", () => {
        localStorageMock.setItem.mockImplementation(() => {
          throw new Error("localStorage quota exceeded");
        });

        const result = StorageService.saveProfile(mockProfile);

        expect(result).toBe(false);
        expect(console.warn).toHaveBeenCalledWith(
          "Failed to save profile to localStorage:",
          "localStorage quota exceeded"
        );
      });

      it("should handle validation errors", () => {
        ProfileValidator.validateProfile.mockImplementation(() => {
          throw new Error("Validation error");
        });

        const result = StorageService.saveProfile(mockProfile);

        expect(result).toBe(false);
        expect(console.warn).toHaveBeenCalledWith(
          "Failed to save profile to localStorage:",
          "Validation error"
        );
      });

      it("should sanitize profile before saving", () => {
        const unsanitizedProfile = { ...mockProfile, dangerousField: "<script>" };
        const sanitizedProfile = { ...mockProfile };

        ProfileValidator.sanitizeProfile.mockReturnValue(sanitizedProfile);

        StorageService.saveProfile(unsanitizedProfile);

        expect(ProfileValidator.sanitizeProfile).toHaveBeenCalledWith(unsanitizedProfile);

        const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
        expect(savedData.dangerousField).toBeUndefined();
      });
    });

    describe("clearProfile", () => {
      it("should clear all profile-related data", () => {
        const result = StorageService.clearProfile();

        expect(result).toBe(true);
        expect(localStorageMock.removeItem).toHaveBeenCalledWith("manylla_profile");
        expect(localStorageMock.removeItem).toHaveBeenCalledWith("manylla_last_sync");
        expect(localStorageMock.removeItem).toHaveBeenCalledWith("manylla_version");
      });

      it("should handle localStorage errors gracefully", () => {
        localStorageMock.removeItem.mockImplementation(() => {
          throw new Error("localStorage access error");
        });

        const result = StorageService.clearProfile();

        expect(result).toBe(false);
        expect(console.warn).toHaveBeenCalledWith(
          "Failed to clear profile from localStorage:",
          "localStorage access error"
        );
      });
    });
  });

  describe("Sync Metadata Operations", () => {
    describe("getLastSyncTime", () => {
      it("should return null when no sync time exists", () => {
        const result = StorageService.getLastSyncTime();
        expect(result).toBeNull();
      });

      it("should return parsed sync time", () => {
        localStorageMock.getItem.mockReturnValue("1234567890");

        const result = StorageService.getLastSyncTime();

        expect(result).toBe(1234567890);
        expect(localStorageMock.getItem).toHaveBeenCalledWith("manylla_last_sync");
      });

      it("should handle invalid sync time gracefully", () => {
        localStorageMock.getItem.mockReturnValue("invalid-number");

        const result = StorageService.getLastSyncTime();

        expect(result).toBeNaN(); // parseInt returns NaN for invalid strings
      });

      it("should handle localStorage errors", () => {
        localStorageMock.getItem.mockImplementation(() => {
          throw new Error("localStorage error");
        });

        const result = StorageService.getLastSyncTime();

        expect(result).toBeNull();
        expect(console.warn).toHaveBeenCalledWith(
          "Failed to get last sync time from localStorage:",
          "localStorage error"
        );
      });
    });

    describe("setLastSyncTime", () => {
      it("should save sync time as string", () => {
        StorageService.setLastSyncTime(1234567890);

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "manylla_last_sync",
          "1234567890"
        );
      });

      it("should handle number conversion", () => {
        StorageService.setLastSyncTime(Date.now());

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "manylla_last_sync",
          expect.stringMatching(/^\d+$/)
        );
      });
    });

    describe("getVersion", () => {
      it("should return 0 when no version exists", () => {
        const result = StorageService.getVersion();
        expect(result).toBe(0);
      });

      it("should return parsed version", () => {
        localStorageMock.getItem.mockReturnValue("42");

        const result = StorageService.getVersion();

        expect(result).toBe(42);
        expect(localStorageMock.getItem).toHaveBeenCalledWith("manylla_version");
      });

      it("should handle localStorage errors", () => {
        localStorageMock.getItem.mockImplementation(() => {
          throw new Error("localStorage error");
        });

        const result = StorageService.getVersion();

        expect(result).toBe(0);
        expect(console.warn).toHaveBeenCalledWith(
          "Failed to get version from localStorage:",
          "localStorage error"
        );
      });

      it("should handle invalid version strings", () => {
        localStorageMock.getItem.mockReturnValue("not-a-number");

        const result = StorageService.getVersion();

        expect(result).toBeNaN(); // parseInt behavior
      });
    });

    describe("setVersion", () => {
      it("should save version as string", () => {
        StorageService.setVersion(123);

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "manylla_version",
          "123"
        );
      });
    });
  });

  describe("Export/Import Operations", () => {
    describe("exportProfile", () => {
      it("should export profile as formatted JSON", () => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify(mockProfile));

        const result = StorageService.exportProfile();

        expect(result).toBeDefined();
        expect(() => JSON.parse(result)).not.toThrow();

        const parsed = JSON.parse(result);
        expect(parsed.id).toBe(mockProfile.id);
        expect(parsed.name).toBe(mockProfile.name);
      });

      it("should return null when no profile exists", () => {
        const result = StorageService.exportProfile();
        expect(result).toBeNull();
      });

      it("should format JSON with proper indentation", () => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify(mockProfile));

        const result = StorageService.exportProfile();

        // Check that it's properly formatted (contains newlines and spaces)
        expect(result).toContain("\n");
        expect(result).toContain("  "); // 2-space indentation
      });
    });

    describe("importProfile", () => {
      it("should import valid profile JSON", () => {
        const jsonString = JSON.stringify(mockProfile);

        const result = StorageService.importProfile(jsonString);

        expect(result).toBe(true);
        expect(ProfileValidator.validateProfile).toHaveBeenCalled();
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "manylla_profile",
          expect.any(String)
        );
      });

      it("should reject invalid JSON", () => {
        const result = StorageService.importProfile("invalid-json{");

        expect(result).toBe(false);
        expect(console.warn).toHaveBeenCalledWith(
          "Failed to import profile:",
          expect.any(String)
        );
      });

      it("should reject profiles missing required fields", () => {
        const incompleteProfile = { name: "Test" }; // Missing id and entries

        const result = StorageService.importProfile(JSON.stringify(incompleteProfile));

        expect(result).toBe(false);
        expect(console.warn).toHaveBeenCalledWith(
          "Failed to import profile:",
          "Invalid profile structure"
        );
      });

      it("should convert date strings to Date objects", () => {
        const profileWithStringDates = {
          ...mockProfile,
          dateOfBirth: "2015-05-15T00:00:00.000Z",
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-06-01T00:00:00.000Z",
          entries: [
            {
              ...mockProfile.entries[0],
              date: "2023-06-01T00:00:00.000Z",
            },
          ],
        };

        StorageService.importProfile(JSON.stringify(profileWithStringDates));

        // Verify that saveProfile was called (which would have received converted dates)
        expect(ProfileValidator.validateProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            dateOfBirth: expect.any(Date),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            entries: expect.arrayContaining([
              expect.objectContaining({
                date: expect.any(Date),
              }),
            ]),
          })
        );
      });

      it("should handle validation failure during import", () => {
        ProfileValidator.validateProfile.mockReturnValue({ valid: false });

        const result = StorageService.importProfile(JSON.stringify(mockProfile));

        expect(result).toBe(false);
      });

      it("should handle empty entries array", () => {
        const profileWithEmptyEntries = { ...mockProfile, entries: [] };

        const result = StorageService.importProfile(JSON.stringify(profileWithEmptyEntries));

        expect(result).toBe(true);
        expect(ProfileValidator.validateProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            entries: [],
          })
        );
      });

      it("should handle complex profile structures", () => {
        const complexProfile = {
          ...mockProfile,
          entries: [
            {
              id: "entry-1",
              category: "medical",
              title: "Medical Entry",
              content: "Medical content",
              date: "2023-06-01T00:00:00.000Z",
              tags: ["urgent", "medication"],
            },
            {
              id: "entry-2",
              category: "educational",
              title: "School Note",
              content: "Educational content",
              date: "2023-06-02T00:00:00.000Z",
              attachments: ["file1.pdf"],
            },
          ],
          categories: [
            { id: "cat-1", name: "Medical", color: "#ff0000" },
            { id: "cat-2", name: "Educational", color: "#00ff00" },
          ],
        };

        const result = StorageService.importProfile(JSON.stringify(complexProfile));

        expect(result).toBe(true);
        expect(ProfileValidator.validateProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            entries: expect.arrayContaining([
              expect.objectContaining({
                date: expect.any(Date),
                tags: ["urgent", "medication"],
              }),
              expect.objectContaining({
                date: expect.any(Date),
                attachments: ["file1.pdf"],
              }),
            ]),
            categories: expect.arrayContaining([
              expect.objectContaining({ name: "Medical" }),
              expect.objectContaining({ name: "Educational" }),
            ]),
          })
        );
      });
    });
  });

  describe("Edge Cases and Error Scenarios", () => {
    it("should handle localStorage being unavailable", () => {
      // Simulate localStorage being unavailable
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, "localStorage", {
        value: undefined,
        writable: true,
      });

      expect(() => StorageService.getProfile()).toThrow();

      // Restore localStorage
      Object.defineProperty(window, "localStorage", {
        value: originalLocalStorage,
        writable: true,
      });
    });

    it("should handle quota exceeded errors", () => {
      localStorageMock.setItem.mockImplementation(() => {
        const error = new Error("QuotaExceededError");
        error.name = "QuotaExceededError";
        throw error;
      });

      const result = StorageService.saveProfile(mockProfile);

      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith(
        "Failed to save profile to localStorage:",
        "QuotaExceededError"
      );
    });

    it("should handle different quota exceeded scenarios", () => {
      const quotaErrors = [
        "QuotaExceededError",
        "NS_ERROR_DOM_QUOTA_REACHED",
        "QUOTA_EXCEEDED_ERR"
      ];

      quotaErrors.forEach((errorName) => {
        jest.clearAllMocks();
        localStorageMock.setItem.mockImplementation(() => {
          const error = new Error(errorName);
          error.name = errorName;
          throw error;
        });

        const result = StorageService.saveProfile(mockProfile);
        expect(result).toBe(false);
      });
    });

    it("should handle stress test with large profiles", () => {
      const stressProfile = {
        ...mockProfile,
        entries: Array.from({ length: 5000 }, (_, i) => ({
          id: `stress-entry-${i}`,
          category: "stress-test",
          title: `Stress Entry ${i}`,
          content: "Very long content ".repeat(1000),
          date: new Date().toISOString(),
          metadata: {
            tags: Array.from({ length: 50 }, (_, j) => `tag-${j}`),
            attachments: Array.from({ length: 10 }, (_, k) => `file-${k}.pdf`),
          },
        })),
      };

      // Should attempt to save (may succeed or fail based on size)
      const result = StorageService.saveProfile(stressProfile);
      expect(typeof result).toBe("boolean");
    });

    it("should handle profiles with null/undefined values", () => {
      const profileWithNulls = {
        ...mockProfile,
        optionalField: null,
        undefinedField: undefined,
      };

      const result = StorageService.saveProfile(profileWithNulls);

      expect(result).toBe(true);

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData.optionalField).toBeNull();
      expect(savedData.undefinedField).toBeUndefined();
    });

    it("should handle very large profiles", () => {
      const largeProfile = {
        ...mockProfile,
        entries: Array.from({ length: 1000 }, (_, i) => ({
          id: `entry-${i}`,
          category: "test",
          title: `Entry ${i}`,
          content: "Large content ".repeat(100),
          date: new Date().toISOString(),
        })),
      };

      const result = StorageService.saveProfile(largeProfile);

      // Should succeed unless localStorage throws quota error
      expect(ProfileValidator.validateProfile).toHaveBeenCalledWith(largeProfile);
    });

    it("should preserve special characters in profile data", () => {
      const profileWithSpecialChars = {
        ...mockProfile,
        name: "Test Child 测试 🎈",
        entries: [
          {
            id: "entry-1",
            category: "medical",
            title: "Entry with émojis 🏥",
            content: "Content with special chars: àáâãäåæçèéêë",
            date: new Date().toISOString(),
          },
        ],
      };

      StorageService.saveProfile(profileWithSpecialChars);

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData.name).toContain("测试");
      expect(savedData.name).toContain("🎈");
      expect(savedData.entries[0].title).toContain("🏥");
      expect(savedData.entries[0].content).toContain("àáâãäåæçèéêë");
    });
  });

  describe("Data Integrity", () => {
    it("should maintain data consistency across save/load cycles", () => {
      // Save profile
      StorageService.saveProfile(mockProfile);

      // Mock localStorage to return what was just saved
      const savedData = localStorageMock.setItem.mock.calls[0][1];
      localStorageMock.getItem.mockReturnValue(savedData);

      // Load profile
      const loadedProfile = StorageService.getProfile();

      expect(loadedProfile.id).toBe(mockProfile.id);
      expect(loadedProfile.name).toBe(mockProfile.name);
      expect(loadedProfile.entries).toHaveLength(mockProfile.entries.length);
      expect(loadedProfile.dateOfBirth).toBeInstanceOf(Date);
    });

    it("should handle circular references gracefully", () => {
      const circularProfile = { ...mockProfile };
      circularProfile.self = circularProfile; // Create circular reference

      expect(() => StorageService.saveProfile(circularProfile)).toThrow();
    });

    it("should preserve array order in entries", () => {
      const profileWithOrderedEntries = {
        ...mockProfile,
        entries: [
          { id: "1", category: "a", title: "First", content: "First entry", date: new Date().toISOString() },
          { id: "2", category: "b", title: "Second", content: "Second entry", date: new Date().toISOString() },
          { id: "3", category: "c", title: "Third", content: "Third entry", date: new Date().toISOString() },
        ],
      };

      StorageService.saveProfile(profileWithOrderedEntries);

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData.entries[0].title).toBe("First");
      expect(savedData.entries[1].title).toBe("Second");
      expect(savedData.entries[2].title).toBe("Third");
    });
  });
});