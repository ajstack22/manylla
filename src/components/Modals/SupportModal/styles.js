import { StyleSheet, Platform } from "react-native";

export const createStyles = (colors) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        colors.background?.primary || colors.background || "#F4E4C1",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border || "#A68B5B",
      backgroundColor:
        colors.background?.secondary ||
        colors.surface ||
        colors.background?.primary ||
        "#F9F0E1",
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
      color: colors.primary || "#A08670",
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
      backgroundColor: colors.primary || "#A08670",
      justifyContent: "center",
      alignItems: "center",
      ...Platform.select({
        web: {
          boxShadow: `0 0 0 3px ${colors.background?.secondary || colors.surface || "#F9F0E1"}, 0 0 0 5px #CC0000`,
          position: "relative",
        },
        ios: {
          borderWidth: 2,
          borderColor: "#CC0000",
        },
        android: {
          borderWidth: 2,
          borderColor: "#CC0000",
        },
      }),
    },
    logoAvatarText: {
      color: colors.background?.secondary || colors.surface || "#F9F0E1",
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
      color: colors.text?.primary || colors.text || "#3D2F1F",
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
      color: colors.primary || colors.text?.primary || "#A08670",
      marginBottom: 8,
      textAlign: "center",
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: 16,
      color: colors.text?.secondary || "#5D4A37",
      marginBottom: 24,
      textAlign: "center",
      fontStyle: "italic",
    },
    heroSection: {
      marginBottom: 32,
      backgroundColor:
        colors.background?.secondary || colors.surface || "#F9F0E1",
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border || "#A68B5B",
      alignItems: "center",
    },
    heroTitle: {
      fontSize: 24,
      fontWeight: "600",
      color: colors.primary || "#A08670",
      marginBottom: 12,
      textAlign: "center",
    },
    heroText: {
      fontSize: 16,
      color: colors.text?.secondary || "#5D4A37",
      lineHeight: 24,
      textAlign: "center",
    },
    section: {
      marginBottom: 24,
      backgroundColor:
        colors.background?.secondary || colors.surface || "#F9F0E1",
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border || "#A68B5B",
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text?.primary || colors.text || "#3D2F1F",
      marginBottom: 12,
      letterSpacing: 0.3,
    },
    sectionText: {
      fontSize: 16,
      color: colors.text?.secondary || "#5D4A37",
      lineHeight: 24,
      marginBottom: 8,
    },
    teamPhotoContainer: {
      alignItems: "center",
      marginVertical: 16,
    },
    teamPhoto: {
      width: "100%",
      maxWidth: 450,
      height: 300,
      borderRadius: 12,
    },
    teamPhotoPlaceholder: {
      width: "100%",
      maxWidth: 450,
      height: 300,
      backgroundColor: colors.background?.primary || "#F4E4C1",
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border || "#A68B5B",
      borderStyle: "dashed",
      justifyContent: "center",
      alignItems: "center",
    },
    teamPhotoText: {
      fontSize: 18,
      color: colors.text?.secondary || "#5D4A37",
      textAlign: "center",
      marginBottom: 8,
    },
    teamPhotoSubtext: {
      fontSize: 32,
      color: colors.text?.secondary || "#5D4A37",
    },
    impactGrid: {
      gap: 12,
    },
    impactCard: {
      backgroundColor: colors.background?.primary || "#F4E4C1",
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border || "#A68B5B",
    },
    impactCardTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary || "#A08670",
      marginBottom: 6,
    },
    impactCardDescription: {
      fontSize: 14,
      color: colors.text?.secondary || "#5D4A37",
      lineHeight: 20,
    },
    donationContainer: {
      alignItems: "center",
      marginTop: 16,
    },
    waysGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      justifyContent: "space-between",
    },
    wayCard: {
      backgroundColor: colors.background?.primary || "#F4E4C1",
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border || "#A68B5B",
      alignItems: "center",
      minHeight: 120,
      ...Platform.select({
        web: {
          width: "calc(50% - 6px)",
        },
        default: {
          width: "48%",
        },
      }),
    },
    wayCardIcon: {
      fontSize: 24,
      marginBottom: 8,
    },
    wayCardTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary || "#A08670",
      marginBottom: 6,
      textAlign: "center",
    },
    wayCardDescription: {
      fontSize: 12,
      color: colors.text?.secondary || "#5D4A37",
      textAlign: "center",
      lineHeight: 16,
      marginBottom: 4,
    },
    wayCardAction: {
      fontSize: 12,
      color: colors.primary || "#A08670",
      textAlign: "center",
      fontWeight: "500",
    },
    emailButton: {
      backgroundColor: colors.primary || "#A08670",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      alignSelf: "center",
      marginTop: 12,
      ...Platform.select({
        web: {
          cursor: "pointer",
          transition: "background-color 0.2s",
          ":hover": {
            backgroundColor: "#8F7660",
          },
        },
      }),
    },
    emailButtonText: {
      color: colors.background?.secondary || "#F9F0E1",
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
    },
    footer: {
      fontSize: 16,
      color: colors.text?.primary || colors.text || "#3D2F1F",
      fontStyle: "italic",
      textAlign: "center",
      marginTop: 24,
      paddingTop: 24,
      borderTopWidth: 1,
      borderTopColor: colors.border || "#A68B5B",
      backgroundColor:
        colors.background?.secondary || colors.surface || "#F9F0E1",
      padding: 20,
      marginHorizontal: -20,
      borderRadius: 12,
      lineHeight: 24,
    },
  });
};

export default createStyles;
