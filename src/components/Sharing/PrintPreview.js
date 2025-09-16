import React, { useState, useEffect } from "react";
import { View, ScrollView, Alert, Share } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { ThemedModal } from "../Common";
import { isWeb } from "../../utils/platform";
import { PrintPreviewConfiguration } from "./PrintPreviewConfiguration";
import { PrintPreviewHeader } from "./PrintPreviewHeader";
import { PrintPreviewNote } from "./PrintPreviewNote";
import { PrintPreviewQuickInfo } from "./PrintPreviewQuickInfo";
import { PrintPreviewEntries } from "./PrintPreviewEntries";
import { PrintPreviewFooter } from "./PrintPreviewFooter";
import { PrintPreviewActions } from "./PrintPreviewActions";
import { usePrintStyles } from "./usePrintStyles";
import {
  generateTextContent,
  generateHtmlContent,
} from "./printContentGenerators";

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
  const styles = usePrintStyles(colors);

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

  const handlePrint = async () => {
    try {
      if (isWeb) {
        // Web: Use actual browser print functionality
        const htmlContent = generateHtmlContent({
          childName: actualChildName,
          recipientName: localRecipientName,
          note: localNote,
          selectedCategories: localSelectedCategories,
          actualEntries,
          categoryTitles,
        });
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
        const textContent = generateTextContent({
          childName: actualChildName,
          recipientName: localRecipientName,
          note: localNote,
          selectedCategories: localSelectedCategories,
          actualEntries,
          categoryGroups,
          categoryTitles,
        });
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
      const textContent = generateTextContent({
        childName: actualChildName,
        recipientName: localRecipientName,
        note: localNote,
        selectedCategories: localSelectedCategories,
        actualEntries,
        categoryGroups,
        categoryTitles,
      });

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

  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      title="Print"
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {/* Configuration Section */}
        <PrintPreviewConfiguration
          colors={colors}
          availableCategories={availableCategories}
          selectedCategories={localSelectedCategories}
          categoryTitles={categoryTitles}
          onToggleCategory={toggleCategory}
        />

        {/* Preview Content */}
        <ScrollView style={styles.previewContainer}>
          <View style={styles.previewContent}>
            {/* Header */}
            <PrintPreviewHeader
              colors={colors}
              childName={actualChildName}
              recipientName={localRecipientName}
            />

            <View style={styles.divider} />

            {/* Note */}
            <PrintPreviewNote colors={colors} note={localNote} />

            {/* Quick Info */}
            <PrintPreviewQuickInfo
              colors={colors}
              visible={localSelectedCategories.includes("quick-info")}
            />

            {/* Selected Categories */}
            <PrintPreviewEntries
              colors={colors}
              selectedCategories={localSelectedCategories}
              actualEntries={actualEntries}
              categoryGroups={categoryGroups}
              categoryTitles={categoryTitles}
            />

            {/* Footer */}
            <PrintPreviewFooter colors={colors} />
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <PrintPreviewActions
          colors={colors}
          onClose={onClose}
          onDownloadPDF={handleDownloadPDF}
          onPrint={handlePrint}
        />
      </View>
    </ThemedModal>
  );
};
