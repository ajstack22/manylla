import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { SharedView } from '../SharedView';

// Mock react-native components
jest.mock('react-native', () => ({
  View: ({ children, testID, style, ...props }) => (
    <div data-testid={testID} style={style} {...props}>{children}</div>
  ),
  Text: ({ children, testID, style, ...props }) => (
    <span data-testid={testID} style={style} {...props}>{children}</span>
  ),
  ScrollView: ({ children, testID, style, ...props }) => (
    <div data-testid={testID || 'scroll-view'} style={style} {...props}>{children}</div>
  ),
  StyleSheet: {
    create: (styles) => styles
  },
  ActivityIndicator: ({ testID, size, color, style }) => (
    <div
      data-testid={testID || 'activity-indicator'}
      data-size={size}
      data-color={color}
      style={style}
    >
      Loading...
    </div>
  ),
  Dimensions: {
    get: () => ({ width: 375, height: 667 })
  }
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => {
  return ({ name, size, color, style, testID }) => (
    <span
      data-testid={testID || `icon-${name}`}
      data-icon={name}
      data-size={size}
      data-color={color}
      style={style}
    >
      {name}
    </span>
  );
});

// Mock unifiedCategories
jest.mock('../../../utils/unifiedCategories', () => ({
  unifiedCategories: [
    {
      id: 'quick-info',
      name: 'quick-info',
      displayName: 'Quick Info',
      isVisible: true,
      isQuickInfo: true,
      order: 1,
      color: '#4CAF50'
    },
    {
      id: 'strengths',
      name: 'strengths',
      displayName: 'Strengths',
      isVisible: true,
      isQuickInfo: false,
      order: 2,
      color: '#2196F3'
    },
    {
      id: 'challenges',
      name: 'challenges',
      displayName: 'Challenges',
      isVisible: true,
      isQuickInfo: false,
      order: 3,
      color: '#FF9800'
    }
  ]
}));

// Mock API endpoints
jest.mock('../../../config/api', () => ({
  API_ENDPOINTS: {
    share: {
      access: 'https://manylla.com/qual/api/share_access.php'
    }
  }
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('SharedView', () => {
  const mockShareCode = 'test-token#test-key';

  const renderSharedView = (shareCode = mockShareCode) => {
    return render(<SharedView shareCode={shareCode} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  describe('Loading State', () => {
    it('shows loading state initially', () => {
      // Mock fetch to not resolve immediately
      fetch.mockImplementation(() => new Promise(() => {}));

      renderSharedView();

      expect(screen.getByTestId('activity-indicator')).toBeTruthy();
      expect(screen.getByText('Verifying Access')).toBeTruthy();
      expect(screen.getByText('Verifying access code...')).toBeTruthy();
      expect(screen.getByTestId('icon-security')).toBeTruthy();
    });

    it('displays loading spinner with correct properties', () => {
      fetch.mockImplementation(() => new Promise(() => {}));

      renderSharedView();

      const spinner = screen.getByTestId('activity-indicator');
      expect(spinner).toHaveAttribute('data-size', 'large');
      expect(spinner).toHaveAttribute('data-color', '#3D2F1F');
    });
  });

  describe('Error States - URL Validation', () => {
    it('shows error for invalid share URL format', async () => {
      renderSharedView('invalid-code-without-hash');

      await waitFor(() => {
        expect(screen.getByTestId('icon-error')).toBeTruthy();
        expect(screen.getByText('Invalid share URL format')).toBeTruthy();
      });
    });

    it('shows error for missing decryption key', async () => {
      renderSharedView('token-only#');

      await waitFor(() => {
        expect(screen.getByTestId('icon-error')).toBeTruthy();
        expect(screen.getByText('Missing decryption key in URL')).toBeTruthy();
      });
    });
  });

  describe('Error States - API Responses', () => {
    it('shows error for 404 response', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' })
      });

      renderSharedView();

      await waitFor(() => {
        expect(screen.getByText('Share not found')).toBeTruthy();
        expect(screen.getByTestId('icon-error')).toBeTruthy();
      });
    });

    it('shows error for 403 response with custom message', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: 'Expired share' })
      });

      renderSharedView();

      await waitFor(() => {
        expect(screen.getByText('Expired share')).toBeTruthy();
      });
    });

    it('shows error for 403 response with default message', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({})
      });

      renderSharedView();

      await waitFor(() => {
        expect(screen.getByText('Share has expired or reached view limit')).toBeTruthy();
      });
    });

    it('shows error for other HTTP errors', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' })
      });

      renderSharedView();

      await waitFor(() => {
        expect(screen.getByText('Failed to load share')).toBeTruthy();
      });
    });

    it('shows error for missing encrypted data', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'success' })
      });

      renderSharedView();

      await waitFor(() => {
        expect(screen.getByText('Share data is missing')).toBeTruthy();
      });
    });

    it('shows error for fetch network failure', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      renderSharedView();

      await waitFor(() => {
        expect(screen.getByText('Failed to load shared data')).toBeTruthy();
      });
    });
  });

  describe('Successful Authentication and Data Display', () => {
    beforeEach(() => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          encrypted_data: 'mock-encrypted-data'
        })
      });
    });

    it('makes correct API call', async () => {
      renderSharedView();

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'https://manylla.com/qual/api/share_access.php',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_code: 'test-token' })
          }
        );
      });
    });

    it('displays profile header correctly', async () => {
      renderSharedView();

      await waitFor(() => {
        expect(screen.getByText('manylla')).toBeTruthy();
        expect(screen.getByTestId('icon-visibility')).toBeTruthy();
        expect(screen.getByTestId('icon-person')).toBeTruthy();
        expect(screen.getByText('Ellie')).toBeTruthy();
      });
    });

    it('displays access info banner', async () => {
      renderSharedView();

      await waitFor(() => {
        expect(screen.getByText('Shared Access:')).toBeTruthy();
        expect(screen.getByText(/You are viewing information shared by the family/)).toBeTruthy();
      });
    });

    it('displays profile information', async () => {
      renderSharedView();

      await waitFor(() => {
        expect(screen.getByText('E')).toBeTruthy(); // Avatar text
        expect(screen.getByText('Ellie')).toBeTruthy();
        expect(screen.getByText(/she\/her.*Born.*3\/15\/2018/)).toBeTruthy();
      });
    });

    it('displays quick info panels', async () => {
      renderSharedView();

      await waitFor(() => {
        expect(screen.getByText('Quick Information')).toBeTruthy();
        expect(screen.getByText('Communication:')).toBeTruthy();
        expect(screen.getByText('Uses 2-3 word phrases. Understands more than she can express.')).toBeTruthy();
        expect(screen.getByText('Emergency Contact:')).toBeTruthy();
        expect(screen.getByText('Mom: 555-0123, Dad: 555-0124')).toBeTruthy();
      });
    });

    it('displays category entries correctly', async () => {
      renderSharedView();

      await waitFor(() => {
        expect(screen.getByText('Strengths')).toBeTruthy();
        expect(screen.getByText('Visual Learning')).toBeTruthy();
        expect(screen.getByText('Ellie learns best with visual aids. Picture cards and demonstrations work much better than verbal instructions alone.')).toBeTruthy();

        expect(screen.getByText('Challenges')).toBeTruthy();
        expect(screen.getByText('Loud Noises')).toBeTruthy();
        expect(screen.getByText('Sudden loud noises cause significant distress. Always warn beforehand when possible. Noise-canceling headphones help.')).toBeTruthy();
      });
    });

    it('handles profile date formatting', async () => {
      renderSharedView();

      await waitFor(() => {
        // Should format date correctly
        expect(screen.getByText(/Born.*3\/15\/2018/)).toBeTruthy();
      });
    });

    it('generates correct avatar text', async () => {
      renderSharedView();

      await waitFor(() => {
        // Should show first letter of preferred name
        expect(screen.getByText('E')).toBeTruthy();
      });
    });
  });

  describe('Share Code Parsing', () => {
    it('correctly parses token and key from share code', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          encrypted_data: 'mock-encrypted-data'
        })
      });

      renderSharedView('custom-token#custom-key');

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'https://manylla.com/qual/api/share_access.php',
          expect.objectContaining({
            body: JSON.stringify({ access_code: 'custom-token' })
          })
        );
      });
    });

    it('handles complex share codes with multiple hash symbols', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          encrypted_data: 'mock-encrypted-data'
        })
      });

      renderSharedView('token#key#extra');

      await waitFor(() => {
        // Should still work with first split
        expect(fetch).toHaveBeenCalledWith(
          'https://manylla.com/qual/api/share_access.php',
          expect.objectContaining({
            body: JSON.stringify({ access_code: 'token' })
          })
        );
      });
    });
  });

  describe('Component State Management', () => {
    it('manages loading state correctly', async () => {
      fetch.mockImplementation(() => new Promise(() => {}));

      renderSharedView();

      // Should show loading initially
      expect(screen.getByTestId('activity-indicator')).toBeTruthy();
      expect(screen.queryByText('Ellie')).toBeNull();
    });

    it('transitions from loading to success state', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          encrypted_data: 'mock-encrypted-data'
        })
      });

      renderSharedView();

      // Initially loading
      expect(screen.getByTestId('activity-indicator')).toBeTruthy();

      // After loading completes
      await waitFor(() => {
        expect(screen.queryByTestId('activity-indicator')).toBeNull();
        expect(screen.getByText('Ellie')).toBeTruthy();
      });
    });

    it('transitions from loading to error state', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      renderSharedView();

      // Initially loading
      expect(screen.getByTestId('activity-indicator')).toBeTruthy();

      // After error occurs
      await waitFor(() => {
        expect(screen.queryByTestId('activity-indicator')).toBeNull();
        expect(screen.getByTestId('icon-error')).toBeTruthy();
      });
    });
  });

  describe('Profile Data Edge Cases', () => {
    beforeEach(() => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          encrypted_data: 'mock-encrypted-data'
        })
      });
    });

    it('handles missing profile gracefully', async () => {
      // Test when no profile is returned (edge case in the useEffect)
      renderSharedView();

      // The component should still attempt to authenticate and show error if no profile
      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });
    });

    it('filters category entries correctly', async () => {
      renderSharedView();

      await waitFor(() => {
        // Should only show categories that have entries
        expect(screen.getByText('Strengths')).toBeTruthy();
        expect(screen.getByText('Challenges')).toBeTruthy();

        // Should show entries within categories
        expect(screen.getByText('Visual Learning')).toBeTruthy();
        expect(screen.getByText('Loud Noises')).toBeTruthy();
      });
    });

    it('handles empty categories', async () => {
      renderSharedView();

      await waitFor(() => {
        // The component should render successfully even if some categories are empty
        expect(screen.getByText('Ellie')).toBeTruthy();
      });
    });

    it('filters visible quick info panels', async () => {
      renderSharedView();

      await waitFor(() => {
        // Should only show visible panels
        expect(screen.getByText('Communication:')).toBeTruthy();
        expect(screen.getByText('Emergency Contact:')).toBeTruthy();
      });
    });
  });

  describe('Conditional Rendering', () => {
    beforeEach(() => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          encrypted_data: 'mock-encrypted-data'
        })
      });
    });

    it('renders header elements correctly', async () => {
      renderSharedView();

      await waitFor(() => {
        expect(screen.getByText('manylla')).toBeTruthy();
        expect(screen.getByTestId('icon-visibility')).toBeTruthy();
        expect(screen.getByTestId('icon-person')).toBeTruthy();
      });
    });

    it('renders profile section with all elements', async () => {
      renderSharedView();

      await waitFor(() => {
        // Profile card elements
        expect(screen.getByText('E')).toBeTruthy(); // Avatar
        expect(screen.getByText('Ellie')).toBeTruthy(); // Name
        expect(screen.getByText(/she\/her.*Born/)).toBeTruthy(); // Details
      });
    });

    it('renders access banner', async () => {
      renderSharedView();

      await waitFor(() => {
        expect(screen.getByText('Shared Access:')).toBeTruthy();
        expect(screen.getByText(/temporary link that will expire/)).toBeTruthy();
      });
    });
  });
});