/**
 * Focused BottomToolbar Tests
 * Basic smoke tests and interaction tests with working mocks
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock React Native with comprehensive mocks
jest.mock("react-native", () => {
  const React = require("react");

  return {
    Platform: {
      OS: "web",
      select: (obj) => obj.web || obj.default,
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 1024, height: 768 })),
      addEventListener: jest.fn(() => ({
        remove: jest.fn(),
      })),
    },
    StyleSheet: {
      create: (styles) => styles,
    },
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
    TouchableOpacity: ({ children, onPress, style, accessibilityLabel, accessibilityRole, ...props }) => (
      <button
        onClick={onPress}
        style={style}
        aria-label={accessibilityLabel}
        role={accessibilityRole}
        {...props}
      >
        {children}
      </button>
    ),
    ScrollView: ({ children, style, ...props }) => (
      <div style={{ ...style, overflow: "scroll" }} {...props}>
        {children}
      </div>
    ),
    Modal: ({ children, visible, transparent, ...props }) => {
      if (!visible) return null;
      return (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: transparent ? "transparent" : "white",
          }}
          {...props}
        >
          {children}
        </div>
      );
    },
  };
});

// Mock platform utility
jest.mock("../../../utils/platform", () => ({
  isWeb: true,
  isAndroid: false,
  isIOS: false,
  isMobile: false,
  select: (obj) => obj.web || obj.default,
}));

// Create comprehensive icon mocks
const mockIcon = (name) => ({ size = 24, color = "#000", style = {}, ...props }) => (
  <span
    data-testid={`${name.toLowerCase()}-icon`}
    style={{ fontSize: size, color, ...style }}
    {...props}
  >
    {name}
  </span>
);

// Mock all the Common icons
jest.mock("../Common", () => ({
  ShareIcon: mockIcon("Share"),
  PrintIcon: mockIcon("Print"),
  CloudIcon: mockIcon("Cloud"),
  PaletteIcon: mockIcon("Palette"),
  PrivacyTipIcon: mockIcon("Privacy"),
  SupportIcon: mockIcon("Support"),
  LogoutIcon: mockIcon("Logout"),
  MoreHorizIcon: mockIcon("More"),
  LightModeIcon: mockIcon("LightMode"),
  DarkModeIcon: mockIcon("DarkMode"),
  CheckCircleIcon: mockIcon("CheckCircle"),
}));

// Import the component after mocks
import BottomToolbar from "../BottomToolbar";

describe("BottomToolbar Focused Tests", () => {
  const defaultProps = {
    onShare: jest.fn(),
    onPrintClick: jest.fn(),
    onSyncClick: jest.fn(),
    onThemeToggle: jest.fn(),
    onThemeSelect: jest.fn(),
    onPrivacyClick: jest.fn(),
    onSupportClick: jest.fn(),
    onCloseProfile: jest.fn(),
    theme: "light",
    colors: {
      background: { paper: "#ffffff" },
      text: { primary: "#000000", secondary: "#666666" },
      primary: "#a08670",
      divider: "#e0e0e0",
      error: "#d32f2f",
      warning: "#FFA726",
      success: "#66BB6A",
    },
    syncStatus: "success",
    showToast: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Dimensions mock
    const { Dimensions } = require("react-native");
    Dimensions.get.mockReturnValue({ width: 1024, height: 768 });
  });

  test("should render without crashing", () => {
    const { container } = render(<BottomToolbar {...defaultProps} />);
    expect(container).toBeInTheDocument();
  });

  test("should render basic menu icons", () => {
    render(<BottomToolbar {...defaultProps} />);

    expect(screen.getByTestId("share-icon")).toBeInTheDocument();
    expect(screen.getByTestId("print-icon")).toBeInTheDocument();
    expect(screen.getByTestId("cloud-icon")).toBeInTheDocument();
    expect(screen.getByTestId("palette-icon")).toBeInTheDocument();
  });

  test("should call onShare when Share button is clicked", () => {
    render(<BottomToolbar {...defaultProps} />);

    const shareButton = screen.getByLabelText("Share");
    fireEvent.click(shareButton);

    expect(defaultProps.onShare).toHaveBeenCalledTimes(1);
  });

  test("should call onPrintClick when Print button is clicked", () => {
    render(<BottomToolbar {...defaultProps} />);

    const printButton = screen.getByLabelText("Print");
    fireEvent.click(printButton);

    expect(defaultProps.onPrintClick).toHaveBeenCalledTimes(1);
  });

  test("should call onSyncClick when Sync button is clicked", () => {
    render(<BottomToolbar {...defaultProps} />);

    const syncButton = screen.getByLabelText("Sync");
    fireEvent.click(syncButton);

    expect(defaultProps.onSyncClick).toHaveBeenCalledTimes(1);
  });

  test("should show different sync status colors", () => {
    const { rerender } = render(
      <BottomToolbar {...defaultProps} syncStatus="syncing" />
    );

    let syncIcon = screen.getByTestId("cloud-icon");
    expect(syncIcon).toHaveStyle({ color: "#FFA726" });

    rerender(<BottomToolbar {...defaultProps} syncStatus="error" />);
    syncIcon = screen.getByTestId("cloud-icon");
    expect(syncIcon).toHaveStyle({ color: "#EF5350" });

    rerender(<BottomToolbar {...defaultProps} syncStatus="success" />);
    syncIcon = screen.getByTestId("cloud-icon");
    expect(syncIcon).toHaveStyle({ color: "#66BB6A" });
  });

  test("should handle theme button click", () => {
    render(<BottomToolbar {...defaultProps} />);

    const themeButton = screen.getByLabelText("Theme");
    fireEvent.click(themeButton);

    // Should show theme menu
    expect(screen.getByTestId("lightmode-icon")).toBeInTheDocument();
    expect(screen.getByTestId("darkmode-icon")).toBeInTheDocument();
  });

  test("should call onThemeSelect when theme option is clicked", () => {
    render(<BottomToolbar {...defaultProps} />);

    // Open theme menu
    const themeButton = screen.getByLabelText("Theme");
    fireEvent.click(themeButton);

    // Click dark theme
    const darkThemeButton = screen.getByLabelText("Dark theme");
    fireEvent.click(darkThemeButton);

    expect(defaultProps.onThemeSelect).toHaveBeenCalledWith("dark");
  });

  test("should handle narrow screen layout", () => {
    // Set narrow screen
    const { Dimensions } = require("react-native");
    Dimensions.get.mockReturnValue({ width: 400, height: 800 });

    render(<BottomToolbar {...defaultProps} />);

    // Should show More icon for overflow
    expect(screen.getByTestId("more-icon")).toBeInTheDocument();
  });

  test("should handle overflow menu in narrow layout", () => {
    // Set narrow screen
    const { Dimensions } = require("react-native");
    Dimensions.get.mockReturnValue({ width: 400, height: 800 });

    render(<BottomToolbar {...defaultProps} />);

    const moreButton = screen.getByLabelText("More options");
    fireEvent.click(moreButton);

    // Should show modal with More Options
    expect(screen.getByText("More Options")).toBeInTheDocument();
  });

  test("should show close button with error color", () => {
    render(<BottomToolbar {...defaultProps} />);

    const closeIcon = screen.getByTestId("logout-icon");
    expect(closeIcon).toHaveStyle({ color: "#EF5350" });
  });

  test("should handle missing props gracefully", () => {
    const minimalProps = {
      onShare: jest.fn(),
      onPrintClick: jest.fn(),
      onSyncClick: jest.fn(),
      onThemeToggle: jest.fn(),
      onPrivacyClick: jest.fn(),
      onSupportClick: jest.fn(),
      onCloseProfile: jest.fn(),
      theme: "light",
      colors: { primary: "#a08670" },
    };

    expect(() => {
      render(<BottomToolbar {...minimalProps} />);
    }).not.toThrow();
  });

  test("should have proper accessibility attributes", () => {
    render(<BottomToolbar {...defaultProps} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);

    // Check some specific accessibility labels
    expect(screen.getByLabelText("Share")).toBeInTheDocument();
    expect(screen.getByLabelText("Print")).toBeInTheDocument();
    expect(screen.getByLabelText("Sync")).toBeInTheDocument();
  });
});