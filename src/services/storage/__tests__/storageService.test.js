/* eslint-disable */
import { StorageService } from "../storageService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import platform from "../../../utils/platform";

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("../../../utils/platform", () => ({
  isWeb: false,
}));

// Mock localStorage for web tests
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(global, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

describe("StorageService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    platform.isWeb = false;
    process.env.NODE_ENV = "test";
  });

  describe("getProfile", () => {
    it("should get profile from AsyncStorage on mobile", async () => {
      const profileData = {
        id: "1",
        name: "Test Profile",
        dateOfBirth: "2020-01-01",
        entries: [{ id: "1", date: "2023-01-01", content: "Test entry" }]
      };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(profileData));

      const result = await StorageService.getProfile();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith("manylla_profile");
      expect(result.name).toBe("Test Profile");
      expect(result.dateOfBirth).toBeInstanceOf(Date);
      expect(result.entries[0].date).toBeInstanceOf(Date);
    });

    it("should get profile from localStorage on web", async () => {
      platform.isWeb = true;
      const profileData = { id: "1", name: "Web Profile" };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(profileData));

      const result = await StorageService.getProfile();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("manylla_profile");
      expect(result.name).toBe("Web Profile");
    });

    it("should return null when no profile exists", async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await StorageService.getProfile();

      expect(result).toBeNull();
    });

    it("should return null when storage fails", async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));

      const result = await StorageService.getProfile();

      expect(result).toBeNull();
    });

    it("should convert date strings to Date objects", async () => {
      const profileData = {
        id: "1",
        dateOfBirth: "2020-01-01T00:00:00.000Z",
        createdAt: "2023-01-01T00:00:00.000Z",
        updatedAt: "2023-01-02T00:00:00.000Z",
      };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(profileData));

      const result = await StorageService.getProfile();

      expect(result.dateOfBirth).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("should handle entries without dates", async () => {
      const profileData = {
        id: "1",
        entries: [
          { id: "1", content: "Entry with date", date: "2023-01-01" },
          { id: "2", content: "Entry without date" }
        ]
      };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(profileData));

      const result = await StorageService.getProfile();

      expect(result.entries[0].date).toBeInstanceOf(Date);
      expect(result.entries[1].date).toBeInstanceOf(Date);
    });
  });

  describe("saveProfile", () => {
    it("should save profile to AsyncStorage on mobile", async () => {
      const profile = { id: "1", name: "Test Profile" };

      await StorageService.saveProfile(profile);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "manylla_profile",
        JSON.stringify(profile)
      );
    });

    it("should save profile to localStorage on web", async () => {
      platform.isWeb = true;
      const profile = { id: "1", name: "Web Profile" };

      await StorageService.saveProfile(profile);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "manylla_profile",
        JSON.stringify(profile)
      );
    });

    it("should throw error when storage fails", async () => {
      const profile = { id: "1", name: "Test Profile" };
      AsyncStorage.setItem.mockRejectedValue(new Error("Storage error"));

      await expect(StorageService.saveProfile(profile)).rejects.toThrow("Storage error");
    });
  });

  describe("clearProfile", () => {
    it("should clear profile from AsyncStorage on mobile", async () => {
      await StorageService.clearProfile();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("manylla_profile");
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("manylla_onboarding_completed");
    });

    it("should clear profile from localStorage on web", async () => {
      platform.isWeb = true;

      await StorageService.clearProfile();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("manylla_profile");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("manylla_onboarding_completed");
    });

    it("should handle storage errors silently", async () => {
      AsyncStorage.removeItem.mockRejectedValue(new Error("Storage error"));

      // Should not throw
      await expect(StorageService.clearProfile()).resolves.toBeUndefined();
    });
  });

  describe("static properties", () => {
    it("should have correct profile key", () => {
      expect(StorageService.PROFILE_KEY).toBe("manylla_profile");
    });
  });
});