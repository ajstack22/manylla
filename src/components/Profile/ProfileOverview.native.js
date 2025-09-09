import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { MarkdownRenderer } from "../Forms";

const ProfileOverview = ({ profile, onUpdateProfile, onLogout }) => {
  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out? Your data will be saved locally.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: onLogout,
        },
      ],
    );
  };

  if (!profile) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No profile loaded</Text>
      </View>
    );
  }

  const getEntriesByCategory = (category) =>
    profile.entries?.filter((entry) => entry.category === category) || [];

  const getVisibleCategories = (categories) => {
    if (!categories) return [];
    return categories.filter((cat) => cat.enabled !== false);
  };

  const allCategories = getVisibleCategories(profile.categories);

  // Show categories that have entries OR are Quick Info (always show Quick Info)
  const visibleCategories = allCategories
    .filter((category) => {
      const entries = getEntriesByCategory(category.name);
      return entries.length > 0 || category.isQuickInfo;
    })
    .sort((a, b) => {
      // Quick Info categories always come first
      if (a.isQuickInfo && !b.isQuickInfo) return -1;
      if (!a.isQuickInfo && b.isQuickInfo) return 1;
      return a.order - b.order;
    });

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const renderCategory = (category) => {
    const entries = getEntriesByCategory(category.name);

    if (!category.isQuickInfo && entries.length === 0) return null;

    return (
      <View style={styles.categorySection} key={category.id}>
        <View
          style={[styles.categoryHeader, { backgroundColor: category.color }]}
        >
          <Text style={styles.categoryTitle}>{category.displayName}</Text>
          {entries.length > 0 && (
            <Text style={styles.categoryCount}>{entries.length} items</Text>
          )}
        </View>
        {entries.length > 0 ? (
          <View style={styles.categoryContent}>
            {entries.map((entry) => (
              <View key={entry.id} style={styles.entryItem}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                {entry.description && (
                  <MarkdownRenderer
                    content={entry.description}
                    style={styles.entryDescription}
                    numberOfLines={2}
                  />
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.categoryContent}>
            <Text style={styles.emptyCategory}>No entries yet</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar with Logout */}
      <View style={styles.topBar}>
        <Text style={styles.appTitle}>Manylla</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {profile.photo ? (
              <Image source={{ uri: profile.photo }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {profile.name?.charAt(0) || "?"}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.profileName}>
            {profile.preferredName || profile.name}
          </Text>
          {profile.dateOfBirth && (
            <Text style={styles.profileAge}>
              Age: {calculateAge(profile.dateOfBirth)} years
            </Text>
          )}
          {profile.pronouns && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{profile.pronouns}</Text>
            </View>
          )}
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          {visibleCategories.length > 0 ? (
            visibleCategories.map(renderCategory)
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateTitle}>No Information Yet</Text>
              <Text style={styles.emptyStateText}>
                Add entries to start building the profile
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Entry Button */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#8B7355",
    paddingTop: 50, // Account for status bar
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 6,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  profileHeader: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    backgroundColor: "#8B7355",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "600",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  profileAge: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  chip: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 12,
    color: "#333",
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  categorySection: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    borderBottomColor: "#E0E0E0",
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  entryDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  emptyCategory: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#8B7355",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "300",
  },
});

export default ProfileOverview;
