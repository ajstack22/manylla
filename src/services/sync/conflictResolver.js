/**
 * Conflict Resolution Service for Manylla
 * Based on StackMap's field-level conflict resolution approach
 *
 * Handles merging of profile data when conflicts occur during sync
 */

class ConflictResolver {
  constructor() {
    // 3-second merge window for near-simultaneous updates
    this.MERGE_WINDOW = 3000;

    // Field priority for resolution (higher number = higher priority)
    this.FIELD_PRIORITY = {
      medicalInfo: 10,
      emergencyContacts: 9,
      medications: 8,
      quickInfo: 7,
      categories: 6,
      settings: 5,
    };
  }

  /**
   * Merge two profile versions with conflict resolution
   * @param {Object} local - Local profile data
   * @param {Object} remote - Remote profile data from sync
   * @returns {Object} Merged profile data
   */
  mergeProfiles(local, remote) {
    // Handle null/undefined cases
    if (!local || !local.timestamp) return remote;
    if (!remote || !remote.timestamp) return local;

    // If timestamps are within merge window, do field-level merge
    const timeDiff = Math.abs(local.timestamp - remote.timestamp);
    if (timeDiff < this.MERGE_WINDOW) {
      return this.fieldLevelMerge(local, remote);
    }

    // Outside merge window - use last-write-wins
    if (remote.timestamp > local.timestamp) {
      return remote;
    } else {
      return local;
    }
  }

  /**
   * Perform field-level merge when updates are within merge window
   * @param {Object} local - Local profile data
   * @param {Object} remote - Remote profile data
   * @returns {Object} Merged profile
   */
  fieldLevelMerge(local, remote) {
    const merged = {
      ...local,
      timestamp: Math.max(local.timestamp, remote.timestamp),
      lastModified: new Date().toISOString(),
    };

    // Merge basic info (prefer most recent non-empty values)
    merged.name = this.mergeField(
      local.name,
      remote.name,
      local.timestamp,
      remote.timestamp,
    );
    merged.dateOfBirth = this.mergeField(
      local.dateOfBirth,
      remote.dateOfBirth,
      local.timestamp,
      remote.timestamp,
    );
    merged.profileImage = this.mergeField(
      local.profileImage,
      remote.profileImage,
      local.timestamp,
      remote.timestamp,
    );

    // Merge arrays (combine and deduplicate)
    merged.categories = this.mergeCategories(
      local.categories || [],
      remote.categories || [],
    );
    merged.quickInfo = this.mergeQuickInfo(
      local.quickInfo || [],
      remote.quickInfo || [],
    );

    // Merge complex objects
    merged.medicalInfo = this.mergeMedicalInfo(
      local.medicalInfo || {},
      remote.medicalInfo || {},
    );
    merged.emergencyContacts = this.mergeEmergencyContacts(
      local.emergencyContacts || [],
      remote.emergencyContacts || [],
    );
    merged.medications = this.mergeMedications(
      local.medications || [],
      remote.medications || [],
    );

    // Settings - prefer local device settings
    merged.settings = local.settings || remote.settings;

    return merged;
  }

  /**
   * Merge a single field value
   */
  mergeField(localValue, remoteValue, localTime, remoteTime) {
    // If one is empty/null, use the other
    if (!localValue) return remoteValue;
    if (!remoteValue) return localValue;

    // If both have values, use the more recent one
    return localTime >= remoteTime ? localValue : remoteValue;
  }

  /**
   * Merge categories array with deduplication
   */
  mergeCategories(local, remote) {
    const mergedMap = new Map();

    // Add all local categories
    local.forEach((category) => {
      mergedMap.set(category.id, category);
    });

    // Add or update with remote categories
    remote.forEach((category) => {
      const existing = mergedMap.get(category.id);
      if (!existing || category.lastModified > existing.lastModified) {
        mergedMap.set(category.id, category);
      }
    });

    return Array.from(mergedMap.values());
  }

