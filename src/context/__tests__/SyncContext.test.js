import React from 'react';
import { render, act, screen } from '@testing-library/react';
import { SyncProvider, useSync } from '../SyncContext';
import platform from '../../utils/platform';
import ManyllaMinimalSyncService from '../../services/sync/manyllaMinimalSyncService';
import {
  TEST_RECOVERY_PHRASE,
  TEST_SYNC_ID,
  createTestProfileData,
} from '../../test/utils/encryption-helpers';

// Mock platform module
jest.mock('../../utils/platform', () => ({
  isWeb: true,
  isNative: false,
}));

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock sync services
jest.mock('../../services/sync/manyllaMinimalSyncService', () => ({
  __esModule: true,
  default: {
    init: jest.fn(async () => true),
    checkHealth: jest.fn(async () => true),
    push: jest.fn(async () => ({ success: true })),
    pull: jest.fn(async () => ({ test: 'pulled data' })),
    startPolling: jest.fn(),
    stopPolling: jest.fn(),
    addListener: jest.fn(() => jest.fn()), // Returns unsubscribe function
    generateRecoveryPhrase: jest.fn(() => 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'),
    enableSync: jest.fn(async () => true),
    disableSync: jest.fn(async () => {}),
    isSyncEnabled: jest.fn(() => true),
    getSyncId: jest.fn(() => 'test_sync_id_12345678'),
    pushData: jest.fn(async () => ({ success: true })),
    pullData: jest.fn(async () => ({ test: 'pulled data' })),
    getStatus: jest.fn(() => ({
      initialized: true,
      polling: false,
      lastPull: Date.now(),
      syncId: 'test_sync_id_12345678',
    })),
    setDataCallback: jest.fn(),
    generateInviteCode: jest.fn((phrase) => phrase.toUpperCase()),
    joinFromInvite: jest.fn(async () => ({ test: 'joined data' })),
    reset: jest.fn(async () => {}),
  },
}));

jest.mock('../../services/sync/manyllaEncryptionService', () => ({
  __esModule: true,
  default: {
    isInitialized: jest.fn(() => true),
    generateRecoveryPhrase: jest.fn(() => 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'),
    initialize: jest.fn(async () => ({ syncId: 'test_sync_id_12345678', salt: 'test_salt' })),
    init: jest.fn(async () => ({ syncId: 'test_sync_id_12345678', salt: 'test_salt' })),
    encrypt: jest.fn((data) => 'encrypted_test_data'),
    encryptData: jest.fn((data) => 'encrypted_test_data'),
    decrypt: jest.fn((encrypted) => ({ test: 'decrypted data' })),
    decryptData: jest.fn((encrypted) => ({ test: 'decrypted data' })),
    clear: jest.fn(async () => {}),
    restore: jest.fn(async () => true),
    isEnabled: jest.fn(async () => true),
    getSyncId: jest.fn(async () => 'test_sync_id_12345678'),
    getDeviceKey: jest.fn(async () => new Uint8Array(32)),
    encryptWithKey: jest.fn(async () => 'encrypted_with_key'),
    deriveKeyFromPhrase: jest.fn(async (phrase, salt) => ({
      key: new Uint8Array(32),
      salt: salt || 'dGVzdF9zYWx0XzEyMzQ1Njc4',
      syncId: 'test_sync_id_12345678',
    })),
  },
}));

// Mock localStorage for web
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });

// Define mock services for test usage
const mockSyncService = ManyllaMinimalSyncService;
const mockEncryptionService = {
  encryptData: jest.fn(() => Promise.resolve('encrypted_test_data')),
  decryptData: jest.fn(() => Promise.resolve({ test: 'decrypted data' })),
  generateRecoveryPhrase: jest.fn(() => 'test-recovery-phrase'),
  isInitialized: jest.fn(() => true),
  initialize: jest.fn(() => Promise.resolve({ syncId: 'test_sync_id_12345678', salt: 'test_salt' })),
};

