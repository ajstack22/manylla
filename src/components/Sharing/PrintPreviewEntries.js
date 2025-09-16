import React from "react";
import { View, Text } from "react-native";
import { usePrintStyles } from "./usePrintStyles";

export const PrintPreviewEntries = ({
  colors,
  selectedCategories,
  actualEntries,
  categoryGroups,
  categoryTitles
}) => {
  const styles = usePrintStyles(colors);

  return (
    <>
      {selectedCategories &&
        selectedCategories.map((categoryGroup) => {
          // Skip quick-info since it's handled separately
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
                  if (categoryEntries.length < 1) return null;

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
    </>
  );
};