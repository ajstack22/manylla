// Web-compatible AsyncStorage replacement using localStorage
const AsyncStorage = {
  async getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  },

  async setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      throw error;
    }
  },

  async removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      throw error;
    }
  },

  async clear() {
    try {
      localStorage.clear();
    } catch (error) {
      throw error;
    }
  },

  async getAllKeys() {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      return [];
    }
  },

  async multiGet(keys) {
    try {
      return keys.map((key) => [key, localStorage.getItem(key)]);
    } catch (error) {
      return [];
    }
  },

  async multiSet(keyValuePairs) {
    try {
      keyValuePairs.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    } catch (error) {
      throw error;
    }
  },

  async multiRemove(keys) {
    try {
      keys.forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      throw error;
    }
  },
};

export default AsyncStorage;
