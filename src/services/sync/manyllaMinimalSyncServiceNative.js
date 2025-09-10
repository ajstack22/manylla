import '../../polyfills/crypto'; // Import crypto polyfill
import AsyncStorage from "@react-native-async-storage/async-storage";
import nacl from "tweetnacl";
import util from "tweetnacl-util";
import manyllaEncryptionService from "./manyllaEncryptionService";
import conflictResolver from "./conflictResolver";
import { API_ENDPOINTS } from "../../config/api";

class ManyllaMinimalSyncService {
  constructor() {
    this.isEnabled = false;
    this.syncId = null;
    this.recoveryPhrase = null;
    this.pullInterval = null;
    this.dataCallback = null;
    this.lastPullTimestamp = 0;
    this.deviceId = null;

    // Initialize device ID asynchronously
    this.initializeDeviceId();

    // Manylla uses 60-second interval instead of StackMap's 30
    this.PULL_INTERVAL = 60000; // 1 minute

    // Rate limiting properties
    this.MIN_REQUEST_INTERVAL = 200; // 200ms between API requests
    this.lastRequestTime = 0;
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.lastPull = 0;
    this.lastPush = 0;
    this.pullAttempts = 0;
  }

  /**
   * Initialize device ID asynchronously
   */
  async initializeDeviceId() {
    this.deviceId = await this.getOrCreateDeviceId();
  }

  /**
   * Get or create a device ID for this device
   * React Native version using AsyncStorage
   */
  async getOrCreateDeviceId() {
    try {
      // Check if AsyncStorage is available
      if (!AsyncStorage || !AsyncStorage.getItem) {
        console.warn(
          "[ManyllaSync] AsyncStorage not available, using fallback",
        );
        return (
          Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
        );
      }

      let deviceId = await AsyncStorage.getItem("manylla_device_id");
      if (!deviceId) {
        // Generate new device ID
        const bytes = nacl.randomBytes(8);
        deviceId = Array.from(bytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        await AsyncStorage.setItem("manylla_device_id", deviceId);
        // console.log('[ManyllaSync] Generated device ID:', deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error("[ManyllaSync] Error with device ID:", error);
      // Fallback device ID
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
  }

  /**
   * Enable sync with a recovery phrase
   * @param {string} recoveryPhrase - 32-character hex string
   * @param {boolean} isNewSync - true if creating new sync, false if joining
   */
  async enableSync(recoveryPhrase, isNewSync = false) {
    try {
      // console.log('[ManyllaSync] Enabling sync...');

      // Validate recovery phrase format
      if (!recoveryPhrase || !recoveryPhrase.match(/^[a-f0-9]{32}$/)) {
        throw new Error("Invalid recovery phrase format");
      }

      this.recoveryPhrase = recoveryPhrase;

      // Initialize encryption with recovery phrase
      const { syncId } =
        await manyllaEncryptionService.initialize(recoveryPhrase);
      this.syncId = syncId;

      // Use AsyncStorage as backend
      await AsyncStorage.setItem("manylla_sync_enabled", "true");
      await AsyncStorage.setItem("manylla_recovery_phrase", recoveryPhrase);

      this.isEnabled = true;

      // Start pull interval
      this.startPullInterval();

      // If joining existing sync, immediately pull
      if (!isNewSync) {
        await this.pull();
      }

      // console.log('[ManyllaSync] Sync enabled successfully');
      return { success: true, syncId: this.syncId };
    } catch (error) {
      console.error("[ManyllaSync] Error enabling sync:", error);
      throw error;
    }
  }

  /**
   * Disable sync
   */
  async disableSync() {
    // console.log('[ManyllaSync] Disabling sync...');

    this.stopPullInterval();
    this.isEnabled = false;
    this.syncId = null;
    this.recoveryPhrase = null;

    await AsyncStorage.removeItem("manylla_sync_enabled");
    await AsyncStorage.removeItem("manylla_recovery_phrase");

    // console.log('[ManyllaSync] Sync disabled');
  }

  /**
   * Check if sync is enabled
   */
  async checkSyncStatus() {
    try {
      const enabled = await AsyncStorage.getItem("manylla_sync_enabled");
      const recoveryPhrase = await AsyncStorage.getItem(
        "manylla_recovery_phrase",
      );

      if (enabled === "true" && recoveryPhrase) {
        // Re-enable sync with stored recovery phrase
        await this.enableSync(recoveryPhrase, false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("[ManyllaSync] Error checking sync status:", error);
      return false;
    }
  }

  /**
   * Save data to AsyncStorage
   */
  async saveToStorage(key, data) {
    try {
      const encrypted = await manyllaEncryptionService.encrypt(data);
      await AsyncStorage.setItem(`manylla_${key}`, encrypted);

      // Also trigger push if sync is enabled
      if (this.isEnabled) {
        await this.push(key, data);
      }
    } catch (error) {
      console.error("[ManyllaSync] Error saving to storage:", error);
      throw error;
    }
  }

  /**
   * Load data from AsyncStorage
   */
  async loadFromStorage(key) {
    try {
      const encrypted = await AsyncStorage.getItem(`manylla_${key}`);
      if (!encrypted) return null;

      const decrypted = await manyllaEncryptionService.decrypt(encrypted);
      return decrypted;
    } catch (error) {
      console.error("[ManyllaSync] Error loading from storage:", error);
      return null;
    }
  }

  /**
   * Push data to sync server (placeholder for now)
   */
  async push(key, data) {
    if (!this.isEnabled) return;

    try {
      // console.log('[ManyllaSync] Push operation would happen here');
      // TODO: Implement actual push to server when API is ready
    } catch (error) {
      console.error("[ManyllaSync] Error pushing data:", error);
    }
  }

  /**
   * Pull data from sync server (placeholder for now)
   */
  async pull() {
    if (!this.isEnabled) return;

    try {
      // console.log('[ManyllaSync] Pull operation would happen here');
      // TODO: Implement actual pull from server when API is ready
    } catch (error) {
      console.error("[ManyllaSync] Error pulling data:", error);
    }
  }

  /**
   * Start pull interval
   */
  startPullInterval() {
    if (this.pullInterval) {
      clearInterval(this.pullInterval);
    }

    this.pullInterval = setInterval(() => {
      this.pull();
    }, this.PULL_INTERVAL);

    // console.log('[ManyllaSync] Started pull interval');
  }

  /**
   * Stop pull interval
   */
  stopPullInterval() {
    if (this.pullInterval) {
      clearInterval(this.pullInterval);
      this.pullInterval = null;
      // console.log('[ManyllaSync] Stopped pull interval');
    }
  }

  /**
   * Set callback for data updates
   */
  setDataCallback(callback) {
    this.dataCallback = callback;
  }

  /**
   * Generate a new recovery phrase
   */
  generateRecoveryPhrase() {
    const bytes = nacl.randomBytes(16);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}

export default new ManyllaMinimalSyncService();
