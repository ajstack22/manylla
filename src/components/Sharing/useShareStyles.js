import { StyleSheet } from "react-native";
import platform from "../../utils/platform";

export const useShareStyles = (colors) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.background.paper,
      flex: 1,
      textAlign: "center",
    },
    closeButton: {
      padding: 8,
    },
    closeButtonText: {
      fontSize: 20,
      color: colors.background.paper,
    },
    headerSpacer: {
      width: 36,
    },
    scrollView: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
    },
    sectionCount: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: "600",
    },
    presetGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
    },
    presetCard: {
      flex: 1,
      minWidth: "45%",
      backgroundColor: colors.background.paper,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
    },
    presetCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.background.manila,
    },
    presetIcon: {
      fontSize: 18,
      marginBottom: 8,
    },
    presetLabel: {
      fontSize: 14,
      color: colors.text.primary,
    },
    presetLabelSelected: {
      fontWeight: "600",
      color: colors.primary,
    },
    presetDescription: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 8,
    },
    categoryRow: {
      marginBottom: 8,
    },
    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    categoryChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.background.paper,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
    },
    categoryChipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryChipQuickInfo: {
      borderWidth: 1,
    },
    categoryChipText: {
      fontSize: 14,
      color: colors.text.primary,
    },
    categoryChipTextSelected: {
      color: colors.background.paper,
      fontWeight: "600",
    },
    expirationGrid: {
      flexDirection: "row",
      gap: 8,
      marginTop: 12,
    },
    expirationButton: {
      flex: 1,
      paddingVertical: 12,
      backgroundColor: colors.background.paper,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      alignItems: "center",
    },
    expirationButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    expirationButtonText: {
      fontSize: 14,
      color: colors.text.primary,
    },
    expirationButtonTextSelected: {
      color: colors.background.paper,
      fontWeight: "600",
    },
    previewButton: {
      padding: 12,
      marginBottom: 16,
    },
    previewButtonText: {
      fontSize: 14,
      color: colors.primary,
      textAlign: "center",
    },
    previewBox: {
      backgroundColor: colors.background.paper,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
    },
    previewItem: {
      marginBottom: 12,
    },
    previewCategory: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 8,
    },
    previewTitle: {
      fontSize: 14,
      color: colors.text.primary,
    },
    previewMore: {
      fontSize: 12,
      color: colors.text.secondary,
      fontStyle: "italic",
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 16,
    },
    primaryButtonText: {
      color: colors.background.paper,
      fontSize: 16,
      fontWeight: "600",
    },
    secondaryButton: {
      paddingVertical: 12,
      alignItems: "center",
      marginBottom: 16,
    },
    secondaryButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "600",
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    successAlert: {
      backgroundColor: colors.background.manila,
      borderWidth: 1,
      borderColor: "#67B26F",
      borderRadius: 8,
      padding: 16,
      marginBottom: 20,
    },
    successAlertText: {
      color: "#67B26F",
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
    },
    successAlertSubtext: {
      color: "#67B26F",
      fontSize: 14,
    },
    linkCard: {
      backgroundColor: colors.background.paper,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
    },
    linkCardTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 12,
    },
    linkInputContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    linkInput: {
      flex: 1,
      backgroundColor: colors.background.default,
      borderRadius: 8,
      padding: 12,
      fontFamily: platform.isIOS ? "Menlo" : "monospace",
      fontSize: 12,
      color: colors.text.primary,
    },
    copyButton: {
      marginLeft: 8,
      padding: 12,
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    copyButtonText: {
      fontSize: 18,
      color: colors.background.paper,
    },
    securityCard: {
      backgroundColor: colors.background.default,
      borderRadius: 8,
      padding: 16,
      marginBottom: 20,
    },
    securityCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    securityCardTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
    },
    securityCardText: {
      fontSize: 13,
      color: colors.text.secondary,
      lineHeight: 18,
    },
    shareOptions: {
      marginBottom: 20,
    },
    shareOptionsTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 12,
    },
    shareButton: {
      backgroundColor: colors.background.paper,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
    },
    shareButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    shareButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "600",
    },
    checkboxContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    checkboxLabel: {
      fontSize: 14,
      color: colors.text?.primary || "#333",
    },
  });
};