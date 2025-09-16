/**
 * Comprehensive test coverage for photoSyncExclusion
 * Tests photo handling, storage, and sync preparation functionality
 */

import {
  prepareProfileForSync,
  restorePhotoToProfile,
  storePhotoLocally,
  getLocalPhoto,
} from "../photoSyncExclusion";

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock require for AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  default: mockAsyncStorage,
}));

describe("photoSyncExclusion", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup global localStorage mock
    Object.defineProperty(global, "localStorage", {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    // Setup window for web environment tests
    if (!global.window) {
      Object.defineProperty(global, "window", {
        value: {
          localStorage: mockLocalStorage,
        },
        writable: true,
        configurable: true,
      });
    } else {
      global.window.localStorage = mockLocalStorage;
    }
  });

  afterEach(() => {
    // Clean up global mocks
    if (global.window) {
      delete global.window;
    }
    if (global.localStorage) {
      delete global.localStorage;
    }
  });

  describe("prepareProfileForSync", () => {
    test("should return profile unchanged if no profile provided", () => {
      expect(prepareProfileForSync(null)).toBeNull();
      expect(prepareProfileForSync(undefined)).toBeUndefined();
    });

    test("should return profile unchanged if no photo", () => {
      const profile = {
        id: "test-id",
        name: "Test Profile",
        categories: [],
      };

      const result = prepareProfileForSync(profile);

      expect(result).toEqual(profile);
      expect(result.photo).toBeUndefined();
      expect(result.photoRef).toBeUndefined();
    });

    test("should extract photo and create photoRef", () => {
      const profile = {
        id: "test-id",
        name: "Test Profile",
        photo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
        updatedAt: "2023-01-01T00:00:00Z",
        categories: [],
      };

      const result = prepareProfileForSync(profile);

      expect(result.photo).toBeUndefined();
      expect(result.photoRef).toEqual({
        id: "photo_test-id",
        hasPhoto: true,
        updatedAt: "2023-01-01T00:00:00Z",
      });
      expect(result.id).toBe("test-id");
      expect(result.name).toBe("Test Profile");
      expect(result.categories).toEqual([]);
    });

    test("should handle profile without ID using default", () => {
      const profile = {
        name: "Test Profile",
        photo: "data:image/jpeg;base64,test",
        updatedAt: "2023-01-01T00:00:00Z",
      };

      const result = prepareProfileForSync(profile);

      expect(result.photoRef).toEqual({
        id: "photo_default",
        hasPhoto: true,
        updatedAt: "2023-01-01T00:00:00Z",
      });
    });

    test("should not modify original profile object", () => {
      const profile = {
        id: "test-id",
        name: "Test Profile",
        photo: "data:image/jpeg;base64,test",
        updatedAt: "2023-01-01T00:00:00Z",
      };

      const originalPhoto = profile.photo;
      const result = prepareProfileForSync(profile);

      // Original should still have photo
      expect(profile.photo).toBe(originalPhoto);
      // Result should not have photo
      expect(result.photo).toBeUndefined();
      // They should be different objects
      expect(result).not.toBe(profile);
    });

    test("should handle empty photo string", () => {
      const profile = {
        id: "test-id",
        name: "Test Profile",
        photo: "",
        updatedAt: "2023-01-01T00:00:00Z",
      };

      const result = prepareProfileForSync(profile);

      expect(result.photo).toBeUndefined();
      expect(result.photoRef).toEqual({
        id: "photo_test-id",
        hasPhoto: true,
        updatedAt: "2023-01-01T00:00:00Z",
      });
    });
  });

  describe("restorePhotoToProfile", () => {
    test("should return profile unchanged if no profile provided", () => {
      expect(restorePhotoToProfile(null, {})).toBeNull();
      expect(restorePhotoToProfile(undefined, {})).toBeUndefined();
    });

    test("should return profile unchanged if no photoRef", () => {
      const syncProfile = {
        id: "test-id",
        name: "Test Profile",
        categories: [],
      };

      const result = restorePhotoToProfile(syncProfile, {});

      expect(result).toEqual(syncProfile);
    });

    test("should restore photo from local storage", () => {
      const syncProfile = {
        id: "test-id",
        name: "Test Profile",
        photoRef: {
          id: "photo_test-id",
          hasPhoto: true,
          updatedAt: "2023-01-01T00:00:00Z",
        },
        categories: [],
      };

      const localPhotos = {
        "photo_test-id": "data:image/jpeg;base64,restored_photo",
      };

      const result = restorePhotoToProfile(syncProfile, localPhotos);

      expect(result.photo).toBe("data:image/jpeg;base64,restored_photo");
      expect(result.photoRef).toBeUndefined();
      expect(result.id).toBe("test-id");
      expect(result.name).toBe("Test Profile");
    });

    test("should handle missing photo in local storage", () => {
      const syncProfile = {
        id: "test-id",
        name: "Test Profile",
        photoRef: {
          id: "photo_test-id",
          hasPhoto: true,
          updatedAt: "2023-01-01T00:00:00Z",
        },
        categories: [],
      };

      const localPhotos = {}; // Empty local photos

      const result = restorePhotoToProfile(syncProfile, localPhotos);

      expect(result.photo).toBeUndefined();
      expect(result.photoRef).toBeUndefined();
      expect(result.id).toBe("test-id");
    });

    test("should handle null localPhotos", () => {
      const syncProfile = {
        id: "test-id",
        name: "Test Profile",
        photoRef: {
          id: "photo_test-id",
          hasPhoto: true,
          updatedAt: "2023-01-01T00:00:00Z",
        },
        categories: [],
      };

      const result = restorePhotoToProfile(syncProfile, null);

      expect(result.photo).toBeUndefined();
      expect(result.photoRef).toBeUndefined();
    });

    test("should handle photoRef without hasPhoto flag", () => {
      const syncProfile = {
        id: "test-id",
        name: "Test Profile",
        photoRef: {
          id: "photo_test-id",
          updatedAt: "2023-01-01T00:00:00Z",
          // hasPhoto is missing
        },
        categories: [],
      };

      const localPhotos = {
        "photo_test-id": "data:image/jpeg;base64,photo",
      };

      const result = restorePhotoToProfile(syncProfile, localPhotos);

      // Should not restore photo because hasPhoto is falsy
      expect(result.photo).toBeUndefined();
      expect(result.photoRef).toEqual(syncProfile.photoRef); // photoRef should remain
    });

    test("should not modify original sync profile object", () => {
      const syncProfile = {
        id: "test-id",
        name: "Test Profile",
        photoRef: {
          id: "photo_test-id",
          hasPhoto: true,
          updatedAt: "2023-01-01T00:00:00Z",
        },
        categories: [],
      };

      const localPhotos = {
        "photo_test-id": "data:image/jpeg;base64,photo",
      };

      const originalPhotoRef = syncProfile.photoRef;
      const result = restorePhotoToProfile(syncProfile, localPhotos);

      // Original should still have photoRef
      expect(syncProfile.photoRef).toBe(originalPhotoRef);
      // Result should not have photoRef
      expect(result.photoRef).toBeUndefined();
      // They should be different objects
      expect(result).not.toBe(syncProfile);
    });
  });

  describe("storePhotoLocally - Web Environment", () => {
    beforeEach(() => {
      // Set up web environment
      global.window = { localStorage: mockLocalStorage };
    });

    test("should store photo in localStorage for web", async () => {
      const profileId = "test-profile";
      const photoData = "data:image/jpeg;base64,test_data";

      await storePhotoLocally(profileId, photoData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "manylla_photos_photo_test-profile",
        photoData,
      );
    });

    test("should handle profileId as undefined", async () => {
      const photoData = "data:image/jpeg;base64,test_data";

      await storePhotoLocally(undefined, photoData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "manylla_photos_photo_default",
        photoData,
      );
    });

    test("should handle profileId as null", async () => {
      const photoData = "data:image/jpeg;base64,test_data";

      await storePhotoLocally(null, photoData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "manylla_photos_photo_default",
        photoData,
      );
    });
  });

  describe("storePhotoLocally - React Native Environment", () => {
    beforeEach(() => {
      // Remove window to simulate React Native environment
      delete global.window;
    });

    test("should store photo in AsyncStorage for React Native", async () => {
      const profileId = "test-profile";
      const photoData = "data:image/jpeg;base64,test_data";

      await storePhotoLocally(profileId, photoData);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        "manylla_photos_photo_test-profile",
        photoData,
      );
    });

    test("should handle AsyncStorage errors gracefully", async () => {
      const profileId = "test-profile";
      const photoData = "data:image/jpeg;base64,test_data";

      mockAsyncStorage.setItem.mockRejectedValue(new Error("Storage error"));

      // Should not throw
      await expect(
        storePhotoLocally(profileId, photoData),
      ).resolves.toBeUndefined();
    });
  });

  describe("getLocalPhoto - Web Environment", () => {
    beforeEach(() => {
      // Set up web environment
      global.window = { localStorage: mockLocalStorage };
    });

    test("should retrieve photo from localStorage for web", async () => {
      const profileId = "test-profile";
      const expectedPhoto = "data:image/jpeg;base64,test_data";

      mockLocalStorage.getItem.mockReturnValue(expectedPhoto);

      const result = await getLocalPhoto(profileId);

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        "manylla_photos_photo_test-profile",
      );
      expect(result).toBe(expectedPhoto);
    });

    test("should return null when photo not found in localStorage", async () => {
      const profileId = "test-profile";

      mockLocalStorage.getItem.mockReturnValue(null);

      const result = await getLocalPhoto(profileId);

      expect(result).toBeNull();
    });

    test("should handle profileId as undefined", async () => {
      mockLocalStorage.getItem.mockReturnValue("test_photo");

      const result = await getLocalPhoto(undefined);

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        "manylla_photos_photo_default",
      );
      expect(result).toBe("test_photo");
    });

    test("should handle profileId as null", async () => {
      mockLocalStorage.getItem.mockReturnValue("test_photo");

      const result = await getLocalPhoto(null);

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        "manylla_photos_photo_default",
      );
      expect(result).toBe("test_photo");
    });
  });

  describe("getLocalPhoto - React Native Environment", () => {
    beforeEach(() => {
      // Remove window to simulate React Native environment
      delete global.window;
    });

    test("should retrieve photo from AsyncStorage for React Native", async () => {
      const profileId = "test-profile";
      const expectedPhoto = "data:image/jpeg;base64,test_data";

      mockAsyncStorage.getItem.mockResolvedValue(expectedPhoto);

      const result = await getLocalPhoto(profileId);

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
        "manylla_photos_photo_test-profile",
      );
      expect(result).toBe(expectedPhoto);
    });

    test("should return null when photo not found in AsyncStorage", async () => {
      const profileId = "test-profile";

      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await getLocalPhoto(profileId);

      expect(result).toBeNull();
    });

    test("should handle AsyncStorage errors gracefully", async () => {
      const profileId = "test-profile";

      mockAsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));

      // Should not throw, but will return the rejected promise
      await expect(getLocalPhoto(profileId)).rejects.toThrow("Storage error");
    });
  });

  describe("Integration tests", () => {
    test("should prepare profile and restore it correctly", () => {
      const originalProfile = {
        id: "test-id",
        name: "Test Profile",
        photo: "data:image/jpeg;base64,original_photo",
        updatedAt: "2023-01-01T00:00:00Z",
        categories: ["category1"],
      };

      // Prepare for sync
      const syncProfile = prepareProfileForSync(originalProfile);

      // Simulate local photo storage
      const localPhotos = {
        "photo_test-id": originalProfile.photo,
      };

      // Restore after sync
      const restoredProfile = restorePhotoToProfile(syncProfile, localPhotos);

      expect(restoredProfile).toEqual(originalProfile);
      expect(restoredProfile.photo).toBe(originalProfile.photo);
      expect(restoredProfile.photoRef).toBeUndefined();
    });

    test("should handle full workflow with storage", async () => {
      global.window = { localStorage: mockLocalStorage };

      const profileId = "test-profile";
      const photoData = "data:image/jpeg;base64,workflow_test";

      // Store photo
      await storePhotoLocally(profileId, photoData);

      // Mock retrieval
      mockLocalStorage.getItem.mockReturnValue(photoData);

      // Retrieve photo
      const retrievedPhoto = await getLocalPhoto(profileId);

      expect(retrievedPhoto).toBe(photoData);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "manylla_photos_photo_test-profile",
        photoData,
      );
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        "manylla_photos_photo_test-profile",
      );
    });
  });

  describe("Edge cases", () => {
    test("should handle empty string profileId", () => {
      const profile = {
        id: "",
        name: "Test Profile",
        photo: "data:image/jpeg;base64,test",
        updatedAt: "2023-01-01T00:00:00Z",
      };

      const result = prepareProfileForSync(profile);

      expect(result.photoRef.id).toBe("photo_");
    });

    test("should handle profile with only photoRef (no photo)", () => {
      const profile = {
        id: "test-id",
        name: "Test Profile",
        photoRef: {
          id: "photo_test-id",
          hasPhoto: true,
        },
      };

      const result = prepareProfileForSync(profile);

      // Should not create another photoRef since there's no photo
      expect(result.photo).toBeUndefined();
      expect(result.photoRef).toEqual(profile.photoRef);
    });

    test("should handle special characters in profileId", async () => {
      global.window = { localStorage: mockLocalStorage };

      const profileId = "test-profile-with-special-chars-@#$%";
      const photoData = "data:image/jpeg;base64,test";

      await storePhotoLocally(profileId, photoData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "manylla_photos_photo_test-profile-with-special-chars-@#$%",
        photoData,
      );
    });
  });
});
