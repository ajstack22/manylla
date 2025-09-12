/**
 * Cross-Platform Storage Service
 * Works on iOS, Android, and Web
 */

import platform from '../../utils/platform';
import AsyncStorage from "@react-native-async-storage/async-storage";

export class StorageService {
  static PROFILE_KEY = "manylla_profile";

  static async getProfile() {
    try {
      let profileData;

      if (platform.isWeb) {
        // Web uses localStorage
        profileData = localStorage.getItem(this.PROFILE_KEY);
      } else {
        // Mobile uses AsyncStorage
        profileData = await AsyncStorage.getItem(this.PROFILE_KEY);
      }

      if (!profileData) return null;

      const profile = JSON.parse(profileData);

      // Convert date strings back to Date objects
      if (profile.dateOfBirth) {
        profile.dateOfBirth = new Date(profile.dateOfBirth);
      }
      if (profile.createdAt) {
        profile.createdAt = new Date(profile.createdAt);
      }
      if (profile.updatedAt) {
        profile.updatedAt = new Date(profile.updatedAt);
      }

      // Convert entry dates
      if (profile.entries) {
        profile.entries = profile.entries.map((entry) => ({
          ...entry,
          date: entry.date ? new Date(entry.date) : new Date(),
        }));
      }

      return profile;
    } catch (error) {
      return null;
    }
  }

  static async saveProfile(profile) {
    try {
      const profileData = JSON.stringify(profile);

      if (platform.isWeb) {
        localStorage.setItem(this.PROFILE_KEY, profileData);
      } else {
        await AsyncStorage.setItem(this.PROFILE_KEY, profileData);
      }
    } catch (error) {
      throw error;
    }
  }

  static async clearProfile() {
    try {
      if (platform.isWeb) {
        localStorage.removeItem(this.PROFILE_KEY);
        localStorage.removeItem("manylla_onboarding_completed");
      } else {
        await AsyncStorage.removeItem(this.PROFILE_KEY);
        await AsyncStorage.removeItem("manylla_onboarding_completed");
      }
    } catch (error) {}
  }
}
