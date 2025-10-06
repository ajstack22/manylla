import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { getStatusBarHeight } from "../../utils/platformStyles";
import platform from "../../utils/platform";
import ManyllaLogo from "../Common/ManyllaLogo";
import { MoreVertIcon } from "../Common";

// Define consistent header height
const statusBarHeight = getStatusBarHeight();
export const HEADER_HEIGHT = platform.select({
  web: 64,
  ios: 88, // Account for status bar
  android: 56 + statusBarHeight, // Add status bar height
  default: 56,
});

const Header = ({ colors, theme, profile, onEditProfile, onOpenSettings }) => {
  const styles = createStyles(colors, theme);

  // Platform-specific container styles
  const headerContainerStyle = platform.select({
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
    <View style={headerContainerStyle}>
      <View style={styles.content}>
        {/* Logo on the left */}
        <View style={styles.left}>
          <View style={styles.logoContainer}>
            <ManyllaLogo size={32} />
            <Text style={styles.logo}>manylla</Text>
          </View>
        </View>

        {/* Profile and Settings on the right */}
        <View style={styles.right}>
          {profile && (
            <>
              <TouchableOpacity
                onPress={onEditProfile}
                style={styles.profileButton}
              >
                <View style={styles.profileContent}>
                  <Text style={styles.profileName} numberOfLines={1}>
                    {profile.preferredName || profile.name}
                  </Text>
                  {profile.photo && profile.photo !== "default" ? (
                    <Image
                      source={
                        profile.photo === '__DEMO_ELLIE__'
                          ? require('../../../public/assets/ellie.png')
                          : typeof profile.photo === "number"
                            ? profile.photo
                            : { uri: profile.photo }
                      }
                      style={styles.profileAvatar}
                      onLoad={() => console.log('[PHOTO-TEST] ✓ Header photo loaded successfully')}
                      onError={(e) => console.error('[PHOTO-TEST] ✗ Header photo failed:', JSON.stringify(e.nativeEvent))}
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
                </View>
              </TouchableOpacity>
              {onOpenSettings && (
                <TouchableOpacity
                  onPress={onOpenSettings}
                  style={styles.settingsButton}
                  accessibilityLabel="Open settings"
                  accessibilityRole="button"
                >
                  <MoreVertIcon
                    size={24}
                    color={colors.text?.primary || colors.primary || "#A08670"}
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const createStyles = (colors, theme) =>
  StyleSheet.create({
    container: {
      height: HEADER_HEIGHT,
      backgroundColor: colors.background.paper,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      justifyContent: "center",
      ...platform.select({
        ios: {
          paddingTop: statusBarHeight, // Use dynamic status bar height for iOS too
        },
        android: {
          paddingTop: statusBarHeight, // Use actual status bar height
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
      paddingHorizontal: 24,
      height: "100%",
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
    },
    right: {
      flexDirection: "row",
      alignItems: "center",
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      height: 32, // Match icon height for perfect alignment
    },
    logo: {
      fontSize: 32,
      fontWeight: "600",
      color: colors.primary || "#A08670",
      letterSpacing: 0.3,
      lineHeight: 32,
      ...platform.select({
        web: {
          fontFamily:
            '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
        },
      }),
    },
    profileButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 4,
      borderRadius: 8,
      ...platform.select({
        web: {
          cursor: "pointer",
          ":hover": {
            backgroundColor: colors.action?.hover || "rgba(0,0,0,0.04)",
          },
        },
      }),
    },
    settingsButton: {
      marginLeft: 8,
      padding: 8,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      ...platform.select({
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
      boxShadow: "0 0 0 3px " + colors.background.paper + ", 0 0 0 5px #CC0000",
      ...platform.select({
        web: {
          position: "relative",
        },
      }),
    },
    profileAvatarText: {
      color: colors.background.paper,
      fontSize: 20, // Match logo avatar text size
      fontWeight: "600",
    },
    profileName: {
      fontSize: 24, // Match logo font size
      fontWeight: "600",
      color: colors.primary || "#A08670",
      maxWidth: 200,
      ...platform.select({
        web: {
          fontFamily:
            '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
        },
      }),
    },
  });

export default Header;
