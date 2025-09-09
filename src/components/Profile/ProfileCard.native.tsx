import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChildProfile } from "../../types/ChildProfile";

interface ProfileCardProps {
  profile: ChildProfile;
  onPress: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onPress }) => {
  const getCategoryCount = () => {
    const customCategories = profile.customCategories || [];
    const defaultCategoriesUsed = [
      "medical",
      "behavior",
      "sensory",
      "dietary",
      "communication",
      "daily",
      "education",
      "emergency",
    ].filter((cat) => {
      const entries = profile[cat as keyof ChildProfile];
      return Array.isArray(entries) && entries.length > 0;
    });

    return customCategories.length + defaultCategoriesUsed.length;
  };

  const getItemCount = () => {
    let count = 0;

    const categoryFields = [
      "medical",
      "behavior",
      "sensory",
      "dietary",
      "communication",
      "daily",
      "education",
      "emergency",
    ];

    categoryFields.forEach((field) => {
      const entries = profile[field as keyof ChildProfile];
      if (Array.isArray(entries)) {
        count += entries.length;
      }
    });

    if (profile.customCategories) {
      profile.customCategories.forEach((category) => {
        if (category.entries) {
          count += category.entries.length;
        }
      });
    }

    return count;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name}>{profile.name}</Text>
        {profile.diagnosis && (
          <Text style={styles.diagnosis}>{profile.diagnosis}</Text>
        )}
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{getCategoryCount()}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{getItemCount()}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </View>
      </View>

      {profile.quickInfo && profile.quickInfo.length > 0 && (
        <View style={styles.quickInfo}>
          <Text style={styles.quickInfoLabel}>Quick Info:</Text>
          <Text style={styles.quickInfoText} numberOfLines={2}>
            {profile.quickInfo.map((info) => `• ${info}`).join(" ")}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  diagnosis: {
    fontSize: 14,
    color: "#666",
  },
  stats: {
    flexDirection: "row",
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "600",
    color: "#8B7355",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  quickInfo: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 12,
  },
  quickInfoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  quickInfoText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});

export default ProfileCard;
