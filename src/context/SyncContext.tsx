import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import encryptionService from '../services/sync/manyllaEncryptionService';

interface SyncContextType {
  syncEnabled: boolean;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  lastSyncTime: Date | null;
  recoveryPhrase: string | null;
  enableSync: () => Promise<{ recoveryPhrase: string; syncId: string }>;
  disableSync: () => Promise<void>;
  syncNow: () => Promise<void>;
  joinSync: (recoveryPhrase: string) => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};

interface SyncProviderProps {
  children: ReactNode;
}

export const SyncProvider: React.FC<SyncProviderProps> = ({ children }) => {
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [recoveryPhrase, setRecoveryPhrase] = useState<string | null>(null);

  // Check sync status on mount
  useEffect(() => {
    checkSyncStatus();
  }, []);

  const checkSyncStatus = async () => {
    try {
      const enabled = await encryptionService.isEnabled();
      setSyncEnabled(enabled);
      
      if (enabled) {
        // Try to restore encryption
        await encryptionService.restore();
      }
    } catch (error) {
      console.error('Failed to check sync status:', error);
    }
  };

  const enableSync = async () => {
    try {
      setSyncStatus('syncing');
      
      // Generate new recovery phrase
      const phrase = encryptionService.generateRecoveryPhrase();
      const { syncId } = await encryptionService.initialize(phrase);
      
      // TODO: Call API to create sync group
      const apiUrl = process.env.REACT_APP_API_URL || '/api/manylla';
      const response = await fetch(`${apiUrl}/sync/create.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sync_id: syncId,
          encrypted_blob: await encryptionService.encryptData({
            profiles: [],
            settings: {},
            version: 1
          }),
          recovery_salt: await localStorage.getItem('secure_manylla_salt'),
          device_id: await generateDeviceId()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create sync group');
      }

      setSyncEnabled(true);
      setSyncStatus('success');
      setRecoveryPhrase(phrase);
      setLastSyncTime(new Date());
      
      return { recoveryPhrase: phrase, syncId };
    } catch (error) {
      console.error('Failed to enable sync:', error);
      setSyncStatus('error');
      throw error;
    }
  };

  const joinSync = async (phrase: string) => {
    try {
      setSyncStatus('syncing');
      
      // Initialize with existing phrase
      const { syncId } = await encryptionService.initialize(phrase);
      
      // TODO: Pull data from server
      const apiUrl = process.env.REACT_APP_API_URL || '/api/manylla';
      const response = await fetch(`${apiUrl}/sync/pull.php?sync_id=${syncId}`, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to join sync group');
      }

      const data = await response.json();
      
      // Decrypt and restore data
      if (data.encrypted_blob) {
        const decrypted = await encryptionService.decryptData(data.encrypted_blob);
        // TODO: Restore profiles and settings from decrypted data
        console.log('Restored data:', decrypted);
      }

      setSyncEnabled(true);
      setSyncStatus('success');
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Failed to join sync:', error);
      setSyncStatus('error');
      throw error;
    }
  };

  const disableSync = async () => {
    try {
      await encryptionService.clear();
      setSyncEnabled(false);
      setSyncStatus('idle');
      setRecoveryPhrase(null);
      setLastSyncTime(null);
    } catch (error) {
      console.error('Failed to disable sync:', error);
      throw error;
    }
  };

  const syncNow = async () => {
    if (!syncEnabled) return;

    try {
      setSyncStatus('syncing');
      
      // TODO: Implement actual sync logic
      // 1. Get current state
      // 2. Encrypt data
      // 3. Push to server
      // 4. Pull latest from server
      // 5. Merge changes
      // 6. Update local state
      
      setSyncStatus('success');
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      throw error;
    }
  };

  return (
    <SyncContext.Provider
      value={{
        syncEnabled,
        syncStatus,
        lastSyncTime,
        recoveryPhrase,
        enableSync,
        disableSync,
        syncNow,
        joinSync,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

// Utility function to generate device ID
async function generateDeviceId(): Promise<string> {
  let deviceId = localStorage.getItem('manylla_device_id');
  
  if (!deviceId) {
    deviceId = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    localStorage.setItem('manylla_device_id', deviceId);
  }
  
  return deviceId;
}