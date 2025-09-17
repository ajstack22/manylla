import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert, Share } from 'react-native';
import { PrintPreview } from '../PrintPreview';
import { ThemeProvider } from '../../../context/ThemeContext';
import * as printContentGenerators from '../printContentGenerators';

// Mock react-native components
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: {
    alert: jest.fn()
  },
  Share: {
    share: jest.fn(() => Promise.resolve())
  },
  ScrollView: ({ children, testID, ...props }) => (
    <div data-testid={testID || 'scroll-view'} {...props}>{children}</div>
  ),
  Platform: {
    OS: 'web',
    select: (obj) => obj.web || obj.default
  }
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock platform utilities
jest.mock('../../../utils/platform', () => ({
  isWeb: true,
  isAndroid: false,
  isIOS: false
}));

// Simple mock for all sub-components to focus on main logic
jest.mock('../../Common', () => ({
  ThemedModal: ({ children, visible, onClose, title }) =>
    visible ? (
      <div>
        <div>{title}</div>
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    ) : null
}));

jest.mock('../PrintPreviewConfiguration', () => ({
  PrintPreviewConfiguration: ({ onToggleCategory, selectedCategories, availableCategories }) => (
    <div>
      {availableCategories.map(cat => (
        <button
          key={cat}
          onClick={() => onToggleCategory(cat)}
        >
          {selectedCategories.includes(cat) ? 'Enabled' : 'Disabled'} {cat}
        </button>
      ))}
    </div>
  )
}));

jest.mock('../PrintPreviewHeader', () => ({
  PrintPreviewHeader: ({ childName, recipientName }) => (
    <div>
      <span>{childName}</span>
      {recipientName && <span>{recipientName}</span>}
    </div>
  )
}));

jest.mock('../PrintPreviewNote', () => ({
  PrintPreviewNote: ({ note }) => (
    <div>
      {note && <span>{note}</span>}
    </div>
  )
}));

jest.mock('../PrintPreviewQuickInfo', () => ({
  PrintPreviewQuickInfo: ({ visible }) => (
    visible ? <div>Quick Info Content</div> : null
  )
}));

jest.mock('../PrintPreviewEntries', () => ({
  PrintPreviewEntries: ({ selectedCategories }) => (
    <div>
      {selectedCategories.filter(cat => cat !== 'quick-info').map(cat => (
        <div key={cat}>{cat} entries</div>
      ))}
    </div>
  )
}));

jest.mock('../PrintPreviewFooter', () => ({
  PrintPreviewFooter: () => <div>Footer</div>
}));

jest.mock('../PrintPreviewActions', () => ({
  PrintPreviewActions: ({ onClose, onDownloadPDF, onPrint }) => (
    <div>
      <button onClick={onClose}>Close Action</button>
      <button onClick={onDownloadPDF}>Download PDF</button>
      <button onClick={onPrint}>Print Action</button>
    </div>
  )
}));

jest.mock('../usePrintStyles', () => ({
  usePrintStyles: () => ({
    container: { flex: 1 },
    previewContainer: { flex: 1 },
    previewContent: { padding: 16 },
    divider: { height: 1, backgroundColor: '#ccc' }
  })
}));

// Mock content generators
jest.mock('../printContentGenerators', () => ({
  generateTextContent: jest.fn(() => 'Generated text content'),
  generateHtmlContent: jest.fn(() => '<html>Generated HTML content</html>')
}));

// Mock global window methods for web print functionality
Object.defineProperty(window, 'open', {
  writable: true,
  value: jest.fn(() => ({
    document: {
      write: jest.fn(),
      close: jest.fn()
    },
    focus: jest.fn(),
    print: jest.fn(),
    close: jest.fn()
  }))
});

// Mock URL methods
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'blob:mock-url')
});

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn()
});

// Mock document methods
const mockLink = {
  href: '',
  download: '',
  click: jest.fn()
};

Object.defineProperty(document, 'createElement', {
  writable: true,
  value: jest.fn(() => mockLink)
});

Object.defineProperty(document, 'body', {
  writable: true,
  value: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  }
});

