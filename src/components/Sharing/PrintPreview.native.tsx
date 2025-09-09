import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
  Dimensions,
  Share,
} from "react-native";
import { Entry } from "../../types/ChildProfile";

interface PrintPreviewProps {
  visible: boolean;
  onClose: () => void;
  childName: string;
  selectedCategories: string[];
  entries: {
    goals: Entry[];
    successes: Entry[];
    strengths: Entry[];
    challenges: Entry[];
  };
  includeQuickInfo: boolean;
  recipientName?: string;
  note?: string;
}

const colors = {
  primary: "#8B7355",
  secondary: "#A0937D",
  background: "#FDFBF7",
  surface: "#F4E4C1",
  text: "#4A4A4A",
  textSecondary: "#666666",
  border: "#E0E0E0",
  white: "#FFFFFF",
  error: "#D32F2F",
  success: "#2E7D32",
  hover: "#F5F5F5",
};

export const PrintPreview: React.FC<PrintPreviewProps> = ({
  visible,
  onClose,
  childName,
  selectedCategories,
  entries,
  includeQuickInfo,
  recipientName,
  note,
}) => {
  const categoryTitles: Record<string, string> = {
    goals: "Current Goals",
    successes: "Recent Successes",
    strengths: "Strengths",
    challenges: "Challenges",
  };

  const generateHTML = () => {
    const currentDate = new Date().toLocaleDateString();
    const currentDateTime = new Date().toLocaleString();

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${childName} - Information Summary</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            line-height: 1.6;
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
          }
          .title { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 10px; 
          }
          .subtitle { 
            font-size: 14px; 
            color: #666; 
          }
          .divider { 
            border-top: 1px solid #ccc; 
            margin: 20px 0; 
          }
          .note { 
            background-color: #f5f5f5; 
            padding: 15px; 
            border-radius: 5px; 
            margin-bottom: 20px;
            font-style: italic;
          }
          .section { 
            margin-bottom: 30px; 
            page-break-inside: avoid; 
          }
          .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 15px; 
          }
          .entry { 
            margin-bottom: 15px; 
            margin-left: 20px;
          }
          .entry-title { 
            font-weight: bold; 
            margin-bottom: 5px; 
          }
          .entry-description { 
            margin-left: 15px;
          }
          .quick-info-item {
            margin-bottom: 10px;
            margin-left: 20px;
          }
          .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #ccc; 
            text-align: center; 
            font-size: 12px; 
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${childName} - Information Summary</div>
          <div class="subtitle">
            Prepared on ${currentDate}${recipientName ? ` for ${recipientName}` : ""}
          </div>
        </div>
        
        <div class="divider"></div>
    `;

    // Add note if present
    if (note) {
      html += `
        <div class="note">
          ${note}
        </div>
      `;
    }

    // Add quick info if included
    if (includeQuickInfo) {
      html += `
        <div class="section">
          <div class="section-title">Quick Reference</div>
          <div class="quick-info-item"><strong>Communication:</strong> Uses 2-3 word phrases. Understands more than she can express.</div>
          <div class="quick-info-item"><strong>Sensory:</strong> Sensitive to loud noises and bright lights. Loves soft textures.</div>
          <div class="quick-info-item"><strong>Medical:</strong> No allergies. Takes melatonin for sleep (prescribed).</div>
          <div class="quick-info-item"><strong>Dietary:</strong> Gluten-free diet. Prefers crunchy foods. No nuts.</div>
          <div class="quick-info-item"><strong>Emergency Contact:</strong> Mom: 555-0123, Dad: 555-0124</div>
        </div>
      `;
    }

    // Add selected categories
    selectedCategories.forEach((category) => {
      const categoryEntries = entries[category as keyof typeof entries];
      if (categoryEntries && categoryEntries.length > 0) {
        html += `
          <div class="section">
            <div class="section-title">${categoryTitles[category]}</div>
        `;

        categoryEntries.forEach((entry) => {
          html += `
            <div class="entry">
              <div class="entry-title">• ${entry.title}</div>
              <div class="entry-description">${entry.description}</div>
            </div>
          `;
        });

        html += `</div>`;
      }
    });

    // Add footer
    html += `
        <div class="footer">
          This information is confidential. Generated by Manylla on ${currentDateTime}
        </div>
      </body>
      </html>
    `;

    return html;
  };

  const handlePrint = async () => {
    try {
      // Generate a text version of the document
      const textContent = generateTextContent();

      // Share the content as text
      await Share.share({
        message: textContent,
        title: `${childName} - Information Summary`,
      });
    } catch (error) {
      if (error.message !== "User did not share") {
        Alert.alert("Error", "Failed to share document. Please try again.");
        console.error("Share error:", error);
      }
    }
  };

  const handleDownloadPDF = async () => {
    // Same as print for now - shares the text content
    await handlePrint();
  };

  const generateTextContent = () => {
    let content = `${childName} - Information Summary\n`;
    content += `Prepared on ${new Date().toLocaleDateString()}\n`;
    if (recipientName) {
      content += `For: ${recipientName}\n`;
    }
    content += "\n---\n\n";

    if (note) {
      content += `Note: ${note}\n\n`;
    }

    selectedCategories.forEach((category) => {
      const categoryEntries = entries[category] || [];
      if (categoryEntries.length > 0) {
        content += `${category.toUpperCase()}\n`;
        content += "=".repeat(category.length) + "\n\n";

        categoryEntries.forEach((entry, index) => {
          content += `${index + 1}. ${entry.title}\n`;
          content += `   ${entry.description}\n`;
          content += `   Date: ${new Date(entry.date).toLocaleDateString()}\n\n`;
        });
      }
    });

    return content;
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text
              style={{ fontSize: 24, color: colors.primary, marginRight: 8 }}
            >
              🖨️
            </Text>
            <Text style={styles.headerTitle}>Print Preview</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={{ fontSize: 24, color: colors.text }}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Preview Content */}
        <ScrollView style={styles.previewContainer}>
          <View style={styles.previewContent}>
            {/* Header */}
            <View style={styles.documentHeader}>
              <Text style={styles.documentTitle}>
                {childName} - Information Summary
              </Text>
              <Text style={styles.documentSubtitle}>
                Prepared on {new Date().toLocaleDateString()}
                {recipientName && ` for ${recipientName}`}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Note */}
            {note && (
              <View style={styles.noteSection}>
                <Text style={styles.noteText}>{note}</Text>
              </View>
            )}

            {/* Quick Info */}
            {includeQuickInfo && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Reference</Text>
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
            {selectedCategories.map((category) => {
              const categoryEntries = entries[category as keyof typeof entries];
              if (!categoryEntries || categoryEntries.length === 0) return null;

              return (
                <View key={category} style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    {categoryTitles[category]}
                  </Text>
                  <View style={styles.entriesContainer}>
                    {categoryEntries.map((entry, index) => (
                      <View key={index} style={styles.entry}>
                        <Text style={styles.entryTitle}>• {entry.title}</Text>
                        <Text style={styles.entryDescription}>
                          {entry.description}
                        </Text>
                      </View>
                    ))}
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
            <Text
              style={{ fontSize: 16, color: colors.primary, marginRight: 8 }}
            >
              📄
            </Text>
            <Text style={styles.downloadButtonText}>Share as Text</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.printButton]}
            onPress={handlePrint}
          >
            <Text style={{ fontSize: 18, color: colors.white, marginRight: 6 }}>
              🖨️
            </Text>
            <Text style={styles.printButtonText}>Print</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: colors.hover,
  },
  previewContent: {
    backgroundColor: colors.white,
    margin: 16,
    padding: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  documentHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  documentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  documentSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  noteSection: {
    backgroundColor: colors.hover,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  noteText: {
    fontSize: 14,
    color: colors.text,
    fontStyle: "italic",
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  quickInfoItems: {
    marginLeft: 16,
  },
  quickInfoItem: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  bold: {
    fontWeight: "bold",
  },
  entriesContainer: {
    marginLeft: 16,
  },
  entry: {
    marginBottom: 12,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 4,
  },
  entryDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginLeft: 12,
  },
  documentFooter: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 6,
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
  downloadButton: {
    backgroundColor: colors.white,
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
    color: colors.white,
    fontWeight: "600",
  },
});
