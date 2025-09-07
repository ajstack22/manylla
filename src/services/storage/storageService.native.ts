import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildProfile } from '../../types/ChildProfile';

export class StorageService {
  private static readonly PROFILE_KEY = 'manylla_profile';
  
  static async getProfile(): Promise<ChildProfile | null> {
    try {
      const profileData = await AsyncStorage.getItem(this.PROFILE_KEY);
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
        profile.entries = profile.entries.map((entry: any) => ({
          ...entry,
          date: entry.date ? new Date(entry.date) : new Date()
        }));
      }
      
      return profile;
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    }
  }
  
  static async saveProfile(profile: ChildProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }
  
  static async clearProfile(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.PROFILE_KEY);
      await AsyncStorage.removeItem('manylla_onboarding_completed');
    } catch (error) {
      console.error('Error clearing profile:', error);
    }
  }
}