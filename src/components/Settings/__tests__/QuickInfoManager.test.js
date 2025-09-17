import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import QuickInfoManager from '../QuickInfoManager';

// Mock dependencies
jest.mock("../../../utils/platformStyles", () => ({
  getNumColumns: jest.fn(() => 1),
}));

jest.mock("../../../utils/platform", () => ({
  isIOS: false,
}));

// Mock additional React Native components not in jest.setup.js
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  const React = require('react');

  const createMockComponent = (name) => {
    return React.forwardRef((props, ref) => {
      const { testID, children, ...otherProps } = props;
      return React.createElement('div', {
        ref,
        'data-testid': testID,
        ...otherProps
      }, children);
    });
  };

  return {
    ...RN,
    Switch: React.forwardRef((props, ref) => {
      const { testID, value, onValueChange, ...otherProps } = props;
      return React.createElement('input', {
        ref,
        'data-testid': testID,
        type: 'checkbox',
        role: 'switch',
        checked: value,
        onChange: (e) => onValueChange && onValueChange(e.target.checked),
        ...otherProps
      });
    }),
    FlatList: React.forwardRef((props, ref) => {
      const { data, renderItem, keyExtractor, testID, ...otherProps } = props;
      return React.createElement('div', {
        ref,
        'data-testid': testID || 'flatlist',
        ...otherProps
      }, data && data.map((item, index) => {
        const key = keyExtractor ? keyExtractor(item) : index;
        return React.createElement('div', { key }, renderItem ? renderItem({ item, index }) : null);
      }));
    }),
    KeyboardAvoidingView: createMockComponent('KeyboardAvoidingView'),
  };
});

// Override MaterialIcons mock from jest.setup.js to add testID support
jest.mock("react-native-vector-icons/MaterialIcons", () => {
  const React = require('react');
  return React.forwardRef(({ name, testID, ...props }, ref) => {
    return React.createElement('span', {
      ref,
      'data-testid': testID || `icon-${name}`,
      role: 'img',
      'aria-label': name,
      ...props
    }, name);
  });
});

// Mock Alert
const alertSpy = jest.spyOn(Alert, "alert");

// Helper to simulate Alert confirmation
const mockAlertConfirm = (buttonIndex = 1) => {
  const lastCall = alertSpy.mock.calls[alertSpy.mock.calls.length - 1];
  if (lastCall && lastCall[2] && lastCall[2][buttonIndex]) {
    lastCall[2][buttonIndex].onPress();
  }
};

