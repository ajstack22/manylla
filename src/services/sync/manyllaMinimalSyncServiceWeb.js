import nacl from "tweetnacl";
import util from "tweetnacl-util";
import manyllaEncryptionService from "./manyllaEncryptionService";
import conflictResolver from "./conflictResolver";
import { API_ENDPOINTS } from "../../config/api";
import {
  SyncError,
  NetworkError,
  AuthError,
  ErrorHandler,
} from "../../utils/errors";

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
    if (!recoveryPhrase || typeof recoveryPhrase !== "string") {
      throw new AuthError("Invalid recovery phrase format", "INVALID_CODE");
    }

    // Validate recovery phrase format (32 hex characters, case-insensitive)
    const hexRegex = /^[A-Fa-f0-9]{32}$/;
    if (!hexRegex.test(recoveryPhrase)) {
      throw new AuthError("Invalid recovery phrase format", "INVALID_CODE");
    }

    // Initialize encryption
    manyllaEncryptionService.init(recoveryPhrase);

    // Generate sync ID from recovery phrase (32 hex characters to match API requirement)
    const phraseBytes = util.decodeUTF8(recoveryPhrase);
    const hash = nacl.hash(phraseBytes);
    // Convert first 16 bytes of hash to 32 hex characters
    const hashBytes = hash.slice(0, 16);
    this.syncId = Array.from(hashBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Test sync health
    try {
      const isHealthy = await this.checkHealth();
      if (!isHealthy) {
        // Don't throw error, just log it
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

  // Check if sync endpoint is available
  async checkHealth() {
    try {
      const response = await fetch(API_ENDPOINTS.sync.health, {
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

  // Helper: Validate push response
  _validatePushResponse(response) {
    if (response.status >= 401 && response.status < 402) {
      throw new AuthError("Invalid sync credentials", "UNAUTHORIZED");
    }
    if (response.status >= 500) {
      throw new NetworkError(`Server error: ${response.statusText}`);
    }
    throw new SyncError(`Push failed: ${response.statusText}`);
  }

  // Helper: Attempt single push request
  async _attemptPush(payload) {
    const response = await fetch(API_ENDPOINTS.sync.push, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      this._validatePushResponse(response);
    }

    const result = await response.json();
    if (result.success) {
      return result;
    }

    throw new SyncError(result.error || "Push failed");
  }

  // Helper: Push with retry logic
  async _pushWithRetries(payload) {
    let lastError;

    for (let i = 0; i < this.MAX_RETRIES; i++) {
      try {
        return await this._attemptPush(payload);
      } catch (error) {
        lastError = error;
        if (i < this.MAX_RETRIES - 1) {
          await new Promise((r) => setTimeout(r, this.RETRY_DELAY));
        }
      }
    }

    throw ErrorHandler.normalize(lastError);
  }

  // Push data to sync endpoint
  async push(data) {
    if (!this.syncId || !manyllaEncryptionService.isInitialized()) {
      throw new SyncError(
        "Sync not initialized. Please enable sync first.",
        false,
      );
    }

    // Cancel any pending push
    if (this.pendingPush) {
      clearTimeout(this.pendingPush);
    }

    // Debounce pushes
    return new Promise((resolve, reject) => {
      this.pendingPush = setTimeout(async () => {
        try {
          const encrypted = manyllaEncryptionService.encrypt(data);

          const payload = {
            sync_id: this.syncId,
            data: encrypted,
            timestamp: Date.now(),
            version: "2.0.0",
          };

          const result = await this._pushWithRetries(payload);
          this.notifyListeners("pushed", data);
          resolve(result);
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

  // Helper: Handle HTTP response errors
  _handlePullResponseError(response) {
    if (response.status >= 401 && response.status < 402) {
      throw new AuthError("Invalid sync credentials", "UNAUTHORIZED");
    }
    if (response.status >= 500) {
      throw new NetworkError(`Server error: ${response.statusText}`);
    }
    throw new SyncError(`Pull failed: ${response.statusText}`);
  }

  // Helper: Handle pull result validation
  _validatePullResult(result) {
    if (!result.success) {
      if (result.error === "No data found") {
        return null;
      }
      throw new SyncError(result.error || "Pull failed");
    }
    return result.data || null;
  }

  // Helper: Notify and return data
  _notifyAndReturn(data) {
    this.notifyListeners("pulled", data);
    if (this.dataCallback) {
      this.dataCallback(data);
    }
    return data;
  }

  // Pull data from sync endpoint
  async pull() {
    if (!this.syncId || !manyllaEncryptionService.isInitialized()) {
      throw new SyncError(
        "Sync not initialized. Please enable sync first.",
        false,
      );
    }

    try {
      const response = await fetch(
        `${API_ENDPOINTS.sync.pull}?sync_id=${encodeURIComponent(this.syncId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        this._handlePullResponseError(response);
      }

      const result = await response.json();
      const encryptedData = this._validatePullResult(result);

      if (!encryptedData) {
        return null;
      }

      const decrypted = manyllaEncryptionService.decrypt(encryptedData);
      this.lastPullTime = Date.now();

      const localData = this.getLocalData();
      if (localData) {
        const resolved = conflictResolver.mergeProfiles(localData, decrypted);
        return this._notifyAndReturn(resolved);
      }

      return this._notifyAndReturn(decrypted);
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

  // Start polling for changes
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
    this.pollInterval = setInterval(() => {
      if (this.syncId && manyllaEncryptionService.isInitialized()) {
        this.pull().catch((error) => {
          ErrorHandler.log(error, {
            context: "poll",
            recoverable: true,
          });
        });
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
      } catch (error) {
        ErrorHandler.log(error, {
          context: "listener callback",
          event,
        });
      }
    });
  }

  // Get local data (to be implemented based on storage mechanism)
  getLocalData() {
    try {
      const stored = localStorage.getItem("manylla_profile");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      // Log error in development for debugging
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to get local data from localStorage:", error.message);
      }
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
    if (!inviteCode || typeof inviteCode !== "string") {
      throw new Error("Invalid invite code");
    }

    // Clean and validate invite code format (32 hex characters)
    const cleaned = inviteCode.replace(/[^A-F0-9]/gi, "").toUpperCase();
    const hexRegex = /^[A-F0-9]{32}$/;
    if (!hexRegex.test(cleaned)) {
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
const manyllaMinimalSyncService = new ManyllaMinimalSyncService();
export default manyllaMinimalSyncService;

// Also export the class for testing
export { ManyllaMinimalSyncService };
