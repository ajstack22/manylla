import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildProfile } from '@src/types/ChildProfile';

const STORAGE_KEYS = {
  PROFILES: 'manylla_profiles',
  ACTIVE_PROFILE: 'manylla_active_profile',
  HAS_ONBOARDED: 'manylla_has_onboarded',
};

class ProfileStorageService {
  async hasProfile(): Promise<boolean> {
    try {
      const profiles = await this.getProfiles();
      return profiles.length > 0;
    } catch (error) {
      console.error('Error checking for profiles:', error);
      return false;
    }
  }

  async getProfiles(): Promise<ChildProfile[]> {
    try {
      const profilesJson = await AsyncStorage.getItem(STORAGE_KEYS.PROFILES);
      if (!profilesJson) {
        return [];
      }
      return JSON.parse(profilesJson);
    } catch (error) {
      console.error('Error getting profiles:', error);
      return [];
    }
  }

  async saveProfiles(profiles: ChildProfile[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    } catch (error) {
      console.error('Error saving profiles:', error);
      throw error;
    }
  }

  async addProfile(profile: ChildProfile): Promise<void> {
    try {
      const profiles = await this.getProfiles();
      profiles.push(profile);
      await this.saveProfiles(profiles);
    } catch (error) {
      console.error('Error adding profile:', error);
      throw error;
    }
  }

  async updateProfile(id: string, updates: Partial<ChildProfile>): Promise<void> {
    try {
      const profiles = await this.getProfiles();
      const index = profiles.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Profile not found');
      }
      profiles[index] = { ...profiles[index], ...updates };
      await this.saveProfiles(profiles);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async deleteProfile(id: string): Promise<void> {
    try {
      const profiles = await this.getProfiles();
      const filtered = profiles.filter(p => p.id !== id);
      await this.saveProfiles(filtered);
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }

  async getActiveProfileId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE);
    } catch (error) {
      console.error('Error getting active profile:', error);
      return null;
    }
  }

  async setActiveProfileId(id: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, id);
    } catch (error) {
      console.error('Error setting active profile:', error);
      throw error;
    }
  }

  async getActiveProfile(): Promise<ChildProfile | null> {
    try {
      const activeId = await this.getActiveProfileId();
      if (!activeId) {
        return null;
      }
      const profiles = await this.getProfiles();
      return profiles.find(p => p.id === activeId) || null;
    } catch (error) {
      console.error('Error getting active profile:', error);
      return null;
    }
  }

  async setHasOnboarded(value: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, value.toString());
    } catch (error) {
      console.error('Error setting onboarded status:', error);
      throw error;
    }
  }

  async getHasOnboarded(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED);
      return value === 'true';
    } catch (error) {
      console.error('Error getting onboarded status:', error);
      return false;
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.PROFILES,
        STORAGE_KEYS.ACTIVE_PROFILE,
        STORAGE_KEYS.HAS_ONBOARDED,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}

export default new ProfileStorageService();