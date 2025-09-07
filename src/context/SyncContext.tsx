import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import manyllaMinimalSyncService from '../services/sync/manyllaMinimalSyncService';
import { ChildProfile } from '../types/ChildProfile';

interface SyncContextType {
  syncEnabled: boolean;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success' | 'not-setup';
  lastSyncTime: Date | null;
  recoveryPhrase: string | null;
  syncId: string | null;
  enableSync: (isNewSync: boolean, recoveryPhrase?: string) => Promise<{ recoveryPhrase: string; syncId: string }>;
  disableSync: () => Promise<void>;
  syncNow: () => Promise<void>;
  pushProfile: (profile: ChildProfile) => Promise<void>;
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
  onProfileReceived?: (profile: ChildProfile) => void;
}

export const SyncProvider: React.FC<SyncProviderProps> = ({ children, onProfileReceived }) => {
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success' | 'not-setup'>('not-setup');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [recoveryPhrase, setRecoveryPhrase] = useState<string | null>(null);
  const [syncId, setSyncId] = useState<string | null>(null);

  // Handle profile updates from sync
  const handleProfileReceived = useCallback((profile: ChildProfile) => {
    console.log('[SyncContext] Received profile from sync');
    setLastSyncTime(new Date());
    if (onProfileReceived) {
      onProfileReceived(profile);
    }
  }, [onProfileReceived]);

  // Check sync status on mount
  useEffect(() => {
    checkSyncStatus();
  }, []);

  // Set up sync data callback
  useEffect(() => {
    manyllaMinimalSyncService.setDataCallback(handleProfileReceived);
  }, [handleProfileReceived]);

  const checkSyncStatus = async () => {
    try {
      const enabled = localStorage.getItem('manylla_sync_enabled') === 'true';
      setSyncEnabled(enabled);
      
      if (enabled) {
        const storedPhrase = localStorage.getItem('manylla_recovery_phrase');
        const storedSyncId = localStorage.getItem('manylla_sync_id');
        
        if (storedPhrase && storedSyncId) {
          setRecoveryPhrase(storedPhrase);
          setSyncId(storedSyncId);
          
          // Re-enable sync with stored phrase
          await manyllaMinimalSyncService.enableSync(storedPhrase, false);
          setSyncStatus('idle');
        }
      } else {
        setSyncStatus('not-setup');
      }
    } catch (error) {
      console.error('Failed to check sync status:', error);
      setSyncStatus('error');
    }
  };

  const enableSync = async (isNewSync: boolean = true, existingPhrase?: string) => {
    try {
      setSyncStatus('syncing');
      
      // Generate new or use existing recovery phrase
      const phrase = existingPhrase || manyllaMinimalSyncService.generateRecoveryPhrase();
      
      // Enable sync with the service
      await manyllaMinimalSyncService.enableSync(phrase, isNewSync);
      
      const syncIdValue = manyllaMinimalSyncService.getSyncId();
      
      // Store in localStorage for persistence
      localStorage.setItem('manylla_sync_enabled', 'true');
      localStorage.setItem('manylla_recovery_phrase', phrase);
      localStorage.setItem('manylla_sync_id', syncIdValue);
      
      setSyncEnabled(true);
      setSyncStatus('success');
      setRecoveryPhrase(phrase);
      setSyncId(syncIdValue);
      setLastSyncTime(new Date());
      
      // Brief success status then back to idle
      setTimeout(() => setSyncStatus('idle'), 2000);
      
      return { recoveryPhrase: phrase, syncId: syncIdValue };
    } catch (error) {
      console.error('Failed to enable sync:', error);
      setSyncStatus('error');
      throw error;
    }
  };

  const pushProfile = async (profile: ChildProfile) => {
    if (!syncEnabled || !manyllaMinimalSyncService.isSyncEnabled()) {
      return;
    }
    
    try {
      setSyncStatus('syncing');
      await manyllaMinimalSyncService.pushData(profile);
      setLastSyncTime(new Date());
      setSyncStatus('idle');
    } catch (error) {
      console.error('Failed to push profile:', error);
      setSyncStatus('error');
    }
  };

  const disableSync = async () => {
    try {
      await manyllaMinimalSyncService.disableSync();
      
      // Clear localStorage
      localStorage.removeItem('manylla_sync_enabled');
      localStorage.removeItem('manylla_recovery_phrase');
      localStorage.removeItem('manylla_sync_id');
      
      setSyncEnabled(false);
      setSyncStatus('not-setup');
      setRecoveryPhrase(null);
      setSyncId(null);
      setLastSyncTime(null);
    } catch (error) {
      console.error('Failed to disable sync:', error);
      throw error;
    }
  };

  const syncNow = async () => {
    if (!syncEnabled || !manyllaMinimalSyncService.isSyncEnabled()) return;

    try {
      setSyncStatus('syncing');
      
      // Force a pull to get latest data
      await manyllaMinimalSyncService.pullData(true);
      
      setSyncStatus('success');
      setLastSyncTime(new Date());
      
      // Return to idle after brief success indication
      setTimeout(() => setSyncStatus('idle'), 2000);
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
        syncId,
        enableSync,
        disableSync,
        syncNow,
        pushProfile,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

