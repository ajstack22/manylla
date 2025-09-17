/**
 * Simplified BottomSheetMenu Tests
 * Focus on basic functionality with minimal mocking
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock all dependencies upfront
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  return {
    ...RN,
    Animated: {
      Value: jest.fn(() => ({
        interpolate: jest.fn(() => ({})),
      })),
      timing: jest.fn(() => ({
        start: jest.fn(),
      })),
      parallel: jest.fn(() => ({
        start: jest.fn(),
      })),
    },
    BackHandler: {
      addEventListener: jest.fn(() => ({
        remove: jest.fn(),
      })),
    },
    Vibration: {
      vibrate: jest.fn(),
    },
  };
});

// Mock platform with absolute path
jest.mock("/Users/adamstack/manylla/src/utils/platform", () => ({
  isWeb: true,
  isAndroid: false,
  isIOS: false,
  isMobile: false,
  select: (obj) => obj.web || obj.default,
}));

// Mock the Common module with absolute path
jest.mock("/Users/adamstack/manylla/src/components/Common", () => ({
  ShareIcon: ({ size, color, style }) => (
    <div data-testid="share-icon" style={{ fontSize: size, color, ...style }}>
      Share
    </div>
  ),
  PrintIcon: ({ size, color, style }) => (
    <div data-testid="print-icon" style={{ fontSize: size, color, ...style }}>
      Print
    </div>
  ),
  CloudIcon: ({ size, color, style }) => (
    <div data-testid="cloud-icon" style={{ fontSize: size, color, ...style }}>
      Cloud
    </div>
  ),
  PaletteIcon: ({ size, color, style }) => (
    <div data-testid="palette-icon" style={{ fontSize: size, color, ...style }}>
      Palette
    </div>
  ),
  PrivacyTipIcon: ({ size, color, style }) => (
    <div data-testid="privacy-icon" style={{ fontSize: size, color, ...style }}>
      Privacy
    </div>
  ),
  SupportIcon: ({ size, color, style }) => (
    <div data-testid="support-icon" style={{ fontSize: size, color, ...style }}>
      Support
    </div>
  ),
  LogoutIcon: ({ size, color, style }) => (
    <div data-testid="logout-icon" style={{ fontSize: size, color, ...style }}>
      Logout
    </div>
  ),
  CloseIcon: ({ size, color, style }) => (
    <div data-testid="close-icon" style={{ fontSize: size, color, ...style }}>
      Close
    </div>
  ),
}));

jest.mock("@mui/icons-material/ExpandLess", () => ({
  default: ({ style }) => <div data-testid="expand-less" style={style}>↑</div>,
}));

jest.mock("@mui/icons-material/ExpandMore", () => ({
  default: ({ style }) => <div data-testid="expand-more" style={style}>↓</div>,
}));

// Now import the component
import BottomSheetMenu from "../BottomSheetMenu";

// P2 TECH DEBT: Remove skip when working on BottomSheetMenu
// Issue: Animation mocking
describe.skip("BottomSheetMenu Simplified Tests", () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onShare: jest.fn(),
    onPrint: jest.fn(),
    onSync: jest.fn(),
    onTheme: jest.fn(),
    onPrivacy: jest.fn(),
    onSupport: jest.fn(),
    onCloseProfile: jest.fn(),
    colors: {
      background: { paper: "#ffffff" },
      text: { primary: "#000000", secondary: "#666666" },
      primary: "#a08670",
      divider: "#e0e0e0",
    },
    theme: "light",
    syncStatus: "success",
    showToast: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.document = {
      ...global.document,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
  });

  test("should render when visible", () => {
    render(<BottomSheetMenu {...defaultProps} />);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  test("should not render when not visible", () => {
    render(<BottomSheetMenu {...defaultProps} visible={false} />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  test("should render primary menu items", () => {
    render(<BottomSheetMenu {...defaultProps} />);

    expect(screen.getByTestId("share-icon")).toBeInTheDocument();
    expect(screen.getByTestId("print-icon")).toBeInTheDocument();
    expect(screen.getByTestId("cloud-icon")).toBeInTheDocument();
  });

  test("should call onClose when close button is pressed", () => {
    render(<BottomSheetMenu {...defaultProps} />);

    const closeButton = screen.getByLabelText("Close menu");
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test("should call action callbacks when buttons are pressed", () => {
    render(<BottomSheetMenu {...defaultProps} />);

    const shareButton = screen.getByLabelText("Share profile information");
    fireEvent.click(shareButton);

    expect(defaultProps.onShare).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test("should handle More button toggle", () => {
    render(<BottomSheetMenu {...defaultProps} />);

    const moreButton = screen.getByLabelText("Show more options");
    fireEvent.click(moreButton);

    // Should show secondary items
    expect(screen.getByTestId("palette-icon")).toBeInTheDocument();
    expect(screen.getByTestId("privacy-icon")).toBeInTheDocument();
  });

  test("should have proper accessibility attributes", () => {
    render(<BottomSheetMenu {...defaultProps} />);

    const modal = screen.getByRole("menu");
    expect(modal).toHaveAttribute("aria-modal", "true");
  });
});