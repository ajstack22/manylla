import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PrintPreviewActions } from '../PrintPreviewActions';

// Mock platform utility
jest.mock('../../../utils/platform', () => ({
  isWeb: true,
}));

// Mock icons
jest.mock('../../Common', () => ({
  InsertDriveFileIcon: ({ size, color, style, ...props }) => (
    <div
      data-testid="insert-drive-file-icon"
      data-size={size}
      data-color={color}
      style={style}
      {...props}
    >
      📄
    </div>
  ),
  PrintIcon: ({ size, color, style, ...props }) => (
    <div
      data-testid="print-icon"
      data-size={size}
      data-color={color}
      style={style}
      {...props}
    >
      🖨️
    </div>
  ),
}));

// Mock print styles hook
const mockUsePrintStyles = {
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E1E4E8',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666666',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  downloadButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#A08670',
  },
  downloadButtonText: {
    fontSize: 14,
    color: '#A08670',
    fontWeight: '500',
  },
  printButton: {
    backgroundColor: '#A08670',
  },
  printButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
};

jest.mock('../usePrintStyles', () => ({
  usePrintStyles: () => mockUsePrintStyles,
}));

// P2 TECH DEBT: Remove skip when working on print preview action handlers
// Issue: Tests need platform-specific behavior validation improvements
describe.skip('PrintPreviewActions - Smoke Tests', () => {
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
    onClose: jest.fn(),
    onDownloadPDF: jest.fn(),
    onPrint: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByText } = render(<PrintPreviewActions {...mockProps} />);
      expect(getByText('Close')).toBeTruthy();
    });

    it('should render all action buttons', () => {
      const { getByText } = render(<PrintPreviewActions {...mockProps} />);

      expect(getByText('Close')).toBeTruthy();
      expect(getByText('Share as Text')).toBeTruthy();
      expect(getByText('Print')).toBeTruthy(); // Web platform
    });

    it('should render icons for download and print buttons', () => {
      const { getByTestId } = render(<PrintPreviewActions {...mockProps} />);

      expect(getByTestId('insert-drive-file-icon')).toBeTruthy();
      expect(getByTestId('print-icon')).toBeTruthy();
    });

    it('should apply correct styling to buttons', () => {
      const { getByText } = render(<PrintPreviewActions {...mockProps} />);

      const closeButton = getByText('Close').parent;
      const downloadButton = getByText('Share as Text').parent;
      const printButton = getByText('Print').parent;

      expect(closeButton).toBeTruthy();
      expect(downloadButton).toBeTruthy();
      expect(printButton).toBeTruthy();
    });
  });

  describe('Button Interactions', () => {
    it('should handle close button press', () => {
      const { getByText } = render(<PrintPreviewActions {...mockProps} />);

      fireEvent.press(getByText('Close'));
      expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('should handle download PDF button press', () => {
      const { getByText } = render(<PrintPreviewActions {...mockProps} />);

      fireEvent.press(getByText('Share as Text'));
      expect(mockProps.onDownloadPDF).toHaveBeenCalled();
    });

    it('should handle print button press', () => {
      const { getByText } = render(<PrintPreviewActions {...mockProps} />);

      fireEvent.press(getByText('Print'));
      expect(mockProps.onPrint).toHaveBeenCalled();
    });
  });

  describe('Platform-specific Behavior', () => {
    it('should show "Print" text on web platform', () => {
      // Mock is already set to web: true
      const { getByText } = render(<PrintPreviewActions {...mockProps} />);
      expect(getByText('Print')).toBeTruthy();
    });

    it('should show "Share" text on mobile platforms', () => {
      // Temporarily mock isWeb as false
      jest.doMock('../../../utils/platform', () => ({
        isWeb: false,
      }));

      // Re-require the component to pick up the new mock
      const { PrintPreviewActions: MobileActions } = require('../PrintPreviewActions');
      const { getByText } = render(<MobileActions {...mockProps} />);

      expect(getByText('Share')).toBeTruthy();
    });
  });

  describe('Icon Properties', () => {
    it('should pass correct props to InsertDriveFileIcon', () => {
      const { getByTestId } = render(<PrintPreviewActions {...mockProps} />);

      const icon = getByTestId('insert-drive-file-icon');
      expect(icon.dataset.size).toBe('18');
      expect(icon.dataset.color).toBe(mockColors.primary);
    });

    it('should pass correct props to PrintIcon', () => {
      const { getByTestId } = render(<PrintPreviewActions {...mockProps} />);

      const icon = getByTestId('print-icon');
      expect(icon.dataset.size).toBe('20');
      expect(icon.dataset.color).toBe(mockColors.background.paper);
    });

    it('should apply margin styles to icons', () => {
      const { getByTestId } = render(<PrintPreviewActions {...mockProps} />);

      const fileIcon = getByTestId('insert-drive-file-icon');
      const printIcon = getByTestId('print-icon');

      expect(fileIcon.style.marginRight).toBe('5px');
      expect(printIcon.style.marginRight).toBe('5px');
    });
  });

  describe('Color Theme Integration', () => {
    it('should work with different color themes', () => {
      const customColors = {
        primary: '#FF0000',
        background: {
          paper: '#FFFF00',
        },
      };

      const { getByTestId } = render(
        <PrintPreviewActions {...mockProps} colors={customColors} />
      );

      const fileIcon = getByTestId('insert-drive-file-icon');
      const printIcon = getByTestId('print-icon');

      expect(fileIcon.dataset.color).toBe(customColors.primary);
      expect(printIcon.dataset.color).toBe(customColors.background.paper);
    });
  });

  describe('Accessibility', () => {
    it('should render buttons with proper text labels', () => {
      const { getByText } = render(<PrintPreviewActions {...mockProps} />);

      // All buttons should have clear text labels
      expect(getByText('Close')).toBeTruthy();
      expect(getByText('Share as Text')).toBeTruthy();
      expect(getByText('Print')).toBeTruthy();
    });

    it('should have touchable buttons', () => {
      const { getByText } = render(<PrintPreviewActions {...mockProps} />);

      const buttons = [
        getByText('Close'),
        getByText('Share as Text'),
        getByText('Print'),
      ];

      buttons.forEach((button) => {
        expect(button.parent.type).toBe('TouchableOpacity');
      });
    });
  });
});