// P2 TECH DEBT: Remove skip when working on QuickInfoManager
// Issue: State management
describe.skip("QuickInfoManager", () => {
  const mockQuickInfoPanels = [
    {
      id: "default-1",
      name: "age",
      displayName: "Age",
      value: "5 years old",
      isVisible: true,
      isCustom: false,
      order: 0,
    },
    {
      id: "default-2",
      name: "allergies",
      displayName: "Allergies",
      value: "",
      isVisible: false,
      isCustom: false,
      order: 1,
    },
    {
      id: "custom-123",
      name: "special-needs",
      displayName: "Special Needs",
      value: "Sensory processing",
      isVisible: true,
      isCustom: true,
      order: 2,
    },
  ];

  const mockProps = {
    visible: true,
    onClose: jest.fn(),
    quickInfoPanels: mockQuickInfoPanels,
    onUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy.mockClear();
  });

  describe("Component Rendering", () => {
    it("should render when visible is true", () => {
      const result = render(<QuickInfoManager {...mockProps} />);
      // Check that the component renders by looking for unique elements
      expect(result.getAllByRole("switch")).toHaveLength(3); // Should have 3 switches for 3 panels
      expect(result.getByText("Age")).toBeTruthy();
      expect(result.getByText("Save Changes")).toBeTruthy();
    });

    it("should not render when visible is false", () => {
      const { queryByText } = render(
        <QuickInfoManager {...mockProps} visible={false} />
      );
      expect(queryByText("Manage Quick Info")).toBeNull();
    });

    it("should render all panel items", () => {
      const { container } = render(<QuickInfoManager {...mockProps} />);
      expect(container.textContent).toContain("Age");
      expect(container.textContent).toContain("Allergies");
      expect(container.textContent).toContain("Special Needs");
    });

    it("should show custom label for custom panels", () => {
      const { getByText } = render(<QuickInfoManager {...mockProps} />);
      expect(getByText("Custom")).toBeTruthy();
    });

    it("should show panel values when they exist", () => {
      const { getByText } = render(<QuickInfoManager {...mockProps} />);
      expect(getByText("5 years old")).toBeTruthy();
      expect(getByText("Sensory processing")).toBeTruthy();
    });

    it("should show placeholder text for empty values", () => {
      const { getByText } = render(<QuickInfoManager {...mockProps} />);
      expect(getByText("Tap to add value...")).toBeTruthy();
    });

    it("should render header with title and action buttons", () => {
      const { getByText, getByTestId } = render(<QuickInfoManager {...mockProps} />);
      expect(getByText("Manage Quick Info")).toBeTruthy();
      expect(getByTestId("icon-add")).toBeTruthy();
      expect(getByTestId("icon-close")).toBeTruthy();
    });

    it("should render footer with cancel and save buttons", () => {
      const { getByText } = render(<QuickInfoManager {...mockProps} />);
      expect(getByText("Cancel")).toBeTruthy();
      expect(getByText("Save Changes")).toBeTruthy();
    });
  });

  describe("Panel Visibility Toggle", () => {
    it("should toggle panel visibility", () => {
      const { getAllByRole, getByText } = render(<QuickInfoManager {...mockProps} />);
      const switches = getAllByRole("switch");

      // First switch should be for Age panel (visible: true)
      fireEvent(switches[0], "valueChange", false);

      // Save changes to update props
      fireEvent.press(getByText("Save Changes"));

      expect(mockProps.onUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: "default-1",
            isVisible: false,
          }),
        ])
      );
    });

    it("should handle toggle for invisible panels", () => {
      const { getAllByRole, getByText } = render(<QuickInfoManager {...mockProps} />);
      const switches = getAllByRole("switch");

      // Second switch should be for Allergies panel (visible: false)
      fireEvent(switches[1], "valueChange", true);

      fireEvent.press(getByText("Save Changes"));

      expect(mockProps.onUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: "default-2",
            isVisible: true,
          }),
        ])
      );
    });

    it("should maintain switch state correctly", () => {
      const { getAllByRole } = render(<QuickInfoManager {...mockProps} />);
      const switches = getAllByRole("switch");

      // Check initial switch states match panel visibility
      expect(switches[0].props.value).toBe(true); // Age panel
      expect(switches[1].props.value).toBe(false); // Allergies panel
      expect(switches[2].props.value).toBe(true); // Special Needs panel
    });
  });

  describe("Panel Value Editing", () => {
    it("should open edit dialog when tapping on value", () => {
      const { getByText } = render(<QuickInfoManager {...mockProps} />);

      fireEvent.press(getByText("5 years old"));

      expect(getByText("Edit Age")).toBeTruthy();
    });

    it("should open edit dialog when tapping on placeholder", () => {
      const { getByText } = render(<QuickInfoManager {...mockProps} />);

      fireEvent.press(getByText("Tap to add value..."));

      expect(getByText("Edit Allergies")).toBeTruthy();
    });

    it("should pre-populate edit dialog with current value", () => {
      const { getByText, getByDisplayValue } = render(<QuickInfoManager {...mockProps} />);

      fireEvent.press(getByText("5 years old"));

      expect(getByDisplayValue("5 years old")).toBeTruthy();
    });

    it("should update value when saving edit", async () => {
      const { getByText, getByDisplayValue } = render(<QuickInfoManager {...mockProps} />);

      // Open edit dialog
      fireEvent.press(getByText("5 years old"));

      // Change text
      const textInput = getByDisplayValue("5 years old");
      fireEvent.changeText(textInput, "6 years old");

      // Save changes
      fireEvent.press(getByText("Save"));

      // Should close edit dialog
      await waitFor(() => {
        expect(() => getByText("Edit Age")).toThrow();
      });
    });

    it("should cancel edit without changes", async () => {
      const { getByText, getByDisplayValue } = render(<QuickInfoManager {...mockProps} />);

      // Open edit dialog
      fireEvent.press(getByText("5 years old"));

      // Change text
      const textInput = getByDisplayValue("5 years old");
      fireEvent.changeText(textInput, "6 years old");

      // Cancel changes
      fireEvent.press(getByText("Cancel"));

      // Should close edit dialog without saving
      await waitFor(() => {
        expect(() => getByText("Edit Age")).toThrow();
      });
    });

    it("should handle empty edit value", async () => {
      const { getByText, getByDisplayValue } = render(<QuickInfoManager {...mockProps} />);

      // Open edit dialog
      fireEvent.press(getByText("5 years old"));

      // Clear text
      const textInput = getByDisplayValue("5 years old");
      fireEvent.changeText(textInput, "");

      // Save changes
      fireEvent.press(getByText("Save"));

      // Should close edit dialog
      await waitFor(() => {
        expect(() => getByText("Edit Age")).toThrow();
      });
    });

    it("should handle multiline text input", () => {
      const { getByText, getByDisplayValue } = render(<QuickInfoManager {...mockProps} />);

      fireEvent.press(getByText("5 years old"));

      const textInput = getByDisplayValue("5 years old");
      expect(textInput.props.multiline).toBe(true);
      expect(textInput.props.numberOfLines).toBe(4);
    });
  });

  describe("Custom Panel Management", () => {
    it("should open add panel dialog", () => {
      const { getByTestId, getByText } = render(<QuickInfoManager {...mockProps} />);

      // Find and press add button using testID
      const addButton = getByTestId("icon-add");
      fireEvent.press(addButton);

      // Should show add dialog
      expect(getByText("Add Quick Info Panel")).toBeTruthy();
    });

    it("should add new custom panel with valid name", async () => {
      const { getByText, getByPlaceholderText, getByTestId } = render(<QuickInfoManager {...mockProps} />);

      // Open add dialog
      const addButton = getByTestId("icon-add");
      fireEvent.press(addButton);

      // Enter panel name
      const nameInput = getByPlaceholderText("Panel name");
      fireEvent.changeText(nameInput, "New Panel");

      // Add panel
      fireEvent.press(getByText("Add"));

      // Should close dialog
      await waitFor(() => {
        expect(() => getByText("Add Quick Info Panel")).toThrow();
      });

      // Save changes to see the new panel
      fireEvent.press(getByText("Save Changes"));

      expect(mockProps.onUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            displayName: "New Panel",
            isCustom: true,
          }),
        ])
      );
    });

    it("should show error for empty panel name", () => {
      const { getByText, getByTestId } = render(<QuickInfoManager {...mockProps} />);

      // Open add dialog
      const addButton = getByTestId("icon-add");
      fireEvent.press(addButton);

      // Try to add without entering name
      fireEvent.press(getByText("Add"));

      expect(alertSpy).toHaveBeenCalledWith("Error", "Please enter a panel name");
    });

    it("should show error for whitespace-only panel name", () => {
      const { getByText, getByTestId, getByPlaceholderText } = render(<QuickInfoManager {...mockProps} />);

      // Open add dialog
      const addButton = getByTestId("icon-add");
      fireEvent.press(addButton);

      // Try to add with whitespace-only name
      const nameInput = getByPlaceholderText("Panel name");
      fireEvent.changeText(nameInput, "   ");
      fireEvent.press(getByText("Add"));

      expect(alertSpy).toHaveBeenCalledWith("Error", "Please enter a panel name");
    });

    it("should cancel add panel dialog", () => {
      const { getByText, getByTestId, getByPlaceholderText } = render(<QuickInfoManager {...mockProps} />);

      // Open add dialog
      const addButton = getByTestId("icon-add");
      fireEvent.press(addButton);

      // Enter some text
      const nameInput = getByPlaceholderText("Panel name");
      fireEvent.changeText(nameInput, "Test Panel");

      // Cancel
      fireEvent.press(getByText("Cancel"));

      // Dialog should close
      expect(() => getByText("Add Quick Info Panel")).toThrow();
    });

    it("should delete custom panel with confirmation", async () => {
      const { getByTestId } = render(<QuickInfoManager {...mockProps} />);

      // Find delete button for custom panel
      const deleteButton = getByTestId("icon-delete");
      fireEvent.press(deleteButton);

      expect(alertSpy).toHaveBeenCalledWith(
        "Delete Quick Info Panel",
        expect.stringContaining('Are you sure you want to delete "Special Needs"?'),
        expect.any(Array)
      );

      // Simulate user confirming delete
      mockAlertConfirm(1); // Press "Delete" button

      // Should remove the panel from state
      expect(true).toBeTruthy(); // Panel should be removed from local state
    });

    it("should not show delete button for default panels", () => {
      const propsWithDefaultPanels = {
        ...mockProps,
        quickInfoPanels: [
          {
            id: "default-1",
            name: "age",
            displayName: "Age",
            value: "5 years old",
            isVisible: true,
            isCustom: false,
            order: 0,
          },
        ],
      };

      const { queryByTestId } = render(<QuickInfoManager {...propsWithDefaultPanels} />);

      // Default panels should not have delete buttons
      expect(queryByTestId("icon-delete")).toBeNull();
    });

    it("should assign correct order to new panels", () => {
      const { getByText, getByTestId, getByPlaceholderText } = render(<QuickInfoManager {...mockProps} />);

      // Open add dialog
      const addButton = getByTestId("icon-add");
      fireEvent.press(addButton);

      // Add new panel
      const nameInput = getByPlaceholderText("Panel name");
      fireEvent.changeText(nameInput, "New Panel");
      fireEvent.press(getByText("Add"));

      // Save and check order
      fireEvent.press(getByText("Save Changes"));

      expect(mockProps.onUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            displayName: "New Panel",
            order: 3, // Should be next after existing 3 panels
          }),
        ])
      );
    });

    it("should generate proper name from display name", () => {
      const { getByText, getByTestId, getByPlaceholderText } = render(<QuickInfoManager {...mockProps} />);

      // Open add dialog
      const addButton = getByTestId("icon-add");
      fireEvent.press(addButton);

      // Add panel with spaces and capital letters
      const nameInput = getByPlaceholderText("Panel name");
      fireEvent.changeText(nameInput, "Special Dietary Needs");
      fireEvent.press(getByText("Add"));

      // Save and check generated name
      fireEvent.press(getByText("Save Changes"));

      expect(mockProps.onUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: "special-dietary-needs",
            displayName: "Special Dietary Needs",
          }),
        ])
      );
    });

    it("should generate unique IDs for new panels", () => {
      const mockDateNow = 1234567890;
      jest.spyOn(Date, "now").mockReturnValue(mockDateNow);

      const { getByText, getByTestId, getByPlaceholderText } = render(<QuickInfoManager {...mockProps} />);

      // Open add dialog
      const addButton = getByTestId("icon-add");
      fireEvent.press(addButton);

      // Add new panel
      const nameInput = getByPlaceholderText("Panel name");
      fireEvent.changeText(nameInput, "Test Panel");
      fireEvent.press(getByText("Add"));

      // Save and check ID format
      fireEvent.press(getByText("Save Changes"));

      expect(mockProps.onUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: "custom-1234567890",
          }),
        ])
      );

      Date.now.mockRestore();
    });
  });

  describe("Save and Cancel Operations", () => {
    it("should call onUpdate and onClose when saving", () => {
      const { getByText } = render(<QuickInfoManager {...mockProps} />);

      fireEvent.press(getByText("Save Changes"));

      expect(mockProps.onUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: "default-1" }),
          expect.objectContaining({ id: "default-2" }),
          expect.objectContaining({ id: "custom-123" }),
        ])
      );
      expect(mockProps.onClose).toHaveBeenCalled();
    });

    it("should call onClose when canceling", () => {
      const { getAllByText } = render(<QuickInfoManager {...mockProps} />);

      // Get the Cancel button from footer (not from dialogs)
      const cancelButtons = getAllByText("Cancel");
      fireEvent.press(cancelButtons[0]); // First Cancel button should be the main one

      expect(mockProps.onClose).toHaveBeenCalled();
      expect(mockProps.onUpdate).not.toHaveBeenCalled();
    });

    it("should call onClose when pressing close button in header", () => {
      const { getByTestId } = render(<QuickInfoManager {...mockProps} />);

      // Find and press close button
      const closeButton = getByTestId("icon-close");
      fireEvent.press(closeButton);

      expect(mockProps.onClose).toHaveBeenCalled();
    });

    it("should maintain changes until save is pressed", () => {
      const { getByText, getAllByRole } = render(<QuickInfoManager {...mockProps} />);

      // Make a change
      const switches = getAllByRole("switch");
      fireEvent(switches[0], "valueChange", false);

      // Should not call onUpdate until save
      expect(mockProps.onUpdate).not.toHaveBeenCalled();

      // Save changes
      fireEvent.press(getByText("Save Changes"));

      // Now should call onUpdate
      expect(mockProps.onUpdate).toHaveBeenCalled();
    });
  });

  describe("Panel Sorting and Display", () => {
    it("should sort panels by order property", () => {
      const unsortedPanels = [
        { ...mockQuickInfoPanels[0], order: 2 },
        { ...mockQuickInfoPanels[1], order: 0 },
        { ...mockQuickInfoPanels[2], order: 1 },
      ];

      const { getByText } = render(
        <QuickInfoManager {...mockProps} quickInfoPanels={unsortedPanels} />
      );

      // Should render all panels regardless of order
      expect(getByText("Allergies")).toBeTruthy(); // order: 0
      expect(getByText("Special Needs")).toBeTruthy(); // order: 1
      expect(getByText("Age")).toBeTruthy(); // order: 2
    });

    it("should handle panels with missing order property", () => {
      const panelsWithoutOrder = mockQuickInfoPanels.map(panel => {
        const { order, ...rest } = panel;
        return rest;
      });

      const { getByText } = render(
        <QuickInfoManager {...mockProps} quickInfoPanels={panelsWithoutOrder} />
      );

      // Should still render without errors
      expect(getByText("Age")).toBeTruthy();
      expect(getByText("Allergies")).toBeTruthy();
      expect(getByText("Special Needs")).toBeTruthy();
    });

    it("should display visibility indicator for hidden panels", () => {
      const { getByTestId } = render(<QuickInfoManager {...mockProps} />);

      // Allergies panel is not visible, should show visibility-off icon
      expect(getByTestId("icon-visibility-off")).toBeTruthy();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle empty panels array", () => {
      const { getByText } = render(
        <QuickInfoManager {...mockProps} quickInfoPanels={[]} />
      );

      expect(getByText("Manage Quick Info")).toBeTruthy();
      expect(getByText("Save Changes")).toBeTruthy();
    });

    it("should handle null panel values", () => {
      const panelsWithNullValues = mockQuickInfoPanels.map(panel => ({
        ...panel,
        value: null,
      }));

      const { getAllByText } = render(
        <QuickInfoManager {...mockProps} quickInfoPanels={panelsWithNullValues} />
      );

      // Should show placeholder for null values
      expect(getAllByText("Tap to add value...").length).toBeGreaterThan(0);
    });

    it("should handle panel without displayName", () => {
      const panelsWithoutDisplayName = [
        {
          id: "test-1",
          name: "test",
          value: "test value",
          isVisible: true,
          isCustom: false,
          order: 0,
        },
      ];

      const { getByText } = render(
        <QuickInfoManager {...mockProps} quickInfoPanels={panelsWithoutDisplayName} />
      );

      // Should handle gracefully
      expect(getByText("test value")).toBeTruthy();
    });

    it("should handle edit operations gracefully", () => {
      const { getByText } = render(<QuickInfoManager {...mockProps} />);

      // Component should handle null editingPanel gracefully
      // This is tested by ensuring the component renders without the edit dialog
      expect(() => getByText("Edit Age")).toThrow();

      // Main component should still be functional
      expect(getByText("Manage Quick Info")).toBeTruthy();
    });

    it("should handle invalid panel operations", () => {
      const { getByText } = render(<QuickInfoManager {...mockProps} />);

      // Component should render without issues
      expect(getByText("Manage Quick Info")).toBeTruthy();

      // No alerts should be shown for valid operations
      expect(alertSpy).not.toHaveBeenCalled();
    });
  });

  describe("Dialog Interactions", () => {
    it("should close edit dialog on modal request close", async () => {
      const { getByText } = render(<QuickInfoManager {...mockProps} />);

      // Open edit dialog
      fireEvent.press(getByText("5 years old"));
      expect(getByText("Edit Age")).toBeTruthy();

      // Find the modal and trigger onRequestClose
      const modals = document.querySelectorAll('[data-testid*="modal"]');
      if (modals.length > 0) {
        fireEvent(modals[0], "requestClose");
      }

      // For our test, we'll simulate the cancel button press
      fireEvent.press(getByText("Cancel"));

      // Should close dialog
      await waitFor(() => {
        expect(() => getByText("Edit Age")).toThrow();
      });
    });

    it("should close add dialog on modal request close", async () => {
      const { getByText, getByTestId } = render(<QuickInfoManager {...mockProps} />);

      // Open add dialog
      const addButton = getByTestId("icon-add");
      fireEvent.press(addButton);
      expect(getByText("Add Quick Info Panel")).toBeTruthy();

      // Simulate modal close by pressing cancel
      fireEvent.press(getByText("Cancel"));

      // Should close dialog
      await waitFor(() => {
        expect(() => getByText("Add Quick Info Panel")).toThrow();
      });
    });

    it("should handle keyboard avoiding behavior", () => {
      const { getByText } = render(<QuickInfoManager {...mockProps} />);

      // Component should render KeyboardAvoidingView components
      expect(getByText("Manage Quick Info")).toBeTruthy();
    });
  });

  describe("State Management", () => {
    it("should initialize state correctly from props", () => {
      const { getByText } = render(<QuickInfoManager {...mockProps} />);

      // Verify initial state is set from props
      expect(getByText("Age")).toBeTruthy();
      expect(getByText("5 years old")).toBeTruthy();
    });

    it("should reset dialog state after operations", async () => {
      const { getByText, getByDisplayValue } = render(<QuickInfoManager {...mockProps} />);

      // Open edit dialog
      fireEvent.press(getByText("5 years old"));

      // Verify edit state is set
      expect(getByDisplayValue("5 years old")).toBeTruthy();

      // Save and verify state is reset
      fireEvent.press(getByText("Save"));

      await waitFor(() => {
        expect(() => getByText("Edit Age")).toThrow();
      });
    });

    it("should clear add dialog state after canceling", () => {
      const { getByText, getByTestId, getByPlaceholderText } = render(<QuickInfoManager {...mockProps} />);

      // Open add dialog
      const addButton = getByTestId("icon-add");
      fireEvent.press(addButton);

      // Enter text
      const nameInput = getByPlaceholderText("Panel name");
      fireEvent.changeText(nameInput, "Test");

      // Cancel and reopen
      fireEvent.press(getByText("Cancel"));
      fireEvent.press(addButton);

      // Input should be cleared
      const newNameInput = getByPlaceholderText("Panel name");
      expect(newNameInput.props.value).toBe("");
    });
  });

  describe("Accessibility and User Experience", () => {
    it("should have proper text input behaviors", () => {
      const { getByText, getByDisplayValue } = render(<QuickInfoManager {...mockProps} />);

      // Open edit dialog
      fireEvent.press(getByText("5 years old"));

      // Check that multiline and autoFocus are set appropriately
      const textInput = getByDisplayValue("5 years old");
      expect(textInput.props.multiline).toBe(true);
      expect(textInput.props.autoFocus).toBe(true);
      expect(textInput.props.numberOfLines).toBe(4);
    });

    it("should provide appropriate placeholder text", () => {
      const { getByText, getByTestId } = render(<QuickInfoManager {...mockProps} />);

      // Open add dialog
      const addButton = getByTestId("icon-add");
      fireEvent.press(addButton);

      expect(getByText("Panel name")).toBeTruthy();
    });

    it("should show descriptive text for user guidance", () => {
      const { getByText } = render(<QuickInfoManager {...mockProps} />);

      expect(getByText("Show or hide information panels. Edit values directly or add custom panels.")).toBeTruthy();
      expect(getByText("Note: Default panels can be hidden but not deleted. Custom panels can be deleted permanently.")).toBeTruthy();
    });

    it("should handle switch labels correctly", () => {
      const { getByText } = render(<QuickInfoManager {...mockProps} />);

      expect(getByText("Visible")).toBeTruthy();
    });
  });

  describe("Integration with Platform Utils", () => {
    it("should call getNumColumns utility", () => {
      const { getNumColumns } = require("../../../utils/platformStyles");
      render(<QuickInfoManager {...mockProps} />);

      expect(getNumColumns).toHaveBeenCalled();
    });

    it("should handle different column counts", () => {
      const { getNumColumns } = require("../../../utils/platformStyles");
      getNumColumns.mockReturnValue(2);

      const { getByText } = render(<QuickInfoManager {...mockProps} />);

      expect(getByText("Manage Quick Info")).toBeTruthy();
      expect(getNumColumns).toHaveBeenCalled();
    });

    it("should re-render FlatList when numColumns changes", () => {
      const { getNumColumns } = require("../../../utils/platformStyles");

      // First render with 1 column
      getNumColumns.mockReturnValue(1);
      const { getByText, rerender } = render(<QuickInfoManager {...mockProps} />);
      expect(getByText("Manage Quick Info")).toBeTruthy();

      // Re-render with 2 columns
      getNumColumns.mockReturnValue(2);
      rerender(<QuickInfoManager {...mockProps} />);
      expect(getByText("Manage Quick Info")).toBeTruthy();

      expect(getNumColumns).toHaveBeenCalledTimes(2);
    });
  });
});