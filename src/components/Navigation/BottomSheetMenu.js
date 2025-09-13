/**
 * BottomSheetMenu - Bottom Sheet Navigation System
 * Replaces cramped header menu with scalable, mobile-friendly navigation
 * Implements all Story S016 requirements
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  BackHandler,
  Vibration,
} from "react-native";
import {
  ShareIcon,
  PrintIcon,
  CloudIcon,
  PaletteIcon,
  PrivacyTipIcon,
  SupportIcon,
  LogoutIcon,
  CloseIcon,
} from "../Common";
import platform from "../../utils/platform";

// ChevronUp and ChevronDown icons (using ExpandLess/ExpandMore)
const ChevronUpIcon = ({ size = 24, color = "#666", style }) => {
  if (platform.isWeb) {
    const ExpandLess = require("@mui/icons-material/ExpandLess").default;
    return <ExpandLess style={{ fontSize: size, color, ...style }} />;
  } else {
    const MaterialIcons =
      require("react-native-vector-icons/MaterialIcons").default;
    return (
      <MaterialIcons
        name="expand-less"
        size={size}
        color={color}
        style={style}
      />
    );
  }
};

const ChevronDownIcon = ({ size = 24, color = "#666", style }) => {
  if (platform.isWeb) {
    const ExpandMore = require("@mui/icons-material/ExpandMore").default;
    return <ExpandMore style={{ fontSize: size, color, ...style }} />;
  } else {
    const MaterialIcons =
      require("react-native-vector-icons/MaterialIcons").default;
    return (
      <MaterialIcons
        name="expand-more"
        size={size}
        color={color}
        style={style}
      />
    );
  }
};

const BottomSheetMenu = ({
  visible,
  onClose,
  onShare,
  onPrint,
  onSync,
  onTheme,
  onPrivacy,
  onSupport,
  onCloseProfile,
  colors,
  theme,
  syncStatus,
  showToast,
}) => {
  const [showMore, setShowMore] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [backdropAnim] = useState(new Animated.Value(0));
  const [chevronRotation] = useState(new Animated.Value(0));

  // Handle keyboard shortcuts (web only)
  useEffect(() => {
    if (!platform.isWeb || !visible) return;

    const handleKeyDown = (event) => {
      switch (event.key) {
        case "Escape":
          onClose();
          break;
        case "1":
          onShare();
          onClose();
          break;
        case "2":
          onPrint();
          onClose();
          break;
        case "3":
          onSync();
          onClose();
          break;
        case "4":
          onTheme();
          onClose();
          break;
        case "5":
          onPrivacy();
          onClose();
          break;
        case "6":
          onSupport();
          onClose();
          break;
        case "7":
          onCloseProfile();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    visible,
    onShare,
    onPrint,
    onSync,
    onTheme,
    onPrivacy,
    onSupport,
    onCloseProfile,
    onClose,
  ]);

  // Handle Android back button
  useEffect(() => {
    if (!platform.isAndroid || !visible) return;

    const handleBackPress = () => {
      onClose();
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress,
    );
    return () => backHandler.remove();
  }, [visible, onClose]);

  // Animation management
  useEffect(() => {
    if (visible) {
      // Open animations
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Close animations
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
      // Reset more menu when closing
      setShowMore(false);
      Animated.timing(chevronRotation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim, backdropAnim, chevronRotation]);

  // Toggle More menu with animation
  const toggleMore = () => {
    const newShowMore = !showMore;
    setShowMore(newShowMore);

    // Haptic feedback on mobile
    if (platform.isMobile) {
      Vibration.vibrate(50);
    }

    // Rotate chevron icon
    Animated.timing(chevronRotation, {
      toValue: newShowMore ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Haptic feedback helper
  const vibrate = () => {
    if (platform.isMobile) {
      Vibration.vibrate(50);
    }
  };

  // Handle item press with feedback and close
  const handleItemPress = (action) => {
    vibrate();
    action();
    onClose();

    // Show next theme name for theme toggle
    if (action === onTheme) {
      const nextTheme =
        theme === "light" ? "Dark" : theme === "dark" ? "Manylla" : "Light";
      if (showToast) {
        showToast(`${nextTheme} mode activated`, "info");
      }
    }
  };

  const styles = createStyles(colors, theme);

  const windowHeight = Dimensions.get("window").height;
  const sheetHeight = showMore ? Math.min(480, windowHeight * 0.7) : 280;

  // Primary menu items (always visible)
  const primaryItems = [
    {
      id: "share",
      label: "Share",
      icon: ShareIcon,
      action: onShare,
      accessibilityLabel: "Share profile information",
      keyboardShortcut: "1",
    },
    {
      id: "print",
      label: "Print",
      icon: PrintIcon,
      action: onPrint,
      accessibilityLabel: "Print profile information",
      keyboardShortcut: "2",
    },
    {
      id: "sync",
      label: "Sync",
      icon: CloudIcon,
      action: onSync,
      accessibilityLabel: "Sync data across devices",
      keyboardShortcut: "3",
    },
  ];

  // Secondary menu items (shown when "More" is expanded)
  const secondaryItems = [
    {
      id: "theme",
      label: "Theme",
      icon: PaletteIcon,
      action: onTheme,
      accessibilityLabel: "Change app theme",
      keyboardShortcut: "5",
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: PrivacyTipIcon,
      action: onPrivacy,
      accessibilityLabel: "View privacy policy",
      keyboardShortcut: "6",
    },
    {
      id: "support",
      label: "Support",
      icon: SupportIcon,
      action: onSupport,
      accessibilityLabel: "Get help and support",
      keyboardShortcut: "7",
    },
    {
      id: "close",
      label: "Close Profile",
      icon: LogoutIcon,
      action: onCloseProfile,
      accessibilityLabel: "Close current profile",
      keyboardShortcut: "8",
    },
  ];

  // Transform values for animations
  const slideTransform = {
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [sheetHeight, 0],
        }),
      },
    ],
  };

  const chevronTransform = {
    transform: [
      {
        rotate: chevronRotation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        }),
      },
    ],
  };

  const backdropStyle = {
    backgroundColor: backdropAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["rgba(0,0,0,0)", "rgba(0,0,0,0.5)"],
    }),
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      accessibilityLabel="Navigation menu"
      accessibilityRole="menu"
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Close menu"
          accessibilityRole="button"
        />

        <SafeAreaView style={styles.safeArea}>
          <Animated.View
            style={[
              styles.bottomSheet,
              slideTransform,
              { height: sheetHeight },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Menu</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                accessibilityLabel="Close menu"
                accessibilityRole="button"
              >
                <CloseIcon size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Primary Menu Items */}
            <View style={styles.menuSection}>
              <View style={styles.menuRow}>
                {primaryItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.menuItem}
                      onPress={() => handleItemPress(item.action)}
                      accessibilityLabel={item.accessibilityLabel}
                      accessibilityRole="button"
                      accessibilityHint={
                        platform.isWeb
                          ? `Press ${item.keyboardShortcut} for quick access`
                          : undefined
                      }
                    >
                      <View style={styles.iconContainer}>
                        <IconComponent
                          size={28}
                          color={colors.primary}
                          style={styles.icon}
                        />
                      </View>
                      <Text style={styles.menuItemLabel}>{item.label}</Text>
                      {platform.isWeb && (
                        <Text style={styles.shortcutKey}>
                          {item.keyboardShortcut}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* More Button */}
            <TouchableOpacity
              style={styles.moreButton}
              onPress={toggleMore}
              accessibilityLabel={
                showMore ? "Hide more options" : "Show more options"
              }
              accessibilityRole="button"
              accessibilityState={{ expanded: showMore }}
            >
              <Text style={styles.moreButtonText}>More</Text>
              <Animated.View style={chevronTransform}>
                {showMore ? (
                  <ChevronUpIcon size={20} color={colors.text.secondary} />
                ) : (
                  <ChevronDownIcon size={20} color={colors.text.secondary} />
                )}
              </Animated.View>
            </TouchableOpacity>

            {/* Secondary Menu Items (More section) */}
            {showMore && (
              <View style={styles.menuSection}>
                <View style={styles.menuRow}>
                  {secondaryItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.menuItem,
                          item.id === "close" && styles.menuItemDanger,
                        ]}
                        onPress={() => handleItemPress(item.action)}
                        accessibilityLabel={item.accessibilityLabel}
                        accessibilityRole="button"
                        accessibilityHint={
                          platform.isWeb
                            ? `Press ${item.keyboardShortcut} for quick access`
                            : undefined
                        }
                      >
                        <View style={styles.iconContainer}>
                          <IconComponent
                            size={28}
                            color={
                              item.id === "close"
                                ? colors.error?.main || "#d32f2f"
                                : colors.primary
                            }
                            style={styles.icon}
                          />
                        </View>
                        <Text
                          style={[
                            styles.menuItemLabel,
                            item.id === "close" && styles.menuItemLabelDanger,
                          ]}
                        >
                          {item.label}
                        </Text>
                        {platform.isWeb && (
                          <Text style={styles.shortcutKey}>
                            {item.keyboardShortcut}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Platform-specific safe area padding */}
            {platform.isIOS && <View style={styles.iosSafeArea} />}
          </Animated.View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

const createStyles = (colors, theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: "flex-end",
    },
    backdropTouchable: {
      flex: 1,
    },
    safeArea: {
      justifyContent: "flex-end",
    },
    bottomSheet: {
      backgroundColor: colors.background.paper,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: platform.isIOS ? 0 : 16, // Let safe area handle iOS padding
      ...platform.select({
        web: {
          boxShadow: "0 -4px 12px rgba(0,0,0,0.15)",
        },
        default: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        },
      }),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    title: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text.primary,
      ...platform.select({
        web: {
          fontFamily:
            '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
        },
      }),
    },
    closeButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: "transparent",
      ...platform.select({
        web: {
          cursor: "pointer",
          ":hover": {
            backgroundColor: colors.action?.hover || "rgba(0,0,0,0.04)",
          },
        },
      }),
    },
    menuSection: {
      paddingVertical: 16,
    },
    menuRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    menuItem: {
      width: "22%", // 4 items per row with some margin
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 8,
      borderRadius: 12,
      backgroundColor: "transparent",
      position: "relative",
      ...platform.select({
        web: {
          cursor: "pointer",
          ":hover": {
            backgroundColor: colors.action?.hover || "rgba(0,0,0,0.04)",
          },
          transition: "background-color 0.2s",
        },
        default: {
          // Ensure proper spacing on mobile
          marginBottom: 8,
        },
      }),
    },
    menuItemDanger: {
      ...platform.select({
        web: {
          ":hover": {
            backgroundColor: "rgba(211, 47, 47, 0.08)",
          },
        },
      }),
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor:
        colors.background.secondary ||
        colors.action?.selected ||
        "rgba(0,0,0,0.04)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    icon: {
      // Icon styling handled by individual icon components
    },
    menuItemLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text.primary,
      textAlign: "center",
      ...platform.select({
        web: {
          fontFamily:
            '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
        },
      }),
    },
    menuItemLabelDanger: {
      color: colors.error?.main || "#d32f2f",
    },
    shortcutKey: {
      position: "absolute",
      top: 4,
      right: 4,
      fontSize: 12,
      color: colors.text.disabled,
      backgroundColor: colors.background.secondary || "rgba(0,0,0,0.04)",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      minWidth: 20,
      textAlign: "center",
    },
    moreButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: "transparent",
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      ...platform.select({
        web: {
          cursor: "pointer",
          ":hover": {
            backgroundColor: colors.action?.hover || "rgba(0,0,0,0.04)",
          },
          transition: "background-color 0.2s",
        },
      }),
    },
    moreButtonText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text.secondary,
      marginRight: 8,
      ...platform.select({
        web: {
          fontFamily:
            '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
        },
      }),
    },
    iosSafeArea: {
      height: 34, // iOS home indicator safe area
    },
  });

export default BottomSheetMenu;
