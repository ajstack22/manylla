import { StyleSheet } from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import platform from "../../../utils/platform";

/**
 * Custom hook for consistent sync dialog styling
 * Provides shared styles used across sync dialog components
 */
export const useSyncStyles = () => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    // Layout
    scrollView: {
      flex: 1,
      padding: 16,
    },
    actions: {
      flexDirection: "row",
      marginTop: 24,
      gap: 12,
    },

    // Cards
    card: {
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      ...platform.select({
        ios: {
          shadowColor: colors.text.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    infoCard: {
      backgroundColor: colors.background.manila,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    cardContent: {
      flex: 1,
      marginLeft: 12,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 4,
    },
    cardDescription: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 20,
    },

    // Alerts
    successAlert: {
      backgroundColor: colors.background.manila,
      borderWidth: 1,
      borderColor: "#67B26F",
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    successText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#67B26F",
      flex: 1,
    },
    errorAlert: {
      backgroundColor: "#ffebee",
      borderWidth: 1,
      borderColor: "#E76F51",
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    errorAlertText: {
      fontSize: 14,
      color: "#E76F51",
    },
    warningAlert: {
      backgroundColor: colors.background.manila,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 8,
      padding: 12,
      marginVertical: 16,
    },
    warningAlertTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
      marginBottom: 4,
    },
    warningAlertText: {
      fontSize: 12,
      color: colors.text.secondary,
      lineHeight: 18,
    },
    infoAlert: {
      backgroundColor: colors.background.manila,
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
    },
    infoAlertText: {
      fontSize: 12,
      color: colors.text.secondary,
      lineHeight: 18,
    },

    // Buttons
    button: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 48,
    },
    buttonWithIcon: {
      flexDirection: "row",
      gap: 8,
    },
    cancelButton: {
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: colors.border || "#E0E0E0",
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text.primary,
    },
    primaryButton: {
      backgroundColor: colors.primary || "#A08670",
      borderWidth: 2,
      borderColor: colors.primary || "#A08670",
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.background.paper,
    },
    outlineButton: {
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.background.paper,
    },
    outlineButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    fullWidthButton: {
      marginTop: 8,
    },
    copyButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor: colors.primary || "#A08670",
      borderWidth: 2,
      borderColor: colors.primary || "#A08670",
      gap: 8,
      minHeight: 44,
    },
    copyButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.background.paper,
    },

    // Text
    instructions: {
      fontSize: 14,
      color: colors.text.secondary,
      marginBottom: 16,
      lineHeight: 20,
    },
    stepsList: {
      marginTop: 8,
    },
    stepItem: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 24,
    },

    // Inputs
    inputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text.primary,
      backgroundColor: colors.background.paper,
    },
    codeInput: {
      fontFamily: platform.select({
        ios: "Menlo",
        android: "monospace",
        default: "monospace",
      }),
    },
    helperText: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 4,
    },

    // Code/Phrase Display
    phraseContainer: {
      backgroundColor: colors.background.manila,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      marginVertical: 16,
    },
    phraseText: {
      fontFamily: platform.select({
        ios: "Menlo",
        android: "monospace",
        default: "monospace",
      }),
      fontSize: 16,
      color: colors.text.primary,
      letterSpacing: 2,
      textAlign: "center",
      marginBottom: 16,
    },
    blurredContainer: {
      alignItems: "center",
    },
    blurredText: {
      fontFamily: platform.select({
        ios: "Menlo",
        android: "monospace",
        default: "monospace",
      }),
      fontSize: 16,
      color: colors.text.secondary,
      letterSpacing: 2,
      marginBottom: 16,
    },
    revealButton: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 6,
      backgroundColor: colors.primary,
    },
    revealButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.background.paper,
    },

    // Invite Code Display
    inviteCodeContainer: {
      backgroundColor: colors.background.manila,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 12,
      padding: 20,
      marginVertical: 16,
      alignItems: "center",
    },
    inviteCode: {
      fontFamily: platform.select({
        ios: "Menlo",
        android: "monospace",
        default: "monospace",
      }),
      fontSize: 32,
      fontWeight: "bold",
      color: colors.primary,
      letterSpacing: 2,
      marginBottom: 16,
    },
    linkContainer: {
      backgroundColor: colors.background.paper,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
    },
    linkLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 8,
    },
    linkText: {
      fontFamily: platform.select({
        ios: "Menlo",
        android: "monospace",
        default: "monospace",
      }),
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 12,
    },
    copyLinkButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.primary,
      alignItems: "center",
    },
    copyLinkButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
  });

  return { styles, colors };
};
