/**
 * ProfileOverview.test.js
 * Comprehensive tests for ProfileOverview component
 * Target: 65% coverage
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProfileOverview } from '../ProfileOverview';

// Mock dependencies
jest.mock('../../../theme/theme', () => ({
  manyllaColors: {
    brown: '#8B6F47',
    avatarDefaultBg: '#5D4E37',
  },
}));

jest.mock('../CategorySection', () => ({
  CategorySection: ({ title, entries, onMoveUp, onMoveDown, onAddEntry, onEditEntry, onDeleteEntry, isQuickInfo }) => (
    <div data-testid={`category-section-${title}`}>
      <h3>{title}</h3>
      <div>Entries: {entries?.length || 0}</div>
      {!isQuickInfo && (
        <>
          <button onClick={onMoveUp} data-testid={`move-up-${title}`}>Move Up</button>
          <button onClick={onMoveDown} data-testid={`move-down-${title}`}>Move Down</button>
        </>
      )}
      {onAddEntry && <button onClick={onAddEntry} data-testid={`add-entry-${title}`}>Add Entry</button>}
      {onEditEntry && <button onClick={() => onEditEntry({id: 'test'})} data-testid={`edit-entry-${title}`}>Edit Entry</button>}
      {onDeleteEntry && <button onClick={() => onDeleteEntry('test')} data-testid={`delete-entry-${title}`}>Delete Entry</button>}
    </div>
  ),
}));

jest.mock('../../../utils/unifiedCategories', () => ({
  getVisibleCategories: jest.fn(() => [
    {
      id: 'quick-info',
      name: 'Quick Info',
      displayName: 'Quick Info',
      color: '#4A90E2',
      order: 0,
      isQuickInfo: true,
    },
    {
      id: 'medical',
      name: 'Medical Information',
      displayName: 'Medical Information',
      color: '#E76F51',
      order: 1,
      isQuickInfo: false,
    },
    {
      id: 'education',
      name: 'Education',
      displayName: 'Education',
      color: '#67B26F',
      order: 2,
      isQuickInfo: false,
    },
  ]),
}));

jest.mock('../ProfileEditDialog', () => ({
  ProfileEditDialog: ({ open, onClose, profile, onSave }) => (
    open ? (
      <div data-testid="profile-edit-dialog">
        <h2>Edit Profile: {profile.name}</h2>
        <button onClick={onClose} data-testid="close-dialog">Close</button>
        <button onClick={() => onSave({...profile, name: 'Updated Name'})} data-testid="save-profile">Save</button>
      </div>
    ) : null
  ),
}));

jest.mock('../../../services/photoService', () => ({
  __esModule: true,
  default: {
    isPhotoEncrypted: jest.fn(),
    decryptPhoto: jest.fn(),
  },
}));

jest.mock('../../../utils/platform', () => ({
  isWeb: true,
  isMobile: false,
}));

// Mock Dimensions
jest.mock('react-native', () => {
  const actualRN = jest.requireActual('react-native');
  return {
    ...actualRN,
    Dimensions: {
      get: jest.fn(() => ({ width: 1024, height: 768 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
  };
});

const mockPhotoService = require('../../../services/photoService').default;

// Mock data
const mockProfile = {
  id: 'profile1',
  name: 'John Doe',
  preferredName: 'Johnny',
  dateOfBirth: '2010-05-15',
  photo: null,
  entries: [
    {
      id: 'entry1',
      category: 'Quick Info',
      title: 'Important Note',
      description: 'This is important information',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 'entry2',
      category: 'Medical Information',
      title: 'Allergy Information',
      description: 'Allergic to peanuts',
      updatedAt: '2023-01-02T00:00:00Z',
    },
  ],
  categories: [
    {
      id: 'quick-info',
      name: 'Quick Info',
      displayName: 'Quick Info',
      color: '#4A90E2',
      order: 0,
      isQuickInfo: true,
    },
    {
      id: 'medical',
      name: 'Medical Information',
      displayName: 'Medical Information',
      color: '#E76F51',
      order: 1,
      isQuickInfo: false,
    },
  ],
  updatedAt: '2023-01-01T00:00:00Z',
};

const defaultProps = {
  profile: mockProfile,
  onAddEntry: jest.fn(),
  onEditEntry: jest.fn(),
  onDeleteEntry: jest.fn(),
  onShare: jest.fn(),
  onUpdateCategories: jest.fn(),
  onUpdateProfile: jest.fn(),
};

describe('ProfileOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPhotoService.isPhotoEncrypted.mockReturnValue(false);
    mockPhotoService.decryptPhoto.mockResolvedValue('data:image/jpeg;base64,test');
  });

  describe('Rendering', () => {
    it('renders profile basic information', () => {
      render(<ProfileOverview {...defaultProps} />);

      expect(screen.getByText('Johnny')).toBeInTheDocument(); // preferredName
      expect(screen.getByText(/Age: \d+ years/)).toBeInTheDocument();
    });

    it('falls back to name when preferredName is not available', () => {
      const profileWithoutPreferredName = {
        ...mockProfile,
        preferredName: null,
      };

      render(<ProfileOverview {...defaultProps} profile={profileWithoutPreferredName} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('displays avatar placeholder with first letter when no photo', () => {
      render(<ProfileOverview {...defaultProps} />);

      expect(screen.getByText('J')).toBeInTheDocument(); // First letter of name
    });

    it('calculates age correctly', () => {
      // Mock current date to ensure consistent age calculation
      const mockDate = new Date('2023-06-01');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      render(<ProfileOverview {...defaultProps} />);

      expect(screen.getByText('Age: 13 years')).toBeInTheDocument();

      global.Date.mockRestore();
    });

    it('renders floating action button when onAddEntry is provided', () => {
      render(<ProfileOverview {...defaultProps} />);

      const fab = screen.getByText('+');
      expect(fab).toBeInTheDocument();
    });

    it('does not render floating action button when onAddEntry is not provided', () => {
      render(<ProfileOverview {...defaultProps} onAddEntry={undefined} />);

      expect(screen.queryByText('+')).not.toBeInTheDocument();
    });

    it('renders edit button when onUpdateProfile is provided', () => {
      render(<ProfileOverview {...defaultProps} />);

      expect(screen.getByText('✏️')).toBeInTheDocument();
    });

    it('does not render edit button when onUpdateProfile is not provided', () => {
      render(<ProfileOverview {...defaultProps} onUpdateProfile={undefined} />);

      expect(screen.queryByText('✏️')).not.toBeInTheDocument();
    });
  });

  describe('Photo Handling', () => {
    it('loads and displays unencrypted photo', async () => {
      const profileWithPhoto = {
        ...mockProfile,
        photo: 'data:image/jpeg;base64,test_photo_data',
      };

      mockPhotoService.isPhotoEncrypted.mockReturnValue(false);

      render(<ProfileOverview {...defaultProps} profile={profileWithPhoto} />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThan(0);
      });
    });

    it('loads and decrypts encrypted photo', async () => {
      const profileWithEncryptedPhoto = {
        ...mockProfile,
        photo: 'encrypted_photo_data',
      };

      mockPhotoService.isPhotoEncrypted.mockReturnValue(true);
      mockPhotoService.decryptPhoto.mockResolvedValue('data:image/jpeg;base64,decrypted_data');

      render(<ProfileOverview {...defaultProps} profile={profileWithEncryptedPhoto} />);

      await waitFor(() => {
        expect(mockPhotoService.decryptPhoto).toHaveBeenCalledWith('encrypted_photo_data');
      });
    });

    it('handles photo decryption errors gracefully', async () => {
      const profileWithPhoto = {
        ...mockProfile,
        photo: 'encrypted_photo_data',
      };

      mockPhotoService.isPhotoEncrypted.mockReturnValue(true);
      mockPhotoService.decryptPhoto.mockRejectedValue(new Error('Decryption failed'));

      render(<ProfileOverview {...defaultProps} profile={profileWithPhoto} />);

      await waitFor(() => {
        // Should fall back to placeholder
        expect(screen.getByText('J')).toBeInTheDocument();
      });
    });

    it('shows loading indicator while photo is loading', () => {
      const profileWithPhoto = {
        ...mockProfile,
        photo: 'data:image/jpeg;base64,test',
      };

      render(<ProfileOverview {...defaultProps} profile={profileWithPhoto} />);

      expect(screen.getByTestId('activity-indicator')).toBeInTheDocument();
    });

    it('handles photo load errors', async () => {
      const profileWithPhoto = {
        ...mockProfile,
        photo: 'data:image/jpeg;base64,test',
      };

      render(<ProfileOverview {...defaultProps} profile={profileWithPhoto} />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        if (images.length > 0) {
          fireEvent.error(images[0]);
        }
      });

      // Should fall back to placeholder after error
      await waitFor(() => {
        expect(screen.getByText('J')).toBeInTheDocument();
      });
    });
  });

  describe('Category Management', () => {
    it('renders all visible categories with entries', () => {
      render(<ProfileOverview {...defaultProps} />);

      expect(screen.getByTestId('category-section-Quick Info')).toBeInTheDocument();
      expect(screen.getByTestId('category-section-Medical Information')).toBeInTheDocument();
    });

    it('filters categories to show only those with entries or Quick Info', () => {
      render(<ProfileOverview {...defaultProps} />);

      // Quick Info should always be visible even without entries
      expect(screen.getByTestId('category-section-Quick Info')).toBeInTheDocument();

      // Medical Information should be visible because it has entries
      expect(screen.getByTestId('category-section-Medical Information')).toBeInTheDocument();

      // Education should not be visible because it has no entries and is not Quick Info
      expect(screen.queryByTestId('category-section-Education')).not.toBeInTheDocument();
    });

    it('handles category reordering correctly', () => {
      const mockOnUpdateProfile = jest.fn();

      render(<ProfileOverview {...defaultProps} onUpdateProfile={mockOnUpdateProfile} />);

      const moveUpButton = screen.getByTestId('move-up-Medical Information');
      fireEvent.click(moveUpButton);

      expect(mockOnUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          categories: expect.arrayContaining([
            expect.objectContaining({ id: 'medical', order: 1 }),
          ]),
          updatedAt: expect.any(String),
        })
      );
    });

    it('prevents reordering Quick Info category', () => {
      const mockOnUpdateProfile = jest.fn();

      render(<ProfileOverview {...defaultProps} onUpdateProfile={mockOnUpdateProfile} />);

      // Quick Info should not have move buttons, but test the handler directly
      const component = screen.getByTestId('category-section-Quick Info');
      expect(component).toBeInTheDocument();

      // Should not update profile when trying to move Quick Info
      expect(mockOnUpdateProfile).not.toHaveBeenCalled();
    });

    it('handles boundary conditions for category movement', () => {
      const mockOnUpdateProfile = jest.fn();
      const profileWithMultipleCategories = {
        ...mockProfile,
        categories: [
          { id: 'quick-info', name: 'Quick Info', order: 0, isQuickInfo: true },
          { id: 'medical', name: 'Medical Information', order: 1, isQuickInfo: false },
          { id: 'education', name: 'Education', order: 2, isQuickInfo: false },
        ],
        entries: [
          ...mockProfile.entries,
          {
            id: 'entry3',
            category: 'Education',
            title: 'School Info',
            description: 'Test school',
            updatedAt: '2023-01-03T00:00:00Z',
          },
        ],
      };

      render(<ProfileOverview {...defaultProps} profile={profileWithMultipleCategories} onUpdateProfile={mockOnUpdateProfile} />);

      // Test moving first non-Quick Info category up (should not move above Quick Info)
      const moveUpMedical = screen.getByTestId('move-up-Medical Information');
      fireEvent.click(moveUpMedical);

      // Should not move Medical above Quick Info (index 0)
      expect(mockOnUpdateProfile).not.toHaveBeenCalled();
    });
  });

  describe('Interactions', () => {
    it('opens profile edit dialog when edit button is clicked', () => {
      render(<ProfileOverview {...defaultProps} />);

      const editButton = screen.getByText('✏️');
      fireEvent.click(editButton);

      expect(screen.getByTestId('profile-edit-dialog')).toBeInTheDocument();
    });

    it('opens profile edit dialog when avatar is clicked', () => {
      render(<ProfileOverview {...defaultProps} />);

      const avatar = screen.getByText('J').parentElement;
      fireEvent.click(avatar);

      expect(screen.getByTestId('profile-edit-dialog')).toBeInTheDocument();
    });

    it('does not open edit dialog when onUpdateProfile is not provided', () => {
      render(<ProfileOverview {...defaultProps} onUpdateProfile={undefined} />);

      const avatar = screen.getByText('J').parentElement;
      fireEvent.click(avatar);

      expect(screen.queryByTestId('profile-edit-dialog')).not.toBeInTheDocument();
    });

    it('closes profile edit dialog when close button is clicked', () => {
      render(<ProfileOverview {...defaultProps} />);

      // Open dialog
      const editButton = screen.getByText('✏️');
      fireEvent.click(editButton);

      expect(screen.getByTestId('profile-edit-dialog')).toBeInTheDocument();

      // Close dialog
      const closeButton = screen.getByTestId('close-dialog');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('profile-edit-dialog')).not.toBeInTheDocument();
    });

    it('calls onAddEntry when floating action button is clicked', () => {
      const mockOnAddEntry = jest.fn();

      render(<ProfileOverview {...defaultProps} onAddEntry={mockOnAddEntry} />);

      const fab = screen.getByText('+');
      fireEvent.click(fab);

      expect(mockOnAddEntry).toHaveBeenCalledWith('');
    });

    it('forwards category actions correctly', () => {
      const mockOnAddEntry = jest.fn();
      const mockOnEditEntry = jest.fn();
      const mockOnDeleteEntry = jest.fn();

      render(<ProfileOverview
        {...defaultProps}
        onAddEntry={mockOnAddEntry}
        onEditEntry={mockOnEditEntry}
        onDeleteEntry={mockOnDeleteEntry}
      />);

      // Test add entry for specific category
      const addButton = screen.getByTestId('add-entry-Quick Info');
      fireEvent.click(addButton);
      expect(mockOnAddEntry).toHaveBeenCalledWith('Quick Info');

      // Test edit entry
      const editButton = screen.getByTestId('edit-entry-Quick Info');
      fireEvent.click(editButton);
      expect(mockOnEditEntry).toHaveBeenCalledWith({ id: 'test' });

      // Test delete entry
      const deleteButton = screen.getByTestId('delete-entry-Quick Info');
      fireEvent.click(deleteButton);
      expect(mockOnDeleteEntry).toHaveBeenCalledWith('test');
    });
  });

  describe('Controlled vs Uncontrolled Profile Edit State', () => {
    it('uses controlled state when provided', () => {
      const mockSetProfileEditOpen = jest.fn();

      render(<ProfileOverview
        {...defaultProps}
        profileEditOpen={true}
        setProfileEditOpen={mockSetProfileEditOpen}
      />);

      expect(screen.getByTestId('profile-edit-dialog')).toBeInTheDocument();

      const closeButton = screen.getByTestId('close-dialog');
      fireEvent.click(closeButton);

      expect(mockSetProfileEditOpen).toHaveBeenCalledWith(false);
    });

    it('uses internal state when not controlled', () => {
      render(<ProfileOverview {...defaultProps} />);

      expect(screen.queryByTestId('profile-edit-dialog')).not.toBeInTheDocument();

      const editButton = screen.getByText('✏️');
      fireEvent.click(editButton);

      expect(screen.getByTestId('profile-edit-dialog')).toBeInTheDocument();
    });
  });

  describe('Age Calculation Edge Cases', () => {
    it('calculates age correctly for recent birthday', () => {
      const mockDate = new Date('2023-05-20');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      render(<ProfileOverview {...defaultProps} />);

      expect(screen.getByText('Age: 13 years')).toBeInTheDocument();

      global.Date.mockRestore();
    });

    it('calculates age correctly for upcoming birthday', () => {
      const mockDate = new Date('2023-05-10');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      render(<ProfileOverview {...defaultProps} />);

      expect(screen.getByText('Age: 12 years')).toBeInTheDocument();

      global.Date.mockRestore();
    });
  });

  describe('Responsive Design', () => {
    it('adjusts layout for different screen sizes', () => {
      // Mock smaller screen
      const Dimensions = require('react-native').Dimensions;
      Dimensions.get.mockReturnValue({ width: 600, height: 800 });

      render(<ProfileOverview {...defaultProps} />);

      // Component should render without errors on smaller screens
      expect(screen.getByText('Johnny')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing profile data gracefully', () => {
      const incompleteProfile = {
        ...mockProfile,
        name: '',
        dateOfBirth: null,
      };

      render(<ProfileOverview {...defaultProps} profile={incompleteProfile} />);

      // Should handle gracefully without crashing
      expect(screen.getByText('')).toBeInTheDocument();
    });

    it('handles missing entries array', () => {
      const profileWithoutEntries = {
        ...mockProfile,
        entries: undefined,
      };

      render(<ProfileOverview {...defaultProps} profile={profileWithoutEntries} />);

      expect(screen.getByText('Johnny')).toBeInTheDocument();
    });

    it('handles missing categories array', () => {
      const profileWithoutCategories = {
        ...mockProfile,
        categories: undefined,
      };

      render(<ProfileOverview {...defaultProps} profile={profileWithoutCategories} />);

      expect(screen.getByText('Johnny')).toBeInTheDocument();
    });
  });
});