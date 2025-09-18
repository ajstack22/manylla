/* eslint-disable */
/**
 * InitSampleData Utility Tests
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeSampleData } from "../initSampleData";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe("initializeSampleData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should initialize sample data when no existing profile", async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();

    await initializeSampleData();

    expect(AsyncStorage.getItem).toHaveBeenCalledWith("childProfile");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "childProfile",
      expect.any(String),
    );
  });

  test("should not initialize when profile already exists", async () => {
    const existingProfile = JSON.stringify({ id: "1", name: "Test Child" });
    AsyncStorage.getItem.mockResolvedValue(existingProfile);

    await initializeSampleData();

    expect(AsyncStorage.getItem).toHaveBeenCalledWith("childProfile");
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  test("should create sample profile with correct structure", async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockImplementation((key, value) => {
      const profile = JSON.parse(value);

      // Check basic structure
      expect(profile).toHaveProperty("id");
      expect(profile).toHaveProperty("name");
      expect(profile).toHaveProperty("dateOfBirth");
      expect(profile).toHaveProperty("categories");
      expect(profile).toHaveProperty("entries");
      expect(profile).toHaveProperty("quickInfo");
      expect(profile).toHaveProperty("createdAt");
      expect(profile).toHaveProperty("updatedAt");

      // Check types
      expect(typeof profile.id).toBe("string");
      expect(typeof profile.name).toBe("string");
      expect(Array.isArray(profile.categories)).toBe(true);
      expect(Array.isArray(profile.quickInfo)).toBe(true);
      expect(typeof profile.entries).toBe("object");

      return Promise.resolve();
    });

    await initializeSampleData();

    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  test("should handle AsyncStorage errors gracefully", async () => {
    AsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));

    // Should not throw error and return empty array on error
    const result = await initializeSampleData();
    expect(result).toEqual([]);
  });

  test("should handle setItem errors gracefully", async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockRejectedValue(new Error("Storage error"));

    // Should not throw error and return empty array on error
    const result = await initializeSampleData();
    expect(result).toEqual([]);
  });

  test("should create sample data with realistic content", async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockImplementation((key, value) => {
      const profile = JSON.parse(value);

      // Should have sample child name
      expect(profile.name).toBe("Alex Johnson");

      // Should have reasonable date of birth
      expect(new Date(profile.dateOfBirth).getFullYear()).toBeGreaterThan(2000);

      // Should have sample categories
      expect(profile.categories.length).toBeGreaterThan(0);

      // Categories should have proper structure
      profile.categories.forEach((category) => {
        expect(category).toHaveProperty("id");
        expect(category).toHaveProperty("name");
        expect(category).toHaveProperty("displayName");
        expect(category).toHaveProperty("color");
      });

      return Promise.resolve();
    });

    await initializeSampleData();

    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  test("should create profile with proper structure", async () => {
    AsyncStorage.getItem.mockResolvedValue(null);

    const result = await initializeSampleData();

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("dateOfBirth");
    expect(result).toHaveProperty("categories");
    expect(result).toHaveProperty("entries");
    expect(result).toHaveProperty("createdAt");
    expect(result).toHaveProperty("updatedAt");
  });

  test("should create categories with proper structure", async () => {
    AsyncStorage.getItem.mockResolvedValue(null);

    const result = await initializeSampleData();

    expect(result.categories).toBeDefined();
    expect(Array.isArray(result.categories)).toBe(true);
    expect(result.categories.length).toBeGreaterThan(0);

    result.categories.forEach((category) => {
      expect(category).toHaveProperty("id");
      expect(category).toHaveProperty("name");
      expect(category).toHaveProperty("displayName");
      expect(category).toHaveProperty("icon");
      expect(category).toHaveProperty("color");
      expect(category).toHaveProperty("order");
      expect(category).toHaveProperty("isVisible");
      expect(category).toHaveProperty("isCustom");
    });
  });

  test("should create entries with proper structure", async () => {
    AsyncStorage.getItem.mockResolvedValue(null);

    const result = await initializeSampleData();

    expect(result.entries).toBeDefined();
    expect(Array.isArray(result.entries)).toBe(true);
    expect(result.entries.length).toBeGreaterThan(0);

    result.entries.forEach((entry) => {
      expect(entry).toHaveProperty("id");
      expect(entry).toHaveProperty("category");
      expect(entry).toHaveProperty("title");
      expect(entry).toHaveProperty("description");
      expect(entry).toHaveProperty("date");
    });
  });

  test("should include quick-info category", async () => {
    AsyncStorage.getItem.mockResolvedValue(null);

    const result = await initializeSampleData();

    const quickInfoCategory = result.categories.find(
      (cat) => cat.id === "quick-info",
    );
    expect(quickInfoCategory).toBeDefined();
    expect(quickInfoCategory.isQuickInfo).toBe(true);
  });

  test("should include entries for multiple categories", async () => {
    AsyncStorage.getItem.mockResolvedValue(null);

    const result = await initializeSampleData();

    const categories = [
      ...new Set(result.entries.map((entry) => entry.category)),
    ];
    expect(categories.length).toBeGreaterThan(1);
  });

  test("should have valid date objects", async () => {
    AsyncStorage.getItem.mockResolvedValue(null);

    const result = await initializeSampleData();

    expect(result.dateOfBirth).toBeInstanceOf(Date);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);

    result.entries.forEach((entry) => {
      expect(entry.date).toBeInstanceOf(Date);
    });
  });

  test("should return existing profile if already present", async () => {
    const existingProfile = {
      id: "2",
      name: "Existing Child",
      dateOfBirth: new Date("2016-01-01"),
      categories: [],
      entries: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingProfile));

    const result = await initializeSampleData();

    expect(result.name).toBe("Existing Child");
    expect(result.id).toBe("2");
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });
});
