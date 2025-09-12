import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Image,
  Dimensions,
} from "react-native";
import { manyllaColors } from "../../theme/theme";
import { CategorySection } from "./CategorySection";
import { getVisibleCategories } from "../../utils/unifiedCategories";
import { ProfileEditDialog } from "./ProfileEditDialog";

const { width } = Dimensions.get("window");

export const ProfileOverview = ({
  profile,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onShare,
  onUpdateCategories,
  onUpdateProfile,
  profileEditOpen: profileEditOpenProp,
  setProfileEditOpen: setProfileEditOpenProp,
}) => {
  // Use local state if not controlled by parent
  const [profileEditOpenLocal, setProfileEditOpenLocal] = useState(false);
  const profileEditOpen = profileEditOpenProp ?? profileEditOpenLocal;
  const setProfileEditOpen = setProfileEditOpenProp ?? setProfileEditOpenLocal;

  const getEntriesByCategory = (category) =>
    profile.entries.filter((entry) => entry.category === category);

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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: platform.isWeb ? 24 : 16,
    },
    profileCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      padding: platform.isWeb ? 24 : 20,
      marginBottom: platform.isWeb ? 24 : 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    profileHeader: {
      alignItems: "center",
      position: "relative",
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: 16,
      backgroundColor: profile.photo
        ? "transparent"
        : manyllaColors.avatarDefaultBg,
    },
    avatarPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: manyllaColors.avatarDefaultBg,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    avatarText: {
      fontSize: 48,
      fontWeight: "bold",
      color: "white",
    },
    editButton: {
      position: "absolute",
      top: 0,
      right: width > 600 ? "calc(50% - 60px)" : "40%",
      backgroundColor: "#FFFFFF",
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    editIcon: {
      fontSize: 16,
      color: "#666",
    },
    name: {
      fontSize: 28,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 8,
      color: "#333",
    },
    ageText: {
      fontSize: 14,
      color: "#666",
      textAlign: "center",
      marginBottom: 8,
    },
    pronounsChip: {
      backgroundColor: "#f0f0f0",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginTop: 8,
    },
    pronounsText: {
      fontSize: 12,
      color: "#666",
      fontWeight: "500",
    },
    content: {
      position: "relative",
    },
    categoriesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 24,
    },
    categoryWrapper: {
      width: platform.isWeb && width > 768 ? "48%" : "100%",
      marginRight: platform.isWeb && width > 768 ? "2%" : 0,
      marginBottom: 16,
    },
    fab: {
      position: "fixed",
      bottom: platform.isWeb ? 24 : 16,
      right: platform.isWeb ? 24 : 16,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: manyllaColors.brown,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 1200,
    },
    fabIcon: {
      fontSize: 24,
      color: "white",
      fontWeight: "bold",
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          {profile.photo && profile.photo !== "default" ? (
            <TouchableOpacity
              onPress={() => onUpdateProfile && setProfileEditOpen(true)}
            >
              <Image
                source={{
                  uri:
                    platform.isIOS && profile.photo.startsWith("/")
                      ? `https://manylla.com/qual${profile.photo}` // Convert relative path to absolute URL for iOS
                      : profile.photo,
                }}
                style={styles.avatar}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.avatarPlaceholder}
              onPress={() => onUpdateProfile && setProfileEditOpen(true)}
            >
              <Text style={styles.avatarText}>
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            </TouchableOpacity>
          )}

          {onUpdateProfile && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setProfileEditOpen(true)}
            >
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.name}>
            {profile.preferredName || profile.name}
          </Text>

          <Text style={styles.ageText}>
            Age: {calculateAge(profile.dateOfBirth)} years
          </Text>

          {profile.pronouns && (
            <View style={styles.pronounsChip}>
              <Text style={styles.pronounsText}>{profile.pronouns}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.categoriesContainer}>
          {visibleCategories.map((category) => {
            const entries = getEntriesByCategory(category.name);

            return (
              <View key={category.id} style={styles.categoryWrapper}>
                <CategorySection
                  title={category.displayName}
                  entries={entries}
                  color={category.color}
                  icon={null}
                  onAddEntry={
                    onAddEntry ? () => onAddEntry(category.name) : undefined
                  }
                  onEditEntry={onEditEntry}
                  onDeleteEntry={onDeleteEntry}
                />
              </View>
            );
          })}
        </View>

        {/* Floating Action Button for Add Entry */}
        {onAddEntry && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => onAddEntry("")}
            activeOpacity={0.8}
          >
            <Text style={styles.fabIcon}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {onUpdateProfile && (
        <ProfileEditDialog
          open={profileEditOpen}
          onClose={() => setProfileEditOpen(false)}
          profile={profile}
          onSave={onUpdateProfile}
        />
      )}
    </ScrollView>
  );
};

import platform from "@platform";
