import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import manyllaEncryptionService from './manyllaEncryptionService';
import conflictResolver from './conflictResolver';

class ManyllaMinimalSyncService {
  constructor() {
    this.isEnabled = false;
    this.syncId = null;
    this.recoveryPhrase = null;
    this.pullInterval = null;
    this.dataCallback = null;
    this.lastPullTimestamp = 0;
    this.deviceId = this.getOrCreateDeviceId();
    
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
    
    // Extract and clear recovery phrase from URL fragment
    if (typeof window !== 'undefined' && window.location.hash) {
      const fragment = window.location.hash.substring(1);
      
      // Clear immediately to prevent exposure in browser history
      window.history.replaceState(null, '', 
        window.location.pathname + window.location.search);
      
      // Check if it looks like a recovery phrase (32 hex chars)
      if (fragment.match(/^[a-f0-9]{32}$/)) {
        this.pendingRecoveryPhrase = fragment;
        
        // Clear from memory after 30 seconds
        setTimeout(() => {
          this.pendingRecoveryPhrase = null;
        }, 30000);
      }
    }
    
    // Listen for app visibility changes to sync when user returns
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isEnabled) {
        console.log('[ManyllaSync] App became visible, pulling data');
        this.pullData();
      }
    });
  }

  /**
   * Generate a 32-character hex recovery phrase (same as StackMap)
   */
  generateRecoveryPhrase() {
    const bytes = nacl.randomBytes(16);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  /**
   * Enforce rate limiting between API requests
   */
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`[ManyllaSync] Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }
  
  /**
   * Make a rate-limited request
   * @param {Function} requestFn - The request function to execute
   * @returns {Promise} The result of the request
   */
  async makeRequest(requestFn) {
    await this.enforceRateLimit();
    try {
      return await requestFn();
    } catch (error) {
      console.error('[ManyllaSync] Request failed:', error);
      throw error;
    }
  }
  
  /**
   * Create an invite code for easier sharing
   * @returns {Promise<{inviteCode: string, inviteUrl: string}>}
   */
  async createInviteCode() {
    if (!this.isEnabled || !this.syncId) {
      throw new Error('Sync must be enabled to create invite codes');
    }
    
    try {
      // For now, generate locally (will use API when available)
      const { generateInviteCode, generateInviteUrl, storeInviteCode } = await import('../../utils/inviteCode');
      
      const inviteCode = generateInviteCode();
      const inviteUrl = generateInviteUrl(inviteCode, this.recoveryPhrase);
      
      // Store locally
      storeInviteCode(inviteCode, this.syncId, this.recoveryPhrase);
      
      // Future: Call API endpoint
      // const response = await fetch('/api/sync/create_invite.php', {
      //   method: 'POST',
      //   body: JSON.stringify({ sync_id: this.syncId, device_id: this.deviceId })
      // });
      
      return { inviteCode, inviteUrl };
    } catch (error) {
      console.error('[ManyllaSync] Failed to create invite code:', error);
      throw error;
    }
  }
  
  /**
   * Validate an invite code
   * @param {string} inviteCode - The invite code to validate
   * @returns {Promise<{valid: boolean, recoveryPhrase?: string}>}
   */
  async validateInviteCode(inviteCode) {
    try {
      // For now, check locally (will use API when available)
      const { getInviteCode, validateInviteCode } = await import('../../utils/inviteCode');
      
      if (!validateInviteCode(inviteCode)) {
        return { valid: false };
      }
      
      const inviteData = getInviteCode(inviteCode);
      if (!inviteData) {
        return { valid: false };
      }
      
      // Future: Validate with API
      // const response = await fetch(`/api/sync/validate_invite.php?code=${inviteCode}`);
      
      return { 
        valid: true, 
        recoveryPhrase: inviteData.recoveryPhrase 
      };
    } catch (error) {
      console.error('[ManyllaSync] Failed to validate invite code:', error);
      return { valid: false };
    }
  }

  /**
   * Get or create a device ID for this browser/device
   * Enhanced with crypto fallback like StackMap
   */
  getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('manylla_device_id');
    if (!deviceId) {
      try {
        // Try crypto.randomUUID if available
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          deviceId = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
        } else {
          // Fallback to nacl random bytes
          const bytes = nacl.randomBytes(8);
          deviceId = Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        }
      } catch (error) {
        console.warn('[ManyllaSync] Failed to generate secure device ID, using fallback:', error);
        deviceId = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
      }
      
      localStorage.setItem('manylla_device_id', deviceId);
      console.log('[ManyllaSync] Generated device ID:', deviceId);
    }
    return deviceId;
  }

  /**
   * Enable sync with a recovery phrase
   * @param {string} recoveryPhrase - 32-character hex string
   * @param {boolean} isNewSync - true if creating new sync, false if joining
   */
  async enableSync(recoveryPhrase, isNewSync = false) {
    try {
      console.log('[ManyllaSync] Enabling sync...');
      
      // Validate recovery phrase format
      if (!recoveryPhrase || !recoveryPhrase.match(/^[a-f0-9]{32}$/)) {
        throw new Error('Invalid recovery phrase format');
      }
      
      this.recoveryPhrase = recoveryPhrase;
      
      // Initialize encryption with recovery phrase
      const { syncId } = await manyllaEncryptionService.initialize(recoveryPhrase);
      this.syncId = syncId;
      
      // For now, use localStorage as backend isn't ready
      // Future: Call API endpoints
      if (isNewSync) {
        await this.createSync();
      } else {
        await this.joinSync();
      }
      
      this.isEnabled = true;
      
      // Start periodic pull
      this.startPullInterval();
      
      // Do initial pull if joining existing sync
      if (!isNewSync) {
        await this.pullData(true);
      }
      
      console.log('[ManyllaSync] Sync enabled successfully');
      return true;
    } catch (error) {
      console.error('[ManyllaSync] Failed to enable sync:', error);
      this.isEnabled = false;
      throw error;
    }
  }

  /**
   * Disable sync and clear data
   */
  async disableSync() {
    console.log('[ManyllaSync] Disabling sync...');
    
    this.stopPullInterval();
    this.isEnabled = false;
    this.syncId = null;
    this.recoveryPhrase = null;
    this.lastPullTimestamp = 0;
    
    await manyllaEncryptionService.clear();
    
    // Clear sync-related localStorage
    localStorage.removeItem('manylla_sync_enabled');
    localStorage.removeItem('manylla_last_pull');
    
    console.log('[ManyllaSync] Sync disabled');
  }

  /**
   * Create a new sync group (localStorage for now)
   */
  async createSync() {
    console.log('[ManyllaSync] Creating new sync group...');
    
    // Store in localStorage for now (will be API call later)
    const syncData = {
      syncId: this.syncId,
      created: Date.now(),
      devices: [this.deviceId]
    };
    
    localStorage.setItem(`manylla_sync_${this.syncId}`, JSON.stringify(syncData));
    localStorage.setItem('manylla_sync_enabled', 'true');
    
    // Future: POST to /api/sync/create_timestamp.php
  }

  /**
   * Join an existing sync group
   */
  async joinSync() {
    console.log('[ManyllaSync] Joining existing sync group...');
    
    // Check if sync exists in localStorage (will be API call later)
    const existingSync = localStorage.getItem(`manylla_sync_${this.syncId}`);
    
    if (existingSync) {
      const syncData = JSON.parse(existingSync);
      if (!syncData.devices.includes(this.deviceId)) {
        syncData.devices.push(this.deviceId);
        localStorage.setItem(`manylla_sync_${this.syncId}`, JSON.stringify(syncData));
      }
    } else {
      // First device to join with this phrase
      await this.createSync();
    }
    
    localStorage.setItem('manylla_sync_enabled', 'true');
    
    // Future: POST to /api/sync/join_timestamp.php
  }

  /**
   * Push profile data to sync
   * @param {Object} profile - The ChildProfile to sync
   */
  async pushData(profile) {
    if (!this.isEnabled) {
      console.log('[ManyllaSync] Sync not enabled, skipping push');
      return;
    }
    
    if (!profile) {
      console.warn('[ManyllaSync] No profile data to push');
      return;
    }
    
    // Use rate-limited request wrapper
    return this.makeRequest(async () => {
      console.log('[ManyllaSync] Pushing data...', { deviceId: this.deviceId });
      
      const timestamp = Date.now();
      
      // Add timestamp to profile for conflict resolution
      const profileWithTimestamp = {
        ...profile,
        timestamp: timestamp,
        lastModified: new Date().toISOString()
      };
      
      // Prepare sync data
      const syncData = {
        version: 1,
        profile: profileWithTimestamp,
        timestamp: timestamp,
        deviceId: this.deviceId,
        metadata: {
          appVersion: '1.0.0',
          platform: this.getPlatform()
        }
      };
      
      // Encrypt the data
      let encryptedData;
      try {
        encryptedData = manyllaEncryptionService.encryptData(syncData);
      } catch (encryptError) {
        console.error('[ManyllaSync] Encryption failed:', encryptError);
        throw new Error('Failed to encrypt sync data');
      }
      
      // Store in localStorage for now (will be API call later)
      const storageKey = `manylla_sync_data_${this.syncId}`;
      const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      existingData.push({
        encrypted: encryptedData,
        timestamp: timestamp,
        deviceId: this.deviceId
      });
      
      // Keep only last 10 entries in localStorage
      if (existingData.length > 10) {
        existingData.shift();
      }
      
      localStorage.setItem(storageKey, JSON.stringify(existingData));
      
      console.log('[ManyllaSync] Data pushed successfully', { timestamp });
      
      // Future: POST to /api/sync/push_timestamp.php
      // const response = await fetch('/api/sync/push_timestamp.php', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     sync_id: this.syncId,
      //     encrypted_blob: encryptedData,
      //     timestamp: timestamp,
      //     device_id: this.deviceId
      //   })
      // });
    } catch (error) {
      console.error('[ManyllaSync] Failed to push data:', error);
      this.emitError('push', error.message);
      throw error;
    }
    }); // End of makeRequest wrapper
  }

  /**
   * Pull data from sync
   * @param {boolean} forceFullPull - Whether to pull all data regardless of timestamp
   */
  async pullData(forceFullPull = false) {
    if (!this.isEnabled) {
      console.log('[ManyllaSync] Sync not enabled, skipping pull');
      return;
    }
    
    // Prevent runaway pulls
    this.pullAttempts++;
    if (this.pullAttempts > 100) {
      console.error('[ManyllaSync] Too many pull attempts, stopping');
      this.stopPullInterval();
      return;
    }
    
    // Use rate-limited request wrapper
    return this.makeRequest(async () => {
      console.log('[ManyllaSync] Pulling data...', { forceFullPull, lastPull: this.lastPullTimestamp });
      
      const since = forceFullPull ? 0 : this.lastPullTimestamp;
      
      // Get from localStorage for now (will be API call later)
      const storageKey = `manylla_sync_data_${this.syncId}`;
      const syncEntries = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Filter entries newer than last pull
      const newEntries = syncEntries.filter(entry => 
        entry.timestamp > since && entry.deviceId !== this.deviceId
      );
      
      if (newEntries.length === 0) {
        console.log('[ManyllaSync] No new data to pull');
        return;
      }
      
      console.log(`[ManyllaSync] Found ${newEntries.length} new entries`);
      
      // Get the most recent entry
      const latestEntry = newEntries.reduce((latest, entry) => 
        entry.timestamp > latest.timestamp ? entry : latest
      );
      
      // Decrypt the data
      let decryptedData;
      try {
        decryptedData = manyllaEncryptionService.decryptData(latestEntry.encrypted);
      } catch (decryptError) {
        console.error('[ManyllaSync] Decryption failed:', decryptError);
        throw new Error('Failed to decrypt sync data');
      }
      
      // Get current local data for conflict resolution
      const localProfile = this.getCurrentLocalProfile();
      
      // Resolve conflicts if we have local data
      let finalProfile;
      if (localProfile && decryptedData.profile) {
        console.log('[ManyllaSync] Resolving conflicts between local and remote data');
        finalProfile = conflictResolver.mergeProfiles(localProfile, decryptedData.profile);
        
        // Validate merged data
        if (!conflictResolver.validateMergedData(finalProfile)) {
          console.warn('[ManyllaSync] Merged data validation failed, using remote data');
          finalProfile = decryptedData.profile;
        }
      } else {
        finalProfile = decryptedData.profile;
      }
      
      // Update last pull timestamp
      this.lastPullTimestamp = latestEntry.timestamp;
      localStorage.setItem('manylla_last_pull', this.lastPullTimestamp.toString());
      
      // Notify callback if set
      if (this.dataCallback && finalProfile) {
        console.log('[ManyllaSync] Notifying data callback with merged profile');
        this.dataCallback(finalProfile);
      }
      
      console.log('[ManyllaSync] Data pulled and merged successfully');
      
      // Future: GET from /api/sync/pull_timestamp.php
    } catch (error) {
      console.error('[ManyllaSync] Failed to pull data:', error);
      // Emit error event for UI feedback
      this.emitError('pull', error.message);
      throw error;
    }
    }); // End of makeRequest wrapper
  }

  /**
   * Start periodic pull interval
   */
  startPullInterval() {
    if (this.pullInterval) {
      clearInterval(this.pullInterval);
    }
    
    console.log(`[ManyllaSync] Starting pull interval (${this.PULL_INTERVAL}ms)`);
    
    this.pullInterval = setInterval(() => {
      this.pullData();
    }, this.PULL_INTERVAL);
  }

  /**
   * Stop periodic pull interval
   */
  stopPullInterval() {
    if (this.pullInterval) {
      console.log('[ManyllaSync] Stopping pull interval');
      clearInterval(this.pullInterval);
      this.pullInterval = null;
    }
  }

  /**
   * Set callback for when new data is received
   * @param {Function} callback - Function to call with new profile data
   */
  setDataCallback(callback) {
    this.dataCallback = callback;
  }

  /**
   * Test sync connection
   */
  async testSyncConnection() {
    try {
      console.log('[ManyllaSync] Testing sync connection...');
      
      // For now, just check localStorage
      const syncExists = localStorage.getItem(`manylla_sync_${this.syncId}`);
      
      if (syncExists) {
        console.log('[ManyllaSync] Sync connection test successful');
        return true;
      } else {
        console.log('[ManyllaSync] No sync data found');
        return false;
      }
      
      // Future: Test API endpoint connectivity
    } catch (error) {
      console.error('[ManyllaSync] Sync connection test failed:', error);
      return false;
    }
  }

  /**
   * Get current sync ID
   */
  getSyncId() {
    return this.syncId;
  }

  /**
   * Check if sync is currently enabled
   */
  isSyncEnabled() {
    return this.isEnabled;
  }
  
  /**
   * Get current local profile data
   * @returns {Object|null} Current profile from localStorage
   */
  getCurrentLocalProfile() {
    try {
      const profileData = localStorage.getItem('childProfile');
      return profileData ? JSON.parse(profileData) : null;
    } catch (error) {
      console.error('[ManyllaSync] Failed to get local profile:', error);
      return null;
    }
  }
  
  /**
   * Get platform information
   */
  getPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return 'ios';
    } else if (userAgent.includes('android')) {
      return 'android';
    } else {
      return 'web';
    }
  }
  
  /**
   * Emit error event for UI feedback
   */
  emitError(operation, message) {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      const event = new CustomEvent('manylla-sync-error', {
        detail: { operation, message, timestamp: Date.now() }
      });
      window.dispatchEvent(event);
    }
  }
}

// Export singleton instance
export default new ManyllaMinimalSyncService();