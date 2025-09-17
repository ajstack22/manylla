/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react-native';
import { Clipboard } from 'react-native';
import { useSyncActions } from '../useSyncActions';
import { useSync } from '../../../../context/SyncContext';
import {
  generateInviteCode,
  validateInviteCode,
  generateInviteUrl,
  storeInviteCode,
  getInviteCode,
} from '../../../../utils/inviteCode';

// Mock dependencies
jest.mock('react-native', () => ({
  Clipboard: {
    setString: jest.fn(),
  },
}));

jest.mock('../../../../context/SyncContext');
jest.mock('../../../../utils/inviteCode');

// P2 TECH DEBT: Remove skip when working on useSyncActions
// Issue: Async action mocking
describe.skip('useSyncActions', () => {
  const mockSyncContext = {
    syncEnabled: false,
    syncStatus: 'idle',
    enableSync: jest.fn(),
    disableSync: jest.fn(),
    syncNow: jest.fn(),
    recoveryPhrase: 'abcd1234567890abcdef1234567890ab',
    syncId: 'sync123',
  };

  beforeEach(() => {
    useSync.mockReturnValue(mockSyncContext);
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useSyncActions());

    expect(result.current.syncEnabled).toBe(false);
    expect(result.current.syncStatus).toBe('idle');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
    expect(result.current.copied).toBe(false);
    expect(result.current.existingPhrase).toBe('abcd1234567890abcdef1234567890ab');
    expect(result.current.syncId).toBe('sync123');
  });

  describe('handleEnableSync', () => {
    it('should enable sync successfully', async () => {
      const mockRecoveryPhrase = 'new_recovery_phrase_12345678901234ab';
      mockSyncContext.enableSync.mockResolvedValue({
        recoveryPhrase: mockRecoveryPhrase,
      });

      const { result } = renderHook(() => useSyncActions());

      let response;
      await act(async () => {
        response = await result.current.handleEnableSync();
      });

      expect(mockSyncContext.enableSync).toHaveBeenCalledWith(true);
      expect(response).toEqual({
        success: true,
        recoveryPhrase: mockRecoveryPhrase,
      });
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('');
    });

    it('should handle enable sync failure', async () => {
      const errorMessage = 'Network error';
      mockSyncContext.enableSync.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useSyncActions());

      let response;
      await act(async () => {
        response = await result.current.handleEnableSync();
      });

      expect(response).toEqual({
        success: false,
        error: errorMessage,
      });
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
    });

    it('should handle enable sync failure without message', async () => {
      mockSyncContext.enableSync.mockRejectedValue(new Error());

      const { result } = renderHook(() => useSyncActions());

      let response;
      await act(async () => {
        response = await result.current.handleEnableSync();
      });

      expect(response).toEqual({
        success: false,
        error: 'Failed to enable backup',
      });
    });
  });

  describe('handleJoinSync', () => {
    it('should join sync with invite code successfully', async () => {
      const inviteCode = 'ABCD-1234';
      const recoveryPhrase = 'stored_recovery_phrase_123456789012ab';

      validateInviteCode.mockReturnValue(true);
      getInviteCode.mockReturnValue({ recoveryPhrase });
      mockSyncContext.enableSync.mockResolvedValue({});

      const { result } = renderHook(() => useSyncActions());

      let response;
      await act(async () => {
        response = await result.current.handleJoinSync(inviteCode);
      });

      expect(validateInviteCode).toHaveBeenCalledWith(inviteCode);
      expect(getInviteCode).toHaveBeenCalledWith(inviteCode);
      expect(mockSyncContext.enableSync).toHaveBeenCalledWith(false, recoveryPhrase);
      expect(response).toEqual({ success: true });
    });

    it('should join sync with direct recovery phrase successfully', async () => {
      const recoveryPhrase = 'abcd1234567890abcdef1234567890ab';

      validateInviteCode.mockReturnValue(false);
      mockSyncContext.enableSync.mockResolvedValue({});

      const { result } = renderHook(() => useSyncActions());

      let response;
      await act(async () => {
        response = await result.current.handleJoinSync(recoveryPhrase);
      });

      expect(mockSyncContext.enableSync).toHaveBeenCalledWith(false, recoveryPhrase);
      expect(response).toEqual({ success: true });
    });

    it('should handle invalid invite code', async () => {
      const inviteCode = 'INVALID-CODE';

      validateInviteCode.mockReturnValue(true);
      getInviteCode.mockReturnValue(null);

      const { result } = renderHook(() => useSyncActions());

      let response;
      await act(async () => {
        response = await result.current.handleJoinSync(inviteCode);
      });

      expect(response).toEqual({
        success: false,
        error: 'Invalid or expired invite code',
      });
    });

    it('should handle invalid recovery phrase format', async () => {
      const invalidPhrase = 'invalid_phrase';

      validateInviteCode.mockReturnValue(false);

      const { result } = renderHook(() => useSyncActions());

      let response;
      await act(async () => {
        response = await result.current.handleJoinSync(invalidPhrase);
      });

      expect(response).toEqual({
        success: false,
        error: 'Invalid format. Enter an 8-character invite code (XXXX-XXXX) or 32-character backup code.',
      });
    });

    it('should handle join sync failure', async () => {
      const recoveryPhrase = 'abcd1234567890abcdef1234567890ab';
      const errorMessage = 'Sync service unavailable';

      validateInviteCode.mockReturnValue(false);
      mockSyncContext.enableSync.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useSyncActions());

      let response;
      await act(async () => {
        response = await result.current.handleJoinSync(recoveryPhrase);
      });

      expect(response).toEqual({
        success: false,
        error: errorMessage,
      });
    });
  });

  describe('handleGenerateInvite', () => {
    it('should generate invite successfully', () => {
      const mockInviteCode = 'WXYZ-9876';
      const mockInviteUrl = 'https://example.com/invite/WXYZ-9876';

      generateInviteCode.mockReturnValue(mockInviteCode);
      generateInviteUrl.mockReturnValue(mockInviteUrl);
      storeInviteCode.mockImplementation(() => {});

      const { result } = renderHook(() => useSyncActions());

      let response;
      act(() => {
        response = result.current.handleGenerateInvite();
      });

      expect(generateInviteCode).toHaveBeenCalled();
      expect(generateInviteUrl).toHaveBeenCalledWith(mockInviteCode, mockSyncContext.recoveryPhrase);
      expect(storeInviteCode).toHaveBeenCalledWith(
        mockInviteCode,
        mockSyncContext.syncId,
        mockSyncContext.recoveryPhrase
      );
      expect(response).toEqual({
        success: true,
        inviteCode: mockInviteCode,
        inviteUrl: mockInviteUrl,
      });
    });

    it('should fail when sync is not enabled', () => {
      useSync.mockReturnValue({
        ...mockSyncContext,
        recoveryPhrase: null,
        syncId: null,
      });

      const { result } = renderHook(() => useSyncActions());

      let response;
      act(() => {
        response = result.current.handleGenerateInvite();
      });

      expect(response).toEqual({
        success: false,
        error: 'Sync must be enabled to generate invite codes',
      });
      expect(result.current.error).toBe('Sync must be enabled to generate invite codes');
    });

    it('should handle generation error', () => {
      const errorMessage = 'Code generation failed';
      generateInviteCode.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      const { result } = renderHook(() => useSyncActions());

      let response;
      act(() => {
        response = result.current.handleGenerateInvite();
      });

      expect(response).toEqual({
        success: false,
        error: errorMessage,
      });
    });
  });

  describe('handleCopyPhrase', () => {
    it('should copy existing phrase to clipboard', () => {
      const { result } = renderHook(() => useSyncActions());

      act(() => {
        result.current.handleCopyPhrase();
      });

      expect(Clipboard.setString).toHaveBeenCalledWith(mockSyncContext.recoveryPhrase);
      expect(result.current.copied).toBe(true);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.copied).toBe(false);
    });

    it('should copy provided phrase to clipboard', () => {
      const customPhrase = 'custom_phrase_1234567890abcdef12ab';
      const { result } = renderHook(() => useSyncActions());

      act(() => {
        result.current.handleCopyPhrase(customPhrase);
      });

      expect(Clipboard.setString).toHaveBeenCalledWith(customPhrase);
      expect(result.current.copied).toBe(true);
    });
  });

  describe('handleCopyInvite', () => {
    it('should copy invite text to clipboard', () => {
      const inviteText = 'Your invite code: ABCD-1234';
      const { result } = renderHook(() => useSyncActions());

      act(() => {
        result.current.handleCopyInvite(inviteText);
      });

      expect(Clipboard.setString).toHaveBeenCalledWith(inviteText);
      expect(result.current.copied).toBe(true);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.copied).toBe(false);
    });
  });

  describe('handleSyncNow', () => {
    it('should sync successfully', async () => {
      mockSyncContext.syncNow.mockResolvedValue();

      const { result } = renderHook(() => useSyncActions());

      let response;
      await act(async () => {
        response = await result.current.handleSyncNow();
      });

      expect(mockSyncContext.syncNow).toHaveBeenCalled();
      expect(response).toEqual({ success: true });
      expect(result.current.loading).toBe(false);
    });

    it('should handle sync failure', async () => {
      const errorMessage = 'Sync failed';
      mockSyncContext.syncNow.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useSyncActions());

      let response;
      await act(async () => {
        response = await result.current.handleSyncNow();
      });

      expect(response).toEqual({
        success: false,
        error: errorMessage,
      });
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useSyncActions());

      // First set an error
      act(() => {
        result.current.handleGenerateInvite(); // This will fail and set error
      });

      expect(result.current.error).not.toBe('');

      // Then clear it
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe('');
    });
  });

  describe('disableSync', () => {
    it('should expose disableSync from context', () => {
      const { result } = renderHook(() => useSyncActions());

      expect(result.current.disableSync).toBe(mockSyncContext.disableSync);
    });
  });
});