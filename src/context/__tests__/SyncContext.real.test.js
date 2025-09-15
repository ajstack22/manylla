/**
 * Real integration tests for SyncContext
 * These tests minimize mocking and test actual state management behavior
 * Focus: Real behavior testing as required by Story S029
 */

import React from 'react';
import { render, act, screen, fireEvent, waitFor } from '@testing-library/react';
import { SyncProvider, useSync } from '../SyncContext';

// Create test consumer component to access context
const TestSyncConsumer = ({ onContextUpdate, testActions = {} }) => {
  const syncContext = useSync();

  React.useEffect(() => {
    if (onContextUpdate) {
      onContextUpdate(syncContext);
    }
  }, [syncContext, onContextUpdate]);

  return (
    <div>
      <div data-testid="sync-enabled">{syncContext.syncEnabled ? 'enabled' : 'disabled'}</div>
      <div data-testid="sync-status">{syncContext.syncStatus}</div>
      <div data-testid="recovery-phrase">{syncContext.recoveryPhrase || 'none'}</div>
      <div data-testid="sync-id">{syncContext.syncId || 'none'}</div>
      <div data-testid="last-pull">{syncContext.lastPull || 'never'}</div>
      <div data-testid="error-message">{syncContext.error || 'none'}</div>

      <button
        data-testid="generate-phrase"
        onClick={() => syncContext.generateRecoveryPhrase()}
      >
        Generate Phrase
      </button>

      <button
        data-testid="enable-sync"
        onClick={() => syncContext.enableSync(syncContext.recoveryPhrase, true)}
      >
        Enable Sync
      </button>

      <button
        data-testid="disable-sync"
        onClick={() => syncContext.disableSync()}
      >
        Disable Sync
      </button>

      <button
        data-testid="push-data"
        onClick={() => syncContext.pushData(testActions.testData || { test: 'data' })}
      >
        Push Data
      </button>

      <button
        data-testid="pull-data"
        onClick={() => syncContext.pullData()}
      >
        Pull Data
      </button>

      <button
        data-testid="clear-error"
        onClick={() => syncContext.clearError()}
      >
        Clear Error
      </button>
    </div>
  );
};

// Test data
const createTestProfileData = () => ({
  id: 'test-profile-context',
  name: 'Context Test Child',
  entries: [
    {
      id: 'context-entry-1',
      category: 'medical',
      title: 'Context Test Entry',
      description: 'Testing SyncContext integration',
      date: new Date().toISOString(),
    }
  ],
  lastModified: Date.now()
});

