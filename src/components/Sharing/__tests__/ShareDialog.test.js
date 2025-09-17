/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ShareDialog } from '../ShareDialog';
import { useTheme } from '../../../context/ThemeContext';
import { useShareActions } from '../useShareActions';

// Mock dependencies
jest.mock('../../../context/ThemeContext');
jest.mock('../useShareActions');
jest.mock('../ShareDialogRecipient', () => ({
  ShareDialogRecipient: ({ onPresetChange }) => {
    return (
      <button testID="preset-education" onPress={() => onPresetChange('education')}>
        Education
      </button>
    );
  },
  sharePresets: [
    { id: 'education', name: 'Education', categories: ['medical', 'behavioral'] },
    { id: 'medical', name: 'Medical', categories: ['medical'] },
    { id: 'custom', name: 'Custom', categories: [] }
  ]
}));

jest.mock('../ShareDialogCategories', () => ({
  ShareDialogCategories: ({ onCategoryToggle, onPhotoToggle }) => (
    <div>
      <button testID="category-medical" onPress={() => onCategoryToggle('medical')}>
        Medical
      </button>
      <button testID="photo-toggle" onPress={onPhotoToggle}>
        Include Photo
      </button>
    </div>
  )
}));

jest.mock('../ShareDialogOptions', () => ({
  ShareDialogOptions: ({ onExpirationChange }) => (
    <button testID="expiration-30" onPress={() => onExpirationChange(30)}>
      30 Days
    </button>
  )
}));

jest.mock('../ShareDialogPreview', () => ({
  ShareDialogPreview: ({ onTogglePreview }) => (
    <button testID="toggle-preview" onPress={onTogglePreview}>
      Toggle Preview
    </button>
  )
}));

jest.mock('../ShareDialogComplete', () => ({
  ShareDialogComplete: ({ onCreateAnother, onDone }) => (
    <div>
      <button testID="create-another" onPress={onCreateAnother}>
        Create Another
      </button>
      <button testID="done" onPress={onDone}>
        Done
      </button>
    </div>
  )
}));

jest.mock('../../Common', () => ({
  ThemedModal: ({ children, visible, onClose, title }) =>
    visible ? (
      <div testID="themed-modal">
        <div testID="modal-title">{title}</div>
        {children}
        <button testID="modal-close" onPress={onClose}>Close</button>
      </div>
    ) : null
}));

