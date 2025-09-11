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
  ScrollView,
  Image,
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

// Define consistent header height
export const HEADER_HEIGHT = Platform.select({
  web: 64,
  ios: 88, // Account for status bar
  android: 56,
  default: 56,
});

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
  profile,
  isProfileHidden,
  onEditProfile,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get("window").width || 0,
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
      label: "Close Profile",
      icon: LogoutIcon,
      onPress: () => {
        onCloseProfile();
        setMenuOpen(false);
      },
    },
  ];

  // Get sync icon based on status
  const getSyncIcon = () => {
    switch (syncStatus) {
      case "synced":
        return CloudIcon; // TODO: Use CloudDoneIcon when available
      case "error":
        return CloudIcon; // TODO: Use CloudAlertIcon when available
      case "not-setup":
      default:
        return CloudIcon;
    }
  };

  const SyncIcon = getSyncIcon();

  // Always use palette icon for theme
  const ThemeIcon = PaletteIcon;

  const styles = createStyles(colors);

  // Debug logging removed for production

  // Platform-specific container styles
  const headerContainerStyle = Platform.select({
    web: {
      ...styles.container,
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      width: "100%",
      // Add shadow for web
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      // Backdrop blur for web
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
    },
    default: styles.container,
  });

  return (
    <>
      <View style={headerContainerStyle}>
        <View style={styles.content}>
          <View style={styles.left}>
            {/* Transition between logo and profile with fade animation */}
            {Platform.OS === "web" ? (
              <View style={styles.transitionContainer}>
                {/* Manylla logo - fades out when profile is hidden */}
                <View
                  style={[
                    styles.logoContainer,
                    styles.fadeContainer,
                    {
                      opacity: profile && isProfileHidden ? 0 : 1,
                      transition: "opacity 0.3s ease-in-out",
                      pointerEvents:
                        profile && isProfileHidden ? "none" : "auto",
                    },
                  ]}
                >
                  <View
                    style={[styles.logoAvatar, styles.logoAvatarPlaceholder]}
                  >
                    <Text style={styles.logoAvatarText}>m</Text>
                  </View>
                  <Text style={styles.logo}>manylla</Text>
                </View>

                {/* Profile - fades in when profile is hidden */}
                {profile && (
                  <TouchableOpacity
                    onPress={onEditProfile}
                    style={[
                      styles.profileButton,
                      styles.fadeContainer,
                      {
                        opacity: isProfileHidden ? 1 : 0,
                        transition: "opacity 0.3s ease-in-out",
                        pointerEvents: isProfileHidden ? "auto" : "none",
                      },
                    ]}
                  >
                    <View style={styles.profileContent}>
                      {profile.photo && profile.photo !== "default" ? (
                        <Image
                          source={{ uri: profile.photo }}
                          style={styles.profileAvatar}
                        />
                      ) : (
                        <View
                          style={[
                            styles.profileAvatar,
                            styles.profileAvatarPlaceholder,
                          ]}
                        >
                          <Text style={styles.profileAvatarText}>
                            {profile.name?.charAt(0)?.toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.profileName} numberOfLines={1}>
                        {profile.preferredName || profile.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              // Mobile: No transition, just show logo
              <View style={styles.logoContainer}>
                <View style={[styles.logoAvatar, styles.logoAvatarPlaceholder]}>
                  <Text style={styles.logoAvatarText}>m</Text>
                </View>
                <Text style={styles.logo}>manylla</Text>
              </View>
            )}
          </View>

          <View style={styles.right}>
            {!showHamburger && (
              <>
                {/* Desktop buttons */}
                {onCategoriesClick && (
                  <TouchableOpacity
                    onPress={onCategoriesClick}
                    style={styles.iconButton}
                  >
                    <LabelIcon size={24} color={colors.primary || "#A08670"} />
                  </TouchableOpacity>
                )}
                {onShare && (
                  <TouchableOpacity onPress={onShare} style={styles.iconButton}>
                    <ShareIcon size={24} color={colors.primary || "#A08670"} />
                  </TouchableOpacity>
                )}
                {onSyncClick && (
                  <TouchableOpacity
                    onPress={onSyncClick}
                    style={styles.iconButton}
                  >
                    <SyncIcon size={24} color={colors.primary || "#A08670"} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={onThemeToggle}
                  style={styles.iconButton}
                >
                  <ThemeIcon size={24} color={colors.primary || "#A08670"} />
                </TouchableOpacity>
                {onCloseProfile && (
                  <TouchableOpacity
                    onPress={onCloseProfile}
                    style={styles.iconButton}
                  >
                    <LogoutIcon size={24} color={colors.primary || "#A08670"} />
                  </TouchableOpacity>
                )}
              </>
            )}

            {showHamburger && (
              <TouchableOpacity
                onPress={() => setMenuOpen(true)}
                style={styles.iconButton}
              >
                <MenuIcon size={24} color={colors.primary || "#A08670"} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Mobile menu modal */}
      <Modal
        visible={menuOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMenuOpen(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Menu</Text>
              <TouchableOpacity
                onPress={() => setMenuOpen(false)}
                style={styles.closeButton}
              >
                <CloseIcon size={24} color={colors.primary || "#A08670"} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.menuList}>
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={item.onPress}
                  >
                    <Icon size={24} color={colors.primary || "#A08670"} />
                    <Text style={styles.menuItemText}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      height: HEADER_HEIGHT,
      backgroundColor: colors.background.paper,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      justifyContent: "center",
      ...Platform.select({
        ios: {
          paddingTop: 44, // Status bar height on iOS
        },
        android: {
          paddingTop: 0,
        },
        web: {
          paddingTop: 0,
        },
      }),
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      height: "100%",
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      height: 36, // Match avatar height for perfect alignment
    },
    logo: {
      fontSize: 24,
      fontWeight: "600",
      color: colors.primary || "#A08670",
      ...Platform.select({
        web: {
          fontFamily:
            '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
        },
      }),
    },
    logoAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
    },
    logoAvatarPlaceholder: {
      backgroundColor: colors.primary || "#A08670",
      justifyContent: "center",
      alignItems: "center",
    },
    logoAvatarText: {
      color: colors.background.paper,
      fontSize: 20,
      fontWeight: "600",
      ...Platform.select({
        web: {
          fontFamily:
            '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
        },
      }),
    },
    transitionContainer: {
      position: "relative",
      minHeight: 36, // Match avatar height
      display: "flex",
      alignItems: "center",
    },
    fadeContainer: {
      position: "absolute",
      left: 0,
      top: "50%",
      transform: [{ translateY: "-50%" }],
    },
    profileButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 0, // Remove padding for better alignment
      borderRadius: 8,
      ...Platform.select({
        web: {
          cursor: "pointer",
          ":hover": {
            backgroundColor: colors.action?.hover || "rgba(0,0,0,0.04)",
          },
        },
      }),
    },
    profileContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    profileAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
    },
    profileAvatarPlaceholder: {
      backgroundColor: colors.primary.light || "#A08670",
      justifyContent: "center",
      alignItems: "center",
    },
    profileAvatarText: {
      color: colors.background.paper,
      fontSize: 16,
      fontWeight: "600",
    },
    profileName: {
      fontSize: 24,
      fontWeight: "600",
      color: colors.primary || "#A08670",
      maxWidth: 200,
      ...Platform.select({
        web: {
          fontFamily:
            '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
        },
      }),
    },
    right: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    iconButton: {
      padding: 8,
      borderRadius: 8,
      ...Platform.select({
        web: {
          cursor: "pointer",
          transition: "background-color 0.2s",
          ":hover": {
            backgroundColor: colors.action?.hover || "rgba(0,0,0,0.04)",
          },
        },
      }),
    },
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.background.paper,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 20,
      maxHeight: "70%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text.primary,
    },
    closeButton: {
      padding: 8,
    },
    menuList: {
      paddingVertical: 8,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      gap: 16,
    },
    menuItemText: {
      fontSize: 16,
      color: colors.text.primary,
      flex: 1,
    },
  });

export default Header;
