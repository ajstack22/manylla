import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useShareStyles } from "./useShareStyles";

export const ShareDialogPreview = ({
  profile,
  selectedCategories,
  showPreview,
  onTogglePreview,
  getSelectedEntriesCount,
}) => {
  const { colors } = useTheme();
  const styles = useShareStyles(colors);

  return (
    <>
      {/* Preview Toggle */}
      <TouchableOpacity style={styles.previewButton} onPress={onTogglePreview}>
        <Text style={styles.previewButtonText}>
          {showPreview ? "Hide" : "Show"} preview ({getSelectedEntriesCount()}{" "}
          entries)
        </Text>
      </TouchableOpacity>

      {/* Preview Content */}
      {showPreview && (
        <View style={styles.previewBox}>
          {profile.entries
            .filter((entry) => selectedCategories.includes(entry.category))
            .slice(0, 5)
            .map((entry) => (
              <View key={entry.id} style={styles.previewItem}>
                <Text style={styles.previewCategory}>
                  {
                    profile.categories.find((c) => c.name === entry.category)
                      ?.displayName
                  }
                </Text>
                <Text style={styles.previewTitle}>{entry.title}</Text>
              </View>
            ))}
          {getSelectedEntriesCount() > 5 && (
            <Text style={styles.previewMore}>
              ...and {getSelectedEntriesCount() - 5} more entries
            </Text>
          )}
        </View>
      )}
    </>
  );
};