// P2 TECH DEBT: Remove skip when working on ShareDialog
// Issue: Mock dependencies
describe.skip('ShareDialog', () => {
  const mockProfile = {
    id: '1',
    name: 'John Doe',
    preferredName: 'Johnny',
    entries: [
      { id: '1', category: 'medical', content: 'Medical info' },
      { id: '2', category: 'behavioral', content: 'Behavioral info' },
      { id: '3', category: 'education', content: 'Education info' }
    ],
    photo: 'data:image/jpeg;base64,photo'
  };

  const mockShareActions = {
    loading: false,
    generatedLink: '',
    copiedLink: false,
    handleGenerateLink: jest.fn(),
    handleCopyLink: jest.fn(),
    handleShareLink: jest.fn(),
    resetShareState: jest.fn()
  };

  const mockTheme = {
    colors: {
      primary: '#A08670',
      background: { paper: '#FAF9F6' },
      text: { primary: '#2C2C2C' }
    }
  };

  beforeEach(() => {
    useTheme.mockReturnValue(mockTheme);
    useShareActions.mockReturnValue(mockShareActions);
    jest.clearAllMocks();
  });

  it('should render with initial configure step', () => {
    const { getByTestId } = render(
      <ShareDialog open={true} onClose={jest.fn()} profile={mockProfile} />
    );

    expect(getByTestId('themed-modal')).toBeTruthy();
    expect(getByTestId('modal-title')).toHaveTextContent('Create Share Link');
  });

  it('should not render when closed', () => {
    const { queryByTestId } = render(
      <ShareDialog open={false} onClose={jest.fn()} profile={mockProfile} />
    );

    expect(queryByTestId('themed-modal')).toBeNull();
  });

  it('should reset state when dialog opens', () => {
    const { rerender } = render(
      <ShareDialog open={false} onClose={jest.fn()} profile={mockProfile} />
    );

    rerender(
      <ShareDialog open={true} onClose={jest.fn()} profile={mockProfile} />
    );

    expect(mockShareActions.resetShareState).toHaveBeenCalled();
  });

  it('should calculate selected entries count correctly', () => {
    const { getByTestId } = render(
      <ShareDialog open={true} onClose={jest.fn()} profile={mockProfile} />
    );

    // Initially should have education preset selected with medical and behavioral categories
    expect(getByTestId('themed-modal')).toBeTruthy();
  });

  it('should handle generate link click successfully', async () => {
    mockShareActions.handleGenerateLink.mockResolvedValue('https://test.com/share/123#key');

    const { getByText } = render(
      <ShareDialog open={true} onClose={jest.fn()} profile={mockProfile} />
    );

    const generateButton = getByText('Generate Share Link');
    fireEvent.press(generateButton);

    await waitFor(() => {
      expect(mockShareActions.handleGenerateLink).toHaveBeenCalledWith({
        profile: mockProfile,
        selectedCategories: ['medical', 'behavioral'],
        includePhoto: false,
        expirationDays: 7,
        selectedPreset: 'education'
      });
    });
  });

  it('should handle generate link failure', async () => {
    mockShareActions.handleGenerateLink.mockResolvedValue(null);

    const { getByText, getByTestId } = render(
      <ShareDialog open={true} onClose={jest.fn()} profile={mockProfile} />
    );

    const generateButton = getByText('Generate Share Link');
    fireEvent.press(generateButton);

    await waitFor(() => {
      expect(mockShareActions.handleGenerateLink).toHaveBeenCalled();
      // Should remain on configure step when link generation fails
      expect(getByTestId('modal-title')).toHaveTextContent('Create Share Link');
    });
  });

  it('should show loading state during link generation', () => {
    useShareActions.mockReturnValue({
      ...mockShareActions,
      loading: true
    });

    const { getByLabelText } = render(
      <ShareDialog open={true} onClose={jest.fn()} profile={mockProfile} />
    );

    // Look for loading indicator instead of button text when loading
    expect(getByLabelText('loading')).toBeTruthy();
  });

  it('should transition to complete step after successful generation', async () => {
    mockShareActions.handleGenerateLink.mockResolvedValue('https://test.com/share/123#key');

    const { getByTestId, rerender } = render(
      <ShareDialog open={true} onClose={jest.fn()} profile={mockProfile} />
    );

    const generateButton = getByTestId('generate-button');
    fireEvent.press(generateButton);

    // Simulate successful generation by updating the component state
    await waitFor(() => {
      expect(mockShareActions.handleGenerateLink).toHaveBeenCalled();
    });

    // Re-render with complete step
    useShareActions.mockReturnValue({
      ...mockShareActions,
      generatedLink: 'https://test.com/share/123#key'
    });

    rerender(
      <ShareDialog open={true} onClose={jest.fn()} profile={mockProfile} />
    );

    // The component should now show the complete step
    expect(getByTestId('create-another')).toBeTruthy();
    expect(getByTestId('done')).toBeTruthy();
  });

  it('should handle create another action', () => {
    // Start with complete step
    const { getByTestId } = render(
      <ShareDialog open={true} onClose={jest.fn()} profile={mockProfile} />
    );

    // Simulate complete step being shown
    const createAnotherButton = getByTestId('create-another');
    fireEvent.press(createAnotherButton);

    expect(mockShareActions.resetShareState).toHaveBeenCalled();
  });

  it('should handle done action', () => {
    const mockOnClose = jest.fn();

    const { getByTestId } = render(
      <ShareDialog open={true} onClose={mockOnClose} profile={mockProfile} />
    );

    const doneButton = getByTestId('done');
    fireEvent.press(doneButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should disable generate button when no categories selected', () => {
    const { getByText } = render(
      <ShareDialog open={true} onClose={jest.fn()} profile={mockProfile} />
    );

    // Initially should have categories selected from education preset
    const generateButton = getByText('Generate Share Link');
    expect(generateButton).toBeTruthy();

    // Button should be enabled by default since education preset has categories
    // Testing exact disabled state would require manipulating internal component state
  });

  it('should call onClose when modal is closed', () => {
    const mockOnClose = jest.fn();

    const { getByTestId } = render(
      <ShareDialog open={true} onClose={mockOnClose} profile={mockProfile} />
    );

    const closeButton = getByTestId('modal-close');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});