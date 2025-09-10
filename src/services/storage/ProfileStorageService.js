import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChildProfile } from "../../types/ChildProfile";

const STORAGE_KEYS = {
  PROFILES: "manylla_profiles",
  ACTIVE_PROFILE: "manylla_active_profile",
  HAS_ONBOARDED: "manylla_has_onboarded",
};

class ProfileStorageService {
  async hasProfile()romise<boolean> {
    try {
      const profiles = await this.getProfiles();
      return profiles.length > 0;
    } catch (error) {
      console.error("Error checking for profiles:", error);
      return false;
    }
  }

  async getProfiles()romise<ChildProfile[]> {
    try {
      const profilesJson = await AsyncStorage.getItem(STORAGE_KEYS.PROFILES);
      if (!profilesJson) {
        return [];
      }
      return JSON.parse(profilesJson);
    } catch (error) {
      console.error("Error getting profiles:", error);
      return [];
    }
  }

  async saveProfiles(profileshildProfile[])romise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PROFILES,
        JSON.stringify(profiles),
      );
    } catch (error) {
      console.error("Error saving profiles:", error);
      throw error;
    }
  }

  async addProfile(profilehildProfile)romise<void> {
    try {
      const profiles = await this.getProfiles();
      profiles.push(profile);
      await this.saveProfiles(profiles);
    } catch (error) {
      console.error("Error adding profile:", error);
      throw error;
    }
  }

  async updateProfile(
    idtring,
    updatesartial<ChildProfile>,
  )romise<void> {
    try {
      const profiles = await this.getProfiles();
      const index = profiles.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error("Profile not found");
      }
      profiles[index] = { ...profiles[index], ...updates };
      await this.saveProfiles(profiles);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  async deleteProfile(idtring)romise<void> {
    try {
      const profiles = await this.getProfiles();
      const filtered = profiles.filter((p) => p.id !== id);
      await this.saveProfiles(filtered);
    } catch (error) {
      console.error("Error deleting profile:", error);
      throw error;
    }
  }

  async getActiveProfileId()romise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE);
    } catch (error) {
      console.error("Error getting active profile:", error);
      return null;
    }
  }

  async setActiveProfileId(idtring)romise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, id);
    } catch (error) {
      console.error("Error setting active profile:", error);
      throw error;
    }
  }

  async getActiveProfile()romise<ChildProfile | null> {
    try {
      const activeId = await this.getActiveProfileId();
      if (!activeId) {
        return null;
      }
      const profiles = await this.getProfiles();
      return profiles.find((p) => p.id === activeId) || null;
    } catch (error) {
      console.error("Error getting active profile:", error);
      return null;
    }
  }

  async setHasOnboarded(valueoolean)romise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, value.toString());
    } catch (error) {
      console.error("Error setting onboarded status:", error);
      throw error;
    }
  }

  async getHasOnboarded()romise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED);
      return value === "true";
    } catch (error) {
      console.error("Error getting onboarded status:", error);
      return false;
    }
  }

  async clearAll()romise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.PROFILES,
        STORAGE_KEYS.ACTIVE_PROFILE,
        STORAGE_KEYS.HAS_ONBOARDED,
      ]);
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  }
}

export default new ProfileStorageService();
