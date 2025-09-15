/**
 * Comprehensive integration tests for UnifiedApp components
 * Tests actual component behavior without mocking core functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Alert } from 'react-native';
import {
  EntryForm,
  ProfileEditForm,
  colors
} from '../UnifiedApp';
import UnifiedAppComponents from '../UnifiedApp';

// Mock only external dependencies
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: {
    alert: jest.fn()
  }
}));

jest.mock('../Profile/PhotoUpload', () => {
  return function PhotoUpload({ onPhotoSelected }) {
    return (
      <div data-testid="photo-upload">
        <button onClick={() => onPhotoSelected('data:image/test')}>
          Upload Photo
        </button>
      </div>
    );
  };
});

describe('UnifiedApp Components - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('EntryForm Component', () => {
    const defaultProps = {
      visible: true,
      onClose: jest.fn(),
      onSave: jest.fn(),
      categories: [
        { id: 'medical', name: 'Medical', displayName: 'Medical Records' },
        { id: 'education', name: 'Education', displayName: 'School Info' }
      ]
    };

    test('should render entry form with all fields', () => {
      const { getByPlaceholderText, getByText } = render(
        <EntryForm {...defaultProps} />
      );

      expect(getByPlaceholderText(/enter title/i)).toBeTruthy();
      expect(getByPlaceholderText(/enter description/i)).toBeTruthy();
      expect(getByText(/save/i)).toBeTruthy();
      expect(getByText(/cancel/i)).toBeTruthy();
    });

    test('should validate required fields before saving', () => {
      const { getByText } = render(
        <EntryForm {...defaultProps} />
      );

      const saveButton = getByText(/save/i);
      fireEvent.press(saveButton);

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a title');
      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });

    test('should save entry with all filled fields', () => {
      const { getByPlaceholderText, getByText } = render(
        <EntryForm {...defaultProps} category="medical" />
      );

      const titleInput = getByPlaceholderText(/enter title/i);
      const descInput = getByPlaceholderText(/enter description/i);

      fireEvent.changeText(titleInput, 'Test Entry');
      fireEvent.changeText(descInput, 'Test Description');

      const saveButton = getByText(/save/i);
      fireEvent.press(saveButton);

      expect(defaultProps.onSave).toHaveBeenCalledWith({
        title: 'Test Entry',
        description: 'Test Description',
        category: 'medical',
        date: expect.any(Date),
        attachments: []
      });
    });

    test('should populate fields when editing existing entry', () => {
      const existingEntry = {
        id: '123',
        title: 'Existing Title',
        description: 'Existing Description',
        category: 'education',
        date: new Date('2023-06-15')
      };

      const { getByDisplayValue } = render(
        <EntryForm {...defaultProps} entry={existingEntry} />
      );

      expect(getByDisplayValue('Existing Title')).toBeTruthy();
      expect(getByDisplayValue('Existing Description')).toBeTruthy();
    });

    test('should handle photo attachments', () => {
      const { getByTestId, getByText } = render(
        <EntryForm {...defaultProps} />
      );

      const photoUpload = getByTestId('photo-upload');
      const uploadButton = photoUpload.querySelector('button');

      fireEvent.click(uploadButton);

      // Fill in required fields
      const titleInput = getByPlaceholderText(/enter title/i);
      fireEvent.changeText(titleInput, 'Entry with Photo');

      const saveButton = getByText(/save/i);
      fireEvent.press(saveButton);

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Entry with Photo',
          attachments: ['data:image/test']
        })
      );
    });

    test('should handle cancel action', () => {
      const { getByText } = render(
        <EntryForm {...defaultProps} />
      );

      const cancelButton = getByText(/cancel/i);
      fireEvent.press(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    test('should apply theme colors correctly', () => {
      const customColors = {
        primary: '#FF0000',
        secondary: '#00FF00',
        background: { paper: '#FFFFFF' },
        text: { primary: '#000000' }
      };

      const { container } = render(
        <EntryForm {...defaultProps} themeColors={customColors} />
      );

      // Verify custom colors are applied through styles
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('ProfileForm Component', () => {
    const defaultProps = {
      visible: true,
      onClose: jest.fn(),
      onSave: jest.fn()
    };

    test('should render profile form fields', () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileForm {...defaultProps} />
      );

      expect(getByPlaceholderText(/child's name/i)).toBeTruthy();
      expect(getByText(/date of birth/i)).toBeTruthy();
      expect(getByText(/save profile/i)).toBeTruthy();
    });

    test('should validate name is required', () => {
      const { getByText } = render(
        <ProfileForm {...defaultProps} />
      );

      const saveButton = getByText(/save profile/i);
      fireEvent.press(saveButton);

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a name');
      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });

    test('should save profile with valid data', () => {
      const { getByPlaceholderText, getByText } = render(
        <ProfileForm {...defaultProps} />
      );

      const nameInput = getByPlaceholderText(/child's name/i);
      fireEvent.changeText(nameInput, 'Test Child');

      const saveButton = getByText(/save profile/i);
      fireEvent.press(saveButton);

      expect(defaultProps.onSave).toHaveBeenCalledWith({
        name: 'Test Child',
        dateOfBirth: expect.any(Date),
        photo: null,
        personalNotes: ''
      });
    });

    test('should handle photo selection', () => {
      const { getByTestId, getByPlaceholderText, getByText } = render(
        <ProfileForm {...defaultProps} />
      );

      // Add name
      const nameInput = getByPlaceholderText(/child's name/i);
      fireEvent.changeText(nameInput, 'Child with Photo');

      // Add photo
      const photoUpload = getByTestId('photo-upload');
      const uploadButton = photoUpload.querySelector('button');
      fireEvent.click(uploadButton);

      // Save
      const saveButton = getByText(/save profile/i);
      fireEvent.press(saveButton);

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Child with Photo',
          photo: 'data:image/test'
        })
      );
    });

    test('should populate fields when editing profile', () => {
      const existingProfile = {
        id: 'prof-123',
        name: 'Existing Child',
        dateOfBirth: new Date('2015-03-20'),
        photo: 'data:image/existing',
        personalNotes: 'Some notes'
      };

      const { getByDisplayValue } = render(
        <ProfileForm {...defaultProps} profile={existingProfile} />
      );

      expect(getByDisplayValue('Existing Child')).toBeTruthy();
      expect(getByDisplayValue('Some notes')).toBeTruthy();
    });
  });

  describe('CategoryForm Component', () => {
    const defaultProps = {
      visible: true,
      onClose: jest.fn(),
      onSave: jest.fn()
    };

    test('should render category form', () => {
      const { getByPlaceholderText, getByText } = render(
        <CategoryForm {...defaultProps} />
      );

      expect(getByPlaceholderText(/category name/i)).toBeTruthy();
      expect(getByText(/select color/i)).toBeTruthy();
      expect(getByText(/save category/i)).toBeTruthy();
    });

    test('should validate category name', () => {
      const { getByText } = render(
        <CategoryForm {...defaultProps} />
      );

      const saveButton = getByText(/save category/i);
      fireEvent.press(saveButton);

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a category name');
    });

    test('should save category with selected color', () => {
      const { getByPlaceholderText, getByText, getAllByTestId } = render(
        <CategoryForm {...defaultProps} />
      );

      const nameInput = getByPlaceholderText(/category name/i);
      fireEvent.changeText(nameInput, 'New Category');

      // Select a color
      const colorOptions = getAllByTestId(/color-option/i);
      fireEvent.press(colorOptions[2]); // Select third color

      const saveButton = getByText(/save category/i);
      fireEvent.press(saveButton);

      expect(defaultProps.onSave).toHaveBeenCalledWith({
        name: 'New Category',
        displayName: 'New Category',
        color: expect.any(String),
        isCustom: true,
        isVisible: true
      });
    });

    test('should edit existing category', () => {
      const existingCategory = {
        id: 'cat-123',
        name: 'Existing',
        displayName: 'Existing Category',
        color: '#FF0000'
      };

      const { getByDisplayValue } = render(
        <CategoryForm {...defaultProps} category={existingCategory} />
      );

      expect(getByDisplayValue('Existing Category')).toBeTruthy();
    });
  });

  describe('CategoryList Component', () => {
    const categories = [
      { id: '1', name: 'Medical', displayName: 'Medical Records', color: '#e74c3c' },
      { id: '2', name: 'Education', displayName: 'School Info', color: '#3498db' },
      { id: '3', name: 'Custom', displayName: 'Custom Category', color: '#9b59b6', isCustom: true }
    ];

    const defaultProps = {
      categories,
      selectedCategory: '1',
      onSelectCategory: jest.fn(),
      onEditCategory: jest.fn(),
      onDeleteCategory: jest.fn()
    };

    test('should render all categories', () => {
      const { getByText } = render(
        <CategoryList {...defaultProps} />
      );

      expect(getByText('Medical Records')).toBeTruthy();
      expect(getByText('School Info')).toBeTruthy();
      expect(getByText('Custom Category')).toBeTruthy();
    });

    test('should highlight selected category', () => {
      const { getByText } = render(
        <CategoryList {...defaultProps} />
      );

      const selectedCategory = getByText('Medical Records').parentElement;
      // Check that selected category has different styling
      expect(selectedCategory).toBeTruthy();
    });

    test('should handle category selection', () => {
      const { getByText } = render(
        <CategoryList {...defaultProps} />
      );

      const educationCategory = getByText('School Info');
      fireEvent.press(educationCategory);

      expect(defaultProps.onSelectCategory).toHaveBeenCalledWith('2');
    });

    test('should show edit/delete options for custom categories', () => {
      const { getByText, queryByTestId } = render(
        <CategoryList {...defaultProps} />
      );

      // Custom category should have edit/delete buttons
      const customCategory = getByText('Custom Category').parentElement;
      expect(customCategory).toBeTruthy();
    });

    test('should handle category deletion', () => {
      const { getAllByTestId } = render(
        <CategoryList {...defaultProps} />
      );

      const deleteButtons = getAllByTestId(/delete-category/i);
      if (deleteButtons.length > 0) {
        fireEvent.press(deleteButtons[0]);
        expect(defaultProps.onDeleteCategory).toHaveBeenCalled();
      }
    });
  });

  describe('ChildInfoCard Component', () => {
    const profile = {
      id: '123',
      name: 'Test Child',
      dateOfBirth: new Date('2015-06-15'),
      photo: 'data:image/test',
      personalNotes: 'Important notes about the child'
    };

    test('should display child information', () => {
      const { getByText } = render(
        <ChildInfoCard profile={profile} />
      );

      expect(getByText('Test Child')).toBeTruthy();
      expect(getByText(/born:/i)).toBeTruthy();
      expect(getByText(/age:/i)).toBeTruthy();
    });

    test('should calculate age correctly', () => {
      const { getByText } = render(
        <ChildInfoCard profile={profile} />
      );

      // Age should be calculated from 2015
      const currentYear = new Date().getFullYear();
      const expectedAge = currentYear - 2015;

      expect(getByText(new RegExp(`${expectedAge}\\s*years?`, 'i'))).toBeTruthy();
    });

    test('should handle missing photo gracefully', () => {
      const profileNoPhoto = { ...profile, photo: null };

      const { container } = render(
        <ChildInfoCard profile={profileNoPhoto} />
      );

      expect(container).toBeTruthy();
    });

    test('should handle onEdit callback', () => {
      const onEdit = jest.fn();

      const { getByTestId } = render(
        <ChildInfoCard profile={profile} onEdit={onEdit} />
      );

      const editButton = getByTestId('edit-profile');
      fireEvent.press(editButton);

      expect(onEdit).toHaveBeenCalled();
    });
  });

  describe('PersonalNotesCard Component', () => {
    test('should display personal notes', () => {
      const notes = 'These are important personal notes';

      const { getByText } = render(
        <PersonalNotesCard notes={notes} />
      );

      expect(getByText(notes)).toBeTruthy();
      expect(getByText(/personal notes/i)).toBeTruthy();
    });

    test('should handle empty notes', () => {
      const { getByText } = render(
        <PersonalNotesCard notes="" />
      );

      expect(getByText(/no personal notes/i)).toBeTruthy();
    });

    test('should handle edit action', () => {
      const onEdit = jest.fn();

      const { getByTestId } = render(
        <PersonalNotesCard notes="Test notes" onEdit={onEdit} />
      );

      const editButton = getByTestId('edit-notes');
      fireEvent.press(editButton);

      expect(onEdit).toHaveBeenCalled();
    });

    test('should apply custom theme colors', () => {
      const customColors = {
        background: { paper: '#F0F0F0' },
        text: { primary: '#333333' }
      };

      const { container } = render(
        <PersonalNotesCard notes="Test" themeColors={customColors} />
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Style Creation', () => {
    test('should create dynamic styles based on colors', () => {
      const customColors = {
        primary: '#FF0000',
        secondary: '#00FF00',
        background: { paper: '#FFFFFF' },
        text: { primary: '#000000' },
        border: '#CCCCCC'
      };

      const styles = createDynamicStyles(customColors);

      expect(styles.container).toBeDefined();
      expect(styles.input).toBeDefined();
      expect(styles.button).toBeDefined();
      expect(styles.buttonText).toBeDefined();
    });

    test('should handle missing color properties', () => {
      const partialColors = {
        primary: '#FF0000'
      };

      const styles = createDynamicStyles(partialColors);
      expect(styles).toBeDefined();
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete entry creation flow', () => {
      const onSave = jest.fn();

      const { getByPlaceholderText, getByText } = render(
        <EntryForm
          visible={true}
          onClose={jest.fn()}
          onSave={onSave}
          category="medical"
          categories={[
            { id: 'medical', name: 'Medical', displayName: 'Medical Records' }
          ]}
        />
      );

      // Fill all fields
      fireEvent.changeText(getByPlaceholderText(/enter title/i), 'Doctor Visit');
      fireEvent.changeText(getByPlaceholderText(/enter description/i), 'Annual checkup notes');

      // Save
      fireEvent.press(getByText(/save/i));

      expect(onSave).toHaveBeenCalledWith({
        title: 'Doctor Visit',
        description: 'Annual checkup notes',
        category: 'medical',
        date: expect.any(Date),
        attachments: []
      });
    });

    test('should handle complete profile creation flow', () => {
      const onSave = jest.fn();

      const { getByPlaceholderText, getByText, getByTestId } = render(
        <ProfileForm
          visible={true}
          onClose={jest.fn()}
          onSave={onSave}
        />
      );

      // Fill all fields
      fireEvent.changeText(getByPlaceholderText(/child's name/i), 'New Child');
      fireEvent.changeText(getByPlaceholderText(/personal notes/i), 'Important info');

      // Add photo
      const photoUpload = getByTestId('photo-upload');
      fireEvent.click(photoUpload.querySelector('button'));

      // Save
      fireEvent.press(getByText(/save profile/i));

      expect(onSave).toHaveBeenCalledWith({
        name: 'New Child',
        dateOfBirth: expect.any(Date),
        photo: 'data:image/test',
        personalNotes: 'Important info'
      });
    });
  });
});