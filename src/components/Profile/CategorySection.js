import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import Icon, { LabelIcon } from "../Common/IconProvider";
import { HtmlRenderer } from "../Forms/HtmlRenderer";
import { useTheme } from "../../context/ThemeContext";

// Helper function to get icon for category
const getCategoryIcon = (categoryTitle) => {
  // Always return Label icon for all categories (as requested)
  return "Label";
};

export const CategorySection = ({
  title,
  entries,
  color,
  icon,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: 24,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      paddingBottom: 8,
      borderBottomWidth: 2,
      borderBottomColor: color,
    },
    iconContainer: {
      marginRight: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    categoryIcon: {
      marginRight: 8,
      opacity: 0.8,
    },
    title: {
      fontSize: 20,
      fontWeight: "600",
      flex: 1,
      color: "#333",
    },
    entriesContainer: {
      gap: 16,
    },
    emptyCard: {
      backgroundColor: colors.background.secondary || "#f5f5f5",
      borderRadius: 8,
      padding: 16,
    },
    emptyText: {
      fontSize: 14,
      color: "#666",
      textAlign: "center",
    },
    entryCard: {
      borderLeftWidth: 4,
      borderLeftColor: color,
      backgroundColor: "#ffffff",
      borderRadius: 8,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    entryHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    entryContent: {
      flex: 1,
    },
    entryActions: {
      flexDirection: "row",
      gap: 4,
    },
    actionButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    editButton: {
      opacity: 0.6,
    },
    deleteButton: {
      opacity: 0.6,
    },
    deleteButtonHover: {
      backgroundColor: "#ffebee",
    },
    actionIcon: {
      fontSize: 16,
      color: "#666",
    },
    deleteIcon: {
      fontSize: 16,
      color: "#d32f2f",
    },
    entryDescription: {
      marginBottom: 8,
    },
    entryDate: {
      fontSize: 12,
      color: "#666",
      marginTop: 8,
    },
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const iconName = getCategoryIcon(title);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon
          name={iconName}
          size={20}
          color={color || colors.primary}
          style={styles.categoryIcon}
        />
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.entriesContainer}>
        {entries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No {title.toLowerCase()} added yet.
            </Text>
          </View>
        ) : (
          entries.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <View style={styles.entryContent}>
                  <HtmlRenderer content={entry.title} variant="h6" />
                </View>
                <View style={styles.entryActions}>
                  {onEditEntry && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => onEditEntry(entry)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionIcon}>✏️</Text>
                    </TouchableOpacity>
                  )}
                  {onDeleteEntry && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => onDeleteEntry(entry.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.entryDescription}>
                <HtmlRenderer content={entry.description} variant="body2" />
              </View>

              <Text style={styles.entryDate}>
                {formatDate(entry.updatedAt || entry.date)}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
};
