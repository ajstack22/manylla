import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { PersonIcon } from "../Common";
import { useShareStyles } from "./useShareStyles";

export const ShareDialogCategories = ({
  profile,
  selectedCategories,
  includePhoto,
  onCategoryToggle,
  onPhotoToggle,
  getSelectedEntriesCount,
}) => {
  const { colors } = useTheme();
  const styles = useShareStyles(colors);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Information to share</Text>
        {selectedCategories.length > 0 && (
          <Text style={styles.sectionCount}>
            {getSelectedEntriesCount()} entries
            {includePhoto ? " + photo" : ""}
          </Text>
        )}
      </View>

      {/* Photo option */}
      <View style={styles.categoryRow}>
        <TouchableOpacity
          style={[
            styles.categoryChip,
            includePhoto && styles.categoryChipSelected,
          ]}
          onPress={onPhotoToggle}
        >
          <Text
            style={[
              styles.categoryChipText,
              includePhoto && styles.categoryChipTextSelected,
            ]}
          >
            <View style={styles.checkboxContent}>
              <PersonIcon size={16} color={colors.text?.primary || "#333"} />
              <Text style={styles.checkboxLabel}>Photo</Text>
            </View>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category options */}
      <View style={styles.categoryGrid}>
        {profile.categories
          .filter((cat) => cat.isVisible)
          .map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategories.includes(category.name) &&
                  styles.categoryChipSelected,
                category.isQuickInfo && styles.categoryChipQuickInfo,
              ]}
              onPress={() => onCategoryToggle(category.name)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategories.includes(category.name) &&
                    styles.categoryChipTextSelected,
                ]}
              >
                {category.displayName}
              </Text>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );
};