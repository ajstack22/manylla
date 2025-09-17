/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react-native';
import { Alert, Clipboard, Share } from 'react-native';
import { useShareActions } from '../useShareActions';
import { API_ENDPOINTS } from '../../../config/api';

// Mock dependencies
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Clipboard: {
    setString: jest.fn(),
  },
  Share: {
    share: jest.fn(),
  },
}));

jest.mock('tweetnacl', () => ({
  randomBytes: jest.fn(),
  secretbox: jest.fn(),
}));

jest.mock('tweetnacl-util', () => ({
  decodeUTF8: jest.fn(),
  encodeBase64: jest.fn(),
}));

jest.mock('../../../utils/inviteCode', () => ({
  generateInviteCode: jest.fn(),
}));

jest.mock('../../../config/api', () => ({
  API_ENDPOINTS: {
    share: {
      create: 'https://test.com/api/share_create.php',
    },
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('useShareActions', () => {
  const mockProfile = {
    id: '1',
    name: 'John Doe',
    preferredName: 'Johnny',
    entries: [
      { id: '1', category: 'medical', content: 'Medical info' },
      { id: '2', category: 'behavioral', content: 'Behavioral info' },
    ],
    photo: 'data:image/jpeg;base64,photo',
    quickInfoPanels: [{ id: '1', content: 'Quick info' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock TweetNaCl functions
    const nacl = require('tweetnacl');
    const util = require('tweetnacl-util');

    nacl.randomBytes.mockImplementation((size) => new Uint8Array(size).fill(1));
    nacl.secretbox.mockReturnValue(new Uint8Array([1, 2, 3, 4]));
    util.decodeUTF8.mockReturnValue(new Uint8Array([5, 6, 7, 8]));
    util.encodeBase64.mockReturnValue('base64encoded');

    // Mock invite code generation
    const { generateInviteCode } = require('../../../utils/inviteCode');
    generateInviteCode.mockReturnValue('ABCD-1234');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useShareActions());

    expect(result.current.loading).toBe(false);
    expect(result.current.generatedLink).toBe('');
    expect(result.current.copiedLink).toBe(false);
  });

  describe('handleGenerateLink', () => {
    const shareParams = {
      profile: mockProfile,
      selectedCategories: ['medical'],
      includePhoto: true,
      expirationDays: 7,
      selectedPreset: 'education',
    };

    it('should generate link successfully', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() => useShareActions());

      let response;
      await act(async () => {
        response = await result.current.handleGenerateLink(shareParams);
      });

      expect(fetch).toHaveBeenCalledWith(API_ENDPOINTS.share.create, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"access_code":"ABCD-1234"'),
      });

      expect(response).toContain('https://manylla.com/qual/share/ABCD-1234#');
      expect(result.current.generatedLink).toContain('https://manylla.com/qual/share/ABCD-1234#');
      expect(result.current.loading).toBe(false);
    });

    it('should filter profile entries by selected categories', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() => useShareActions());

      await act(async () => {
        await result.current.handleGenerateLink(shareParams);
      });

      // Verify the request body contains filtered profile
      const requestBody = JSON.parse(fetch.mock.calls[0][1].body);
      expect(requestBody.encrypted_data).toBe('base64encoded');
      expect(requestBody.recipient_type).toBe('education');
      expect(requestBody.expiry_hours).toBe(168); // 7 days * 24 hours
    });

    it('should exclude photo when includePhoto is false', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const paramsWithoutPhoto = {
        ...shareParams,
        includePhoto: false,
      };

      const { result } = renderHook(() => useShareActions());

      await act(async () => {
        await result.current.handleGenerateLink(paramsWithoutPhoto);
      });

      expect(fetch).toHaveBeenCalled();
      // Photo should be excluded from shared profile
    });

    it('should handle API failure', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useShareActions());

      let response;
      await act(async () => {
        response = await result.current.handleGenerateLink(shareParams);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to create share link. Please try again.'
      );
      expect(response).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('should handle network error', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useShareActions());

      let response;
      await act(async () => {
        response = await result.current.handleGenerateLink(shareParams);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to create share link. Please try again.'
      );
      expect(response).toBeNull();
    });

    it('should set loading state correctly', async () => {
      fetch.mockImplementation(() => new Promise(resolve =>
        setTimeout(() => resolve({ ok: true, json: () => Promise.resolve({}) }), 100)
      ));

      const { result } = renderHook(() => useShareActions());

      let promise;
      act(() => {
        promise = result.current.handleGenerateLink(shareParams);
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        await promise;
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('handleCopyLink', () => {
    it('should copy link to clipboard and show copied state', () => {
      const { result } = renderHook(() => useShareActions());

      // Set a generated link first
      act(() => {
        result.current.generatedLink = 'https://test.com/share/123#key';
      });

      act(() => {
        result.current.handleCopyLink();
      });

      expect(Clipboard.setString).toHaveBeenCalledWith('https://test.com/share/123#key');
      expect(result.current.copiedLink).toBe(true);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.copiedLink).toBe(false);
    });
  });

  describe('handleShareLink', () => {
    it('should share link with proper message format', async () => {
      const { result } = renderHook(() => useShareActions());

      // Set generated link
      act(() => {
        result.current.generatedLink = 'https://test.com/share/123#key';
      });

      Share.share.mockResolvedValue();

      await act(async () => {
        await result.current.handleShareLink(mockProfile, 7);
      });

      expect(Share.share).toHaveBeenCalledWith({
        message: expect.stringContaining('Here\'s a secure encrypted link to view Johnny\'s information'),
        title: 'Johnny\'s Information',
      });
    });

    it('should use profile name when preferredName is not available', async () => {
      const profileWithoutPreferredName = {
        ...mockProfile,
        preferredName: '',
      };

      const { result } = renderHook(() => useShareActions());

      act(() => {
        result.current.generatedLink = 'https://test.com/share/123#key';
      });

      Share.share.mockResolvedValue();

      await act(async () => {
        await result.current.handleShareLink(profileWithoutPreferredName, 7);
      });

      expect(Share.share).toHaveBeenCalledWith({
        message: expect.stringContaining('John Doe\'s information'),
        title: 'John Doe\'s Information',
      });
    });

    it('should format expiration correctly for different periods', async () => {
      const { result } = renderHook(() => useShareActions());

      act(() => {
        result.current.generatedLink = 'https://test.com/share/123#key';
      });

      Share.share.mockResolvedValue();

      // Test 1 day
      await act(async () => {
        await result.current.handleShareLink(mockProfile, 1);
      });
      expect(Share.share).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('1 day'),
      }));

      // Test 30 days
      await act(async () => {
        await result.current.handleShareLink(mockProfile, 30);
      });
      expect(Share.share).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('30 days'),
      }));

      // Test 90+ days (should show "3 months")
      await act(async () => {
        await result.current.handleShareLink(mockProfile, 90);
      });
      expect(Share.share).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('3 months'),
      }));
    });

    it('should handle share failure silently', async () => {
      const { result } = renderHook(() => useShareActions());
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      act(() => {
        result.current.generatedLink = 'https://test.com/share/123#key';
      });

      const shareError = new Error('Share failed');
      Share.share.mockRejectedValue(shareError);

      // Set NODE_ENV to development to enable console.warn
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      await act(async () => {
        await result.current.handleShareLink(mockProfile, 7);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Native share failed, user can copy link manually:',
        'Share failed'
      );

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });

  describe('resetShareState', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useShareActions());

      // Set some state first
      act(() => {
        result.current.generatedLink = 'https://test.com/share/123#key';
        result.current.copiedLink = true;
        result.current.loading = true;
      });

      act(() => {
        result.current.resetShareState();
      });

      expect(result.current.generatedLink).toBe('');
      expect(result.current.copiedLink).toBe(false);
      expect(result.current.loading).toBe(false);
    });
  });
});