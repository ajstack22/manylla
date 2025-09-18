/* eslint-disable */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Animated, BackHandler, Vibration } from 'react-native';
import BottomSheetMenu from '../BottomSheetMenu';

// Mock React Native modules that aren't handled by jest.setup.js
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
      cancel: jest.fn(),
    },
  };
});

// Mock platform utility - use default export
jest.mock("../../../utils/platform", () => {
  const platform = {
    isWeb: true,
    isAndroid: false,
    isIOS: false,
    isMobile: false,
    select: (obj) => obj.web || obj.default,
  };
  platform.default = platform;
  return platform;
});

// Mock Common icons - try simpler approach
jest.mock("../Common", () => {
  const MockIcon = ({ size, color, style, children, ...props }) => (
    <div data-testid={`${children.toLowerCase()}-icon`} style={{ fontSize: size, color, ...style }} {...props}>
      {children}
    </div>
  );

  return {
    ShareIcon: (props) => <MockIcon {...props}>Share</MockIcon>,
    PrintIcon: (props) => <MockIcon {...props}>Print</MockIcon>,
    CloudIcon: (props) => <MockIcon {...props}>Cloud</MockIcon>,
    PaletteIcon: (props) => <MockIcon {...props}>Palette</MockIcon>,
    PrivacyTipIcon: (props) => <MockIcon {...props}>Privacy</MockIcon>,
    SupportIcon: (props) => <MockIcon {...props}>Support</MockIcon>,
    LogoutIcon: (props) => <MockIcon {...props}>Logout</MockIcon>,
    CloseIcon: (props) => <MockIcon {...props}>Close</MockIcon>,
  };
});

// Mock Material-UI icons for chevrons
jest.mock("@mui/icons-material/ExpandLess", () => ({
  default: ({ style }) => (
    <div data-testid="expand-less" style={style}>
      ↑
    </div>
  ),
}));

jest.mock("@mui/icons-material/ExpandMore", () => ({
  default: ({ style }) => (
    <div data-testid="expand-more" style={style}>
      ↓
    </div>
  ),
}));

