/**
 * Cross-Platform Sync Context
 * Provides sync functionality for both web and native platforms
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import platform from "../utils/platform";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ManyllaMinimalSyncService from "../services/sync/manyllaMinimalSyncService";
import ManyllaEncryptionService from "../services/sync/manyllaEncryptionService";

const SyncContext = createContext(undefined);

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSync must be used within a SyncProvider");
  }
  return context;
};

export const SyncProvider = ({ children, onProfileReceived }) => {
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncStatus, setSyncStatus] = useState("not-setup");
  const [lastSync, setLastSync] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [recoveryPhrase, setRecoveryPhrase] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [syncId, setSyncId] = useState(null);

  // Platform-specific storage functions
  const getStorageItem = async (key) => {
    if (platform.isWeb) {
      return localStorage.getItem(key);
    } else {
      return await AsyncStorage.getItem(key);
    }
  };

  const setStorageItem = async (key, value) => {
    if (platform.isWeb) {
      localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  };

  const removeStorageItem = async (key) => {
    if (platform.isWeb) {
      localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  };

  // Handle profile updates from sync (from .tsx version)
  const handleProfileReceived = useCallback(
    (profile) => {
      setLastSyncTime(new Date());
      setLastSync(new Date());
      if (onProfileReceived) {
        onProfileReceived(profile);
      }
    },
    [onProfileReceived],
  );

  // Set up sync data callback (from .tsx version)
  useEffect(() => {
    if (ManyllaMinimalSyncService.setDataCallback) {
      ManyllaMinimalSyncService.setDataCallback(handleProfileReceived);
    }
  }, [handleProfileReceived]);

  // Initialize sync service
  useEffect(() => {
    const initSync = async () => {
      try {
        // Check for sync enabled status (from .tsx version)
        const enabled =
          (await getStorageItem("manylla_sync_enabled")) === "true";
        setSyncEnabled(enabled);

        // Check for existing recovery phrase
        const storedPhrase = await getStorageItem("manylla_recovery_phrase");
        const storedSyncId = await getStorageItem("manylla_sync_id");

        if (storedPhrase) {
          setRecoveryPhrase(storedPhrase);
          if (storedSyncId) {
            setSyncId(storedSyncId);
          }

          ManyllaEncryptionService.init(storedPhrase);
          setEncryptionReady(true);

          // Re-enable sync with stored phrase (from .tsx version)
          if (enabled && ManyllaMinimalSyncService.enableSync) {
            await ManyllaMinimalSyncService.enableSync(storedPhrase, false);
          }

          setSyncStatus(enabled ? "idle" : "not-setup");

          // Start sync polling if enabled
          if (enabled && ManyllaMinimalSyncService.startPolling) {
            ManyllaMinimalSyncService.startPolling();
          }
        } else {
          setSyncStatus("not-setup");
        }
      } catch (error) {
        setSyncError(error.message);
        setSyncStatus("error");
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
      const phrase = ManyllaEncryptionService.generateRecoveryPhrase
        ? ManyllaEncryptionService.generateRecoveryPhrase()
        : ManyllaMinimalSyncService.generateRecoveryPhrase();

      await setStorageItem("manylla_recovery_phrase", phrase);
      setRecoveryPhrase(phrase);
      ManyllaEncryptionService.init(phrase);
      setEncryptionReady(true);
      return phrase;
    } catch (error) {
      setSyncError(error.message);
      throw error;
    }
  }, []);

  // Enable sync (merged from .tsx version)
  const enableSync = async (isNewSync = true, existingPhrase) => {
    try {
      setSyncStatus("syncing");

      // Generate new or use existing recovery phrase
      const phrase =
        existingPhrase ||
        (ManyllaEncryptionService.generateRecoveryPhrase
          ? ManyllaEncryptionService.generateRecoveryPhrase()
          : ManyllaMinimalSyncService.generateRecoveryPhrase());

      // Enable sync with the service
      if (ManyllaMinimalSyncService.enableSync) {
        await ManyllaMinimalSyncService.enableSync(phrase, isNewSync);
      }

      const syncIdValue = ManyllaMinimalSyncService.getSyncId
        ? ManyllaMinimalSyncService.getSyncId()
        : `sync_${Date.now()}`;

      // Store in storage for persistence
      await setStorageItem("manylla_sync_enabled", "true");
      await setStorageItem("manylla_recovery_phrase", phrase);
      await setStorageItem("manylla_sync_id", syncIdValue);

      setSyncEnabled(true);
      setSyncStatus("success");
      setRecoveryPhrase(phrase);
      setSyncId(syncIdValue);
      setLastSyncTime(new Date());
      setLastSync(new Date());

      ManyllaEncryptionService.init(phrase);
      setEncryptionReady(true);

      // Start sync polling if available
      if (ManyllaMinimalSyncService.startPolling) {
        ManyllaMinimalSyncService.startPolling();
      }

      // Brief success status then back to idle
      setTimeout(() => setSyncStatus("idle"), 2000);

      return { recoveryPhrase: phrase, syncId: syncIdValue };
    } catch (error) {
      console.error("Failed to enable sync:", error);
      setSyncStatus("error");
      setSyncError(error.message);
      throw error;
    }
  };

  // Join with existing recovery phrase
  const joinWithPhrase = useCallback(
    async (phrase) => {
      try {
        // Validate phrase format (32 char hex)
        if (!/^[a-f0-9]{32}$/i.test(phrase)) {
          throw new Error("Invalid recovery phrase format");
        }

        await setStorageItem("manylla_recovery_phrase", phrase);
        await setStorageItem("manylla_sync_enabled", "true");

        setRecoveryPhrase(phrase);
        setSyncEnabled(true);
        ManyllaEncryptionService.init(phrase);
        setEncryptionReady(true);

        // Enable sync with the service (from .tsx version)
        if (ManyllaMinimalSyncService.enableSync) {
          await ManyllaMinimalSyncService.enableSync(phrase, false);
        }

        const syncIdValue = ManyllaMinimalSyncService.getSyncId
          ? ManyllaMinimalSyncService.getSyncId()
          : `sync_${Date.now()}`;

        await setStorageItem("manylla_sync_id", syncIdValue);
        setSyncId(syncIdValue);

        // Pull existing data
        await pullSync(); // eslint-disable-line no-use-before-define

        // Start sync polling
        if (ManyllaMinimalSyncService.startPolling) {
          ManyllaMinimalSyncService.startPolling();
        }

        setSyncStatus("idle");
        return true;
      } catch (error) {
        setSyncError(error.message);
        setSyncStatus("error");
        throw error;
      }
    },
    [pullSync],
  ); // eslint-disable-line no-use-before-define

  // Push sync / pushProfile (merged)
  const pushSync = useCallback(
    async (data) => {
      if (!encryptionReady || !recoveryPhrase) {
        if (
          !syncEnabled ||
          !ManyllaMinimalSyncService.isSyncEnabled ||
          !ManyllaMinimalSyncService.isSyncEnabled()
        ) {
          return;
        }
      }

      try {
        setIsSyncing(true);
        setSyncStatus("syncing");

        // Use appropriate push method based on what's available
        if (
          ManyllaEncryptionService.encryptSync &&
          ManyllaMinimalSyncService.push
        ) {
          const encryptedData =
            await ManyllaEncryptionService.encryptSync(data);
          await ManyllaMinimalSyncService.push(recoveryPhrase, encryptedData);
        } else if (ManyllaMinimalSyncService.pushData) {
          await ManyllaMinimalSyncService.pushData(data);
        }

        setSyncStatus("success");
        setLastSync(new Date());
        setLastSyncTime(new Date());
        setSyncError(null);

        // Return to idle after brief success
        setTimeout(() => setSyncStatus("idle"), 2000);
      } catch (error) {
        setSyncStatus("error");
        setSyncError(error.message);
        throw error;
      } finally {
        setIsSyncing(false);
      }
    },
    [encryptionReady, recoveryPhrase, syncEnabled],
  );

  // Alias for compatibility
  const pushProfile = pushSync;

  // Pull sync
  const pullSync = useCallback(async () => {
    if (!syncEnabled && (!encryptionReady || !recoveryPhrase)) {
      return null;
    }

    try {
      setIsSyncing(true);
      setSyncStatus("syncing");

      let decryptedData = null;

      // Use appropriate pull method based on what's available
      if (
        ManyllaMinimalSyncService.pull &&
        ManyllaEncryptionService.decryptSync
      ) {
        const encryptedData =
          await ManyllaMinimalSyncService.pull(recoveryPhrase);
        if (encryptedData) {
          decryptedData =
            await ManyllaEncryptionService.decryptSync(encryptedData);
        }
      } else if (ManyllaMinimalSyncService.pullData) {
        await ManyllaMinimalSyncService.pullData(true);
      }

      setSyncStatus("success");
      setLastSync(new Date());
      setLastSyncTime(new Date());
      setSyncError(null);

      // Return to idle after brief success
      setTimeout(() => setSyncStatus("idle"), 2000);

      return decryptedData;
    } catch (error) {
      setSyncStatus("error");
      setSyncError(error.message);
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [encryptionReady, recoveryPhrase, syncEnabled]);

  // Sync now (from .tsx version)
  const syncNow = async () => {
    if (
      !syncEnabled ||
      (ManyllaMinimalSyncService.isSyncEnabled &&
        !ManyllaMinimalSyncService.isSyncEnabled())
    ) {
      return;
    }

    try {
      setSyncStatus("syncing");

      // Force a pull to get latest data
      if (ManyllaMinimalSyncService.pullData) {
        await ManyllaMinimalSyncService.pullData(true);
      } else {
        await pullSync();
      }

      setSyncStatus("success");
      setLastSyncTime(new Date());
      setLastSync(new Date());

      // Return to idle after brief success indication
      setTimeout(() => setSyncStatus("idle"), 2000);
    } catch (error) {
      setSyncStatus("error");
      setSyncError(error.message);
      throw error;
    }
  };

  // Create share
  const createShare = useCallback(
    async (data, options = {}) => {
      if (!encryptionReady) {
        throw new Error("Encryption not initialized");
      }

      try {
        const shareData = await ManyllaEncryptionService.encryptForShare(data);
        const shareId = await ManyllaMinimalSyncService.createShare(
          shareData,
          options,
        );

        // Return the share URL with encryption key in fragment
        const baseUrl = platform.isWeb
          ? window.location.origin
          : "https://manylla.com/qual";

        return `${baseUrl}/share/${shareId}#${shareData.key}`;
      } catch (error) {
        throw error;
      }
    },
    [encryptionReady],
  );

  // Disable sync (merged from .tsx version)
  const disableSync = useCallback(async () => {
    try {
      if (ManyllaMinimalSyncService.disableSync) {
        await ManyllaMinimalSyncService.disableSync();
      }

      // Clear storage
      await removeStorageItem("manylla_sync_enabled");
      await removeStorageItem("manylla_recovery_phrase");
      await removeStorageItem("manylla_sync_id");

      setSyncEnabled(false);
      setSyncStatus("not-setup");
      setRecoveryPhrase(null);
      setSyncId(null);
      setLastSyncTime(null);
      setLastSync(null);
      setEncryptionReady(false);
      setSyncError(null);

      if (ManyllaMinimalSyncService.stopPolling) {
        ManyllaMinimalSyncService.stopPolling();
      }
    } catch (error) {
      setSyncError(error.message);
      throw error;
    }
  }, []);

  // Reset sync (from .js version)
  const resetSync = useCallback(async () => {
    try {
      await disableSync();
    } catch (error) {
      setSyncError(error.message);
    }
  }, [disableSync]);

  const value = {
    // State
    syncEnabled,
    syncStatus,
    lastSync,
    lastSyncTime,
    syncError,
    recoveryPhrase,
    isSyncing,
    encryptionReady,
    syncId,
    // Methods
    generateRecoveryPhrase,
    joinWithPhrase,
    pushSync,
    pullSync,
    createShare,
    resetSync,
    enableSync,
    disableSync,
    syncNow,
    pushProfile,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export default SyncProvider;
