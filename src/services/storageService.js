import { ChildProfile } from "../types/ChildProfile";
import { ProfileValidator } from "../utils/validation";

export class StorageService {
  static PROFILE_KEY = "manylla_profile";
  static SYNC_TIME_KEY = "manylla_last_sync";
  static VERSION_KEY = "manylla_version";

  // Profile operations
  static getProfile() {
    try {
      const stored = localStorage.getItem(this.PROFILE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      parsed.dateOfBirth = new Date(parsed.dateOfBirth);
      parsed.createdAt = new Date(parsed.createdAt);
      parsed.updatedAt = new Date(parsed.updatedAt);
      parsed.entries = parsed.entries.map((e) => ({
        ...e,
        date: new Date(e.date),
      }));

      return parsed;
    } catch (error) {
      console.error("Failed to load profile:", error);
      return null;
    }
  }

  static saveProfile(profile) {
    try {
      // Validate before saving
      const validation = ProfileValidator.validateProfile(profile);
      if (!validation.valid) {
        console.error("Profile validation failed:", validation.errors);
        return false;
      }

      // Sanitize data
      const sanitized = ProfileValidator.sanitizeProfile(profile);

      // Add version for future sync
      const profileWithVersion = {
        ...sanitized,
        version: Date.now(),
        updatedAt: new Date(),
      };

      localStorage.setItem(
        this.PROFILE_KEY,
        JSON.stringify(profileWithVersion),
      );
      return true;
    } catch (error) {
      console.error("Failed to save profile:", error);
      return false;
    }
  }

  static clearProfile() {
    try {
      localStorage.removeItem(this.PROFILE_KEY);
      localStorage.removeItem(this.SYNC_TIME_KEY);
      localStorage.removeItem(this.VERSION_KEY);
      return true;
    } catch (error) {
      console.error("Failed to clear profile:", error);
      return false;
    }
  }

  // Sync metadata operations
  static getLastSyncTime() {
    try {
      const time = localStorage.getItem(this.SYNC_TIME_KEY);
      return time ? parseInt(time, 10) : null;
    } catch {
      return null;
    }
  }

  static setLastSyncTime(timestamp) {
    localStorage.setItem(this.SYNC_TIME_KEY, timestamp.toString());
  }

  static getVersion() {
    try {
      const version = localStorage.getItem(this.VERSION_KEY);
      return version ? parseInt(version, 10) : 0;
    } catch {
      return 0;
    }
  }

  static setVersion(version) {
    localStorage.setItem(this.VERSION_KEY, version.toString());
  }

  // Export/Import for backup
  static exportProfile() {
    const profile = this.getProfile();
    if (!profile) return null;

    return JSON.stringify(profile, null, 2);
  }

  static importProfile(jsonString) {
    try {
      const profile = JSON.parse(jsonString);
      // Validate basic structure
      if (!profile.id || !profile.name || !profile.entries) {
        throw new Error("Invalid profile structure");
      }

      // Convert dates
      profile.dateOfBirth = new Date(profile.dateOfBirth);
      profile.createdAt = new Date(profile.createdAt);
      profile.updatedAt = new Date(profile.updatedAt);
      profile.entries = profile.entries.map((e) => ({
        ...e,
        date: new Date(e.date),
      }));

      return this.saveProfile(profile);
    } catch (error) {
      console.error("Failed to import profile:", error);
      return false;
    }
  }
}
