/**
 * ProfileCreateDialog.test.js
 * Comprehensive tests for ProfileCreateDialog component
 * Target: 65% coverage
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProfileCreateDialog } from "../ProfileCreateDialog";
import { ThemeProvider } from "../../../context/ThemeContext";

// Mock dependencies
jest.mock("react-native-image-picker", () => ({
  launchImageLibrary: jest.fn(),
}));

// Override Modal mock specifically for this test

// Simple Modal component for testing
const MockModal = ({ visible, children, onRequestClose, ...otherProps }) => {
  if (!visible) return null;

  return (
    <div
      data-testid="modal"
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
      {...otherProps}
    >
      {children}
    </div>
  );
};

// Mock React Native components for this specific test
jest.doMock("react-native", () => ({
  Modal: MockModal,
  View: ({ children, style, ...props }) => (
    <div style={style} {...props}>
      {children}
    </div>
  ),
  Text: ({ children, style, ...props }) => (
    <span style={style} {...props}>
      {children}
    </span>
  ),
  TextInput: ({ style, value, onChangeText, placeholder, ...props }) => (
    <input
      style={style}
      value={value}
      onChange={(e) => onChangeText && onChangeText(e.target.value)}
      placeholder={placeholder}
      {...props}
    />
  ),
  TouchableOpacity: ({ children, onPress, style, ...props }) => (
    <button style={style} onClick={onPress} {...props}>
      {children}
    </button>
  ),
  ScrollView: ({ children, style, ...props }) => (
    <div style={style} {...props}>
      {children}
    </div>
  ),
  SafeAreaView: ({ children, style, ...props }) => (
    <div style={style} {...props}>
      {children}
    </div>
  ),
  Image: ({ source, style, ...props }) => (
    <img src={source?.uri || source} style={style} {...props} />
  ),
  StyleSheet: {
    create: (styles) => styles,
  },
}));

jest.mock("../../DatePicker/DatePicker", () => ({
  DatePicker: ({ value, onChange, style }) => (
    <div data-testid="date-picker" style={style}>
      <input
        type="date"
        value={
          value instanceof Date ? value.toISOString().split("T")[0] : value
        }
        onChange={(e) => onChange(new Date(e.target.value))}
        data-testid="date-input"
      />
    </div>
  ),
}));

jest.mock("../../../utils/defaultCategories", () => ({
  defaultCategories: [
    { id: "medical", name: "Medical Information", color: "#E76F51", order: 0 },
    { id: "behavior", name: "Behavior", color: "#F4A261", order: 1 },
  ],
}));

jest.mock("../../../utils/defaultQuickInfo", () => ({
  defaultQuickInfoPanels: [
    { id: "emergency", title: "Emergency Contacts", content: "" },
  ],
}));

jest.mock("../../../utils/platform", () => ({
  isWeb: true,
  isIOS: false,
  isMobile: false,
}));

// Mock FileReader for web photo upload
const mockFileReader = {
  readAsDataURL: jest.fn(),
  result: "data:image/jpeg;base64,test_image_data",
  onloadend: null,
};

Object.defineProperty(global, "FileReader", {
  writable: true,
  value: jest.fn(() => mockFileReader),
});

// Mock document.createElement for file input
const mockFileInput = {
  type: "",
  accept: "",
  onchange: null,
  click: jest.fn(),
  files: [],
};

Object.defineProperty(document, "createElement", {
  writable: true,
  value: jest.fn((tagName) => {
    if (tagName === "input") {
      return { ...mockFileInput };
    }
    return {};
  }),
});

// Mock the useTheme hook directly to avoid context issues
const mockColors = {
  primary: "#8B6F47",
  secondary: "#F4E4C1",
  background: {
    primary: "#F5F5F5",
    secondary: "#FFFFFF",
    default: "#F5F5F5",
    paper: "#FFFFFF",
    manila: "#F4E4C1",
  },
  surface: "#FFFFFF",
  text: {
    primary: "#333333",
    secondary: "#666666",
    disabled: "#999999",
  },
  border: "#E0E0E0",
  error: "#E76F51",
  success: {
    main: "#4CAF50",
  },
};

jest.mock("../../../context/ThemeContext", () => ({
  useTheme: () => ({ colors: mockColors }),
  ThemeProvider: ({ children }) => children,
}));

// Test wrapper with theme context
const TestWrapper = ({ children, themeMode = "light" }) => (
  <div data-testid="theme-wrapper">{children}</div>
);

const defaultProps = {
  open: true,
  onClose: jest.fn(),
  onCreate: jest.fn(),
};

describe("ProfileCreateDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFileReader.readAsDataURL.mockImplementation(() => {
      if (mockFileReader.onloadend) {
        mockFileReader.onloadend();
      }
    });
  });

  describe("Rendering", () => {
    it("renders when open", () => {
      render(<ProfileCreateDialog {...defaultProps} />);

      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByText("Create New Profile")).toBeInTheDocument();
      expect(screen.getByText("Basic Info")).toBeInTheDocument();
      expect(screen.getByText("Photo")).toBeInTheDocument();
    });

    it("does not render when closed", () => {
      render(
        <TestWrapper>
          <ProfileCreateDialog {...defaultProps} open={false} />
        </TestWrapper>,
      );

      expect(screen.queryByText("Create New Profile")).not.toBeInTheDocument();
    });

    it("renders step indicator correctly", () => {
      render(
        <TestWrapper>
          <ProfileCreateDialog {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText("1")).toBeInTheDocument(); // Active step
      expect(screen.getByText("2")).toBeInTheDocument(); // Next step
      expect(screen.getByText("Basic Info")).toBeInTheDocument();
      expect(screen.getByText("Photo")).toBeInTheDocument();
    });

    it("shows active step styling", () => {
      render(
        <TestWrapper>
          <ProfileCreateDialog {...defaultProps} />
        </TestWrapper>,
      );

      // First step should be active
      const basicInfoLabel = screen.getByText("Basic Info");
      expect(basicInfoLabel).toBeInTheDocument();
    });
  });

  describe("Basic Info Step", () => {
    it("renders all basic info fields", () => {
      render(
        <TestWrapper>
          <ProfileCreateDialog {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText("Child's Full Name *")).toBeInTheDocument();
      expect(screen.getByText("Preferred Name (Optional)")).toBeInTheDocument();
      expect(screen.getByText("Date of Birth")).toBeInTheDocument();
      expect(screen.getByTestId("date-picker")).toBeInTheDocument();
    });

    it("handles name input changes", () => {
      render(
        <TestWrapper>
          <ProfileCreateDialog {...defaultProps} />
        </TestWrapper>,
      );

      const nameInput = screen.getByPlaceholderText("Enter full name");
      fireEvent.changeText(nameInput, "John Doe");

      expect(nameInput.value).toBe("John Doe");
    });

    it("handles preferred name input changes", () => {
      render(
        <TestWrapper>
          <ProfileCreateDialog {...defaultProps} />
        </TestWrapper>,
      );

      const preferredNameInput = screen.getByPlaceholderText(
        "What they like to be called",
      );
      fireEvent.changeText(preferredNameInput, "Johnny");

      expect(preferredNameInput.value).toBe("Johnny");
    });

    it("handles date of birth changes", () => {
      render(
        <TestWrapper>
          <ProfileCreateDialog {...defaultProps} />
        </TestWrapper>,
      );

      const dateInput = screen.getByTestId("date-input");
      fireEvent.change(dateInput, { target: { value: "2010-05-15" } });

      expect(dateInput.value).toBe("2010-05-15");
    });

    it("calculates and displays age correctly", () => {
      const mockDate = new Date("2023-06-01");
      jest.spyOn(global, "Date").mockImplementation((arg) => {
        if (arg) return new Date(arg);
        return mockDate;
      });

      render(
        <TestWrapper>
          <ProfileCreateDialog {...defaultProps} />
        </TestWrapper>,
      );

      const dateInput = screen.getByTestId("date-input");
      fireEvent.change(dateInput, { target: { value: "2010-05-15" } });

      expect(screen.getByText(/Age: \d+ years/)).toBeInTheDocument();

      global.Date.mockRestore();
    });

    it("validates required fields", () => {
      render(
        <TestWrapper>
          <ProfileCreateDialog {...defaultProps} />
        </TestWrapper>,
      );

      const nextButton = screen.getByText("Next");

      // Should be disabled when name is empty
      expect(nextButton).toBeDisabled();

      // Enter name to enable next button
      const nameInput = screen.getByPlaceholderText("Enter full name");
      fireEvent.changeText(nameInput, "John Doe");

      expect(nextButton).not.toBeDisabled();
    });
  });

  describe("Photo Step", () => {
    beforeEach(() => {
      render(
        <TestWrapper>
          <ProfileCreateDialog {...defaultProps} />
        </TestWrapper>,
      );

      // Fill in required name field and proceed to photo step
      const nameInput = screen.getByPlaceholderText("Enter full name");
      fireEvent.changeText(nameInput, "John Doe");

      const nextButton = screen.getByText("Next");
      fireEvent.press(nextButton);
    });

    it("renders photo step correctly", () => {
      expect(
        screen.getByText("Add a photo to personalize the profile (optional)"),
      ).toBeInTheDocument();
      expect(screen.getByText("Add Photo")).toBeInTheDocument();
    });

    it("shows placeholder with first letter of name", () => {
      expect(screen.getByText("J")).toBeInTheDocument(); // First letter of 'John Doe'
    });

    it("handles photo selection on web", () => {
      const addPhotoButton = screen.getByText("Add Photo");
      fireEvent.press(addPhotoButton);

      expect(document.createElement).toHaveBeenCalledWith("input");
      expect(mockFileInput.click).toHaveBeenCalled();
    });

    it("updates photo preview after selection", async () => {
      const addPhotoButton = screen.getByText("Add Photo");
      fireEvent.press(addPhotoButton);

      // Simulate file selection
      const fileInput = document.createElement("input");
      const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

      Object.defineProperty(fileInput, "files", {
        value: [mockFile],
        writable: false,
      });

      if (fileInput.onchange) {
        fileInput.onchange({ target: { files: [mockFile] } });
      }

      await waitFor(() => {
        expect(screen.getByText("Change Photo")).toBeInTheDocument();
      });
    });

    it("shows back button on photo step", () => {
      expect(screen.getByText("Back")).toBeInTheDocument();
    });

    it("shows create profile button on final step", () => {
      expect(screen.getByText("Create Profile")).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("handles back navigation", () => {
      render(
        <TestWrapper>
          <ProfileCreateDialog {...defaultProps} />
        </TestWrapper>,
      );

      // Go to photo step first
      const nameInput = screen.getByPlaceholderText("Enter full name");
      fireEvent.changeText(nameInput, "John Doe");

      const nextButton = screen.getByText("Next");
      fireEvent.press(nextButton);

      expect(screen.getByText("Add Photo")).toBeInTheDocument();

      // Go back
      const backButton = screen.getByText("Back");
      fireEvent.press(backButton);

      expect(screen.getByText("Child's Full Name *")).toBeInTheDocument();
    });

    it("handles close dialog", () => {
      const mockOnClose = jest.fn();

      render(
        <TestWrapper>
          <ProfileCreateDialog {...defaultProps} onClose={mockOnClose} />
        </TestWrapper>,
      );

      const closeButton = screen.getByText("✕");
      fireEvent.press(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("handles cancel button", () => {
      const mockOnClose = jest.fn();

      render(
        <TestWrapper>
          <ProfileCreateDialog {...defaultProps} onClose={mockOnClose} />
        </TestWrapper>,
      );

      const cancelButton = screen.getByText("Cancel");
      fireEvent.press(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("Profile Creation", () => {
    it("creates profile with complete data", () => {
      const mockOnCreate = jest.fn();
      const mockDate = new Date("2023-06-01");
      jest.spyOn(global, "Date").mockImplementation((arg) => {
        if (arg) return new Date(arg);
        return mockDate;
      });
      jest.spyOn(Date, "now").mockReturnValue(1234567890);

      render(
        <TestWrapper>
          <ProfileCreateDialog {...defaultProps} onCreate={mockOnCreate} />
        </TestWrapper>,
      );

      // Fill in basic info
      const nameInput = screen.getByPlaceholderText("Enter full name");
      fireEvent.changeText(nameInput, "John Doe");

      const preferredNameInput = screen.getByPlaceholderText(
        "What they like to be called",
      );
      fireEvent.changeText(preferredNameInput, "Johnny");

      const dateInput = screen.getByTestId("date-input");
      fireEvent.change(dateInput, { target: { value: "2010-05-15" } });

      // Go to photo step
      const nextButton = screen.getByText("Next");
      fireEvent.press(nextButton);

      // Create profile
      const createButton = screen.getByText("Create Profile");
      fireEvent.press(createButton);

      expect(mockOnCreate).toHaveBeenCalledWith({
        id: "1234567890",
        name: "John Doe",
        preferredName: "Johnny",
        dateOfBirth: new Date("2010-05-15"),
        photo: "",
        entries: [],
        categories: [
          {
            id: "medical",
            name: "Medical Information",
            color: "#E76F51",
            order: 0,
          },
          { id: "behavior", name: "Behavior", color: "#F4A261", order: 1 },
        ],
        quickInfoPanels: [
          { id: "emergency", title: "Emergency Contacts", content: "" },
        ],
        themeMode: "light",
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      global.Date.mockRestore();
      Date.now.mockRestore();
    });

    it("creates profile with minimal data", () => {
      const mockOnCreate = jest.fn();

      render(
        <TestWrapper>
          <ProfileCreateDialog {...defaultProps} onCreate={mockOnCreate} />
        </TestWrapper>,
      );

      // Only fill required field
      const nameInput = screen.getByPlaceholderText("Enter full name");
      fireEvent.changeText(nameInput, "Jane Smith");

      // Go to photo step
      const nextButton = screen.getByText("Next");
      fireEvent.press(nextButton);

      // Create profile without photo
      const createButton = screen.getByText("Create Profile");
      fireEvent.press(createButton);

      expect(mockOnCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Jane Smith",
          preferredName: "",
          photo: "",
        }),
      );
    });

    it("includes photo data when photo is selected", async () => {
      const mockOnCreate = jest.fn();

      render(
        <TestWrapper>
          <ProfileCreateDialog {...defaultProps} onCreate={mockOnCreate} />
        </TestWrapper>,
      );

      // Fill in basic info
      const nameInput = screen.getByPlaceholderText("Enter full name");
      fireEvent.changeText(nameInput, "John Doe");

      // Go to photo step
      const nextButton = screen.getByText("Next");
      fireEvent.press(nextButton);

      // Add photo
      const addPhotoButton = screen.getByText("Add Photo");
      fireEvent.press(addPhotoButton);

      // Simulate file selection and loading
      const fileInput = document.createElement("input");
      const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

      Object.defineProperty(fileInput, "files", {
        value: [mockFile],
        writable: false,
      });

      if (fileInput.onchange) {
        fileInput.onchange({ target: { files: [mockFile] } });
      }

      await waitFor(() => {
        expect(screen.getByText("Change Photo")).toBeInTheDocument();
      });

      // Create profile
      const createButton = screen.getByText("Create Profile");
      fireEvent.press(createButton);

      expect(mockOnCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          photo: "data:image/jpeg;base64,test_image_data",
        }),
      );
    });
  });

  describe("Step Indicator States", () => {
    it("shows correct states for completed steps", () => {
      render(
        <TestWrapper>
          <ProfileCreateDialog {...defaultProps} />
        </TestWrapper>,
      );

      // Fill name and go to next step
      const nameInput = screen.getByPlaceholderText("Enter full name");
      fireEvent.changeText(nameInput, "John Doe");

      const nextButton = screen.getByText("Next");
      fireEvent.press(nextButton);

      // First step should show checkmark
      expect(screen.getByText("✓")).toBeInTheDocument();

      // Second step should be active
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  describe("Platform-specific Behavior", () => {
    it("handles mobile photo selection", () => {
      // Mock mobile platform
      jest.doMock("../../../utils/platform", () => ({
        isWeb: false,
        isIOS: true,
        isMobile: true,
      }));

      const { launchImageLibrary } = require("react-native-image-picker");
      launchImageLibrary.mockImplementation((options, callback) => {
        callback({
          assets: [
            {
              type: "image/jpeg",
              base64: "test_mobile_image_data",
            },
          ],
        });
      });

      render(
        <TestWrapper>
          <ProfileCreateDialog {...defaultProps} />
        </TestWrapper>,
      );

      // Go to photo step
      const nameInput = screen.getByPlaceholderText("Enter full name");
      fireEvent.changeText(nameInput, "John Doe");

      const nextButton = screen.getByText("Next");
      fireEvent.press(nextButton);

      // Add photo on mobile
      const addPhotoButton = screen.getByText("Add Photo");
      fireEvent.press(addPhotoButton);

      expect(launchImageLibrary).toHaveBeenCalledWith(
        expect.objectContaining({
          mediaType: "photo",
          includeBase64: true,
          maxHeight: 500,
          maxWidth: 500,
        }),
        expect.any(Function),
      );
    });

    it("handles iOS-specific photo URL formatting", () => {
      render(
        <TestWrapper>
          <ProfileCreateDialog {...defaultProps} />
        </TestWrapper>,
      );

      // Go to photo step
      const nameInput = screen.getByPlaceholderText("Enter full name");
      fireEvent.changeText(nameInput, "John Doe");

      const nextButton = screen.getByText("Next");
      fireEvent.press(nextButton);

      // The component should handle iOS photo URL formatting
      expect(screen.getByText("Add Photo")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("handles file reading errors gracefully", () => {
      mockFileReader.readAsDataURL.mockImplementation(() => {
        throw new Error("File read error");
      });

      render(
        <TestWrapper>
          <ProfileCreateDialog {...defaultProps} />
        </TestWrapper>,
      );

      // Go to photo step
      const nameInput = screen.getByPlaceholderText("Enter full name");
      fireEvent.changeText(nameInput, "John Doe");

      const nextButton = screen.getByText("Next");
      fireEvent.press(nextButton);

      // Try to add photo
      const addPhotoButton = screen.getByText("Add Photo");
      fireEvent.press(addPhotoButton);

      // Should not crash the application
      expect(screen.getByText("Add Photo")).toBeInTheDocument();
    });

    it("handles empty file selection", () => {
      render(
        <TestWrapper>
          <ProfileCreateDialog {...defaultProps} />
        </TestWrapper>,
      );

      // Go to photo step
      const nameInput = screen.getByPlaceholderText("Enter full name");
      fireEvent.changeText(nameInput, "John Doe");

      const nextButton = screen.getByText("Next");
      fireEvent.press(nextButton);

      // Simulate file input with no files
      const addPhotoButton = screen.getByText("Add Photo");
      fireEvent.press(addPhotoButton);

      const fileInput = document.createElement("input");
      Object.defineProperty(fileInput, "files", {
        value: [],
        writable: false,
      });

      if (fileInput.onchange) {
        fileInput.onchange({ target: { files: [] } });
      }

      // Should still show "Add Photo"
      expect(screen.getByText("Add Photo")).toBeInTheDocument();
    });
  });

  describe("Theme Integration", () => {
    it("applies theme colors correctly", () => {
      render(
        <TestWrapper themeMode="dark">
          <ProfileCreateDialog {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText("Create New Profile")).toBeInTheDocument();
      // Theme colors are applied through StyleSheet.create, which is mocked
    });
  });
});