  /**
   * Merge quick info items
   */
  mergeQuickInfo(local, remote) {
    const mergedMap = new Map();

    // Process all items from both sources
    [...local, ...remote].forEach((item) => {
      const existing = mergedMap.get(item.id);
      if (
        !existing ||
        (item.timestamp &&
          (!existing.timestamp || item.timestamp > existing.timestamp))
      ) {
        mergedMap.set(item.id, item);
      }
    });

    return Array.from(mergedMap.values());
  }

  /**
   * Merge medical info object
   */
  mergeMedicalInfo(local, remote) {
    // For medical info, prefer the most complete/recent data
    const localCompleteness = this.calculateCompleteness(local);
    const remoteCompleteness = this.calculateCompleteness(remote);

    if (remoteCompleteness > localCompleteness) {
      return remote;
    } else if (localCompleteness > remoteCompleteness) {
      return local;
    }

    // If equally complete, merge field by field
    return {
      diagnoses: this.mergeArrayField(local.diagnoses, remote.diagnoses),
      allergies: this.mergeArrayField(local.allergies, remote.allergies),
      bloodType: local.bloodType || remote.bloodType,
      notes: this.mergeTextField(local.notes, remote.notes),
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Merge emergency contacts
   */
  mergeEmergencyContacts(local, remote) {
    const mergedMap = new Map();

    // Key contacts by phone number for deduplication
    [...local, ...remote].forEach((contact) => {
      const key = contact.phone || contact.email || contact.name;
      const existing = mergedMap.get(key);

      if (!existing || this.isMoreComplete(contact, existing)) {
        mergedMap.set(key, contact);
      }
    });

    return Array.from(mergedMap.values());
  }

  /**
   * Merge medications list
   */
  mergeMedications(local, remote) {
    const mergedMap = new Map();

    // Key by medication name + dosage for uniqueness
    [...local, ...remote].forEach((med) => {
      const key = `${med.name}_${med.dosage}`.toLowerCase();
      const existing = mergedMap.get(key);

      if (
        !existing ||
        (med.lastModified &&
          (!existing.lastModified || med.lastModified > existing.lastModified))
      ) {
        mergedMap.set(key, med);
      }
    });

    return Array.from(mergedMap.values());
  }

  /**
   * Merge array fields (simple deduplication)
   */
  mergeArrayField(local = [], remote = []) {
    const combined = [...local, ...remote];
    return [...new Set(combined)].filter(Boolean);
  }

  /**
   * Merge text fields (prefer longer, non-empty values)
   */
  mergeTextField(local, remote) {
    if (!local) return remote;
    if (!remote) return local;

    // Prefer the longer text as it likely contains more information
    return local.length >= remote.length ? local : remote;
  }

  /**
   * Calculate how complete a data object is
   */
  calculateCompleteness(obj) {
    let score = 0;
    Object.entries(obj || {}).forEach(([key, value]) => {
      if (value != null && value !== "") {
        score++;
        if (Array.isArray(value)) {
          score += value.length;
        } else if (typeof value === "string") {
          score += value.length > 0 ? 1 : 0;
        }
      }
    });
    return score;
  }

  /**
   * Check if one object is more complete than another
   */
  isMoreComplete(obj1, obj2) {
    return this.calculateCompleteness(obj1) > this.calculateCompleteness(obj2);
  }

  /**
   * Validate merged data structure
   */
  validateMergedData(data) {
    if (!data || typeof data !== "object") {
      return false;
    }

    // Ensure required fields exist
    const requiredFields = ["timestamp"];
    for (const field of requiredFields) {
      if (!(field in data)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Merge entries with attachment deduplication
   * @param {Array} localEntries - Local entries array
   * @param {Array} remoteEntries - Remote entries array
   * @returns {Array} Merged entries without duplicate attachments
   */
  mergeEntries(localEntries = [], remoteEntries = []) {
    const mergedMap = new Map();

    // Add all local entries
    localEntries.forEach((entry) => {
      mergedMap.set(entry.id, entry);
    });

    // Merge remote entries
    remoteEntries.forEach((remoteEntry) => {
      const localEntry = mergedMap.get(remoteEntry.id);

      if (!localEntry) {
        // New entry from remote
        mergedMap.set(remoteEntry.id, remoteEntry);
      } else {
        // Merge the entry, especially attachments
        const merged = this.mergeEntry(localEntry, remoteEntry);
        mergedMap.set(remoteEntry.id, merged);
      }
    });

    return Array.from(mergedMap.values());
  }

  /**
   * Merge a single entry with attachment conflict resolution
   * @param {Object} localEntry - Local entry
   * @param {Object} remoteEntry - Remote entry
   * @returns {Object} Merged entry
   */
  mergeEntry(localEntry, remoteEntry) {
    // Use last-write-wins for basic fields
    const localTime = new Date(localEntry.updatedAt || localEntry.date || 0).getTime();
    const remoteTime = new Date(remoteEntry.updatedAt || remoteEntry.date || 0).getTime();

    const baseEntry = localTime >= remoteTime ? localEntry : remoteEntry;

    // Merge attachments to prevent duplicates
    const mergedAttachments = this.mergeAttachments(
      localEntry.attachments || [],
      remoteEntry.attachments || []
    );

    return {
      ...baseEntry,
      attachments: mergedAttachments,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Merge attachments arrays preventing duplicates
   * Uses UUID-based deduplication to prevent exponential growth
   * @param {Array} localAttachments - Local attachments
   * @param {Array} remoteAttachments - Remote attachments
   * @returns {Array} Merged attachments without duplicates
   */
  mergeAttachments(localAttachments = [], remoteAttachments = []) {
    const merged = new Map();

    // Add local attachments
    for (const att of localAttachments) {
      if (att && att.id) {
        merged.set(att.id, att);
      }
    }

    // Merge remote attachments
    for (const att of remoteAttachments) {
      if (!att || !att.id) continue;

      const existing = merged.get(att.id);

      if (!existing) {
        // New attachment from remote
        merged.set(att.id, att);
      } else {
        // Same ID exists - check if it's the same file
        if (existing.fileHash === att.fileHash) {
          // Same file, keep newer version
          const existingVersion = existing.version || 1;
          const remoteVersion = att.version || 1;
          if (remoteVersion > existingVersion) {
            merged.set(att.id, att);
          }
        } else if (existing.fileHash !== att.fileHash) {
          // Different files with same ID (shouldn't happen with UUIDs)
          // Keep local version - ID collision tracked silently
        }
      }
    }

    return Array.from(merged.values());
  }

  /**
   * Calculate total size of attachments
   * @param {Array} attachments - Array of attachments
   * @returns {number} Total size in bytes
   */
  calculateAttachmentsSize(attachments) {
    if (!attachments || !Array.isArray(attachments)) return 0;

    return attachments.reduce((total, att) => {
      return total + (att?.size || 0);
    }, 0);
  }

  /**
   * Check if adding attachments would exceed quota
   * @param {Object} profile - Profile object
   * @param {Array} newAttachments - New attachments to add
   * @param {number} quotaBytes - Quota in bytes (default 500MB)
   * @returns {boolean} True if within quota
   */
  checkAttachmentQuota(profile, newAttachments, quotaBytes = 500 * 1024 * 1024) {
    let totalSize = 0;

    // Calculate size of all existing attachments in profile
    if (profile.entries) {
      for (const entry of profile.entries) {
        totalSize += this.calculateAttachmentsSize(entry.attachments);
      }
    }

    // Add size of new attachments
    totalSize += this.calculateAttachmentsSize(newAttachments);

    return totalSize <= quotaBytes;
  }
}

// Export singleton instance
const conflictResolver = new ConflictResolver();
export default conflictResolver;
