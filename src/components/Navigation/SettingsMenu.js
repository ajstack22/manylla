import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import {
  ShareIcon,
  PrintIcon,
  CloudIcon,
  PaletteIcon,
  PrivacyTipIcon,
  SupportIcon,
  LogoutIcon,
  LightModeIcon,
  DarkModeIcon,
  CheckCircleIcon,
  CloseIcon,
} from "../Common";
import platform from "../../utils/platform";

const SettingsMenu = ({
  visible,
  onClose,
  onShare,
  onPrintClick,
  onSyncClick,
  onThemeSelect,
  onPrivacyClick,
  onSupportClick,
  onCloseProfile,
  theme,
  colors,
  syncStatus,
  showToast,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // Get sync status color
  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case "syncing":
        return colors.warning || "#FFA726";
      case "error":
        return colors.error || "#EF5350";
      case "success":
        return colors.success || "#66BB6A";
      default:
        return colors.text?.primary || colors.primary || "#A08670";
    }
  };

  // Helper: Get display name for theme
  const getThemeName = (themeKey) => {
    return themeKey === "light"
      ? "Light"
      : themeKey === "dark"
        ? "Dark"
        : "manylla";
  };

  // Helper: Show theme toast notification
  const showThemeToast = (selectedTheme) => {
    if (showToast) {
      const themeName = getThemeName(selectedTheme);
      showToast(`${themeName} theme activated`, "info");
    }
  };

  // Handle theme selection
  const handleThemeSelect = (selectedTheme) => {
    setShowThemeMenu(false);
    if (onThemeSelect) {
      onThemeSelect(selectedTheme);
      showThemeToast(selectedTheme);
    }
  };

  // Handle menu item press
  const handleMenuItemPress = (action) => {
    if (action) {
      action();
    }
    // Don't close menu for theme button (it opens submenu)
    if (action !== (() => setShowThemeMenu(!showThemeMenu))) {
      onClose();
    }
  };

  const styles = createStyles(colors);

  // Menu items in specified order
  const menuItems = [
    {
      id: "theme",
      label: "Theme",
      icon: PaletteIcon,
      action: () => setShowThemeMenu(!showThemeMenu),
    },
    { id: "share", label: "Share", icon: ShareIcon, action: onShare },
    {
      id: "sync",
      label: "Sync",
      icon: CloudIcon,
      action: onSyncClick,
      color: getSyncStatusColor(),
    },
    { id: "print", label: "Print", icon: PrintIcon, action: onPrintClick },
    {
      id: "privacy",
      label: "Privacy",
      icon: PrivacyTipIcon,
      action: onPrivacyClick,
    },
    {
      id: "support",
      label: "Support Us",
      icon: SupportIcon,
      action: onSupportClick,
    },
    {
      id: "close",
      label: "Close",
      icon: LogoutIcon,
      action: onCloseProfile,
      color: colors.error || "#EF5350",
    },
  ];

  // Theme submenu items
  const themeItems = [
    { id: "light", label: "Light", icon: LightModeIcon },
    { id: "dark", label: "Dark", icon: DarkModeIcon },
    { id: "manylla", label: "manylla", icon: PaletteIcon },
  ];

  const MenuButton = ({ item }) => {
    const Icon = item.icon;
    const itemColor =
      item.color || colors.text?.primary || colors.primary || "#A08670";

    return (
      <TouchableOpacity
        onPress={() => handleMenuItemPress(item.action)}
        style={styles.menuItem}
        accessibilityLabel={item.label}
        accessibilityRole="button"
      >
        <Icon size={24} color={itemColor} />
        <Text style={[styles.menuLabel, { color: itemColor }]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const ThemeMenuItem = ({ item }) => {
    const Icon = item.icon;
    const isActive = theme === item.id;
    const itemColor = colors.text?.primary || colors.primary || "#A08670";

    return (
      <TouchableOpacity
        onPress={() => handleThemeSelect(item.id)}
        style={styles.submenuItem}
        accessibilityLabel={`${item.label} theme`}
        accessibilityRole="button"
      >
        <Icon size={22} color={itemColor} />
        <Text style={[styles.submenuLabel, { color: itemColor }]}>
          {item.label}
        </Text>
        {isActive && (
          <CheckCircleIcon
            size={18}
            color={theme === "dark" ? "#FFFFFF" : colors.primary}
          />
        )}
      </TouchableOpacity>
    );
  };

  // Mobile: Modal with slide-up animation
  if (!platform.isWeb) {
    return (
      <>
        <Modal
          visible={visible}
          transparent={true}
          animationType="slide"
          onRequestClose={onClose}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={onClose}
            activeOpacity={1}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Settings</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <CloseIcon
                    size={24}
                    color={colors.text?.primary || colors.primary || "#333"}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {menuItems.map((item) => (
                  <MenuButton key={item.id} item={item} />
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Theme submenu modal */}
        <Modal
          visible={showThemeMenu}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowThemeMenu(false)}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setShowThemeMenu(false)}
            activeOpacity={1}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Theme</Text>
                <TouchableOpacity
                  onPress={() => setShowThemeMenu(false)}
                  style={styles.closeButton}
                >
                  <CloseIcon
                    size={24}
                    color={colors.text?.primary || colors.primary || "#333"}
                  />
                </TouchableOpacity>
              </View>
              {themeItems.map((item) => (
                <ThemeMenuItem key={item.id} item={item} />
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </>
    );
  }

  // Web: Side panel
  return (
    <>
      {visible && (
        <>
          {/* Backdrop */}
          <TouchableOpacity
            style={styles.webBackdrop}
            onPress={onClose}
            activeOpacity={1}
          />
          {/* Side panel */}
          <View style={styles.webPanel}>
            <View style={styles.webHeader}>
              <Text style={styles.webTitle}>Settings</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <CloseIcon
                  size={24}
                  color={colors.text?.primary || colors.primary || "#333"}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.webContent}>
              {menuItems.map((item) => (
                <MenuButton key={item.id} item={item} />
              ))}
            </ScrollView>
          </View>
        </>
      )}

      {/* Theme submenu for web */}
      {showThemeMenu && platform.isWeb && (
        <>
          <TouchableOpacity
            style={styles.submenuBackdrop}
            onPress={() => setShowThemeMenu(false)}
            activeOpacity={1}
          />
          <View style={styles.webSubmenu}>
            <View style={styles.webSubmenuHeader}>
              <Text style={styles.webSubmenuTitle}>Select Theme</Text>
            </View>
            {themeItems.map((item) => (
              <ThemeMenuItem key={item.id} item={item} />
            ))}
          </View>
        </>
      )}
    </>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    // Mobile modal styles
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.background?.paper || colors.surface || "#FFFFFF",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      paddingBottom: 40,
      minHeight: 400,
      maxHeight: "80%",
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider || "#E0E0E0",
      marginBottom: 10,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text?.primary || colors.primary || "#333333",
    },
    closeButton: {
      padding: 8,
      borderRadius: 20,
      ...platform.select({
        web: {
          cursor: "pointer",
          ":hover": {
            backgroundColor: colors.action?.hover || "rgba(0,0,0,0.04)",
          },
        },
      }),
    },

    // Web side panel styles
    webBackdrop: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 1000,
    },
    webPanel: {
      position: "fixed",
      top: 0,
      right: 0,
      bottom: 0,
      width: 320,
      backgroundColor: colors.background?.paper || colors.surface || "#FFFFFF",
      borderLeftWidth: 1,
      borderLeftColor: colors.divider || "#E0E0E0",
      shadowColor: "#000",
      shadowOffset: { width: -2, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      zIndex: 1001,
    },
    webHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider || "#E0E0E0",
    },
    webTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text?.primary || colors.primary || "#333333",
    },
    webContent: {
      flex: 1,
    },

    // Menu item styles (shared)
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 20,
      gap: 16,
      ...platform.select({
        web: {
          cursor: "pointer",
          ":hover": {
            backgroundColor: colors.action?.hover || "rgba(0,0,0,0.04)",
          },
        },
      }),
    },
    menuLabel: {
      fontSize: 16,
      fontWeight: "500",
      flex: 1,
    },

    // Submenu styles
    submenuBackdrop: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "transparent",
      zIndex: 1002,
    },
    webSubmenu: {
      position: "fixed",
      top: 100,
      right: 340, // Position to left of main panel
      width: 200,
      backgroundColor: colors.background?.paper || colors.surface || "#FFFFFF",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.divider || "#E0E0E0",
      shadowColor: "#000",
      shadowOffset: { width: -2, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      zIndex: 1003,
    },
    webSubmenuHeader: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider || "#E0E0E0",
    },
    webSubmenuTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text?.secondary || "#666666",
    },
    submenuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      gap: 12,
      ...platform.select({
        web: {
          cursor: "pointer",
          ":hover": {
            backgroundColor: colors.action?.hover || "rgba(0,0,0,0.04)",
          },
        },
      }),
    },
    submenuLabel: {
      fontSize: 14,
      fontWeight: "500",
      flex: 1,
    },
  });

export default SettingsMenu;
