import { StyleSheet, Platform } from "react-native";

export const createStyles = (colors) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        colors.background?.primary || colors.background || "#FFFFFF",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border || "#E0E0E0",
      backgroundColor:
        colors.background?.secondary ||
        colors.surface ||
        colors.background?.primary ||
        "#FFFFFF",
      minHeight: 64,
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    logo: {
      fontSize: 24,
      fontWeight: "600",
      color: colors.primary || "#5D4E37",
      letterSpacing: 0.5,
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
      backgroundColor: colors.primary || "#5D4E37",
      justifyContent: "center",
      alignItems: "center",
      ...Platform.select({
        web: {
          boxShadow: `0 0 0 3px ${colors.background?.secondary || colors.surface || "#FFFFFF"}, 0 0 0 5px #CC0000`,
          position: "relative",
        },
        ios: {
          // iOS: Use a subtle red border
          borderWidth: 2,
          borderColor: "#CC0000",
        },
        android: {
          // Android: Use a subtle red border
          borderWidth: 2,
          borderColor: "#CC0000",
        },
      }),
    },
    logoAvatarText: {
      color: colors.background?.secondary || colors.surface || "#FFFFFF",
      fontSize: 20,
      fontWeight: "600",
      ...Platform.select({
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
    },
    closeButtonText: {
      fontSize: 24,
      color: colors.text?.primary || colors.text || "#666666",
      fontWeight: "bold",
      ...Platform.select({
        web: {
          userSelect: "none",
        },
      }),
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      paddingBottom: 40,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.primary || colors.text?.primary || "#333333",
      marginBottom: 8,
      textAlign: "center",
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: 14,
      color: colors.text?.secondary || "#666666",
      marginBottom: 24,
      textAlign: "center",
      fontStyle: "italic",
    },
    section: {
      marginBottom: 24,
      backgroundColor:
        colors.background?.secondary || colors.surface || "transparent",
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border || "transparent",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text?.primary || colors.text || "#333333",
      marginBottom: 8,
      letterSpacing: 0.3,
    },
    sectionText: {
      fontSize: 16,
      color: colors.text?.secondary || colors.textSecondary || "#555555",
      lineHeight: 24,
    },
    footer: {
      fontSize: 16,
      color: colors.text?.primary || colors.text || "#333333",
      fontStyle: "italic",
      textAlign: "center",
      marginTop: 24,
      paddingTop: 24,
      borderTopWidth: 1,
      borderTopColor: colors.border || "#E0E0E0",
      backgroundColor:
        colors.background?.secondary || colors.surface || "transparent",
      padding: 20,
      marginHorizontal: -20,
      borderRadius: 12,
    },
  });
};

export default createStyles;
