import nacl from "tweetnacl";
import util from "tweetnacl-util";
import manyllaEncryptionService from "./manyllaEncryptionService";
import conflictResolver from "./conflictResolver";
import { API_ENDPOINTS } from "../../config/api";

class ManyllaMinimalSyncService {
  constructor() {
    this.syncId = null;
    this.isPolling = false;
    this.pollInterval = null;
    this.lastPullTime = null;
    this.pendingPush = null;
    this.listeners = new Set();
    this.dataCallback = null; // Callback for when data is received

    // Optimized for Manylla's usage pattern
    this.POLL_INTERVAL = 60000; // 60 seconds (less frequent than StackMap's 30s)
    this.PUSH_DEBOUNCE = 2000; // 2 seconds debounce for pushes
    this.MAX_RETRIES = 3;
    this.RETRY_DELAY = 5000;
  }

  // Initialize with recovery phrase
  async init(recoveryPhrase) {
    if (!recoveryPhrase || recoveryPhrase.length !== 32) {
      throw new Error("Invalid recovery phrase");
    }

    // Initialize encryption
    manyllaEncryptionService.init(recoveryPhrase);

    // Generate sync ID from recovery phrase
    const phraseBytes = util.decodeUTF8(recoveryPhrase);
    const hash = nacl.hash(phraseBytes);
    this.syncId = util.encodeBase64(hash.slice(0, 16));

    // Test sync health
    const isHealthy = await this.checkHealth();
    if (!isHealthy) {
    }

    return true;
  }

  // Check if sync endpoint is available
  async checkHealth() {
    try {
      const response = await fetch(API_ENDPOINTS.SYNC_HEALTH, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      return data.status === "healthy";
    } catch (error) {
      return false;
    }
  }

  // Push data to sync endpoint
  async push(data) {
    if (!this.syncId || !manyllaEncryptionService.isInitialized()) {
      throw new Error("Sync not initialized");
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

          // Push with retries
          let lastError;
          for (let i = 0; i < this.MAX_RETRIES; i++) {
            try {
              const response = await fetch(API_ENDPOINTS.SYNC_PUSH, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              });

              if (!response.ok) {
                throw new Error(`Push failed: ${response.statusText}`);
              }

              const result = await response.json();
              if (result.success) {
                this.notifyListeners("pushed", data);
                resolve(result);
                return;
              }

              throw new Error(result.error || "Push failed");
            } catch (error) {
              lastError = error;
              if (i < this.MAX_RETRIES - 1) {
                await new Promise((r) => setTimeout(r, this.RETRY_DELAY));
              }
            }
          }

          throw lastError;
        } catch (error) {
          this.notifyListeners("push-error", error);
          reject(error);
        }
      }, this.PUSH_DEBOUNCE);
    });
  }

  // Pull data from sync endpoint
  async pull() {
    if (!this.syncId || !manyllaEncryptionService.isInitialized()) {
      throw new Error("Sync not initialized");
    }

    try {
      const response = await fetch(
        `${API_ENDPOINTS.SYNC_PULL}?sync_id=${encodeURIComponent(this.syncId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Pull failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        if (result.error === "No data found") {
          // No sync data exists yet
          return null;
        }
        throw new Error(result.error || "Pull failed");
      }

      if (!result.data) {
        return null;
      }

      // Decrypt data
      const decrypted = manyllaEncryptionService.decrypt(result.data);

      // Update last pull time
      this.lastPullTime = Date.now();

      // Handle conflicts if local data exists
      const localData = this.getLocalData();
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
      this.notifyListeners("pull-error", error);
      throw error;
    }
  }

  // Start polling for changes
  startPolling() {
    if (this.isPolling) return;

    this.isPolling = true;

    // Initial pull
    this.pull().catch(() => {});

    // Set up interval
    this.pollInterval = setInterval(() => {
      if (this.syncId && manyllaEncryptionService.isInitialized()) {
        this.pull().catch(() => {});
      }
    }, this.POLL_INTERVAL);
  }

  // Stop polling
  stopPolling() {
    this.isPolling = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  // Add listener for sync events
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners(event, data) {
    this.listeners.forEach((callback) => {
      try {
        callback(event, data);
      } catch (error) {}
    });
  }

  // Get local data (to be implemented based on storage mechanism)
  getLocalData() {
    try {
      const stored = localStorage.getItem("manylla_profile");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // Generate invite code for sharing sync
  generateInviteCode(recoveryPhrase) {
    // For Manylla, invite code is just the recovery phrase
    // (Unlike StackMap which uses additional encoding)
    return recoveryPhrase.toUpperCase();
  }

  // Join sync from invite code
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

  // Clear all sync data
  async reset() {
    this.stopPolling();
    this.syncId = null;
    this.lastPullTime = null;

    // Clear stored recovery phrase
    localStorage.removeItem("manylla_recovery_phrase");

    // Note: We don't delete server data (user might want to reconnect)
  }

  // Get sync status
  getStatus() {
    return {
      initialized: !!this.syncId,
      polling: this.isPolling,
      lastPull: this.lastPullTime,
      syncId: this.syncId,
    };
  }

  // Set callback for when data is received
  setDataCallback(callback) {
    this.dataCallback = callback;
  }

  // Check if sync is enabled
  isSyncEnabled() {
    return !!this.syncId && manyllaEncryptionService.isInitialized();
  }

  // Get sync ID
  getSyncId() {
    return this.syncId;
  }

  // Enable sync (compatible with native version)
  async enableSync(recoveryPhrase, isNewSync = true) {
    await this.init(recoveryPhrase);

    if (isNewSync) {
      // For new sync, push initial data
      const localData = this.getLocalData();
      if (localData) {
        await this.push(localData);
      }
    }

    this.startPolling();
    return true;
  }

  // Disable sync
  async disableSync() {
    await this.reset();
  }

  // Push data (compatible interface)
  async pushData(data) {
    return this.push(data);
  }

  // Pull data (compatible interface)
  async pullData(forcePull = false) {
    const data = await this.pull();
    if (data && this.dataCallback) {
      this.dataCallback(data);
    }
    return data;
  }

  // Generate recovery phrase
  generateRecoveryPhrase() {
    return manyllaEncryptionService.generateRecoveryPhrase();
  }
}

// Export singleton instance
export default new ManyllaMinimalSyncService();
