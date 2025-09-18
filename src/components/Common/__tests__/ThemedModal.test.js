/* eslint-disable */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemedModal from '../ThemedModal';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock react-native components
jest.mock('react-native', () => ({
  Modal: ({ children, visible, testID }) =>
    visible ? <div data-testid={testID || 'modal'}>{children}</div> : null,
  View: ({ children, testID, ...props }) => <div data-testid={testID} {...props}>{children}</div>,
  Text: ({ children, ...props }) => <span {...props}>{children}</span>,
  TouchableOpacity: ({ children, onPress, testID, ...props }) => (
    <button onClick={onPress} data-testid={testID} {...props}>{children}</button>
  ),
  StyleSheet: {
    create: (styles) => styles
  },
  Platform: {
    OS: 'web',
    select: (obj) => obj.web || obj.default
  }
}));

// Mock icon
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

describe('ThemedModal', () => {
  const mockOnClose = jest.fn();

  const renderModal = (props = {}) => {
    return render(
      <ThemeProvider>
        <ThemedModal
          visible={true}
          onClose={mockOnClose}
          title="Test Modal"
          {...props}
        >
          <Text>Modal Content</Text>
        </ThemedModal>
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when visible', () => {
    renderModal();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    renderModal({ visible: false });
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is pressed', () => {
    renderModal();
    const closeButton = screen.getByTestId('modal-close-button');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders with custom headerColor', () => {
    renderModal({ headerColor: '#FF0000' });
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('renders without title', () => {
    renderModal({ title: null });
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });
});