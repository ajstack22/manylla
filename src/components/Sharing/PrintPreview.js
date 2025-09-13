import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Share,
  Switch,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { ThemedModal, InsertDriveFileIcon, PrintIcon } from "../Common";
import { isWeb } from "../../utils/platform";

export const PrintPreview = ({
  visible,
  onClose,
  profile,
  categories,
  entries,
  // Legacy props for backward compatibility
  childName,
  selectedCategories: propSelectedCategories,
  includeQuickInfo: propIncludeQuickInfo,
  recipientName: propRecipientName,
  note: propNote,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // Use profile data if available, fallback to legacy props
  const actualChildName = profile?.name || childName || "Child";

  // Transform entries array into an object organized by category
  const entriesArray = profile?.entries || entries || [];

  const actualEntries = Array.isArray(entriesArray)
    ? entriesArray.reduce((acc, entry) => {
        if (!acc[entry.category]) {
          acc[entry.category] = [];
        }
        acc[entry.category].push(entry);
        return acc;
      }, {})
    : entriesArray;

  // State for managing selections
  const [localSelectedCategories, setLocalSelectedCategories] = useState(() => {
    // Initialize with provided categories or include quick-info if includeQuickInfo was true
    const initial = propSelectedCategories || [];
    if (propIncludeQuickInfo && !initial.includes("quick-info")) {
      return [...initial, "quick-info"];
    }
    return initial;
  });
  const [localRecipientName, setLocalRecipientName] = useState(
    propRecipientName || "",
  );
  const [localNote, setLocalNote] = useState(propNote || "");

  // Update state when props change
  useEffect(() => {
    if (propSelectedCategories) {
      const updated = [...propSelectedCategories];
      if (propIncludeQuickInfo && !updated.includes("quick-info")) {
        updated.push("quick-info");
      }
      setLocalSelectedCategories(updated);
    }
    if (propRecipientName) setLocalRecipientName(propRecipientName);
    if (propNote) setLocalNote(propNote);
  }, [
    propSelectedCategories,
    propIncludeQuickInfo,
    propRecipientName,
    propNote,
  ]);

  // Define all available category groups
  // These match the actual category IDs from unifiedCategories.js
  const categoryGroups = {
    "quick-info": {
      title: "Quick Info",
      categories: ["quick-info"],
    },
    "daily-support": {
      title: "Daily Support",
      categories: ["daily-support"],
    },
    "health-therapy": {
      title: "Health & Therapy",
      categories: ["health-therapy"],
    },
    "education-goals": {
      title: "Education & Goals",
      categories: ["education-goals"],
    },
    "behavior-social": {
      title: "Behavior & Social",
      categories: ["behavior-social"],
    },
    "family-resources": {
      title: "Family & Resources",
      categories: ["family-resources"],
    },
  };

  // Build flat list of available categories for selection
  const availableCategories = [];
  Object.keys(categoryGroups).forEach((groupKey) => {
    availableCategories.push(groupKey);
  });

  const categoryTitles = {
    "quick-info": "Quick Info",
    "daily-support": "Daily Support",
    "health-therapy": "Health & Therapy",
    "education-goals": "Education & Goals",
    "behavior-social": "Behavior & Social",
    "family-resources": "Family & Resources",
    therapies: "Therapies",
    sensory: "Sensory",
    medications: "Medications",
    milestones: "Milestones",
    communication: "Communication",
    social: "Social",
    emotions: "Emotions",
    family: "Family",
    resources: "Resources",
    notes: "Notes",
    contacts: "Contacts",
  };

  // Toggle category selection
  const toggleCategory = (category) => {
    setLocalSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // HTML escaping for security
  const escapeHtml = (unsafe) => {
    if (!unsafe) return "";
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const handlePrint = async () => {
    try {
      if (isWeb) {
        // Web: Use actual browser print functionality
        const htmlContent = generateHtmlContent();
        const printWindow = window.open("", "PRINT", "height=600,width=800");

        if (!printWindow) {
          Alert.alert(
            "Error",
            "Unable to open print window. Please check your popup blocker settings.",
          );
          return;
        }

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();

        // Add a small delay to ensure content is loaded
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      } else {
        // Mobile: Use Share API
        const textContent = generateTextContent();
        await Share.share({
          message: textContent,
          title: `${actualChildName} - Information Summary`,
        });
      }
    } catch (error) {
      if (error.message !== "User did not share") {
        Alert.alert(
          "Error",
          "Failed to print/share document. Please try again.",
        );
      }
    }
  };

  const handleShareAsText = async () => {
    try {
      const textContent = generateTextContent();

      if (isWeb) {
        // Web: Download as text file
        const blob = new Blob([textContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${actualChildName.replace(/\s+/g, "_")}_Information_Summary.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Mobile: Use Share API
        await Share.share({
          message: textContent,
          title: `${actualChildName} - Information Summary`,
        });
      }
    } catch (error) {
      if (error.message !== "User did not share") {
        Alert.alert("Error", "Failed to share document. Please try again.");
      }
    }
  };

  const handleDownloadPDF = async () => {
    // For now, use the text share functionality
    await handleShareAsText();
  };

  const generateTextContent = () => {
    let content = `${actualChildName} - Information Summary
`;
    content += `Prepared on ${new Date().toLocaleDateString()}
`;
    if (localRecipientName) {
      content += `For: ${localRecipientName}
`;
    }
    content += `
---

`;

    if (localNote) {
      content += `Note: ${localNote}

`;
    }

    localSelectedCategories &&
      localSelectedCategories.forEach((categoryGroup) => {
        if (categoryGroup === "quick-info") {
          // Handle Quick Info as special formatted content
          content += `QUICK INFO
`;
          content += `================

`;
          content += `• Communication: Uses 2-3 word phrases. Understands more than can express.
`;
          content += `• Sensory: Sensitive to loud noises and bright lights. Loves soft textures.
`;
          content += `• Medical: No allergies. Takes melatonin for sleep (prescribed).
`;
          content += `• Dietary: Gluten-free diet. Prefers crunchy foods. No nuts.
`;
          content += `• Emergency Contact: Mom: 555-0123, Dad: 555-0124

`;
        } else if (categoryGroups[categoryGroup]) {
          // Handle category groups
          const group = categoryGroups[categoryGroup];
          let hasContent = false;
          let groupContent = "";

          // Check if any categories in this group have entries
          group.categories.forEach((cat) => {
            const categoryEntries =
              actualEntries && actualEntries[cat] ? actualEntries[cat] : [];
            if (categoryEntries.length > 0) {
              hasContent = true;
            }
          });

          if (hasContent) {
            const title = categoryTitles[categoryGroup] || categoryGroup;
            content += `${title.toUpperCase()}
`;
            content += `${"=".repeat(title.length)}

`;

            // Add entries from all categories in this group
            group.categories.forEach((cat) => {
              const categoryEntries =
                actualEntries && actualEntries[cat] ? actualEntries[cat] : [];
              if (categoryEntries.length > 0) {
                const catTitle = categoryTitles[cat] || cat;
                content += `${catTitle}:
`;
                categoryEntries.forEach((entry, index) => {
                  content += `  ${index + 1}. ${entry.title}
`;
                  content += `     ${entry.description}
`;
                  content += `     Date: ${new Date(entry.date).toLocaleDateString()}

`;
                });
              }
            });
          }
        }
      });

    return content;
  };

  const generateHtmlContent = () => {
    const currentDate = new Date().toLocaleDateString();
    const currentDateTime = new Date().toLocaleString();

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(actualChildName)} - Information Summary</title>
    <style>
        @page {
            margin: 1in;
            size: letter;
        }

        @media print {
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
                font-size: 12pt;
                line-height: 1.4;
                color: #000;
                background: white;
            }

            .no-print { display: none; }

            h1 {
                font-size: 18pt;
                margin-bottom: 8pt;
                text-align: center;
            }

            h2 {
                font-size: 14pt;
                margin-top: 16pt;
                margin-bottom: 8pt;
                border-bottom: 1px solid #ccc;
                padding-bottom: 4pt;
            }

            .document-header {
                text-align: center;
                margin-bottom: 20pt;
                border-bottom: 2pt solid #000;
                padding-bottom: 12pt;
            }

            .document-subtitle {
                font-size: 10pt;
                color: #666;
                margin-top: 4pt;
            }

            .localNote-section {
                background-color: #f9f9f9;
                padding: 12pt;
                border-left: 4pt solid #ccc;
                margin: 16pt 0;
                font-style: italic;
            }

            .section {
                margin-bottom: 16pt;
                break-inside: avoid;
            }

            .entry {
                margin-bottom: 12pt;
                margin-left: 16pt;
                break-inside: avoid;
            }

            .entry-title {
                font-weight: bold;
                margin-bottom: 4pt;
            }

            .entry-description {
                margin-bottom: 4pt;
                margin-left: 8pt;
            }

            .entry-date {
                font-size: 10pt;
                color: #666;
                margin-left: 8pt;
            }

            .quick-info-item {
                margin-bottom: 8pt;
                margin-left: 16pt;
            }

            .document-footer {
                margin-top: 24pt;
                padding-top: 12pt;
                border-top: 1pt solid #ccc;
                text-align: center;
                font-size: 10pt;
                color: #666;
                page-break-inside: avoid;
            }
        }

        @media screen {
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
                max-width: 8.5in;
                margin: 0 auto;
                padding: 1in;
                background: white;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }

            .print-button {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 20px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }

            .print-button:hover {
                background: #0056b3;
            }
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">Print Document</button>

    <div class="document-header">
        <h1>${escapeHtml(actualChildName)} - Information Summary</h1>
        <div class="document-subtitle">
            Prepared on ${escapeHtml(currentDate)}${localRecipientName ? ` for ${escapeHtml(localRecipientName)}` : ""}
        </div>
    </div>`;

    if (localNote) {
      html += `
    <div class="localNote-section">
        <strong>Note:</strong> ${escapeHtml(localNote)}
    </div>`;
    }

    if (localSelectedCategories.includes("quick-info")) {
      html += `
    <div class="section">
        <h2>Quick Info</h2>
        <div class="quick-info-item"><strong>Communication:</strong> ${escapeHtml("Uses 2-3 word phrases. Understands more than can express.")}</div>
        <div class="quick-info-item"><strong>Sensory:</strong> ${escapeHtml("Sensitive to loud noises and bright lights. Loves soft textures.")}</div>
        <div class="quick-info-item"><strong>Medical:</strong> ${escapeHtml("No allergies. Takes melatonin for sleep (prescribed).")}</div>
        <div class="quick-info-item"><strong>Dietary:</strong> ${escapeHtml("Gluten-free diet. Prefers crunchy foods. No nuts.")}</div>
        <div class="quick-info-item"><strong>Emergency Contact:</strong> ${escapeHtml("Mom: 555-0123, Dad: 555-0124")}</div>
    </div>`;
    }

    localSelectedCategories &&
      localSelectedCategories.forEach((category) => {
        // Skip quick-info since it's handled above
        if (category === "quick-info") return;

        const categoryEntries = actualEntries[category] || [];
        if (categoryEntries.length > 0) {
          html += `
    <div class="section">
        <h2>${escapeHtml(categoryTitles[category])}</h2>`;

          categoryEntries.forEach((entry, index) => {
            html += `
        <div class="entry">
            <div class="entry-title">• ${escapeHtml(entry.title)}</div>
            <div class="entry-description">${escapeHtml(entry.description)}</div>
            <div class="entry-date">Date: ${escapeHtml(new Date(entry.date).toLocaleDateString())}</div>
        </div>`;
          });

          html += `
    </div>`;
        }
      });

    html += `
    <div class="document-footer">
        This information is confidential. Generated by Manylla on ${escapeHtml(currentDateTime)}
    </div>
</body>
</html>`;

    return html;
  };

  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      title="Print"
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {/* Configuration Section */}
        <View style={styles.configSection}>
          <Text style={styles.configTitle}>Select categories to include:</Text>
          <View style={styles.categoriesGrid}>
            {availableCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryCheckbox,
                  localSelectedCategories.includes(category) &&
                    styles.categoryCheckboxSelected,
                ]}
                onPress={() => toggleCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryCheckboxText,
                    localSelectedCategories.includes(category) &&
                      styles.categoryCheckboxTextSelected,
                  ]}
                >
                  {localSelectedCategories.includes(category) ? "✓ " : ""}
                  {categoryTitles[category] || category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />
        </View>

        {/* Preview Content */}
        <ScrollView style={styles.previewContainer}>
          <View style={styles.previewContent}>
            {/* Header */}
            <View style={styles.documentHeader}>
              <Text style={styles.documentTitle}>
                {actualChildName} - Information Summary
              </Text>
              <Text style={styles.documentSubtitle}>
                Prepared on {new Date().toLocaleDateString()}
                {localRecipientName ? ` for ${localRecipientName}` : ""}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Note */}
            {localNote && (
              <View style={styles.localNoteSection}>
                <Text style={styles.localNoteText}>{localNote}</Text>
              </View>
            )}

            {/* Quick Info */}
            {localSelectedCategories.includes("quick-info") && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Info</Text>
                <View style={styles.quickInfoItems}>
                  <Text style={styles.quickInfoItem}>
                    <Text style={styles.bold}>Communication:</Text> Uses 2-3
                    word phrases. Understands more than she can express.
                  </Text>
                  <Text style={styles.quickInfoItem}>
                    <Text style={styles.bold}>Sensory:</Text> Sensitive to loud
                    noises and bright lights. Loves soft textures.
                  </Text>
                  <Text style={styles.quickInfoItem}>
                    <Text style={styles.bold}>Medical:</Text> No allergies.
                    Takes melatonin for sleep (prescribed).
                  </Text>
                  <Text style={styles.quickInfoItem}>
                    <Text style={styles.bold}>Dietary:</Text> Gluten-free diet.
                    Prefers crunchy foods. No nuts.
                  </Text>
                  <Text style={styles.quickInfoItem}>
                    <Text style={styles.bold}>Emergency Contact:</Text> Mom:
                    555-0123, Dad: 555-0124
                  </Text>
                </View>
              </View>
            )}

            {/* Selected Categories */}
            {localSelectedCategories &&
              localSelectedCategories.map((categoryGroup) => {
                // Skip quick-info since it's handled separately above
                if (categoryGroup === "quick-info") return null;

                // Handle category groups
                const group = categoryGroups[categoryGroup];
                if (!group) return null;

                // Check if any categories in this group have entries
                let hasContent = false;
                group.categories.forEach((cat) => {
                  const categoryEntries =
                    actualEntries && actualEntries[cat]
                      ? actualEntries[cat]
                      : [];
                  if (categoryEntries.length > 0) {
                    hasContent = true;
                  }
                });

                if (!hasContent) return null;

                return (
                  <View key={categoryGroup} style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      {categoryTitles[categoryGroup]}
                    </Text>
                    <View style={styles.entriesContainer}>
                      {group.categories.map((cat) => {
                        const categoryEntries =
                          actualEntries && actualEntries[cat]
                            ? actualEntries[cat]
                            : [];
                        if (categoryEntries.length === 0) return null;

                        return (
                          <View key={cat}>
                            <Text style={styles.categorySubtitle}>
                              {categoryTitles[cat] || cat}
                            </Text>
                            {categoryEntries.map((entry, index) => (
                              <View key={index} style={styles.entry}>
                                <Text style={styles.entryTitle}>
                                  • {entry.title}
                                </Text>
                                <Text style={styles.entryDescription}>
                                  {entry.description}
                                </Text>
                              </View>
                            ))}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}

            {/* Footer */}
            <View style={styles.documentFooter}>
              <Text style={styles.footerText}>
                This information is confidential. Generated by Manylla on{" "}
                {new Date().toLocaleString()}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Close</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.downloadButton]}
            onPress={handleDownloadPDF}
          >
            <InsertDriveFileIcon
              size={18}
              color={colors.primary}
              style={{ marginRight: 5 }}
            />
            <Text style={styles.downloadButtonText}>Share as Text</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.printButton]}
            onPress={handlePrint}
          >
            <PrintIcon
              size={20}
              color={colors.background.paper}
              style={{ marginRight: 5 }}
            />
            <Text style={styles.printButtonText}>
              {isWeb ? "Print" : "Share"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedModal>
  );
};

const getStyles = (colors) =>
  StyleSheet.create({
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
