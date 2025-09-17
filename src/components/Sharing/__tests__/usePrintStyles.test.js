import { renderHook } from '@testing-library/react';
import { usePrintStyles } from '../usePrintStyles';

// Mock React Native StyleSheet
jest.mock('react-native', () => ({
  StyleSheet: {
    create: (styles) => styles,
  },
}));

describe('usePrintStyles', () => {
  const mockColors = {
    primary: '#A08670',
    background: {
      default: '#FDFBF7',
      paper: '#F4E4C1',
    },
    text: {
      primary: '#4A4A4A',
      secondary: '#666666',
    },
    border: '#E0E0E0',
  };

  test('returns styles object', () => {
    const { result } = renderHook(() => usePrintStyles(mockColors));

    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('object');
  });

  test('creates container styles with correct background', () => {
    const { result } = renderHook(() => usePrintStyles(mockColors));

    expect(result.current.container).toEqual({
      flex: 1,
      backgroundColor: mockColors.background.default,
    });
  });

  test('creates config section styles', () => {
    const { result } = renderHook(() => usePrintStyles(mockColors));

    expect(result.current.configSection).toEqual({
      backgroundColor: mockColors.background.paper,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: mockColors.border,
    });
  });

  test('creates text styles with theme colors', () => {
    const { result } = renderHook(() => usePrintStyles(mockColors));

    expect(result.current.configTitle).toEqual({
      fontSize: 16,
      fontWeight: 'bold',
      color: mockColors.text.primary,
      marginBottom: 15,
    });

    expect(result.current.configSubtitle).toEqual({
      fontSize: 14,
      fontWeight: '600',
      color: mockColors.text.secondary,
      marginTop: 15,
      marginBottom: 10,
    });
  });

  test('creates toggle row styles', () => {
    const { result } = renderHook(() => usePrintStyles(mockColors));

    expect(result.current.toggleRow).toEqual({
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    });

    expect(result.current.toggleLabel).toEqual({
      fontSize: 14,
      color: mockColors.text.primary,
      flex: 1,
    });
  });

  test('creates category checkbox styles', () => {
    const { result } = renderHook(() => usePrintStyles(mockColors));

    expect(result.current.categoryCheckbox).toEqual({
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: mockColors.border,
      backgroundColor: mockColors.background.default,
      marginRight: 8,
      marginBottom: 8,
    });

    expect(result.current.categoryCheckboxSelected).toEqual({
      backgroundColor: mockColors.primary,
      borderColor: mockColors.primary,
    });
  });

  test('creates category checkbox text styles', () => {
    const { result } = renderHook(() => usePrintStyles(mockColors));

    expect(result.current.categoryCheckboxText).toEqual({
      fontSize: 13,
      color: mockColors.text.primary,
    });

    expect(result.current.categoryCheckboxTextSelected).toEqual({
      color: mockColors.background.paper,
      fontWeight: '600',
    });
  });

  test('creates icon styles with primary color', () => {
    const { result } = renderHook(() => usePrintStyles(mockColors));

    expect(result.current.downloadIcon).toEqual({
      fontSize: 16,
      color: mockColors.primary,
      marginRight: 5,
    });

    expect(result.current.printIcon).toEqual({
      fontSize: 18,
      color: mockColors.background.paper,
      marginRight: 5,
    });
  });

  test('creates preview container styles', () => {
    const { result } = renderHook(() => usePrintStyles(mockColors));

    expect(result.current.previewContainer).toEqual({
      flex: 1,
      backgroundColor: mockColors.background.default,
    });

    expect(result.current.previewContent).toEqual({
      backgroundColor: mockColors.background.paper,
      margin: 60,
      padding: 40,
      borderRadius: 8,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    });
  });

  test('creates document header and title styles', () => {
    const { result } = renderHook(() => usePrintStyles(mockColors));

    expect(result.current.documentHeader).toEqual({
      alignItems: 'center',
      marginBottom: 4,
    });

    expect(result.current.documentTitle).toEqual({
      fontSize: 20,
      fontWeight: 'bold',
      color: mockColors.text.primary,
      textAlign: 'center',
      marginBottom: 8,
    });

    expect(result.current.documentSubtitle).toEqual({
      fontSize: 14,
      color: mockColors.text.secondary,
      textAlign: 'center',
    });
  });

  test('creates section and entry styles', () => {
    const { result } = renderHook(() => usePrintStyles(mockColors));

    expect(result.current.section).toEqual({
      marginBottom: 4,
    });

    expect(result.current.sectionTitle).toEqual({
      fontSize: 16,
      fontWeight: '600',
      color: mockColors.text.primary,
      marginBottom: 2,
    });

    expect(result.current.entry).toEqual({
      marginBottom: 2,
    });
  });

  test('creates button styles with theme colors', () => {
    const { result } = renderHook(() => usePrintStyles(mockColors));

    expect(result.current.button).toEqual({
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
      borderRadius: 8,
      gap: 8,
    });

    expect(result.current.printButton).toEqual({
      backgroundColor: mockColors.primary,
    });

    expect(result.current.printButtonText).toEqual({
      fontSize: 16,
      color: mockColors.background.paper,
      fontWeight: '600',
    });
  });

  test('adapts styles to different color schemes', () => {
    const darkColors = {
      primary: '#BB9A80',
      background: {
        default: '#121212',
        paper: '#1E1E1E',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#B0B0B0',
      },
      border: '#333333',
    };

    const { result } = renderHook(() => usePrintStyles(darkColors));

    expect(result.current.container.backgroundColor).toBe(darkColors.background.default);
    expect(result.current.configTitle.color).toBe(darkColors.text.primary);
    expect(result.current.printButton.backgroundColor).toBe(darkColors.primary);
  });

  test('handles all style properties correctly', () => {
    const { result } = renderHook(() => usePrintStyles(mockColors));

    // Test that all expected styles are present
    const expectedStyles = [
      'container', 'configSection', 'configTitle', 'configSubtitle', 'toggleRow',
      'toggleLabel', 'categoriesGrid', 'categoryCheckbox', 'categoryCheckboxSelected',
      'categoryCheckboxText', 'categoryCheckboxTextSelected', 'downloadIcon', 'printIcon',
      'previewContainer', 'previewContent', 'documentHeader', 'documentTitle',
      'documentSubtitle', 'divider', 'localNoteSection', 'localNoteText', 'section',
      'sectionTitle', 'categorySubtitle', 'quickInfoItems', 'quickInfoItem', 'bold',
      'entriesContainer', 'entry', 'entryTitle', 'entryDescription', 'documentFooter',
      'footerText', 'actions', 'button', 'cancelButton', 'cancelButtonText',
      'downloadButton', 'downloadButtonText', 'printButton', 'printButtonText'
    ];

    expectedStyles.forEach(styleName => {
      expect(result.current[styleName]).toBeDefined();
    });
  });
});