// Test consumer component
const TestConsumer = ({ onSyncUpdate }) => {
  const sync = useSync();

  React.useEffect(() => {
    if (onSyncUpdate) {
      onSyncUpdate(sync);
    }
  }, [sync, onSyncUpdate]);

  return (
    <div>
      <div data-testid="sync-enabled">{sync.syncEnabled ? 'enabled' : 'disabled'}</div>
      <div data-testid="sync-status">{sync.syncStatus}</div>
      <div data-testid="is-syncing">{sync.isSyncing ? 'syncing' : 'idle'}</div>
      <div data-testid="recovery-phrase">{sync.recoveryPhrase || 'none'}</div>
      <div data-testid="sync-id">{sync.syncId || 'none'}</div>
      <div data-testid="encryption-ready">{sync.encryptionReady ? 'ready' : 'not-ready'}</div>
      <div data-testid="last-sync">{sync.lastSync ? sync.lastSync.toISOString() : 'never'}</div>
      <button
        data-testid="enable-sync"
        onClick={() => sync.enableSync(TEST_RECOVERY_PHRASE)}
      >
        Enable Sync
      </button>
      <button data-testid="disable-sync" onClick={sync.disableSync}>
        Disable Sync
      </button>
      <button
        data-testid="push-data"
        onClick={() => sync.pushProfileData(createTestProfileData())}
      >
        Push Data
      </button>
      <button data-testid="pull-data" onClick={sync.pullProfileData}>
        Pull Data
      </button>
    </div>
  );
};

