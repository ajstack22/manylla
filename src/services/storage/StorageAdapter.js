import AsyncStorage from "@react-native-async-storage/async-storage";

export class StorageAdapter {
  static async getItem(keytring)romise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  static async setItem(keytring, valuetring)romise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  }

  static async removeItem(keytring)romise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw error;
    }
  }

  static async clear()romise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  }

  static async getAllKeys()romise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys as string[];
    } catch (error) {
      console.error("Error getting all keys:", error);
      return [];
    }
  }

  static async multiGet(keystring[])romise<[string, string | null][]> {
    try {
      const results = await AsyncStorage.multiGet(keys);
      return results as [string, string | null][];
    } catch (error) {
      console.error("Error getting multiple items:", error);
      return keys.map((key) => [key, null]);
    }
  }

  static async multiSet(keyValuePairsstring, string][])romise<void> {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      console.error("Error setting multiple items:", error);
      throw error;
    }
  }

  static async multiRemove(keystring[])romise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error("Error removing multiple items:", error);
      throw error;
    }
  }
}
