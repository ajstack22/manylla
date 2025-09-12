import "../../polyfills/crypto"; // Import crypto polyfill
import AsyncStorage from "@react-native-async-storage/async-storage";
import nacl from "tweetnacl";
import util from "tweetnacl-util";
import manyllaEncryptionService from "./manyllaEncryptionService";
import conflictResolver from "./conflictResolver";
import platform from "../../utils/platform";
import {
  SyncError,
  NetworkError,
  AuthError,
  ErrorHandler,
} from "../../utils/errors";

class ManyllaMinimalSyncService {
  constructor() {
    this.isEnabled = false;
    this.syncId = null;
    this.recoveryPhrase = null;
    this.pullInterval = null;
    this.dataCallback = null;
    this.lastPullTimestamp = 0;
    this.deviceId = null;
    this.listeners = new Set();
    this.isPolling = false;
    this.lastPullTime = null;
    this.pendingPush = null;

    // Initialize device ID asynchronously
    this.initializeDeviceId();

    // Manylla uses 60-second interval instead of StackMap's 30
    this.PULL_INTERVAL = 60000; // 1 minute
    this.POLL_INTERVAL = 60000; // Alias for compatibility
    this.PUSH_DEBOUNCE = 2000; // 2 seconds debounce for pushes
    this.MAX_RETRIES = 3;
    this.RETRY_DELAY = 5000;

    // Rate limiting properties
    this.MIN_REQUEST_INTERVAL = 200; // 200ms between API requests
    this.lastRequestTime = 0;
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.lastPull = 0;
    this.lastPush = 0;
    this.pullAttempts = 0;

    // Network and offline queue properties
    this.isOnline = true; // Assume online initially
    this.offlineQueue = [];
    this.isProcessingOfflineQueue = false;
    this.networkCheckInterval = null;

    // Start network monitoring
    this.startNetworkMonitoring();
  }

  /**
   * Initialize device ID asynchronously
   */
  async initializeDeviceId() {
    this.deviceId = await this.getOrCreateDeviceId();
  }

