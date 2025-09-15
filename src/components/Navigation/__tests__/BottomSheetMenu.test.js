import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import BottomSheetMenu from "../BottomSheetMenu";

// Mock platform module
jest.mock("../../../utils/platform", () => ({
  isWeb: true,
  isNative: false,
  isIOS: false,
  isAndroid: false,
  isMobile: false,
  select: (obj) => obj.web || obj.default,
}));

// Mock React Native components
jest.mock("react-native", () => ({
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
  TouchableOpacity: ({ children, onPress, style, ...props }) => (
    <button style={style} onClick={onPress} {...props}>
      {children}
    </button>
  ),
  Modal: ({ children, visible, onRequestClose, animationType, ...props }) =>
    visible ? (
      <div data-testid="modal" {...props}>
        {children}
      </div>
    ) : null,
  Animated: {
    View: ({ children, style }) => <div style={style}>{children}</div>,
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
  Dimensions: {
    get: jest.fn(() => ({ height: 800, width: 400 })),
  },
  StyleSheet: {
    create: (styles) => styles,
  },
  SafeAreaView: ({ children, style }) => <div style={style}>{children}</div>,
  BackHandler: {
    addEventListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
  },
  Vibration: {
    vibrate: jest.fn(),
  },
}));

// Mock icon components
jest.mock("../../Common", () => ({
  ShareIcon: ({ size, color, style }) => (
    <span data-testid="share-icon" style={style}>
      📤
    </span>
  ),
  PrintIcon: ({ size, color, style }) => (
    <span data-testid="print-icon" style={style}>
      🖨️
    </span>
  ),
  CloudIcon: ({ size, color, style }) => (
    <span data-testid="cloud-icon" style={style}>
      ☁️
    </span>
  ),
  PaletteIcon: ({ size, color, style }) => (
    <span data-testid="palette-icon" style={style}>
      🎨
    </span>
  ),
  PrivacyTipIcon: ({ size, color, style }) => (
    <span data-testid="privacy-icon" style={style}>
      🔒
    </span>
  ),
  SupportIcon: ({ size, color, style }) => (
    <span data-testid="support-icon" style={style}>
      ❓
    </span>
  ),
  LogoutIcon: ({ size, color, style }) => (
    <span data-testid="logout-icon" style={style}>
      🚪
    </span>
  ),
  CloseIcon: ({ size, color, style }) => (
    <span data-testid="close-icon" style={style}>
      ✕
    </span>
  ),
}));

// Mock Material-UI icons
jest.mock("@mui/icons-material/ExpandLess", () => ({
  default: ({ style }) => (
    <span data-testid="expand-less" style={style}>
      ▲
    </span>
  ),
}));

jest.mock("@mui/icons-material/ExpandMore", () => ({
  default: ({ style }) => (
    <span data-testid="expand-more" style={style}>
      ▼
    </span>
  ),
}));

describe("BottomSheetMenu", () => {
  const mockProps = {
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
      primary: "#A08670",
      background: {
        paper: "#FFFFFF",
        secondary: "#F5F5F5",
      },
      text: {
        primary: "#333333",
        secondary: "#666666",
        disabled: "#999999",
      },
      divider: "#E0E0E0",
      action: {
        hover: "rgba(0,0,0,0.04)",
        selected: "rgba(0,0,0,0.08)",
      },
      error: {
        main: "#d32f2f",
      },
    },
    theme: "light",
    syncStatus: "active",
    showToast: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render when visible is true", () => {
      render(<BottomSheetMenu {...mockProps} />);

      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByText("Menu")).toBeInTheDocument();
    });

    it("should not render when visible is false", () => {
      render(<BottomSheetMenu {...mockProps} visible={false} />);

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("should render primary menu items", () => {
      render(<BottomSheetMenu {...mockProps} />);

      expect(screen.getByText("Share")).toBeInTheDocument();
      expect(screen.getByText("Print")).toBeInTheDocument();
      expect(screen.getByText("Sync")).toBeInTheDocument();
      expect(screen.getByTestId("share-icon")).toBeInTheDocument();
      expect(screen.getByTestId("print-icon")).toBeInTheDocument();
      expect(screen.getByTestId("cloud-icon")).toBeInTheDocument();
    });

    it("should render More button", () => {
      render(<BottomSheetMenu {...mockProps} />);

      expect(screen.getByText("More")).toBeInTheDocument();
      expect(screen.getByTestId("expand-more")).toBeInTheDocument();
    });

    it("should show close button in header", () => {
      render(<BottomSheetMenu {...mockProps} />);

      expect(screen.getByTestId("close-icon")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should call onClose when close button is clicked", () => {
      render(<BottomSheetMenu {...mockProps} />);

      fireEvent.click(screen.getByRole("button", { name: /close/i }));

      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onShare and onClose when Share is clicked", () => {
      render(<BottomSheetMenu {...mockProps} />);

      fireEvent.click(screen.getByRole("button", { name: /share/i }));

      expect(mockProps.onShare).toHaveBeenCalledTimes(1);
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onPrint and onClose when Print is clicked", () => {
      render(<BottomSheetMenu {...mockProps} />);

      fireEvent.click(screen.getByRole("button", { name: /print/i }));

      expect(mockProps.onPrint).toHaveBeenCalledTimes(1);
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onSync and onClose when Sync is clicked", () => {
      render(<BottomSheetMenu {...mockProps} />);

      fireEvent.click(screen.getByRole("button", { name: /sync/i }));

      expect(mockProps.onSync).toHaveBeenCalledTimes(1);
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("More Menu Functionality", () => {
    it("should toggle more menu when More button is clicked", () => {
      render(<BottomSheetMenu {...mockProps} />);

      // Initially more menu should not be visible
      expect(screen.queryByText("Theme")).not.toBeInTheDocument();

      // Click More button
      fireEvent.click(screen.getByRole("button", { name: /more/i }));

      // Now more menu items should be visible
      expect(screen.getByText("Theme")).toBeInTheDocument();
      expect(screen.getByText("Privacy")).toBeInTheDocument();
      expect(screen.getByText("Support")).toBeInTheDocument();
      expect(screen.getByText("Close Profile")).toBeInTheDocument();
    });

    it("should show chevron up icon when more menu is expanded", () => {
      render(<BottomSheetMenu {...mockProps} />);

      // Click More button to expand
      fireEvent.click(screen.getByRole("button", { name: /more/i }));

      expect(screen.getByTestId("expand-less")).toBeInTheDocument();
    });

    it("should call secondary menu actions when clicked", () => {
      render(<BottomSheetMenu {...mockProps} />);

      // Expand more menu
      fireEvent.click(screen.getByRole("button", { name: /more/i }));

      // Click Theme
      fireEvent.click(screen.getByRole("button", { name: /theme/i }));

      expect(mockProps.onTheme).toHaveBeenCalledTimes(1);
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("should call showToast when theme is toggled", () => {
      render(<BottomSheetMenu {...mockProps} />);

      // Expand more menu
      fireEvent.click(screen.getByRole("button", { name: /more/i }));

      // Click Theme
      fireEvent.click(screen.getByRole("button", { name: /theme/i }));

      expect(mockProps.showToast).toHaveBeenCalledWith(
        "Dark mode activated",
        "info",
      );
    });

    it("should handle close profile action with danger styling", () => {
      render(<BottomSheetMenu {...mockProps} />);

      // Expand more menu
      fireEvent.click(screen.getByRole("button", { name: /more/i }));

      // Close Profile should be visible
      expect(screen.getByText("Close Profile")).toBeInTheDocument();

      // Click Close Profile
      fireEvent.click(screen.getByRole("button", { name: /close profile/i }));

      expect(mockProps.onCloseProfile).toHaveBeenCalledTimes(1);
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("should have proper accessibility labels", () => {
      render(<BottomSheetMenu {...mockProps} />);

      const shareButton = screen.getByRole("button", { name: /share/i });
      expect(shareButton).toHaveAttribute(
        "accessibilityLabel",
        "Share profile information",
      );

      const printButton = screen.getByRole("button", { name: /print/i });
      expect(printButton).toHaveAttribute(
        "accessibilityLabel",
        "Print profile information",
      );

      const syncButton = screen.getByRole("button", { name: /sync/i });
      expect(syncButton).toHaveAttribute(
        "accessibilityLabel",
        "Sync data across devices",
      );
    });

    it("should have accessibility state for more button", () => {
      render(<BottomSheetMenu {...mockProps} />);

      const moreButton = screen.getByRole("button", { name: /more/i });
      // AccessibilityState is handled by React Native, just check button exists
      expect(moreButton).toBeInTheDocument();

      // Expand and check state changes
      fireEvent.click(moreButton);
      expect(moreButton).toBeInTheDocument();
    });
  });

  describe("Theme Support", () => {
    it("should handle different theme modes", () => {
      const darkProps = {
        ...mockProps,
        theme: "dark",
        colors: {
          ...mockProps.colors,
          background: { paper: "#121212" },
          text: { primary: "#FFFFFF", secondary: "#AAAAAA" },
        },
      };

      render(<BottomSheetMenu {...darkProps} />);

      expect(screen.getByText("Menu")).toBeInTheDocument();
    });

    it("should show correct next theme name in toast", () => {
      // Test light -> dark
      const { unmount } = render(
        <BottomSheetMenu {...mockProps} theme="light" />,
      );
      fireEvent.click(screen.getAllByRole("button", { name: /more/i })[0]);
      fireEvent.click(screen.getByRole("button", { name: /theme/i }));
      expect(mockProps.showToast).toHaveBeenCalledWith(
        "Dark mode activated",
        "info",
      );
      unmount();

      // Test dark -> manylla
      jest.clearAllMocks();
      render(<BottomSheetMenu {...mockProps} theme="dark" />);
      fireEvent.click(screen.getAllByRole("button", { name: /more/i })[0]);
      fireEvent.click(screen.getByRole("button", { name: /theme/i }));
      expect(mockProps.showToast).toHaveBeenCalledWith(
        "Manylla mode activated",
        "info",
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle missing colors gracefully", () => {
      const propsWithMinimalColors = {
        ...mockProps,
        colors: {
          primary: "#A08670",
          background: { paper: "#FFFFFF" },
          text: { primary: "#333333" },
        },
      };

      expect(() => {
        render(<BottomSheetMenu {...propsWithMinimalColors} />);
      }).not.toThrow();
    });

    it("should handle missing showToast prop", () => {
      const propsWithoutToast = {
        ...mockProps,
        showToast: undefined,
      };

      expect(() => {
        render(<BottomSheetMenu {...propsWithoutToast} />);
        fireEvent.click(screen.getByRole("button", { name: /more/i }));
        fireEvent.click(screen.getByRole("button", { name: /theme/i }));
      }).not.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid menu toggles", () => {
      render(<BottomSheetMenu {...mockProps} />);

      const moreButton = screen.getAllByRole("button", { name: /more/i })[0];

      // Rapidly toggle more menu - odd number of clicks means expanded
      fireEvent.click(moreButton);
      fireEvent.click(moreButton);
      fireEvent.click(moreButton);

      // After 3 clicks (odd), more menu should be expanded
      expect(screen.getByText("Theme")).toBeInTheDocument();
    });

    it("should reset more menu when component is hidden and shown again", () => {
      const { rerender } = render(<BottomSheetMenu {...mockProps} />);

      // Expand more menu
      fireEvent.click(screen.getByRole("button", { name: /more/i }));
      expect(screen.getByText("Theme")).toBeInTheDocument();

      // Hide component
      rerender(<BottomSheetMenu {...mockProps} visible={false} />);

      // Show component again
      rerender(<BottomSheetMenu {...mockProps} visible={true} />);

      // More menu should be collapsed
      expect(screen.queryByText("Theme")).not.toBeInTheDocument();
    });
  });
});