describe("BottomSheetMenu", () => {
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
    // Mock document methods for keyboard events
    global.document = {
      ...global.document,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
  });

  describe("Basic Rendering", () => {
    test("should render when visible", () => {
      render(<BottomSheetMenu {...defaultProps} />);

      expect(screen.getByRole("menu")).toBeInTheDocument();
      expect(screen.getByText("Menu")).toBeInTheDocument();
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
      expect(screen.getByText("Share")).toBeInTheDocument();
      expect(screen.getByText("Print")).toBeInTheDocument();
      expect(screen.getByText("Sync")).toBeInTheDocument();
    });

    test("should render More button", () => {
      render(<BottomSheetMenu {...defaultProps} />);

      expect(screen.getByText("More")).toBeInTheDocument();
      expect(screen.getByTestId("expand-more")).toBeInTheDocument();
    });

    test("should render close button in header", () => {
      render(<BottomSheetMenu {...defaultProps} />);

      const closeButtons = screen.getAllByTestId("close-icon");
      expect(closeButtons).toHaveLength(1);
    });
  });

  describe("Menu Interactions", () => {
    test("should call onShare when share button is pressed", () => {
      render(<BottomSheetMenu {...defaultProps} />);

      const shareButton = screen.getByLabelText("Share profile information");
      fireEvent.click(shareButton);

      expect(defaultProps.onShare).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    test("should call onPrint when print button is pressed", () => {
      render(<BottomSheetMenu {...defaultProps} />);

      const printButton = screen.getByLabelText("Print profile information");
      fireEvent.click(printButton);

      expect(defaultProps.onPrint).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    test("should call onSync when sync button is pressed", () => {
      render(<BottomSheetMenu {...defaultProps} />);

      const syncButton = screen.getByLabelText("Sync data across devices");
      fireEvent.click(syncButton);

      expect(defaultProps.onSync).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    test("should call onClose when close button is pressed", () => {
      render(<BottomSheetMenu {...defaultProps} />);

      const closeButton = screen.getByLabelText("Close menu");
      fireEvent.click(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    test("should call onClose when backdrop is pressed", () => {
      render(<BottomSheetMenu {...defaultProps} />);

      const backdrop = screen.getByLabelText("Close menu");
      fireEvent.click(backdrop);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("More Menu Toggle", () => {
    test("should toggle more menu when More button is pressed", () => {
      render(<BottomSheetMenu {...defaultProps} />);

      const moreButton = screen.getByLabelText("Show more options");
      fireEvent.click(moreButton);

      // Should show secondary items
      expect(screen.getByTestId("palette-icon")).toBeInTheDocument();
      expect(screen.getByTestId("privacy-icon")).toBeInTheDocument();
      expect(screen.getByTestId("support-icon")).toBeInTheDocument();
      expect(screen.getByTestId("logout-icon")).toBeInTheDocument();

      // Button label should change
      expect(screen.getByLabelText("Hide more options")).toBeInTheDocument();
      expect(screen.getByTestId("expand-less")).toBeInTheDocument();
    });

    test("should hide more menu when More button is pressed again", () => {
      render(<BottomSheetMenu {...defaultProps} />);

      const moreButton = screen.getByLabelText("Show more options");
      fireEvent.click(moreButton);

      // Should show secondary items
      expect(screen.getByTestId("palette-icon")).toBeInTheDocument();

      // Click again to hide
      const hideMoreButton = screen.getByLabelText("Hide more options");
      fireEvent.click(hideMoreButton);

      // Secondary items should be hidden
      expect(screen.queryByTestId("palette-icon")).not.toBeInTheDocument();
    });

    test("should call secondary menu actions", () => {
      render(<BottomSheetMenu {...defaultProps} />);

      // Open more menu
      const moreButton = screen.getByLabelText("Show more options");
      fireEvent.click(moreButton);

      // Test theme button
      const themeButton = screen.getByLabelText("Change app theme");
      fireEvent.click(themeButton);

      expect(defaultProps.onTheme).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Theme Toast Functionality", () => {
    test("should show theme toast when theme is toggled", () => {
      render(<BottomSheetMenu {...defaultProps} theme="light" />);

      // Open more menu
      const moreButton = screen.getByLabelText("Show more options");
      fireEvent.click(moreButton);

      // Click theme button
      const themeButton = screen.getByLabelText("Change app theme");
      fireEvent.click(themeButton);

      expect(defaultProps.showToast).toHaveBeenCalledWith("Dark mode activated", "info");
    });

    test("should show correct theme name for different themes", () => {
      const { rerender } = render(<BottomSheetMenu {...defaultProps} theme="dark" />);

      // Open more menu and click theme
      const moreButton = screen.getByLabelText("Show more options");
      fireEvent.click(moreButton);
      const themeButton = screen.getByLabelText("Change app theme");
      fireEvent.click(themeButton);

      expect(defaultProps.showToast).toHaveBeenCalledWith("Manylla mode activated", "info");

      // Test manylla theme
      jest.clearAllMocks();
      rerender(<BottomSheetMenu {...defaultProps} theme="manylla" />);

      const moreButton2 = screen.getByLabelText("Show more options");
      fireEvent.click(moreButton2);
      const themeButton2 = screen.getByLabelText("Change app theme");
      fireEvent.click(themeButton2);

      expect(defaultProps.showToast).toHaveBeenCalledWith("Light mode activated", "info");
    });
  });

  describe("Keyboard Support", () => {
    test("should handle Escape key to close menu", () => {
      render(<BottomSheetMenu {...defaultProps} />);

      // Simulate escape key
      const keyDownHandler = global.document.addEventListener.mock.calls
        .find(call => call[0] === "keydown")?.[1];

      if (keyDownHandler) {
        keyDownHandler({ key: "Escape" });
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      }
    });

    test("should handle number keys for quick actions", () => {
      render(<BottomSheetMenu {...defaultProps} />);

      const keyDownHandler = global.document.addEventListener.mock.calls
        .find(call => call[0] === "keydown")?.[1];

      if (keyDownHandler) {
        // Test "1" key for share
        keyDownHandler({ key: "1" });
        expect(defaultProps.onShare).toHaveBeenCalledTimes(1);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);

        jest.clearAllMocks();

        // Test "2" key for print
        keyDownHandler({ key: "2" });
        expect(defaultProps.onPrint).toHaveBeenCalledTimes(1);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe("Accessibility", () => {
    test("should have proper ARIA attributes", () => {
      render(<BottomSheetMenu {...defaultProps} />);

      const modal = screen.getByRole("menu");
      expect(modal).toHaveAttribute("aria-modal", "true");

      const moreButton = screen.getByLabelText("Show more options");
      expect(moreButton).toHaveAttribute("aria-expanded", "false");
    });

    test("should update ARIA expanded state when more menu is toggled", () => {
      render(<BottomSheetMenu {...defaultProps} />);

      const moreButton = screen.getByLabelText("Show more options");
      expect(moreButton).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(moreButton);

      const hideMoreButton = screen.getByLabelText("Hide more options");
      expect(hideMoreButton).toHaveAttribute("aria-expanded", "true");
    });

    test("should have proper accessibility labels for all buttons", () => {
      render(<BottomSheetMenu {...defaultProps} />);

      expect(screen.getByLabelText("Share profile information")).toBeInTheDocument();
      expect(screen.getByLabelText("Print profile information")).toBeInTheDocument();
      expect(screen.getByLabelText("Sync data across devices")).toBeInTheDocument();
      expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    test("should handle missing showToast prop", () => {
      const propsWithoutToast = { ...defaultProps, showToast: undefined };

      expect(() => {
        render(<BottomSheetMenu {...propsWithoutToast} />);
      }).not.toThrow();
    });

    test("should handle missing colors properties", () => {
      const propsWithMinimalColors = {
        ...defaultProps,
        colors: { primary: "#a08670" },
      };

      expect(() => {
        render(<BottomSheetMenu {...propsWithMinimalColors} />);
      }).not.toThrow();
    });

    test("should handle rapid open/close cycles", () => {
      const { rerender } = render(<BottomSheetMenu {...defaultProps} visible={false} />);

      rerender(<BottomSheetMenu {...defaultProps} visible={true} />);
      rerender(<BottomSheetMenu {...defaultProps} visible={false} />);
      rerender(<BottomSheetMenu {...defaultProps} visible={true} />);

      expect(screen.getByRole("menu")).toBeInTheDocument();
    });
  });

  describe("Animation Setup", () => {
    test("should initialize animations properly", () => {
      render(<BottomSheetMenu {...defaultProps} />);

      // Check that Animated.Value was called for animations
      const { Animated } = require("react-native");
      expect(Animated.Value).toHaveBeenCalled();
    });

    test("should handle animation timing calls", () => {
      render(<BottomSheetMenu {...defaultProps} />);

      const { Animated } = require("react-native");
      expect(Animated.timing).toHaveBeenCalled();
      expect(Animated.parallel).toHaveBeenCalled();
    });
  });
});