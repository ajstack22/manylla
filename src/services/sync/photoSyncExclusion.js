/**
 * Photo Sync Exclusion Helper
 * Separates photos from main sync data to avoid header size limits
 */

/**
 * Prepare profile for sync by extracting photo
 * @param {Object} profile - Full profile with photo
 * @returns {Object} Profile without photo data, only reference
 */
export function prepareProfileForSync(profile) {
  if (!profile) return profile;
  
  const syncProfile = { ...profile };
  
  // If there's a photo, replace with a reference
  if (syncProfile.photo) {
    // Store photo locally but don't sync it
    const photoId = `photo_${profile.id || 'default'}`;
    
    // Replace full photo data with just a reference
    syncProfile.photoRef = {
      id: photoId,
      hasPhoto: true,
      // Could add metadata like size, timestamp, etc.
      updatedAt: profile.updatedAt
    };
    
    // Remove the actual photo data
    delete syncProfile.photo;
  }
  
  return syncProfile;
}

/**
 * Restore photo to profile after sync pull
 * @param {Object} syncProfile - Profile from sync (without photo)
 * @param {Object} localPhotos - Local photo storage
 * @returns {Object} Complete profile with photo
 */
export function restorePhotoToProfile(syncProfile, localPhotos) {
  if (!syncProfile) return syncProfile;
  
  const fullProfile = { ...syncProfile };
  
  // If there's a photo reference, restore the actual photo
  if (fullProfile.photoRef && fullProfile.photoRef.hasPhoto) {
    const photoId = fullProfile.photoRef.id;
    
    // Get photo from local storage
    if (localPhotos && localPhotos[photoId]) {
      fullProfile.photo = localPhotos[photoId];
    }
    
    // Clean up the reference
    delete fullProfile.photoRef;
  }
  
  return fullProfile;
}

/**
 * Store photo separately in local storage
 * @param {string} profileId - Profile ID
 * @param {string} photoData - Photo data (encrypted or not)
 */
export async function storePhotoLocally(profileId, photoData) {
  const photoId = `photo_${profileId || 'default'}`;
  
  if (typeof window !== 'undefined' && window.localStorage) {
    // Web
    localStorage.setItem(`manylla_photos_${photoId}`, photoData);
  } else {
    // React Native
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem(`manylla_photos_${photoId}`, photoData);
  }
}

/**
 * Retrieve photo from local storage
 * @param {string} profileId - Profile ID
 * @returns {string|null} Photo data
 */
export async function getLocalPhoto(profileId) {
  const photoId = `photo_${profileId || 'default'}`;
  
  if (typeof window !== 'undefined' && window.localStorage) {
    // Web
    return localStorage.getItem(`manylla_photos_${photoId}`);
  } else {
    // React Native
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem(`manylla_photos_${photoId}`);
  }
}