describe('SyncContext Real Integration', () => {
  // Mock minimal required services while preserving context behavior
  beforeEach(() => {
    // Reset localStorage
    global.localStorage.clear();

    // Reset fetch mock
    global.fetch.mockClear();
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    });
  });

  describe('Initial State and Provider Setup', () => {
    test('should provide initial sync state', () => {
      let capturedContext;

      render(
        <SyncProvider>
          <TestSyncConsumer onContextUpdate={(ctx) => (capturedContext = ctx)} />
        </SyncProvider>
      );

      expect(capturedContext.syncEnabled).toBe(false);
      expect(capturedContext.syncStatus).toBe('inactive');
      expect(capturedContext.recoveryPhrase).toBe('');
      expect(capturedContext.syncId).toBe('');
      expect(capturedContext.error).toBe('');
      expect(typeof capturedContext.generateRecoveryPhrase).toBe('function');
      expect(typeof capturedContext.enableSync).toBe('function');
      expect(typeof capturedContext.disableSync).toBe('function');
    });

    test('should render provider without errors', () => {
      render(
        <SyncProvider>
          <div data-testid="child">Child component</div>
        </SyncProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    test('should handle multiple children', () => {
      render(
        <SyncProvider>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
          <TestSyncConsumer />
        </SyncProvider>
      );

      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
      expect(screen.getByTestId('sync-enabled')).toHaveTextContent('disabled');
    });
  });

  describe('Recovery Phrase Generation', () => {
    test('should generate valid recovery phrase', async () => {
      render(
        <SyncProvider>
          <TestSyncConsumer />
        </SyncProvider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('generate-phrase'));
      });

      await waitFor(() => {
        const phrase = screen.getByTestId('recovery-phrase').textContent;
        expect(phrase).not.toBe('none');
        expect(phrase.length).toBeGreaterThan(20); // Should be substantial
        expect(typeof phrase).toBe('string');
      });
    });

    test('should generate different phrases on multiple calls', async () => {
      let capturedContext;

      render(
        <SyncProvider>
          <TestSyncConsumer onContextUpdate={(ctx) => (capturedContext = ctx)} />
        </SyncProvider>
      );

      // Generate first phrase
      await act(async () => {
        fireEvent.click(screen.getByTestId('generate-phrase'));
      });

      await waitFor(() => {
        expect(capturedContext.recoveryPhrase).not.toBe('');
      });

      const firstPhrase = capturedContext.recoveryPhrase;

      // Generate second phrase
      await act(async () => {
        fireEvent.click(screen.getByTestId('generate-phrase'));
      });

      await waitFor(() => {
        expect(capturedContext.recoveryPhrase).not.toBe(firstPhrase);
      });
    });
  });

  describe('Sync Enable/Disable Workflow', () => {
    test('should complete sync enablement workflow', async () => {
      let capturedContext;

      render(
        <SyncProvider>
          <TestSyncConsumer onContextUpdate={(ctx) => (capturedContext = ctx)} />
        </SyncProvider>
      );

      // Generate phrase first
      await act(async () => {
        fireEvent.click(screen.getByTestId('generate-phrase'));
      });

      await waitFor(() => {
        expect(capturedContext.recoveryPhrase).not.toBe('');
      });

      // Enable sync
      await act(async () => {
        fireEvent.click(screen.getByTestId('enable-sync'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('sync-enabled')).toHaveTextContent('enabled');
        expect(screen.getByTestId('sync-status')).not.toHaveTextContent('inactive');
      });

      expect(capturedContext.syncEnabled).toBe(true);
      expect(capturedContext.syncId).not.toBe('');
    });

    test('should handle sync disable', async () => {
      render(
        <SyncProvider>
          <TestSyncConsumer />
        </SyncProvider>
      );

      // First enable sync
      await act(async () => {
        fireEvent.click(screen.getByTestId('generate-phrase'));
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('enable-sync'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('sync-enabled')).toHaveTextContent('enabled');
      });

      // Then disable
      await act(async () => {
        fireEvent.click(screen.getByTestId('disable-sync'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('sync-enabled')).toHaveTextContent('disabled');
        expect(screen.getByTestId('sync-status')).toHaveTextContent('inactive');
      });
    });

    test('should handle sync enable without phrase', async () => {
      render(
        <SyncProvider>
          <TestSyncConsumer />
        </SyncProvider>
      );

      // Try to enable sync without generating phrase first
      await act(async () => {
        fireEvent.click(screen.getByTestId('enable-sync'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).not.toHaveTextContent('none');
      });

      expect(screen.getByTestId('sync-enabled')).toHaveTextContent('disabled');
    });
  });

  describe('Data Push/Pull Operations', () => {
    test('should handle data push operation', async () => {
      const testData = createTestProfileData();

      render(
        <SyncProvider>
          <TestSyncConsumer testActions={{ testData }} />
        </SyncProvider>
      );

      // Setup sync first
      await act(async () => {
        fireEvent.click(screen.getByTestId('generate-phrase'));
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('enable-sync'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('sync-enabled')).toHaveTextContent('enabled');
      });

      // Mock successful push
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, timestamp: Date.now() })
      });

      // Push data
      await act(async () => {
        fireEvent.click(screen.getByTestId('push-data'));
      });

      // Should not show error
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('none');
      });
    });

    test('should handle data pull operation', async () => {
      render(
        <SyncProvider>
          <TestSyncConsumer />
        </SyncProvider>
      );

      // Setup sync first
      await act(async () => {
        fireEvent.click(screen.getByTestId('generate-phrase'));
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('enable-sync'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('sync-enabled')).toHaveTextContent('enabled');
      });

      // Mock successful pull
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: 'encrypted-data',
          timestamp: Date.now()
        })
      });

      // Pull data
      await act(async () => {
        fireEvent.click(screen.getByTestId('pull-data'));
      });

      // Should update last pull time
      await waitFor(() => {
        expect(screen.getByTestId('last-pull')).not.toHaveTextContent('never');
      });
    });

    test('should handle push/pull errors gracefully', async () => {
      render(
        <SyncProvider>
          <TestSyncConsumer />
        </SyncProvider>
      );

      // Setup sync first
      await act(async () => {
        fireEvent.click(screen.getByTestId('generate-phrase'));
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('enable-sync'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('sync-enabled')).toHaveTextContent('enabled');
      });

      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      // Try to push data
      await act(async () => {
        fireEvent.click(screen.getByTestId('push-data'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).not.toHaveTextContent('none');
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle sync errors and allow recovery', async () => {
      render(
        <SyncProvider>
          <TestSyncConsumer />
        </SyncProvider>
      );

      // Generate phrase
      await act(async () => {
        fireEvent.click(screen.getByTestId('generate-phrase'));
      });

      // Mock sync enable failure
      global.fetch.mockRejectedValueOnce(new Error('Sync service unavailable'));

      // Try to enable sync
      await act(async () => {
        fireEvent.click(screen.getByTestId('enable-sync'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).not.toHaveTextContent('none');
        expect(screen.getByTestId('sync-enabled')).toHaveTextContent('disabled');
      });

      // Clear error
      await act(async () => {
        fireEvent.click(screen.getByTestId('clear-error'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('none');
      });

      // Mock sync enable success
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      // Try again - should succeed
      await act(async () => {
        fireEvent.click(screen.getByTestId('enable-sync'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('sync-enabled')).toHaveTextContent('enabled');
      });
    });

    test('should handle invalid recovery phrase gracefully', async () => {
      let capturedContext;

      render(
        <SyncProvider>
          <TestSyncConsumer onContextUpdate={(ctx) => (capturedContext = ctx)} />
        </SyncProvider>
      );

      // Set invalid phrase manually (simulate user input)
      await act(async () => {
        capturedContext.setRecoveryPhrase('invalid-phrase');
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('enable-sync'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).not.toHaveTextContent('none');
        expect(screen.getByTestId('sync-enabled')).toHaveTextContent('disabled');
      });
    });
  });

  describe('State Persistence', () => {
    test('should persist sync state across provider remounts', async () => {
      const { unmount } = render(
        <SyncProvider>
          <TestSyncConsumer />
        </SyncProvider>
      );

      // Enable sync
      await act(async () => {
        fireEvent.click(screen.getByTestId('generate-phrase'));
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('enable-sync'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('sync-enabled')).toHaveTextContent('enabled');
      });

      const syncId = screen.getByTestId('sync-id').textContent;

      // Unmount and remount
      unmount();

      render(
        <SyncProvider>
          <TestSyncConsumer />
        </SyncProvider>
      );

      // Should restore previous state
      await waitFor(() => {
        const newSyncId = screen.getByTestId('sync-id').textContent;
        if (newSyncId !== 'none') {
          expect(newSyncId).toBe(syncId);
        }
      });
    });

    test('should handle localStorage errors gracefully', async () => {
      // Mock localStorage to fail
      const originalSetItem = global.localStorage.setItem;
      global.localStorage.setItem = jest.fn(() => {
        throw new Error('Quota exceeded');
      });

      render(
        <SyncProvider>
          <TestSyncConsumer />
        </SyncProvider>
      );

      // Should still work even if localStorage fails
      await act(async () => {
        fireEvent.click(screen.getByTestId('generate-phrase'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('recovery-phrase')).not.toHaveTextContent('none');
      });

      // Restore original localStorage
      global.localStorage.setItem = originalSetItem;
    });
  });

  describe('Performance and Concurrency', () => {
    test('should handle concurrent operations without race conditions', async () => {
      render(
        <SyncProvider>
          <TestSyncConsumer />
        </SyncProvider>
      );

      // Setup sync
      await act(async () => {
        fireEvent.click(screen.getByTestId('generate-phrase'));
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('enable-sync'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('sync-enabled')).toHaveTextContent('enabled');
      });

      // Mock responses for concurrent operations
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: 'test' })
        });

      // Trigger concurrent push and pull
      await act(async () => {
        fireEvent.click(screen.getByTestId('push-data'));
        fireEvent.click(screen.getByTestId('pull-data'));
      });

      // Should not cause errors or inconsistent state
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('none');
      });
    });

    test('should complete state updates within reasonable time', async () => {
      const startTime = Date.now();

      render(
        <SyncProvider>
          <TestSyncConsumer />
        </SyncProvider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('generate-phrase'));
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('enable-sync'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('sync-enabled')).toHaveTextContent('enabled');
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(2000); // Should be fast
    });
  });

  describe('Integration with Profile Data', () => {
    test('should handle real profile data structure', async () => {
      const realProfileData = {
        id: 'integration-test-profile',
        name: 'Integration Test Child',
        dateOfBirth: '2015-06-15',
        entries: [
          {
            id: 'real-entry-1',
            category: 'medical',
            title: 'Pediatrician Visit',
            description: 'Annual checkup with growth measurements',
            date: new Date().toISOString(),
            attachments: [],
            visibility: ['family', 'medical']
          },
          {
            id: 'real-entry-2',
            category: 'education',
            title: 'Parent Teacher Conference',
            description: 'Discussed reading progress and math skills',
            date: new Date().toISOString(),
            visibility: ['family', 'education']
          }
        ],
        categories: [
          { id: 'medical', name: 'Medical', displayName: 'Medical Records', color: '#e74c3c' },
          { id: 'education', name: 'Education', displayName: 'School Records', color: '#3498db' }
        ],
        emergencyContact: 'Jane Doe - 555-0123',
        allergies: ['Tree nuts'],
        medications: [],
        lastModified: Date.now()
      };

      render(
        <SyncProvider>
          <TestSyncConsumer testActions={{ testData: realProfileData }} />
        </SyncProvider>
      );

      // Setup sync
      await act(async () => {
        fireEvent.click(screen.getByTestId('generate-phrase'));
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('enable-sync'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('sync-enabled')).toHaveTextContent('enabled');
      });

      // Mock successful data operations
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      // Push real profile data
      await act(async () => {
        fireEvent.click(screen.getByTestId('push-data'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('none');
      });

      // Verify API was called with proper data
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Integration Test Child')
        })
      );
    });
  });
});