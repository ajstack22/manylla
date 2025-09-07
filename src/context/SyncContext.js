/**
 * Cross-Platform Sync Context
 * Provides sync functionality for both web and native platforms
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ManyllaMinimalSyncService } from '../services/sync/manyllaMinimalSyncService';
import { ManyllaEncryptionService } from '../services/sync/manyllaEncryptionService';

const SyncContext = createContext(undefined);

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};

export const SyncProvider = ({ children }) => {
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSync, setLastSync] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [recoveryPhrase, setRecoveryPhrase] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [encryptionReady, setEncryptionReady] = useState(false);

  // Initialize sync service
  useEffect(() => {
    const initSync = async () => {
      try {
        // Check for existing recovery phrase
        const storedPhrase = await AsyncStorage.getItem('manylla_recovery_phrase');
        if (storedPhrase) {
          setRecoveryPhrase(storedPhrase);
          ManyllaEncryptionService.init(storedPhrase);
          setEncryptionReady(true);
          
          // Start sync polling
          ManyllaMinimalSyncService.startPolling();
        }
      } catch (error) {
        console.error('Error initializing sync:', error);
        setSyncError(error.message);
      }
    };

    initSync();

    return () => {
      if (ManyllaMinimalSyncService && ManyllaMinimalSyncService.stopPolling) {
        ManyllaMinimalSyncService.stopPolling();
      }
    };
  }, []);

  // Generate new recovery phrase
  const generateRecoveryPhrase = useCallback(async () => {
    try {
      const phrase = ManyllaEncryptionService.generateRecoveryPhrase();
      await AsyncStorage.setItem('manylla_recovery_phrase', phrase);
      setRecoveryPhrase(phrase);
      ManyllaEncryptionService.init(phrase);
      setEncryptionReady(true);
      return phrase;
    } catch (error) {
      console.error('Error generating recovery phrase:', error);
      setSyncError(error.message);
      throw error;
    }
  }, []);

  // Join with existing recovery phrase
  const joinWithPhrase = useCallback(async (phrase) => {
    try {
      // Validate phrase format (32 char hex)
      if (!/^[a-f0-9]{32}$/i.test(phrase)) {
        throw new Error('Invalid recovery phrase format');
      }

      await AsyncStorage.setItem('manylla_recovery_phrase', phrase);
      setRecoveryPhrase(phrase);
      ManyllaEncryptionService.init(phrase);
      setEncryptionReady(true);
      
      // Pull existing data
      await pullSync();
      
      // Start sync polling
      ManyllaMinimalSyncService.startPolling();
      
      return true;
    } catch (error) {
      console.error('Error joining with phrase:', error);
      setSyncError(error.message);
      throw error;
    }
  }, []);

  // Push sync
  const pushSync = useCallback(async (data) => {
    if (!encryptionReady || !recoveryPhrase) {
      throw new Error('Encryption not initialized');
    }

    try {
      setIsSyncing(true);
      setSyncStatus('pushing');
      
      const encryptedData = await ManyllaEncryptionService.encryptSync(data);
      await ManyllaMinimalSyncService.push(recoveryPhrase, encryptedData);
      
      setSyncStatus('success');
      setLastSync(new Date());
      setSyncError(null);
    } catch (error) {
      console.error('Push sync error:', error);
      setSyncStatus('error');
      setSyncError(error.message);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [encryptionReady, recoveryPhrase]);

  // Pull sync
  const pullSync = useCallback(async () => {
    if (!encryptionReady || !recoveryPhrase) {
      return null;
    }

    try {
      setIsSyncing(true);
      setSyncStatus('pulling');
      
      const encryptedData = await ManyllaMinimalSyncService.pull(recoveryPhrase);
      if (!encryptedData) {
        setSyncStatus('idle');
        return null;
      }
      
      const decryptedData = await ManyllaEncryptionService.decryptSync(encryptedData);
      
      setSyncStatus('success');
      setLastSync(new Date());
      setSyncError(null);
      
      return decryptedData;
    } catch (error) {
      console.error('Pull sync error:', error);
      setSyncStatus('error');
      setSyncError(error.message);
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [encryptionReady, recoveryPhrase]);

  // Create share
  const createShare = useCallback(async (data, options = {}) => {
    if (!encryptionReady) {
      throw new Error('Encryption not initialized');
    }

    try {
      const shareData = await ManyllaEncryptionService.encryptForShare(data);
      const shareId = await ManyllaMinimalSyncService.createShare(shareData, options);
      
      // Return the share URL with encryption key in fragment
      const baseUrl = Platform.OS === 'web' 
        ? window.location.origin 
        : 'https://manylla.com/qual';
      
      return `${baseUrl}/share/${shareId}#${shareData.key}`;
    } catch (error) {
      console.error('Create share error:', error);
      throw error;
    }
  }, [encryptionReady]);

  // Reset sync
  const resetSync = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('manylla_recovery_phrase');
      setRecoveryPhrase(null);
      setEncryptionReady(false);
      setSyncStatus('idle');
      setLastSync(null);
      setSyncError(null);
      ManyllaMinimalSyncService.stopPolling();
    } catch (error) {
      console.error('Error resetting sync:', error);
      setSyncError(error.message);
    }
  }, []);

  const value = {
    syncStatus,
    lastSync,
    syncError,
    recoveryPhrase,
    isSyncing,
    encryptionReady,
    generateRecoveryPhrase,
    joinWithPhrase,
    pushSync,
    pullSync,
    createShare,
    resetSync,
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
};

export default SyncProvider;