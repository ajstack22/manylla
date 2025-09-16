import { StyleSheet } from "react-native";

export const usePrintStyles = (colors) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    configSection: {
      backgroundColor: colors.background.paper,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    configTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text.primary,
      marginBottom: 15,
    },
    configSubtitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.secondary,
      marginTop: 15,
      marginBottom: 10,
    },
    toggleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
    },
    toggleLabel: {
      fontSize: 14,
      color: colors.text.primary,
      flex: 1,
    },
    categoriesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    categoryCheckbox: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background.default,
      marginRight: 8,
      marginBottom: 8,
    },
    categoryCheckboxSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryCheckboxText: {
      fontSize: 13,
      color: colors.text.primary,
    },
    categoryCheckboxTextSelected: {
      color: colors.background.paper,
      fontWeight: "600",
    },
    downloadIcon: {
      fontSize: 16,
      color: colors.primary,
      marginRight: 5,
    },
    printIcon: {
      fontSize: 18,
      color: colors.background.paper,
      marginRight: 5,
    },
    previewContainer: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    previewContent: {
      backgroundColor: colors.background.paper,
      margin: 60,
      padding: 40,
      borderRadius: 8,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    documentHeader: {
      alignItems: "center",
      marginBottom: 4,
    },
    documentTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text.primary,
      textAlign: "center",
      marginBottom: 8,
    },
    documentSubtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: "center",
    },
    divider: {
      height: 2,
      backgroundColor: colors.border,
      marginVertical: 6,
    },
    localNoteSection: {
      backgroundColor: colors.background.default,
      padding: 60,
      borderRadius: 8,
      marginBottom: 0,
    },
    localNoteText: {
      fontSize: 14,
      color: colors.text.primary,
      fontStyle: "italic",
      lineHeight: 20,
    },
    section: {
      marginBottom: 4,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 2,
    },
    categorySubtitle: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text.secondary,
      marginTop: 8,
      marginBottom: 4,
      marginLeft: 8,
    },
    quickInfoItems: {
      marginLeft: 6,
    },
    quickInfoItem: {
      fontSize: 14,
      color: colors.text.primary,
      lineHeight: 20,
      marginBottom: 8,
    },
    bold: {
      fontWeight: "bold",
    },
    entriesContainer: {
      marginLeft: 6,
    },
    entry: {
      marginBottom: 2,
    },
    entryTitle: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text.primary,
      marginBottom: 8,
    },
    entryDescription: {
      fontSize: 14,
      color: colors.text.primary,
      lineHeight: 20,
      marginLeft: 2,
    },
    documentFooter: {
      marginTop: 2,
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      alignItems: "center",
    },
    footerText: {
      fontSize: 12,
      color: colors.text.secondary,
      textAlign: "center",
    },
    actions: {
      flexDirection: "row",
      paddingHorizontal: 0,
      paddingVertical: 6,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background.paper,
      gap: 20,
    },
    button: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 4,
      borderRadius: 8,
      gap: 8,
    },
    cancelButton: {
      backgroundColor: colors.background.paper,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      fontSize: 16,
      color: colors.text.primary,
      fontWeight: "500",
    },
    downloadButton: {
      backgroundColor: colors.background.paper,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    downloadButtonText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: "600",
    },
    printButton: {
      backgroundColor: colors.primary,
    },
    printButtonText: {
      fontSize: 16,
      color: colors.background.paper,
      fontWeight: "600",
    },
  });
};
