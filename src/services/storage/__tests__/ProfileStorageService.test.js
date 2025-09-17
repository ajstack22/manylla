import AsyncStorage from "@react-native-async-storage/async-storage";
import profileStorageService from "../ProfileStorageService";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));

describe("ProfileStorageService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all mocks to resolved state
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();
    AsyncStorage.multiRemove.mockResolvedValue();
  });

  describe("saveProfiles", () => {
    it("should save profiles to storage", async () => {
      const profiles = [{ id: "1", name: "Test Profile" }];

      await profileStorageService.saveProfiles(profiles);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "manylla_profiles",
        JSON.stringify(profiles)
      );
    });

    it("should throw error when storage fails", async () => {
      const profiles = [{ id: "1", name: "Test Profile" }];
      AsyncStorage.setItem.mockRejectedValue(new Error("Storage error"));

      await expect(profileStorageService.saveProfiles(profiles)).rejects.toThrow("Storage error");
    });
  });

  describe("getProfiles", () => {
    it("should return parsed profiles from storage", async () => {
      const profiles = [{ id: "1", name: "Test Profile" }];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(profiles));

      const result = await profileStorageService.getProfiles();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith("manylla_profiles");
      expect(result).toEqual(profiles);
    });

    it("should return empty array when no profiles exist", async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await profileStorageService.getProfiles();

      expect(result).toEqual([]);
    });

    it("should return empty array when storage fails", async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));

      const result = await profileStorageService.getProfiles();

      expect(result).toEqual([]);
    });
  });

  describe("hasProfile", () => {
    it("should return true when profiles exist", async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([{ id: "1" }]));

      const result = await profileStorageService.hasProfile();

      expect(result).toBe(true);
    });

    it("should return false when no profiles exist", async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await profileStorageService.hasProfile();

      expect(result).toBe(false);
    });

    it("should return false when storage fails", async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));

      const result = await profileStorageService.hasProfile();

      expect(result).toBe(false);
    });
  });

  describe("deleteProfile", () => {
    it("should remove profile and save remaining profiles", async () => {
      const profiles = [
        { id: "1", name: "Profile 1" },
        { id: "2", name: "Profile 2" }
      ];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(profiles));

      await profileStorageService.deleteProfile("1");

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "manylla_profiles",
        JSON.stringify([{ id: "2", name: "Profile 2" }])
      );
    });

    it("should throw error when save fails", async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([{ id: "1", name: "Test" }]));
      AsyncStorage.setItem.mockRejectedValue(new Error("Storage error"));

      await expect(profileStorageService.deleteProfile("1")).rejects.toThrow("Storage error");
    });
  });

  describe("addProfile", () => {
    it("should add profile to existing profiles", async () => {
      const existingProfiles = [{ id: "1", name: "Profile 1" }];
      const newProfile = { id: "2", name: "Profile 2" };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingProfiles));

      await profileStorageService.addProfile(newProfile);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "manylla_profiles",
        JSON.stringify([...existingProfiles, newProfile])
      );
    });
  });

  describe("updateProfile", () => {
    it("should update existing profile", async () => {
      const profiles = [
        { id: "1", name: "Profile 1", age: 10 },
        { id: "2", name: "Profile 2", age: 12 }
      ];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(profiles));

      await profileStorageService.updateProfile("1", { age: 11 });

      const expectedProfiles = [
        { id: "1", name: "Profile 1", age: 11 },
        { id: "2", name: "Profile 2", age: 12 }
      ];
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "manylla_profiles",
        JSON.stringify(expectedProfiles)
      );
    });

    it("should throw error when profile not found", async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));

      await expect(profileStorageService.updateProfile("999", { age: 11 }))
        .rejects.toThrow("Profile not found");
    });
  });

  describe("getActiveProfileId", () => {
    it("should return active profile ID", async () => {
      AsyncStorage.getItem.mockResolvedValue("profile-123");

      const result = await profileStorageService.getActiveProfileId();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith("manylla_active_profile");
      expect(result).toBe("profile-123");
    });

    it("should return null when no active profile", async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await profileStorageService.getActiveProfileId();

      expect(result).toBeNull();
    });
  });

  describe("setActiveProfileId", () => {
    it("should set active profile ID", async () => {
      await profileStorageService.setActiveProfileId("profile-123");

      expect(AsyncStorage.setItem).toHaveBeenCalledWith("manylla_active_profile", "profile-123");
    });
  });

  describe("getActiveProfile", () => {
    it("should return active profile", async () => {
      const profiles = [
        { id: "1", name: "Profile 1" },
        { id: "2", name: "Profile 2" }
      ];
      AsyncStorage.getItem
        .mockResolvedValueOnce("1") // getActiveProfileId
        .mockResolvedValueOnce(JSON.stringify(profiles)); // getProfiles

      const result = await profileStorageService.getActiveProfile();

      expect(result).toEqual({ id: "1", name: "Profile 1" });
    });

    it("should return null when no active profile ID", async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await profileStorageService.getActiveProfile();

      expect(result).toBeNull();
    });
  });

  describe("setHasOnboarded", () => {
    it("should set onboarding status as string", async () => {
      await profileStorageService.setHasOnboarded(true);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith("manylla_has_onboarded", "true");
    });
  });

  describe("getHasOnboarded", () => {
    it("should return true when onboarded", async () => {
      AsyncStorage.getItem.mockResolvedValue("true");

      const result = await profileStorageService.getHasOnboarded();

      expect(result).toBe(true);
    });

    it("should return false when not onboarded", async () => {
      AsyncStorage.getItem.mockResolvedValue("false");

      const result = await profileStorageService.getHasOnboarded();

      expect(result).toBe(false);
    });

    it("should return false when storage fails", async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));

      const result = await profileStorageService.getHasOnboarded();

      expect(result).toBe(false);
    });
  });

  describe("clearAll", () => {
    it("should clear all storage keys", async () => {
      await profileStorageService.clearAll();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        "manylla_profiles",
        "manylla_active_profile",
        "manylla_has_onboarded",
      ]);
    });

    it("should throw error when storage fails", async () => {
      AsyncStorage.multiRemove.mockRejectedValue(new Error("Storage error"));

      await expect(profileStorageService.clearAll()).rejects.toThrow("Storage error");
    });
  });
});