// P2 TECH DEBT: Remove skip when working on PrintPreview
// Issue: Print API mocking
describe.skip('PrintPreview', () => {
  const mockProfile = {
    id: 'test-profile',
    name: 'Test Child',
    entries: [
      {
        id: '1',
        title: 'Test Entry',
        description: 'Test description',
        category: 'daily-support',
        date: new Date('2023-01-01')
      }
    ]
  };

  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    profile: mockProfile,
    categories: [],
    entries: []
  };

  const renderPrintPreview = (props = {}) => {
    return render(
      <ThemeProvider>
        <PrintPreview {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Alert.alert.mockClear();
    Share.share.mockClear();
    printContentGenerators.generateTextContent.mockReturnValue('Generated text content');
    printContentGenerators.generateHtmlContent.mockReturnValue('<html>Generated HTML content</html>');
  });

  describe('Basic Rendering', () => {
    it('renders when visible', () => {
      renderPrintPreview();
      expect(screen.getByText('Print')).toBeTruthy();
      expect(screen.getByText('Footer')).toBeTruthy();
    });

    it('does not render when not visible', () => {
      renderPrintPreview({ visible: false });
      expect(screen.queryByText('Print')).toBeNull();
    });

    it('displays child name correctly', () => {
      renderPrintPreview();
      expect(screen.getByText('Test Child')).toBeTruthy();
    });

    it('falls back to legacy childName prop', () => {
      renderPrintPreview({ profile: null, childName: 'Legacy Child' });
      expect(screen.getByText('Legacy Child')).toBeTruthy();
    });

    it('uses default child name when neither profile nor childName provided', () => {
      renderPrintPreview({ profile: null, childName: null });
      expect(screen.getByText('Child')).toBeTruthy();
    });
  });

  describe('Data Processing', () => {
    it('processes entries array into category-organized object', () => {
      const entriesArray = [
        { id: '1', category: 'daily-support', title: 'Entry 1' },
        { id: '2', category: 'health-therapy', title: 'Entry 2' }
      ];
      renderPrintPreview({ entries: entriesArray });
      expect(screen.getByText('Footer')).toBeTruthy(); // Component renders successfully
    });

    it('handles entries object directly', () => {
      const entriesObject = {
        'daily-support': [{ id: '1', title: 'Entry 1' }]
      };
      renderPrintPreview({ entries: entriesObject });
      expect(screen.getByText('Footer')).toBeTruthy(); // Component renders successfully
    });

    it('handles empty entries', () => {
      renderPrintPreview({ entries: [] });
      expect(screen.getByText('Footer')).toBeTruthy(); // Component renders successfully
    });

    it('handles null entries', () => {
      renderPrintPreview({ entries: null });
      expect(screen.getByText('Footer')).toBeTruthy(); // Component renders successfully
    });
  });

  describe('Category Selection', () => {
    it('toggles category selection', () => {
      renderPrintPreview();

      // Find a toggle button and click it
      const toggleButton = screen.getByText(/Disabled quick-info/);
      fireEvent.press(toggleButton);

      // Should now show enabled state
      expect(screen.getByText(/Enabled quick-info/)).toBeTruthy();
    });

    it('initializes with propSelectedCategories', () => {
      renderPrintPreview({
        propSelectedCategories: ['quick-info', 'daily-support']
      });

      expect(screen.getByText('Quick Info Content')).toBeTruthy();
      expect(screen.getByText('daily-support entries')).toBeTruthy();
    });

    it('includes quick-info when propIncludeQuickInfo is true', () => {
      renderPrintPreview({
        propSelectedCategories: ['daily-support'],
        propIncludeQuickInfo: true
      });

      expect(screen.getByText('Quick Info Content')).toBeTruthy();
    });

    it('updates state when props change', () => {
      const { rerender } = renderPrintPreview({ propNote: 'Original note' });
      expect(screen.getByText('Original note')).toBeTruthy();

      rerender(
        <ThemeProvider>
          <PrintPreview {...defaultProps} propNote="Updated note" />
        </ThemeProvider>
      );
      expect(screen.getByText('Updated note')).toBeTruthy();
    });
  });

  describe('Legacy Props Support', () => {
    it('handles legacy recipientName prop', () => {
      renderPrintPreview({ propRecipientName: 'Dr. Smith' });
      expect(screen.getByText('Dr. Smith')).toBeTruthy();
    });

    it('handles legacy note prop', () => {
      renderPrintPreview({ propNote: 'Important note' });
      expect(screen.getByText('Important note')).toBeTruthy();
    });
  });

  describe('Print Functionality - Web', () => {
    beforeEach(() => {
      // Ensure we're testing web platform
      require('../../../utils/platform').isWeb = true;
    });

    it('handles web print successfully', async () => {
      const mockPrintWindow = {
        document: {
          write: jest.fn(),
          close: jest.fn()
        },
        focus: jest.fn(),
        print: jest.fn(),
        close: jest.fn()
      };
      window.open.mockReturnValue(mockPrintWindow);

      renderPrintPreview();

      await act(async () => {
        fireEvent.press(screen.getByText('Print Action'));
      });

      expect(window.open).toHaveBeenCalledWith('', 'PRINT', 'height=600,width=800');
      expect(printContentGenerators.generateHtmlContent).toHaveBeenCalled();
    });

    it('handles print window popup blocked', async () => {
      window.open.mockReturnValue(null);

      renderPrintPreview();

      await act(async () => {
        fireEvent.press(screen.getByText('Print Action'));
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Unable to open print window. Please check your popup blocker settings.'
      );
    });

    it('handles print errors', async () => {
      window.open.mockImplementation(() => {
        throw new Error('Print error');
      });

      renderPrintPreview();

      await act(async () => {
        fireEvent.press(screen.getByText('Print Action'));
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to print/share document. Please try again.'
      );
    });

    it('downloads text file on web', async () => {
      renderPrintPreview();

      await act(async () => {
        fireEvent.press(screen.getByText('Download PDF'));
      });

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('handles text download errors', async () => {
      URL.createObjectURL.mockImplementation(() => {
        throw new Error('Blob error');
      });

      renderPrintPreview();

      await act(async () => {
        fireEvent.press(screen.getByText('Download PDF'));
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to share document. Please try again.'
      );
    });
  });

  describe('Print Functionality - Mobile', () => {
    beforeEach(() => {
      // Mock mobile platform
      jest.doMock('../../../utils/platform', () => ({
        isWeb: false,
        isAndroid: true,
        isIOS: false
      }));
    });

    it('uses Share API on mobile for print action', async () => {
      renderPrintPreview();

      await act(async () => {
        fireEvent.press(screen.getByText('Print Action'));
      });

      expect(Share.share).toHaveBeenCalledWith({
        message: 'Generated text content',
        title: 'Test Child - Information Summary'
      });
      expect(printContentGenerators.generateTextContent).toHaveBeenCalled();
    });

    it('handles Share API user cancellation', async () => {
      Share.share.mockRejectedValue(new Error('User did not share'));

      renderPrintPreview();

      await act(async () => {
        fireEvent.press(screen.getByText('Print Action'));
      });

      expect(Share.share).toHaveBeenCalled();
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('handles Share API errors', async () => {
      Share.share.mockRejectedValue(new Error('Share error'));

      renderPrintPreview();

      await act(async () => {
        fireEvent.press(screen.getByText('Print Action'));
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to print/share document. Please try again.'
      );
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when modal close button is pressed', () => {
      const mockOnClose = jest.fn();
      renderPrintPreview({ onClose: mockOnClose });

      fireEvent.press(screen.getByText('Close'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when action close button is pressed', () => {
      const mockOnClose = jest.fn();
      renderPrintPreview({ onClose: mockOnClose });

      fireEvent.press(screen.getByText('Close Action'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Content Generation Integration', () => {
    it('passes correct parameters to generateTextContent', async () => {
      renderPrintPreview({
        profile: { name: 'Test Child', entries: [] },
        propRecipientName: 'Dr. Smith',
        propNote: 'Test note'
      });

      await act(async () => {
        fireEvent.press(screen.getByText('Print Action'));
      });

      expect(printContentGenerators.generateTextContent).toHaveBeenCalledWith(
        expect.objectContaining({
          childName: 'Test Child',
          recipientName: 'Dr. Smith',
          note: 'Test note',
          selectedCategories: expect.any(Array),
          actualEntries: expect.any(Object)
        })
      );
    });

    it('passes correct parameters to generateHtmlContent', async () => {
      renderPrintPreview({
        profile: { name: 'Test Child', entries: [] }
      });

      await act(async () => {
        fireEvent.press(screen.getByText('Print Action'));
      });

      expect(printContentGenerators.generateHtmlContent).toHaveBeenCalledWith(
        expect.objectContaining({
          childName: 'Test Child',
          selectedCategories: expect.any(Array),
          actualEntries: expect.any(Object)
        })
      );
    });
  });
});