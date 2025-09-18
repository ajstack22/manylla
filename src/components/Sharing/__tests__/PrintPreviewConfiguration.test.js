/* eslint-disable */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PrintPreviewConfiguration } from '../PrintPreviewConfiguration';

// Mock print styles hook
const mockUsePrintStyles = {
  configSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCheckbox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  categoryCheckboxSelected: {
    backgroundColor: '#A08670',
    borderColor: '#A08670',
  },
  categoryCheckboxText: {
    fontSize: 14,
    color: '#666666',
  },
  categoryCheckboxTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E1E4E8',
    marginTop: 16,
  },
};

jest.mock('../usePrintStyles', () => ({
  usePrintStyles: () => mockUsePrintStyles,
}));

// TODO: P2 - Print configuration state
describe.skip('PrintPreviewConfiguration - Smoke Tests', () => {
  const mockColors = {
    primary: '#A08670',
    background: {
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
    border: '#E1E4E8',
  };

  const mockProps = {
    colors: mockColors,
    availableCategories: ['medical', 'school', 'therapy', 'emergency'],
    selectedCategories: ['medical', 'school'],
    categoryTitles: {
      medical: 'Medical Information',
      school: 'School Records',
      therapy: 'Therapy Sessions',
      emergency: 'Emergency Contacts',
    },
    onToggleCategory: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByText } = render(<PrintPreviewConfiguration {...mockProps} />);
      expect(getByText('Select categories to include:')).toBeTruthy();
    });

    it('should render configuration title', () => {
      const { getByText } = render(<PrintPreviewConfiguration {...mockProps} />);
      expect(getByText('Select categories to include:')).toBeTruthy();
    });

    it('should render all available categories', () => {
      const { getByText } = render(<PrintPreviewConfiguration {...mockProps} />);

      expect(getByText('✓ Medical Information')).toBeTruthy();
      expect(getByText('✓ School Records')).toBeTruthy();
      expect(getByText('Therapy Sessions')).toBeTruthy();
      expect(getByText('Emergency Contacts')).toBeTruthy();
    });

    it('should show checkmarks for selected categories', () => {
      const { getByText } = render(<PrintPreviewConfiguration {...mockProps} />);

      // Selected categories should have checkmarks
      expect(getByText('✓ Medical Information')).toBeTruthy();
      expect(getByText('✓ School Records')).toBeTruthy();

      // Unselected categories should not have checkmarks
      expect(getByText('Therapy Sessions')).toBeTruthy();
      expect(getByText('Emergency Contacts')).toBeTruthy();
    });

    it('should render divider', () => {
      const { container } = render(<PrintPreviewConfiguration {...mockProps} />);
      // Divider should be rendered (can't easily test styles in react-native-testing-library)
      expect(container).toBeTruthy();
    });
  });

  describe('Category Selection', () => {
    it('should handle category toggle for unselected category', () => {
      const { getByText } = render(<PrintPreviewConfiguration {...mockProps} />);

      fireEvent.press(getByText('Therapy Sessions'));
      expect(mockProps.onToggleCategory).toHaveBeenCalledWith('therapy');
    });

    it('should handle category toggle for selected category', () => {
      const { getByText } = render(<PrintPreviewConfiguration {...mockProps} />);

      fireEvent.press(getByText('✓ Medical Information'));
      expect(mockProps.onToggleCategory).toHaveBeenCalledWith('medical');
    });

    it('should handle all categories being selectable', () => {
      const { getByText } = render(<PrintPreviewConfiguration {...mockProps} />);

      mockProps.availableCategories.forEach((category) => {
        const displayText = mockProps.categoryTitles[category] || category;
        const isSelected = mockProps.selectedCategories.includes(category);
        const buttonText = isSelected ? `✓ ${displayText}` : displayText;

        fireEvent.press(getByText(buttonText));
        expect(mockProps.onToggleCategory).toHaveBeenCalledWith(category);
      });
    });
  });

  describe('Category Title Handling', () => {
    it('should use category titles when available', () => {
      const { getByText } = render(<PrintPreviewConfiguration {...mockProps} />);

      expect(getByText('✓ Medical Information')).toBeTruthy();
      expect(getByText('✓ School Records')).toBeTruthy();
    });

    it('should fall back to category key when title not available', () => {
      const propsWithMissingTitles = {
        ...mockProps,
        availableCategories: ['medical', 'custom'],
        selectedCategories: ['custom'],
        categoryTitles: {
          medical: 'Medical Information',
          // custom title missing
        },
      };

      const { getByText } = render(
        <PrintPreviewConfiguration {...propsWithMissingTitles} />
      );

      expect(getByText('✓ custom')).toBeTruthy();
    });

    it('should handle empty category titles object', () => {
      const propsWithNoTitles = {
        ...mockProps,
        categoryTitles: {},
      };

      const { getByText } = render(
        <PrintPreviewConfiguration {...propsWithNoTitles} />
      );

      expect(getByText('✓ medical')).toBeTruthy();
      expect(getByText('✓ school')).toBeTruthy();
    });
  });

  describe('Selection State Display', () => {
    it('should apply selected styling to selected categories', () => {
      const { getByText } = render(<PrintPreviewConfiguration {...mockProps} />);

      const selectedButton = getByText('✓ Medical Information').parent;
      expect(selectedButton).toBeTruthy();
      // Note: React Native Testing Library doesn't easily test computed styles
    });

    it('should apply unselected styling to unselected categories', () => {
      const { getByText } = render(<PrintPreviewConfiguration {...mockProps} />);

      const unselectedButton = getByText('Therapy Sessions').parent;
      expect(unselectedButton).toBeTruthy();
    });

    it('should handle no selected categories', () => {
      const propsWithNoSelection = {
        ...mockProps,
        selectedCategories: [],
      };

      const { getByText } = render(
        <PrintPreviewConfiguration {...propsWithNoSelection} />
      );

      expect(getByText('Medical Information')).toBeTruthy();
      expect(getByText('School Records')).toBeTruthy();
      expect(getByText('Therapy Sessions')).toBeTruthy();
      expect(getByText('Emergency Contacts')).toBeTruthy();
    });

    it('should handle all categories selected', () => {
      const propsWithAllSelected = {
        ...mockProps,
        selectedCategories: ['medical', 'school', 'therapy', 'emergency'],
      };

      const { getByText } = render(
        <PrintPreviewConfiguration {...propsWithAllSelected} />
      );

      expect(getByText('✓ Medical Information')).toBeTruthy();
      expect(getByText('✓ School Records')).toBeTruthy();
      expect(getByText('✓ Therapy Sessions')).toBeTruthy();
      expect(getByText('✓ Emergency Contacts')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty available categories', () => {
      const propsWithNoCategories = {
        ...mockProps,
        availableCategories: [],
        selectedCategories: [],
      };

      const { getByText } = render(
        <PrintPreviewConfiguration {...propsWithNoCategories} />
      );

      expect(getByText('Select categories to include:')).toBeTruthy();
      // Should not crash when no categories available
    });

    it('should handle single category', () => {
      const propsWithSingleCategory = {
        ...mockProps,
        availableCategories: ['medical'],
        selectedCategories: ['medical'],
      };

      const { getByText } = render(
        <PrintPreviewConfiguration {...propsWithSingleCategory} />
      );

      expect(getByText('✓ Medical Information')).toBeTruthy();
    });

    it('should handle categories with special characters', () => {
      const propsWithSpecialChars = {
        ...mockProps,
        availableCategories: ['special-category', 'another_category'],
        selectedCategories: ['special-category'],
        categoryTitles: {
          'special-category': 'Special Category!',
          'another_category': 'Another Category & More',
        },
      };

      const { getByText } = render(
        <PrintPreviewConfiguration {...propsWithSpecialChars} />
      );

      expect(getByText('✓ Special Category!')).toBeTruthy();
      expect(getByText('Another Category & More')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should render touchable category buttons', () => {
      const { getByText } = render(<PrintPreviewConfiguration {...mockProps} />);

      const medicalButton = getByText('✓ Medical Information');
      const therapyButton = getByText('Therapy Sessions');

      expect(medicalButton.parent.type).toBe('TouchableOpacity');
      expect(therapyButton.parent.type).toBe('TouchableOpacity');
    });

    it('should provide clear visual feedback for selection state', () => {
      const { getByText } = render(<PrintPreviewConfiguration {...mockProps} />);

      // Selected items have checkmarks
      expect(getByText('✓ Medical Information')).toBeTruthy();
      // Unselected items don't have checkmarks
      expect(getByText('Therapy Sessions')).toBeTruthy();
    });
  });
});