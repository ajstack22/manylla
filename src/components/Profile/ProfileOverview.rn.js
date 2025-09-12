import platform from "../../utils/platform";
/**
 * Cross-Platform Profile Overview
 * Works on iOS, Android, and Web
 */

import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

export const ProfileOverview = ({ profile, onUpdateProfile }) => {
  const { colors } = useTheme();

  if (!profile) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
          No profile loaded
        </Text>
      </View>
    );
  }

  const renderCategory = (title, entries, categoryColor) => {
    if (!entries || entries.length === 0) return null;

    return (
      <View
        style={[styles.categorySection, { backgroundColor: colors.surface }]}
        key={title}
      >
        <View
          style={[styles.categoryHeader, { backgroundColor: categoryColor }]}
        >
          <Text style={styles.categoryTitle}>{title}</Text>
          <Text style={styles.categoryCount}>{entries.length} items</Text>
        </View>
        <View style={styles.categoryContent}>
          {entries.map((entry, index) => (
            <View
              key={index}
              style={[styles.entryItem, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.entryTitle, { color: colors.text.primary }]}>
                {entry.title || entry.name}
              </Text>
              {entry.description && (
                <Text
                  style={[
                    styles.entryDescription,
                    { color: colors.text.secondary },
                  ]}
                  numberOfLines={2}
                >
                  {entry.description}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const categories = [
    { key: "medical", title: "Medical Information", color: "#E57373" },
    { key: "behavior", title: "Behavior & Triggers", color: "#FF8A65" },
    { key: "sensory", title: "Sensory Needs", color: "#FFB74D" },
    { key: "dietary", title: "Dietary Restrictions", color: "#FFD54F" },
    { key: "communication", title: "Communication", color: "#81C784" },
    { key: "daily", title: "Daily Living", color: "#4FC3F7" },
    { key: "education", title: "Education", color: "#9575CD" },
    { key: "emergency", title: "Emergency", color: "#F06292" },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      backgroundColor: colors.primary,
      paddingTop: platform.isIOS ? 50 : platform.isAndroid ? 20 : 0,
      paddingBottom: 16,
      paddingHorizontal: 16,
    },
    headerTitle: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "600",
    },
    content: {
      flex: 1,
    },
    infoCard: {
      backgroundColor: colors.surface,
      margin: 16,
      padding: 16,
      borderRadius: 8,
      ...platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
        web: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        },
      }),
    },
    infoLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      fontWeight: "600",
      marginBottom: 8,
      textTransform: "uppercase",
    },
    infoValue: {
      fontSize: 16,
      color: colors.text.primary,
    },
    quickInfoItem: {
      fontSize: 16,
      color: colors.text.primary,
      marginBottom: 4,
    },
    categoriesContainer: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    categorySection: {
      marginBottom: 16,
      borderRadius: 8,
      overflow: "hidden",
      ...platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
        web: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        },
      }),
    },
    categoryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 12,
    },
    categoryTitle: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    categoryCount: {
      color: "#FFFFFF",
      fontSize: 14,
      opacity: 0.9,
    },
    categoryContent: {
      padding: 12,
    },
    entryItem: {
      paddingVertical: 8,
      borderBottomWidth: 1,
    },
    entryTitle: {
      fontSize: 15,
      fontWeight: "500",
      marginBottom: 4,
    },
    entryDescription: {
      fontSize: 14,
      lineHeight: 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {profile.preferredName || profile.name}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {profile.diagnosis && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Diagnosis</Text>
            <Text style={styles.infoValue}>{profile.diagnosis}</Text>
          </View>
        )}

        {profile.quickInfo && profile.quickInfo.length > 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Quick Info</Text>
            {profile.quickInfo.map((info, index) => (
              <Text key={index} style={styles.quickInfoItem}>
                • {info}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.categoriesContainer}>
          {categories.map((cat) =>
            renderCategory(cat.title, profile[cat.key], cat.color),
          )}

          {profile.customCategories?.map((customCat, index) =>
            renderCategory(customCat.name, customCat.entries || [], "#B0BEC5"),
          )}
        </View>
      </ScrollView>
    </View>
  );
};
