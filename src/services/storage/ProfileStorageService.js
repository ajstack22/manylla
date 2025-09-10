import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChildProfile } from "../../types/ChildProfile";

const STORAGE_KEYS = {
  PROFILES: "manylla_profiles",
  ACTIVE_PROFILE: "manylla_active_profile",
  HAS_ONBOARDED: "manylla_has_onboarded",
};

class ProfileStorageService {
  async hasProfile() {
    try {
      const profiles = await this.getProfiles();
      return profiles.length > 0;
    } catch (error) {
      return false;
    }
  }

  async getProfiles() {
    try {
      const profilesJson = await AsyncStorage.getItem(STORAGE_KEYS.PROFILES);
      if (!profilesJson) {
        return [];
      }
      return JSON.parse(profilesJson);
    } catch (error) {
      return [];
    }
  }

  async saveProfiles(profiles) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PROFILES,
        JSON.stringify(profiles),
      );
    } catch (error) {
      throw error;
    }
  }

  async addProfile(profile) {
    try {
      const profiles = await this.getProfiles();
      profiles.push(profile);
      await this.saveProfiles(profiles);
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(id, updates) {
    try {
      const profiles = await this.getProfiles();
      const index = profiles.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error("Profile not found");
      }
      profiles[index] = { ...profiles[index], ...updates };
      await this.saveProfiles(profiles);
    } catch (error) {
      throw error;
    }
  }

  async deleteProfile(id) {
    try {
      const profiles = await this.getProfiles();
      const filtered = profiles.filter((p) => p.id !== id);
      await this.saveProfiles(filtered);
    } catch (error) {
      throw error;
    }
  }

  async getActiveProfileId() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE);
    } catch (error) {
      return null;
    }
  }

  async setActiveProfileId(id) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, id);
    } catch (error) {
      throw error;
    }
  }

  async getActiveProfile() {
    try {
      const activeId = await this.getActiveProfileId();
      if (!activeId) {
        return null;
      }
      const profiles = await this.getProfiles();
      return profiles.find((p) => p.id === activeId) || null;
    } catch (error) {
      return null;
    }
  }

  async setHasOnboarded(value) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, value.toString());
    } catch (error) {
      throw error;
    }
  }

  async getHasOnboarded() {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED);
      return value === "true";
    } catch (error) {
      return false;
    }
  }

  async clearAll() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.PROFILES,
        STORAGE_KEYS.ACTIVE_PROFILE,
        STORAGE_KEYS.HAS_ONBOARDED,
      ]);
    } catch (error) {
      throw error;
    }
  }
}

export default new ProfileStorageService();