  /**
   * Start network monitoring for React Native
   */
  startNetworkMonitoring() {
    // Simple network check - React Native has fetch available
    // More sophisticated monitoring can be added with @react-native-community/netinfo
    this.networkCheckInterval = setInterval(async () => {
      try {
        // Simple connectivity test
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        await fetch('https://www.google.com/generate_204', {
          signal: controller.signal,
          cache: 'no-cache',
        });
        
        clearTimeout(timeoutId);
        
        if (!this.isOnline) {
          this.isOnline = true;
          this.notifyListeners("online", true);
          this.processOfflineQueue();
        }
      } catch (error) {
        if (this.isOnline) {
          this.isOnline = false;
          this.notifyListeners("offline", false);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Stop network monitoring
   */
  stopNetworkMonitoring() {
    if (this.networkCheckInterval) {
      clearInterval(this.networkCheckInterval);
      this.networkCheckInterval = null;
    }
  }

  /**
   * Queue operations for when device comes back online
   */
  queueForLater(operation, data) {
    this.offlineQueue.push({
      operation,
      data,
      timestamp: Date.now(),
    });

    // Limit queue size
    if (this.offlineQueue.length > 10) {
      this.offlineQueue.shift(); // Remove oldest
    }
  }

  /**
   * Process queued operations when back online
   */
  async processOfflineQueue() {
    if (this.isProcessingOfflineQueue || this.offlineQueue.length === 0) {
      return;
    }

    this.isProcessingOfflineQueue = true;

    try {
      while (this.offlineQueue.length > 0) {
        const item = this.offlineQueue.shift();
        
        try {
          if (item.operation === 'push') {
            await this.push(item.data);
          }
          // Add other operations as needed
        } catch (error) {
          ErrorHandler.log(error, {
            context: "offline queue processing",
            operation: item.operation,
          });
          // If operation fails, don't retry immediately
          break;
        }
      }
    } finally {
      this.isProcessingOfflineQueue = false;
    }
  }

  /**
   * Check if sync endpoint is available
   */
  async checkHealth() {
    try {
      const apiBaseUrl = platform.apiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/sync_health.php`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      return data.status === "healthy";
    } catch (error) {
      ErrorHandler.log(new NetworkError(error.message), {
        context: "health check",
        recoverable: true,
      });
      return false;
    }
  }

  /**
   * Add listener for sync events
   */
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners
   */
  notifyListeners(event, data) {
    this.listeners.forEach((callback) => {
      try {
        callback(event, data);
      } catch (error) {
        ErrorHandler.log(error, {
          context: "listener callback",
          event,
        });
      }
    });
  }

  /**
   * Get local data from AsyncStorage
   */
  async getLocalData() {
    try {
      const stored = await AsyncStorage.getItem("manylla_profile");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get or create a device ID for this device
   * React Native version using AsyncStorage
   */
  async getOrCreateDeviceId() {
    try {
      // Check if AsyncStorage is available
      if (!AsyncStorage || !AsyncStorage.getItem) {
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
      }
      return deviceId;
    } catch (error) {
      // Fallback device ID
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
  }

  /**
   * Initialize sync service with recovery phrase
   * @param {string} recoveryPhrase - 32-character hex string
   */
  async init(recoveryPhrase) {
    if (!recoveryPhrase || recoveryPhrase.length !== 32) {
      throw new AuthError("Invalid recovery phrase format", "INVALID_CODE");
    }

    // Initialize encryption
    manyllaEncryptionService.init(recoveryPhrase);

    // Generate sync ID from recovery phrase (same as web implementation)
    const phraseBytes = util.decodeUTF8(recoveryPhrase);
    const hash = nacl.hash(phraseBytes);
    this.syncId = util.encodeBase64(hash.slice(0, 16));

    this.recoveryPhrase = recoveryPhrase;

    // Test sync health
    try {
      const isHealthy = await this.checkHealth();
      if (!isHealthy) {
        ErrorHandler.log(new NetworkError("Sync service unavailable"), {
          recoverable: true,
          context: "init",
        });
      }
    } catch (error) {
      // Don't fail init if health check fails
      ErrorHandler.log(error, { context: "init health check" });
    }

    return true;
  }

  /**
   * Enable sync with a recovery phrase
   * @param {string} recoveryPhrase - 32-character hex string
   * @param {boolean} isNewSync - true if creating new sync, false if joining
   */
  async enableSync(recoveryPhrase, isNewSync = false) {
    try {
      // Validate recovery phrase format
      if (!recoveryPhrase || !recoveryPhrase.match(/^[a-f0-9]{32}$/)) {
        throw new AuthError("Invalid recovery phrase format", "INVALID_CODE");
      }

      // Initialize using new init method
      await this.init(recoveryPhrase);

      // Use AsyncStorage as backend
      await AsyncStorage.setItem("manylla_sync_enabled", "true");
      await AsyncStorage.setItem("manylla_recovery_phrase", recoveryPhrase);

      this.isEnabled = true;

      // For new sync, push initial data
      if (isNewSync) {
        const localData = await this.getLocalData();
        if (localData) {
          await this.push(localData);
        }
      }

      // Start polling
      this.startPolling();

      // If joining existing sync, immediately pull
      if (!isNewSync) {
        await this.pull();
      }

      return { success: true, syncId: this.syncId };
    } catch (error) {
      ErrorHandler.log(error, { context: "enableSync" });
      throw error;
    }
  }

  /**
   * Disable sync
   */
  async disableSync() {
    this.stopPolling();
    this.isEnabled = false;
    this.syncId = null;
    this.recoveryPhrase = null;
    this.lastPullTime = null;

    await AsyncStorage.removeItem("manylla_sync_enabled");
    await AsyncStorage.removeItem("manylla_recovery_phrase");
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
      return null;
    }
  }

  /**
   * Push data to sync server
   */
  async push(data) {
    if (!this.isEnabled || !this.syncId || !manyllaEncryptionService.isInitialized()) {
      throw new SyncError(
        "Sync not initialized. Please enable sync first.",
        false,
      );
    }

    // Check if online, if not queue for later
    if (!this.isOnline) {
      this.queueForLater('push', data);
      throw new NetworkError("Device offline. Operation queued.");
    }

    // Cancel any pending push
    if (this.pendingPush) {
      clearTimeout(this.pendingPush);
    }

    // Debounce pushes
    return new Promise((resolve, reject) => {
      this.pendingPush = setTimeout(async () => {
        try {
          // Encrypt data
          const encrypted = manyllaEncryptionService.encrypt(data);

          // Prepare payload
          const payload = {
            sync_id: this.syncId,
            data: encrypted,
            timestamp: Date.now(),
            version: "2.0.0",
          };

          // Get API base URL for mobile
          const apiBaseUrl = platform.apiBaseUrl();

          // Push with retries
          let lastError;
          for (let i = 0; i < this.MAX_RETRIES; i++) {
            try {
              const response = await fetch(`${apiBaseUrl}/sync_push.php`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify(payload),
              });

              if (!response.ok) {
                if (response.status === 401) {
                  throw new AuthError(
                    "Invalid sync credentials",
                    "UNAUTHORIZED",
                  );
                }
                if (response.status >= 500) {
                  throw new NetworkError(
                    `Server error: ${response.statusText}`,
                  );
                }
                throw new SyncError(`Push failed: ${response.statusText}`);
              }

              const result = await response.json();
              if (result.success) {
                this.notifyListeners("pushed", data);
                resolve(result);
                return;
              }

              throw new SyncError(result.error || "Push failed");
            } catch (error) {
              lastError = error;
              if (i < this.MAX_RETRIES - 1) {
                await new Promise((r) => setTimeout(r, this.RETRY_DELAY));
              }
            }
          }

          const finalError = ErrorHandler.normalize(lastError);
          throw finalError;
        } catch (error) {
          const normalizedError = ErrorHandler.normalize(error);
          ErrorHandler.log(normalizedError, {
            context: "push",
            syncId: this.syncId,
            retries: this.MAX_RETRIES,
          });
          this.notifyListeners("push-error", normalizedError);
          reject(normalizedError);
        }
      }, this.PUSH_DEBOUNCE);
    });
  }

  /**
   * Pull data from sync server
   */
  async pull() {
    if (!this.isEnabled || !this.syncId || !manyllaEncryptionService.isInitialized()) {
      throw new SyncError(
        "Sync not initialized. Please enable sync first.",
        false,
      );
    }

    // Skip pull if offline
    if (!this.isOnline) {
      throw new NetworkError("Device offline. Cannot pull data.");
    }

    try {
      const apiBaseUrl = platform.apiBaseUrl();
      const response = await fetch(
        `${apiBaseUrl}/sync_pull.php?sync_id=${encodeURIComponent(this.syncId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new AuthError("Invalid sync credentials", "UNAUTHORIZED");
        }
        if (response.status >= 500) {
          throw new NetworkError(`Server error: ${response.statusText}`);
        }
        throw new SyncError(`Pull failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        if (result.error === "No data found") {
          // No sync data exists yet
          return null;
        }
        throw new SyncError(result.error || "Pull failed");
      }

      if (!result.data) {
        return null;
      }

      // Decrypt data
      const decrypted = manyllaEncryptionService.decrypt(result.data);

      // Update last pull time
      this.lastPullTime = Date.now();

      // Handle conflicts if local data exists
      const localData = await this.getLocalData();
      if (localData) {
        const resolved = conflictResolver.resolve(localData, decrypted);
        this.notifyListeners("pulled", resolved);
        // Call data callback if set
        if (this.dataCallback) {
          this.dataCallback(resolved);
        }
        return resolved;
      }

      this.notifyListeners("pulled", decrypted);
      // Call data callback if set
      if (this.dataCallback) {
        this.dataCallback(decrypted);
      }
      return decrypted;
    } catch (error) {
      const normalizedError = ErrorHandler.normalize(error);
      ErrorHandler.log(normalizedError, {
        context: "pull",
        syncId: this.syncId,
      });
      this.notifyListeners("pull-error", normalizedError);
      throw normalizedError;
    }
  }

  /**
   * Start polling for changes
   */
  startPolling() {
    if (this.isPolling) return;

    this.isPolling = true;

    // Initial pull
    this.pull().catch((error) => {
      ErrorHandler.log(error, {
        context: "initial pull",
        recoverable: true,
      });
    });

    // Set up interval
    this.pullInterval = setInterval(() => {
      if (this.syncId && manyllaEncryptionService.isInitialized() && this.isOnline) {
        this.pull().catch((error) => {
          ErrorHandler.log(error, {
            context: "poll",
            recoverable: true,
          });
        });
      }
    }, this.POLL_INTERVAL);
  }

  /**
   * Stop polling
   */
  stopPolling() {
    this.isPolling = false;
    if (this.pullInterval) {
      clearInterval(this.pullInterval);
      this.pullInterval = null;
    }
  }

  /**
   * Start pull interval (legacy compatibility)
   */
  startPullInterval() {
    this.startPolling();
  }

  /**
   * Stop pull interval (legacy compatibility)
   */
  stopPullInterval() {
    this.stopPolling();
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

  /**
   * Get sync status (compatibility with web version)
   */
  getStatus() {
    return {
      initialized: !!this.syncId,
      polling: this.isPolling,
      lastPull: this.lastPullTime,
      syncId: this.syncId,
      isOnline: this.isOnline,
      offlineQueueLength: this.offlineQueue.length,
    };
  }

  /**
   * Check if sync is enabled (compatibility)
   */
  isSyncEnabled() {
    return !!this.syncId && manyllaEncryptionService.isInitialized();
  }

  /**
   * Get sync ID
   */
  getSyncId() {
    return this.syncId;
  }

  /**
   * Push data (compatible interface)
   */
  async pushData(data) {
    return this.push(data);
  }

  /**
   * Pull data (compatible interface)
   */
  async pullData(forcePull = false) {
    const data = await this.pull();
    if (data && this.dataCallback) {
      this.dataCallback(data);
    }
    return data;
  }

  /**
   * Generate invite code for sharing sync
   */
  generateInviteCode(recoveryPhrase) {
    // For Manylla, invite code is just the recovery phrase
    // (Unlike StackMap which uses additional encoding)
    return recoveryPhrase.toUpperCase();
  }

  /**
   * Join sync from invite code
   */
  async joinFromInvite(inviteCode) {
    // Validate invite code format (32 hex characters)
    const cleaned = inviteCode.replace(/[^A-F0-9]/gi, "").toUpperCase();
    if (cleaned.length !== 32) {
      throw new Error("Invalid invite code");
    }

    // Initialize with the invite code as recovery phrase
    await this.init(cleaned);

    // Pull initial data
    const data = await this.pull();

    // Start polling
    this.startPolling();

    return data;
  }

  /**
   * Clear all sync data (reset)
   */
  async reset() {
    this.stopPolling();
    this.syncId = null;
    this.lastPullTime = null;

    // Clear stored recovery phrase
    await AsyncStorage.removeItem("manylla_recovery_phrase");
    await AsyncStorage.removeItem("manylla_sync_enabled");

    // Note: We don't delete server data (user might want to reconnect)
  }

  /**
   * Cleanup resources when service is destroyed
   */
  destroy() {
    this.stopPolling();
    this.stopNetworkMonitoring();
    this.listeners.clear();
    this.offlineQueue = [];
  }
}

const manyllaMinimalSyncService = new ManyllaMinimalSyncService();
export default manyllaMinimalSyncService;
