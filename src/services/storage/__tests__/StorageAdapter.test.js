/* eslint-disable */
import { StorageAdapter } from "../StorageAdapter";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

describe("StorageAdapter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getItem", () => {
    it("should get item from AsyncStorage", async () => {
      AsyncStorage.getItem.mockResolvedValue("test-value");

      const result = await StorageAdapter.getItem("test-key");

      expect(AsyncStorage.getItem).toHaveBeenCalledWith("test-key");
      expect(result).toBe("test-value");
    });

    it("should return null when storage fails", async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));

      const result = await StorageAdapter.getItem("test-key");

      expect(result).toBeNull();
    });
  });

  describe("setItem", () => {
    it("should set item in AsyncStorage", async () => {
      await StorageAdapter.setItem("test-key", "test-value");

      expect(AsyncStorage.setItem).toHaveBeenCalledWith("test-key", "test-value");
    });

    it("should throw error when storage fails", async () => {
      AsyncStorage.setItem.mockRejectedValue(new Error("Storage error"));

      await expect(StorageAdapter.setItem("test-key", "test-value"))
        .rejects.toThrow("Storage error");
    });
  });

  describe("removeItem", () => {
    it("should remove item from AsyncStorage", async () => {
      await StorageAdapter.removeItem("test-key");

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("test-key");
    });

    it("should throw error when storage fails", async () => {
      AsyncStorage.removeItem.mockRejectedValue(new Error("Storage error"));

      await expect(StorageAdapter.removeItem("test-key"))
        .rejects.toThrow("Storage error");
    });
  });

  describe("clear", () => {
    it("should clear all items from AsyncStorage", async () => {
      await StorageAdapter.clear();

      expect(AsyncStorage.clear).toHaveBeenCalled();
    });

    it("should throw error when storage fails", async () => {
      AsyncStorage.clear.mockRejectedValue(new Error("Storage error"));

      await expect(StorageAdapter.clear()).rejects.toThrow("Storage error");
    });
  });

  describe("getAllKeys", () => {
    it("should get all keys from AsyncStorage", async () => {
      const keys = ["key1", "key2", "key3"];
      AsyncStorage.getAllKeys.mockResolvedValue(keys);

      const result = await StorageAdapter.getAllKeys();

      expect(AsyncStorage.getAllKeys).toHaveBeenCalled();
      expect(result).toEqual(keys);
    });

    it("should return empty array when storage fails", async () => {
      AsyncStorage.getAllKeys.mockRejectedValue(new Error("Storage error"));

      const result = await StorageAdapter.getAllKeys();

      expect(result).toEqual([]);
    });
  });

  describe("multiGet", () => {
    it("should get multiple items from AsyncStorage", async () => {
      const keys = ["key1", "key2"];
      const results = [["key1", "value1"], ["key2", "value2"]];
      AsyncStorage.multiGet.mockResolvedValue(results);

      const result = await StorageAdapter.multiGet(keys);

      expect(AsyncStorage.multiGet).toHaveBeenCalledWith(keys);
      expect(result).toEqual(results);
    });

    it("should return null values when storage fails", async () => {
      const keys = ["key1", "key2"];
      AsyncStorage.multiGet.mockRejectedValue(new Error("Storage error"));

      const result = await StorageAdapter.multiGet(keys);

      expect(result).toEqual([["key1", null], ["key2", null]]);
    });
  });

  describe("multiSet", () => {
    it("should set multiple items in AsyncStorage", async () => {
      const keyValuePairs = [["key1", "value1"], ["key2", "value2"]];

      await StorageAdapter.multiSet(keyValuePairs);

      expect(AsyncStorage.multiSet).toHaveBeenCalledWith(keyValuePairs);
    });

    it("should throw error when storage fails", async () => {
      const keyValuePairs = [["key1", "value1"]];
      AsyncStorage.multiSet.mockRejectedValue(new Error("Storage error"));

      await expect(StorageAdapter.multiSet(keyValuePairs))
        .rejects.toThrow("Storage error");
    });
  });

  describe("multiRemove", () => {
    it("should remove multiple items from AsyncStorage", async () => {
      const keys = ["key1", "key2"];

      await StorageAdapter.multiRemove(keys);

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(keys);
    });

    it("should throw error when storage fails", async () => {
      const keys = ["key1", "key2"];
      AsyncStorage.multiRemove.mockRejectedValue(new Error("Storage error"));

      await expect(StorageAdapter.multiRemove(keys))
        .rejects.toThrow("Storage error");
    });
  });
});