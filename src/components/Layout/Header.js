import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Modal,
  SafeAreaView,
} from "react-native";
import {
  MenuIcon,
  ShareIcon,
  PrintIcon,
  CloudIcon,
  LabelIcon,
  LogoutIcon,
  CloseIcon,
  DarkModeIcon,
  LightModeIcon,
  PaletteIcon,
} from "../Common";

const Header = ({
  onSyncClick,
  onCloseProfile,
  onShare,
  onCategoriesClick,
  onQuickInfoClick,
  onPrintClick,
  syncStatus,
  onThemeToggle,
  theme,
  colors,
  showToast,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get("window").width,
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setWindowWidth(window.width);
    });

    return () => subscription?.remove();
  }, []);

  // Determine if we should show hamburger menu
  // On mobile (native) always show hamburger
  // On web, show hamburger when width < 768px (tablet breakpoint)
  const showHamburger = Platform.OS !== "web" || windowWidth < 768;

  const menuItems = [
    {
      label: "Share",
      icon: ShareIcon,
      onPress: () => {
        onShare();
        setMenuOpen(false);
      },
    },
    {
      label: "Print",
      icon: PrintIcon,
      onPress: () => {
        onPrintClick && onPrintClick();
        setMenuOpen(false);
      },
    },
    {
      label: "Sync",
      icon: CloudIcon,
      onPress: () => {
        onSyncClick();
        setMenuOpen(false);
      },
    },
    {
      label: "Categories",
      icon: LabelIcon,
      onPress: () => {
        onCategoriesClick();
        setMenuOpen(false);
      },
    },
    {
      label: "Theme",
      icon: PaletteIcon,
      onPress: () => {
        onThemeToggle();
        // Show toast with new theme name
        const nextTheme =
          theme === "light" ? "Dark" : theme === "dark" ? "Manylla" : "Light";
        if (showToast) {
          showToast(`${nextTheme} mode activated`, "info");
        }
        setMenuOpen(false);
      },
    },
    {
      label: "Sign Out",
      icon: LogoutIcon,
      onPress: () => {
        onCloseProfile();
        setMenuOpen(false);
      },
    },
  ];

  const styles = createStyles(colors);

  const renderDesktopMenu = () => (
    <View style={styles.headerActions}>
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={item.onPress}
          style={styles.headerButton}
        >
          <item.icon size={24} color={colors.text.primary} />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMobileMenu = () => (
    <>
      <TouchableOpacity
        onPress={() => setMenuOpen(true)}
        style={styles.menuButton}
      >
        <MenuIcon size={24} color={colors.text.primary} />
      </TouchableOpacity>

      <Modal
        visible={menuOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMenuOpen(false)}
      >
        <SafeAreaView style={styles.menuOverlay}>
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity
                onPress={() => setMenuOpen(false)}
                style={styles.closeButton}
              >
                <CloseIcon size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.menuItems}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={item.onPress}
                >
                  <View style={styles.menuItemContent}>
                    <item.icon size={24} color={colors.text.primary} />
                    <Text style={styles.menuItemText}>{item.label}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>manylla</Text>
        {showHamburger ? renderMobileMenu() : renderDesktopMenu()}
      </View>
    </View>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    header: {
      backgroundColor: colors.background.paper || "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor: colors.border || "#E0E0E0",
      ...Platform.select({
        ios: {
          paddingTop: 50,
        },
        android: {
          paddingTop: 24,
        },
        web: {
          paddingTop: 0,
        },
      }),
    },
    headerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
    },
    headerTitle: {
      fontSize: 34,
      fontWeight: "bold",
      color: colors.primary || "#8B7355",
    },
    headerActions: {
      flexDirection: "row",
      gap: 12,
    },
    headerButton: {
      padding: 8,
    },
    menuButton: {
      padding: 8,
    },
    menuIconText: {
      fontSize: 24,
      color: colors.text.primary || "#333333",
    },
    // Mobile menu styles
    menuOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    menuContainer: {
      backgroundColor: colors.background.paper || "#FFFFFF",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: Platform.OS === "ios" ? 20 : 0,
    },
    menuHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border || "#E0E0E0",
    },
    menuTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text.primary || "#333333",
    },
    closeButton: {
      padding: 4,
    },
    menuItems: {
      paddingVertical: 10,
    },
    menuItem: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    menuItemContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    menuItemText: {
      fontSize: 16,
      color: colors.text.primary || "#333333",
    },
  });

export default Header;
