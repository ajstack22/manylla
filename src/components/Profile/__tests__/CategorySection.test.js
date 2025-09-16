/**
 * CategorySection.test.js
 * Comprehensive tests for CategorySection component
 * Target: 75% coverage
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CategorySection } from '../CategorySection';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock dependencies
jest.mock('../../../utils/platformStyles', () => ({
  getShadowStyle: jest.fn(() => ({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: 'white',
  })),
}));

jest.mock('../../Common/IconProvider', () => {
  return {
    __esModule: true,
    default: ({ name, size, color, style, ...props }) => (
      <span
        data-testid={`icon-${name}`}
        style={{ fontSize: size, color, ...style }}
        {...props}
      >
        {name}
      </span>
    ),
  };
});

jest.mock('../../Forms/HtmlRenderer', () => ({
  HtmlRenderer: ({ content, variant }) => (
    <div data-testid={`html-renderer-${variant}`}>{content}</div>
  ),
}));

// Test wrapper with theme context
const TestWrapper = ({ children, themeMode = 'light' }) => (
  <ThemeProvider initialThemeMode={themeMode}>
    {children}
  </ThemeProvider>
);

// Mock data
const mockEntries = [
  {
    id: '1',
    title: 'Entry 1 Title',
    description: 'Entry 1 Description',
    updatedAt: '2023-01-01T12:00:00Z',
  },
  {
    id: '2',
    title: 'Entry 2 Title <strong>with HTML</strong>',
    description: 'Entry 2 Description with <em>formatting</em>',
    date: '2023-01-02T12:00:00Z', // Test fallback to date field
  },
];

const defaultProps = {
  title: 'Test Category',
  entries: [],
  color: '#8B6F47',
  icon: 'Label',
  categoryId: 'test-category',
  isFirst: false,
  isLast: false,
  isQuickInfo: false,
  onMoveUp: jest.fn(),
  onMoveDown: jest.fn(),
  onAddEntry: jest.fn(),
  onEditEntry: jest.fn(),
  onDeleteEntry: jest.fn(),
};

describe('CategorySection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with basic props', () => {
      render(
        <TestWrapper>
          <CategorySection {...defaultProps} entries={mockEntries} />
        </TestWrapper>
      );

      expect(screen.getByText('Test Category')).toBeInTheDocument();
      expect(screen.getByTestId('icon-Label')).toBeInTheDocument();
    });

    it('renders category icon with correct props', () => {
      render(
        <TestWrapper>
          <CategorySection {...defaultProps} entries={mockEntries} />
        </TestWrapper>
      );

      const icon = screen.getByTestId('icon-Label');
      expect(icon).toHaveStyle({ color: '#8B6F47' });
    });

    it('applies theme colors correctly', () => {
      render(
        <TestWrapper themeMode="dark">
          <CategorySection {...defaultProps} entries={mockEntries} />
        </TestWrapper>
      );

      expect(screen.getByText('Test Category')).toBeInTheDocument();
    });
  });

  describe('Empty State Handling', () => {
    it('returns null for empty non-QuickInfo categories', () => {
      const { container } = render(
        <TestWrapper>
          <CategorySection {...defaultProps} entries={[]} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeNull();
    });

    it('returns null for undefined entries on non-QuickInfo categories', () => {
      const { container } = render(
        <TestWrapper>
          <CategorySection {...defaultProps} entries={undefined} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders empty QuickInfo category', () => {
      render(
        <TestWrapper>
          <CategorySection
            {...defaultProps}
            entries={[]}
            isQuickInfo={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Test Category')).toBeInTheDocument();
      expect(screen.getByText('No test category added yet.')).toBeInTheDocument();
    });

    it('shows empty message for categories with empty entries', () => {
      render(
        <TestWrapper>
          <CategorySection
            {...defaultProps}
            entries={[]}
            isQuickInfo={true}
            title="Medical Information"
          />
        </TestWrapper>
      );

      expect(screen.getByText('No medical information added yet.')).toBeInTheDocument();
    });
  });

  describe('Entry Rendering', () => {
    it('renders entries with correct content', () => {
      render(
        <TestWrapper>
          <CategorySection {...defaultProps} entries={mockEntries} />
        </TestWrapper>
      );

      const titleRenderers = screen.getAllByTestId('html-renderer-h6');
      const descriptionRenderers = screen.getAllByTestId('html-renderer-body2');

      expect(titleRenderers[0]).toHaveTextContent('Entry 1 Title');
      expect(descriptionRenderers[0]).toHaveTextContent('Entry 1 Description');
    });

    it('formats dates correctly', () => {
      render(
        <TestWrapper>
          <CategorySection {...defaultProps} entries={mockEntries} />
        </TestWrapper>
      );

      // Check for formatted dates
      expect(screen.getByText('Jan 1, 2023')).toBeInTheDocument();
      expect(screen.getByText('Jan 2, 2023')).toBeInTheDocument();
    });

    it('uses date field as fallback when updatedAt is not available', () => {
      const entryWithDateOnly = [{
        id: '3',
        title: 'Test Entry',
        description: 'Test Description',
        date: '2023-12-25T12:00:00Z',
      }];

      render(
        <TestWrapper>
          <CategorySection {...defaultProps} entries={entryWithDateOnly} />
        </TestWrapper>
      );

      expect(screen.getByText('Dec 25, 2023')).toBeInTheDocument();
    });

    it('renders multiple entries correctly', () => {
      render(
        <TestWrapper>
          <CategorySection {...defaultProps} entries={mockEntries} />
        </TestWrapper>
      );

      const titleRenderers = screen.getAllByTestId('html-renderer-h6');
      const descriptionRenderers = screen.getAllByTestId('html-renderer-body2');

      expect(titleRenderers).toHaveLength(2);
      expect(descriptionRenderers).toHaveLength(2);
    });
  });

  describe('Action Buttons', () => {
    it('renders edit button when onEditEntry is provided', () => {
      render(
        <TestWrapper>
          <CategorySection {...defaultProps} entries={mockEntries} />
        </TestWrapper>
      );

      const editButtons = screen.getAllByText('✏️');
      expect(editButtons).toHaveLength(2); // One for each entry
    });

    it('renders delete button when onDeleteEntry is provided', () => {
      render(
        <TestWrapper>
          <CategorySection {...defaultProps} entries={mockEntries} />
        </TestWrapper>
      );

      const deleteButtons = screen.getAllByText('🗑️');
      expect(deleteButtons).toHaveLength(2); // One for each entry
    });

    it('does not render edit button when onEditEntry is not provided', () => {
      render(
        <TestWrapper>
          <CategorySection
            {...defaultProps}
            entries={mockEntries}
            onEditEntry={undefined}
          />
        </TestWrapper>
      );

      expect(screen.queryByText('✏️')).not.toBeInTheDocument();
    });

    it('does not render delete button when onDeleteEntry is not provided', () => {
      render(
        <TestWrapper>
          <CategorySection
            {...defaultProps}
            entries={mockEntries}
            onDeleteEntry={undefined}
          />
        </TestWrapper>
      );

      expect(screen.queryByText('🗑️')).not.toBeInTheDocument();
    });

    it('calls onEditEntry with correct entry when edit button is clicked', () => {
      const mockOnEditEntry = jest.fn();

      render(
        <TestWrapper>
          <CategorySection
            {...defaultProps}
            entries={mockEntries}
            onEditEntry={mockOnEditEntry}
          />
        </TestWrapper>
      );

      const editButtons = screen.getAllByText('✏️');
      fireEvent.click(editButtons[0]);

      expect(mockOnEditEntry).toHaveBeenCalledWith(mockEntries[0]);
    });

    it('calls onDeleteEntry with correct entry ID when delete button is clicked', () => {
      const mockOnDeleteEntry = jest.fn();

      render(
        <TestWrapper>
          <CategorySection
            {...defaultProps}
            entries={mockEntries}
            onDeleteEntry={mockOnDeleteEntry}
          />
        </TestWrapper>
      );

      const deleteButtons = screen.getAllByText('🗑️');
      fireEvent.click(deleteButtons[0]);

      expect(mockOnDeleteEntry).toHaveBeenCalledWith('1');
    });
  });

  describe('Reorder Controls', () => {
    it('renders reorder controls for non-QuickInfo categories', () => {
      render(
        <TestWrapper>
          <CategorySection {...defaultProps} entries={mockEntries} />
        </TestWrapper>
      );

      expect(screen.getByText('↑')).toBeInTheDocument();
      expect(screen.getByText('↓')).toBeInTheDocument();
    });

    it('does not render reorder controls for QuickInfo categories', () => {
      render(
        <TestWrapper>
          <CategorySection
            {...defaultProps}
            entries={mockEntries}
            isQuickInfo={true}
          />
        </TestWrapper>
      );

      expect(screen.queryByText('↑')).not.toBeInTheDocument();
      expect(screen.queryByText('↓')).not.toBeInTheDocument();
    });

    it('disables move up button when isFirst is true', () => {
      render(
        <TestWrapper>
          <CategorySection
            {...defaultProps}
            entries={mockEntries}
            isFirst={true}
          />
        </TestWrapper>
      );

      const moveUpButton = screen.getByLabelText('Move Test Category up');
      expect(moveUpButton).toBeDisabled();
    });

    it('disables move down button when isLast is true', () => {
      render(
        <TestWrapper>
          <CategorySection
            {...defaultProps}
            entries={mockEntries}
            isLast={true}
          />
        </TestWrapper>
      );

      const moveDownButton = screen.getByLabelText('Move Test Category down');
      expect(moveDownButton).toBeDisabled();
    });

    it('calls onMoveUp when move up button is clicked', () => {
      const mockOnMoveUp = jest.fn();

      render(
        <TestWrapper>
          <CategorySection
            {...defaultProps}
            entries={mockEntries}
            onMoveUp={mockOnMoveUp}
          />
        </TestWrapper>
      );

      const moveUpButton = screen.getByLabelText('Move Test Category up');
      fireEvent.click(moveUpButton);

      expect(mockOnMoveUp).toHaveBeenCalled();
    });

    it('calls onMoveDown when move down button is clicked', () => {
      const mockOnMoveDown = jest.fn();

      render(
        <TestWrapper>
          <CategorySection
            {...defaultProps}
            entries={mockEntries}
            onMoveDown={mockOnMoveDown}
          />
        </TestWrapper>
      );

      const moveDownButton = screen.getByLabelText('Move Test Category down');
      fireEvent.click(moveDownButton);

      expect(mockOnMoveDown).toHaveBeenCalled();
    });
  });

  describe('Icon Helper Function', () => {
    it('always returns Label icon regardless of category title', () => {
      // Test different category titles to ensure they all get Label icon
      const categories = [
        'Medical Information',
        'Behavior',
        'Diet',
        'Education',
        'Random Category',
      ];

      categories.forEach(title => {
        const { unmount } = render(
          <TestWrapper>
            <CategorySection
              {...defaultProps}
              title={title}
              entries={mockEntries}
            />
          </TestWrapper>
        );

        expect(screen.getByTestId('icon-Label')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles entries with missing fields gracefully', () => {
      const incompleteEntry = [{
        id: '4',
        title: 'Minimal Entry',
        // Missing description and date fields
      }];

      render(
        <TestWrapper>
          <CategorySection {...defaultProps} entries={incompleteEntry} />
        </TestWrapper>
      );

      expect(screen.getByText('Minimal Entry')).toBeInTheDocument();
    });

    it('handles null color prop gracefully', () => {
      render(
        <TestWrapper>
          <CategorySection
            {...defaultProps}
            entries={mockEntries}
            color={null}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Test Category')).toBeInTheDocument();
    });

    it('handles long category titles', () => {
      const longTitle = 'This is a very long category title that might wrap to multiple lines';

      render(
        <TestWrapper>
          <CategorySection
            {...defaultProps}
            title={longTitle}
            entries={mockEntries}
          />
        </TestWrapper>
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles entries with HTML content in titles and descriptions', () => {
      const htmlEntry = [{
        id: '5',
        title: '<script>alert("xss")</script>Safe Title',
        description: '<strong>Bold</strong> description with <em>emphasis</em>',
        updatedAt: '2023-01-01T00:00:00Z',
      }];

      render(
        <TestWrapper>
          <CategorySection {...defaultProps} entries={htmlEntry} />
        </TestWrapper>
      );

      // Content should be passed to HtmlRenderer
      expect(screen.getByTestId('html-renderer-h6')).toHaveTextContent('<script>alert("xss")</script>Safe Title');
      expect(screen.getByTestId('html-renderer-body2')).toHaveTextContent('<strong>Bold</strong> description with <em>emphasis</em>');
    });
  });

  describe('Accessibility', () => {
    it('provides proper accessibility labels for reorder buttons', () => {
      render(
        <TestWrapper>
          <CategorySection
            {...defaultProps}
            title="Medical Information"
            entries={mockEntries}
          />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Move Medical Information up')).toBeInTheDocument();
      expect(screen.getByLabelText('Move Medical Information down')).toBeInTheDocument();
    });

    it('maintains accessibility when buttons are disabled', () => {
      render(
        <TestWrapper>
          <CategorySection
            {...defaultProps}
            entries={mockEntries}
            isFirst={true}
            isLast={true}
          />
        </TestWrapper>
      );

      const moveUpButton = screen.getByLabelText('Move Test Category up');
      const moveDownButton = screen.getByLabelText('Move Test Category down');

      expect(moveUpButton).toBeDisabled();
      expect(moveDownButton).toBeDisabled();
    });
  });
});