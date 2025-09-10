import AsyncStorage from "@react-native-async-storage/async-storage";

export class StorageAdapter {
  static async getItem(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  static async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  }

  static async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw error;
    }
  }

  static async clear() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  }

  static async getAllKeys() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys;
    } catch (error) {
      console.error("Error getting all keys:", error);
      return [];
    }
  }

  static async multiGet(keys) {
    try {
      const results = await AsyncStorage.multiGet(keys);
      return results;
    } catch (error) {
      console.error("Error getting multiple items:", error);
      return keys.map((key) => [key, null]);
    }
  }

  static async multiSet(keyValuePairs) {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      console.error("Error setting multiple items:", error);
      throw error;
    }
  }

  static async multiRemove(keys) {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error("Error removing multiple items:", error);
      throw error;
    }
  }
}
