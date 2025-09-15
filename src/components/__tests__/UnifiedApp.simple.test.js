/**
 * Simple tests for UnifiedApp components to increase coverage
 * Tests the actual exported components
 */

import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { Alert } from "react-native";
import { EntryForm, ProfileEditForm, colors } from "../UnifiedApp";

// Mock dependencies
jest.mock("react-native", () => ({
  ...jest.requireActual("react-native"),
  Alert: { alert: jest.fn() },
  Platform: { OS: "web", select: (obj) => obj.web || obj.default },
}));

jest.mock("../Profile/PhotoUpload", () => {
  return function PhotoUpload({ onPhotoSelected }) {
    return null;
  };
});

jest.mock("../../utils/platform", () => ({
  isWeb: true,
  isMobile: false,
}));

describe("UnifiedApp Components", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("EntryForm", () => {
    const defaultProps = {
      visible: true,
      onClose: jest.fn(),
      onSave: jest.fn(),
      categories: [
        { id: "medical", name: "Medical", displayName: "Medical Records" },
      ],
    };

    test("renders when visible", () => {
      render(<EntryForm {...defaultProps} />);
      expect(screen.getByPlaceholderText(/enter title/i)).toBeTruthy();
    });

    test("does not render when not visible", () => {
      render(
        <EntryForm {...defaultProps} visible={false} />,
      );
      expect(screen.queryByPlaceholderText(/enter title/i)).toBeNull();
    });

    test("validates title before saving", () => {
      render(<EntryForm {...defaultProps} />);
      const saveButton = screen.getByText(/save/i);
      fireEvent.press(saveButton);

      expect(Alert.alert).toHaveBeenCalledWith("Error", "Please enter a title");
      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });

    test("saves with valid data", () => {
      render(
        <EntryForm {...defaultProps} category="medical" />,
      );

      fireEvent.changeText(screen.getByPlaceholderText(/enter title/i), "Test Title");
      fireEvent.changeText(
        screen.getByPlaceholderText(/enter description/i),
        "Test Desc",
      );
      fireEvent.press(screen.getByText(/save/i));

      expect(defaultProps.onSave).toHaveBeenCalledWith({
        title: "Test Title",
        description: "Test Desc",
        category: "medical",
        date: expect.any(Date),
        attachments: [],
      });
    });

    test("populates fields when editing", () => {
      const entry = {
        id: "123",
        title: "Existing",
        description: "Existing Desc",
        category: "medical",
        date: new Date(),
      };

      render(
        <EntryForm {...defaultProps} entry={entry} />,
      );

      expect(screen.getByDisplayValue("Existing")).toBeTruthy();
      expect(screen.getByDisplayValue("Existing Desc")).toBeTruthy();
    });

    test("handles cancel", () => {
      render(<EntryForm {...defaultProps} />);
      fireEvent.press(screen.getByText(/cancel/i));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    test("applies theme colors", () => {
      const customColors = {
        ...colors,
        primary: "#FF0000",
      };

      const { container } = render(
        <EntryForm {...defaultProps} themeColors={customColors} />,
      );

      expect(container).toBeTruthy();
    });
  });

  describe("ProfileEditForm", () => {
    const defaultProps = {
      visible: true,
      onClose: jest.fn(),
      onSave: jest.fn(),
    };

    test("renders when visible", () => {
      render(
        <ProfileEditForm {...defaultProps} />,
      );
      expect(screen.getByPlaceholderText(/enter name/i)).toBeTruthy();
    });

    test("validates name before saving", () => {
      render(<ProfileEditForm {...defaultProps} />);
      const saveButton = screen.getByText(/save/i);
      fireEvent.press(saveButton);

      expect(Alert.alert).toHaveBeenCalledWith("Error", "Please enter a name");
      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });

    test("saves with valid name", () => {
      render(
        <ProfileEditForm {...defaultProps} />,
      );

      fireEvent.changeText(screen.getByPlaceholderText(/enter name/i), "Test Name");
      fireEvent.press(screen.getByText(/save/i));

      expect(defaultProps.onSave).toHaveBeenCalledWith({
        name: "Test Name",
        dateOfBirth: expect.any(Date),
        personalNotes: "",
      });
    });

    test("populates fields when editing profile", () => {
      const profile = {
        id: "123",
        name: "Existing Name",
        dateOfBirth: new Date("2015-01-01"),
        personalNotes: "Notes",
      };

      render(
        <ProfileEditForm {...defaultProps} profile={profile} />,
      );

      expect(screen.getByDisplayValue("Existing Name")).toBeTruthy();
      expect(screen.getByDisplayValue("Notes")).toBeTruthy();
    });
  });

  describe("Colors", () => {
    test("exports correct color palette", () => {
      expect(colors.primary).toBe("#A08670");
      expect(colors.secondary).toBe("#6B5D54");
      expect(colors.background.manila).toBe("#F4E4C1");
      expect(colors.text.primary).toBe("#333333");
      expect(colors.error).toBe("#F44336");
      expect(colors.success).toBe("#4CAF50");
    });
  });
});