describe('SyncContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    mockLocalStorage.getItem.mockReturnValue(null);

    // Reset sync service mocks
    Object.keys(mockSyncService).forEach(key => {
      if (typeof mockSyncService[key] === 'function') {
        mockSyncService[key].mockClear();
      }
    });

    // Reset encryption service mocks
    Object.keys(mockEncryptionService).forEach(key => {
      if (typeof mockEncryptionService[key] === 'function') {
        mockEncryptionService[key].mockClear();
      }
    });
  });

  describe('Provider Initialization', () => {
    test('should provide default sync state', () => {
      let capturedSync;

      render(
        <SyncProvider>
          <TestConsumer onSyncUpdate={(sync) => (capturedSync = sync)} />
        </SyncProvider>
      );

      expect(capturedSync.syncEnabled).toBe(false);
      expect(capturedSync.syncStatus).toBe('not-setup');
      expect(capturedSync.lastSync).toBeNull();
      expect(capturedSync.lastSyncTime).toBeNull();
      expect(capturedSync.syncError).toBeNull();
      expect(capturedSync.recoveryPhrase).toBeNull();
      expect(capturedSync.isSyncing).toBe(false);
      expect(capturedSync.encryptionReady).toBe(false);
      expect(capturedSync.syncId).toBeNull();
    });

    test('should initialize with stored sync state on web', async () => {
      platform.isWeb = true;
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'manylla_sync_enabled') return 'true';
        if (key === 'manylla_recovery_phrase') return TEST_RECOVERY_PHRASE;
        if (key === 'manylla_sync_id') return TEST_SYNC_ID;
        return null;
      });

      let capturedSync;

      render(
        <SyncProvider>
          <TestConsumer onSyncUpdate={(sync) => (capturedSync = sync)} />
        </SyncProvider>
      );

      // Wait for effects to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      expect(capturedSync.syncEnabled).toBe(true);
      expect(capturedSync.recoveryPhrase).toBe(TEST_RECOVERY_PHRASE);
      expect(capturedSync.syncId).toBe(TEST_SYNC_ID);
    });

    test('should initialize with stored sync state on native', async () => {
      platform.isWeb = false;
      platform.isNative = true;
      mockAsyncStorage.getItem.mockImplementation(async (key) => {
        if (key === 'manylla_sync_enabled') return 'true';
        if (key === 'manylla_recovery_phrase') return TEST_RECOVERY_PHRASE;
        if (key === 'manylla_sync_id') return TEST_SYNC_ID;
        return null;
      });

      let capturedSync;

      render(
        <SyncProvider>
          <TestConsumer onSyncUpdate={(sync) => (capturedSync = sync)} />
        </SyncProvider>
      );

      // Wait for effects to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      expect(capturedSync.syncEnabled).toBe(true);
      expect(capturedSync.recoveryPhrase).toBe(TEST_RECOVERY_PHRASE);
      expect(capturedSync.syncId).toBe(TEST_SYNC_ID);
    });

    test('should handle storage errors during initialization', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      let capturedSync;

      render(
        <SyncProvider>
          <TestConsumer onSyncUpdate={(sync) => (capturedSync = sync)} />
        </SyncProvider>
      );

      await act(async () => {
        // Wait for effects to complete
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Should maintain default state on error
      expect(capturedSync.syncEnabled).toBe(false);
      expect(capturedSync.syncStatus).toBe('not-setup');
    });

    test('should set up data callback with sync service', () => {
      render(
        <SyncProvider>
          <TestConsumer />
        </SyncProvider>
      );

      expect(ManyllaMinimalSyncService.setDataCallback).toHaveBeenCalled();
    });

    test('should handle onProfileReceived callback', async () => {
      const testProfile = createTestProfileData();
      const mockOnProfileReceived = jest.fn();

      let capturedSync;

      render(
        <SyncProvider onProfileReceived={mockOnProfileReceived}>
          <TestConsumer onSyncUpdate={(sync) => (capturedSync = sync)} />
        </SyncProvider>
      );

      // Simulate profile received
      const dataCallback = ManyllaMinimalSyncService.setDataCallback.mock.calls[0][0];

      await act(async () => {
        dataCallback(testProfile);
      });

      expect(mockOnProfileReceived).toHaveBeenCalledWith(testProfile);
      expect(capturedSync.lastSyncTime).toBeTruthy();
      expect(capturedSync.lastSync).toBeTruthy();
    });
  });

  describe('Sync Enabling/Disabling', () => {
    test('should enable sync successfully', async () => {
      render(
        <SyncProvider>
          <TestConsumer />
        </SyncProvider>
      );

      expect(screen.getByTestId('sync-enabled')).toHaveTextContent('disabled');
      expect(screen.getByTestId('sync-status')).toHaveTextContent('not-setup');

      await act(async () => {
        screen.getByTestId('enable-sync').click();
      });

      expect(mockSyncService.enableSync).toHaveBeenCalledWith(TEST_RECOVERY_PHRASE, true);
      expect(screen.getByTestId('sync-enabled')).toHaveTextContent('enabled');
      expect(screen.getByTestId('sync-status')).toHaveTextContent('active');
    });

    test('should handle sync enable failure', async () => {
      mockSyncService.enableSync.mockRejectedValueOnce(new Error('Sync failed'));

      render(
        <SyncProvider>
          <TestConsumer />
        </SyncProvider>
      );

      await act(async () => {
        screen.getByTestId('enable-sync').click();
      });

      expect(screen.getByTestId('sync-enabled')).toHaveTextContent('disabled');
      expect(screen.getByTestId('sync-status')).toHaveTextContent('error');
    });

    test('should disable sync successfully', async () => {
      render(
        <SyncProvider>
          <TestConsumer />
        </SyncProvider>
      );

      // First enable sync
      await act(async () => {
        screen.getByTestId('enable-sync').click();
      });

      expect(screen.getByTestId('sync-enabled')).toHaveTextContent('enabled');

      // Then disable it
      await act(async () => {
        screen.getByTestId('disable-sync').click();
      });

      expect(mockSyncService.disableSync).toHaveBeenCalled();
      expect(screen.getByTestId('sync-enabled')).toHaveTextContent('disabled');
      expect(screen.getByTestId('sync-status')).toHaveTextContent('not-setup');
    });

    test('should handle sync disable failure', async () => {
      mockSyncService.disableSync.mockRejectedValueOnce(new Error('Disable failed'));

      render(
        <SyncProvider>
          <TestConsumer />
        </SyncProvider>
      );

      // First enable sync
      await act(async () => {
        screen.getByTestId('enable-sync').click();
      });

      // Then try to disable it (should fail)
      await act(async () => {
        screen.getByTestId('disable-sync').click();
      });

      // Should still be enabled due to error
      expect(screen.getByTestId('sync-enabled')).toHaveTextContent('enabled');
    });

    test('should persist sync enabled state on web', async () => {
      platform.isWeb = true;

      render(
        <SyncProvider>
          <TestConsumer />
        </SyncProvider>
      );

      await act(async () => {
        screen.getByTestId('enable-sync').click();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('manylla_sync_enabled', 'true');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('manylla_recovery_phrase', TEST_RECOVERY_PHRASE);
    });

    test('should persist sync enabled state on native', async () => {
      platform.isWeb = false;
      platform.isNative = true;

      render(
        <SyncProvider>
          <TestConsumer />
        </SyncProvider>
      );

      await act(async () => {
        screen.getByTestId('enable-sync').click();
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('manylla_sync_enabled', 'true');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('manylla_recovery_phrase', TEST_RECOVERY_PHRASE);
    });
  });

  describe('Data Push/Pull Operations', () => {
    // Helper function to setup enabled sync for push/pull tests
    const setupEnabledSync = async () => {
      render(
        <SyncProvider>
          <TestConsumer />
        </SyncProvider>
      );

      await act(async () => {
        screen.getByTestId('enable-sync').click();
      });
    };

    test('should push profile data successfully', async () => {
      await setupEnabledSync();

      expect(screen.getByTestId('is-syncing')).toHaveTextContent('idle');

      await act(async () => {
        screen.getByTestId('push-data').click();
      });

      expect(mockSyncService.pushData).toHaveBeenCalledWith(
        expect.objectContaining({ id: expect.any(String) })
      );
      expect(screen.getByTestId('is-syncing')).toHaveTextContent('idle'); // Should return to idle after
    });

    test('should handle push data failure', async () => {
      mockSyncService.pushData.mockRejectedValueOnce(new Error('Push failed'));

      await setupEnabledSync();

      await act(async () => {
        screen.getByTestId('push-data').click();
      });

      expect(screen.getByTestId('is-syncing')).toHaveTextContent('idle');
      // Should handle error gracefully
    });

    test('should pull profile data successfully', async () => {
      const testData = createTestProfileData();
      mockSyncService.pullData.mockResolvedValueOnce(testData);

      await setupEnabledSync();

      await act(async () => {
        screen.getByTestId('pull-data').click();
      });

      expect(mockSyncService.pullData).toHaveBeenCalled();
      expect(screen.getByTestId('is-syncing')).toHaveTextContent('idle');
    });

    test('should handle pull data failure', async () => {
      mockSyncService.pullData.mockRejectedValueOnce(new Error('Pull failed'));

      await setupEnabledSync();

      await act(async () => {
        screen.getByTestId('pull-data').click();
      });

      expect(screen.getByTestId('is-syncing')).toHaveTextContent('idle');
    });

    test('should not allow push/pull when sync disabled', async () => {
      render(
        <SyncProvider>
          <TestConsumer />
        </SyncProvider>
      );

      // Try to push without enabling sync first
      await act(async () => {
        screen.getByTestId('push-data').click();
      });

      expect(mockSyncService.pushData).not.toHaveBeenCalled();

      // Try to pull without enabling sync first
      await act(async () => {
        screen.getByTestId('pull-data').click();
      });

      expect(mockSyncService.pullData).not.toHaveBeenCalled();
    });
  });

  describe('Sync Status Management', () => {
    test('should update sync status during operations', async () => {
      let capturedSync;

      render(
        <SyncProvider>
          <TestConsumer onSyncUpdate={(sync) => (capturedSync = sync)} />
        </SyncProvider>
      );

      expect(capturedSync.syncStatus).toBe('not-setup');
      expect(capturedSync.isSyncing).toBe(false);

      await act(async () => {
        screen.getByTestId('enable-sync').click();
      });

      expect(capturedSync.syncStatus).toBe('active');
      expect(capturedSync.syncEnabled).toBe(true);
    });

    test('should handle sync errors', async () => {
      mockSyncService.enableSync.mockRejectedValueOnce(new Error('Network error'));

      let capturedSync;

      render(
        <SyncProvider>
          <TestConsumer onSyncUpdate={(sync) => (capturedSync = sync)} />
        </SyncProvider>
      );

      await act(async () => {
        screen.getByTestId('enable-sync').click();
      });

      expect(capturedSync.syncStatus).toBe('error');
      expect(capturedSync.syncError).toBeTruthy();
    });

    test('should clear sync error on successful operation', async () => {
      mockSyncService.enableSync
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(true);

      let capturedSync;

      render(
        <SyncProvider>
          <TestConsumer onSyncUpdate={(sync) => (capturedSync = sync)} />
        </SyncProvider>
      );

      // First attempt should fail
      await act(async () => {
        screen.getByTestId('enable-sync').click();
      });

      expect(capturedSync.syncError).toBeTruthy();

      // Second attempt should succeed and clear error
      await act(async () => {
        screen.getByTestId('enable-sync').click();
      });

      expect(capturedSync.syncError).toBeNull();
      expect(capturedSync.syncStatus).toBe('active');
    });
  });


  describe('Profile Received Handling', () => {
    test('should update last sync time when profile received', async () => {
      const testProfile = createTestProfileData();
      let capturedSync;

      render(
        <SyncProvider>
          <TestConsumer onSyncUpdate={(sync) => (capturedSync = sync)} />
        </SyncProvider>
      );

      expect(capturedSync.lastSyncTime).toBeNull();

      // Simulate profile received via data callback
      const dataCallback = ManyllaMinimalSyncService.setDataCallback.mock.calls[0][0];

      await act(async () => {
        dataCallback(testProfile);
      });

      expect(capturedSync.lastSyncTime).toBeTruthy();
      expect(capturedSync.lastSync).toBeTruthy();
    });

    test('should call onProfileReceived prop when provided', async () => {
      const testProfile = createTestProfileData();
      const mockOnProfileReceived = jest.fn();

      render(
        <SyncProvider onProfileReceived={mockOnProfileReceived}>
          <TestConsumer />
        </SyncProvider>
      );

      const dataCallback = ManyllaMinimalSyncService.setDataCallback.mock.calls[0][0];

      await act(async () => {
        dataCallback(testProfile);
      });

      expect(mockOnProfileReceived).toHaveBeenCalledWith(testProfile);
    });
  });

  describe('Error Handling', () => {
    test('should throw error when useSync is used outside provider', () => {
      const TestComponent = () => {
        useSync(); // This should throw
        return <div>Test</div>;
      };

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useSync must be used within a SyncProvider');

      console.error = originalError;
    });

    test('should handle storage errors gracefully', async () => {
      platform.isWeb = true;
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      render(
        <SyncProvider>
          <TestConsumer />
        </SyncProvider>
      );

      // Should not throw error despite storage failure
      await act(async () => {
        screen.getByTestId('enable-sync').click();
      });

      expect(screen.getByTestId('sync-enabled')).toHaveTextContent('enabled');
    });
  });

  describe('Context Value Structure', () => {
    test('should provide all required context properties', () => {
      let capturedSync;

      render(
        <SyncProvider>
          <TestConsumer onSyncUpdate={(sync) => (capturedSync = sync)} />
        </SyncProvider>
      );

      expect(capturedSync).toHaveProperty('syncEnabled');
      expect(capturedSync).toHaveProperty('syncStatus');
      expect(capturedSync).toHaveProperty('lastSync');
      expect(capturedSync).toHaveProperty('lastSyncTime');
      expect(capturedSync).toHaveProperty('syncError');
      expect(capturedSync).toHaveProperty('recoveryPhrase');
      expect(capturedSync).toHaveProperty('isSyncing');
      expect(capturedSync).toHaveProperty('encryptionReady');
      expect(capturedSync).toHaveProperty('syncId');
      expect(capturedSync).toHaveProperty('enableSync');
      expect(capturedSync).toHaveProperty('disableSync');
      expect(capturedSync).toHaveProperty('pushProfileData');
      expect(capturedSync).toHaveProperty('pullProfileData');

      expect(typeof capturedSync.enableSync).toBe('function');
      expect(typeof capturedSync.disableSync).toBe('function');
      expect(typeof capturedSync.pushProfileData).toBe('function');
      expect(typeof capturedSync.pullProfileData).toBe('function');
    });
  });
});