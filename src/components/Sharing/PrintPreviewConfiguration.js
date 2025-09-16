import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { usePrintStyles } from "./usePrintStyles";

export const PrintPreviewConfiguration = ({
  colors,
  availableCategories,
  selectedCategories,
  categoryTitles,
  onToggleCategory
}) => {
  const styles = usePrintStyles(colors);

  return (
    <View style={styles.configSection}>
      <Text style={styles.configTitle}>Select categories to include:</Text>
      <View style={styles.categoriesGrid}>
        {availableCategories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryCheckbox,
              selectedCategories.includes(category) &&
                styles.categoryCheckboxSelected,
            ]}
            onPress={() => onToggleCategory(category)}
          >
            <Text
              style={[
                styles.categoryCheckboxText,
                selectedCategories.includes(category) &&
                  styles.categoryCheckboxTextSelected,
              ]}
            >
              {selectedCategories.includes(category) ? "✓ " : ""}
              {categoryTitles[category] || category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.divider} />
    </View>
  );
};