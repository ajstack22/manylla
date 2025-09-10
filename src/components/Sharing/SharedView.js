import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ChildProfile } from "../../types/ChildProfile";
import { unifiedCategories } from "../../utils/unifiedCategories";
import { API_ENDPOINTS } from "../../config/api";

// Manylla theme colors - hardcoded for consistent provider view
const manyllaColors = {
  background: "#C4A66B", // Actual manila envelope color
  paper: "#D4B896", // Lighter manila for cards
  text: "#3D2F1F", // Dark brown text
  textSecondary: "#5D4A37", // Medium brown for secondary text
  border: "#A68B5B", // Darker manila for borders
  white: "#FFFFFF",
  error: "#D32F2F",
};

export const SharedView = ({ shareCode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sharedProfile, setSharedProfile] = useState(null);

  // Auto-authenticate with code from URL
  React.useEffect(() => {
    const loadSharedData = async () => {
      try {
        // Parse share code - must be "token#key" format
        if (!shareCode.includes("#")) {
          setError("Invalid share URL format");
          setIsLoading(false);
          return;
        }

        const [token, encryptionKey] = shareCode.split("#");

        if (!encryptionKey) {
          setError("Missing decryption key in URL");
          setIsLoading(false);
          return;
        }

        // Phase 3etch share from database via API
        try {
          const response = await fetch(API_ENDPOINTS.share.access, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_code: token }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 404) {
              setError("Share not found");
            } else if (response.status === 403) {
              setError(
                errorData.error || "Share has expired or reached view limit",
              );
            } else {
              setError("Failed to load share");
            }
            setIsLoading(false);
            return;
          }

          const result = await response.json();

          if (!result.encrypted_data) {
            setError("Share data is missing");
            setIsLoading(false);
            return;
          }

          // For now, we'll simulate the decryption process
          // In a real implementation, you'd need to import and use TweetNaCl
          // const keyBytes = util.decodeBase64(encryptionKey);
          // const combined = util.decodeBase64(result.encrypted_data);
          // const nonce = combined.slice(0, 24);
          // const ciphertext = combined.slice(24);
          // const decrypted = nacl.secretbox.open(ciphertext, nonce, keyBytes);

          // Mock profile data for demo
          const profile = {
            id: "shared-profile",
            name: "Ellie Thompson",
            preferredName: "Ellie",
            pronouns: "she/her",
            dateOfBirth: new Date("2018-03-15"),
            photo: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            entries: [
              {
                id: "1",
                title: "Visual Learning",
                description:
                  "Ellie learns best with visual aids. Picture cards and demonstrations work much better than verbal instructions alone.",
                category: "strengths",
                date: new Date(),
                visibility: ["education"],
              },
              {
                id: "2",
                title: "Loud Noises",
                description:
                  "Sudden loud noises cause significant distress. Always warn beforehand when possible. Noise-canceling headphones help.",
                category: "challenges",
                date: new Date(),
                visibility: ["education"],
              },
            ],
            quickInfoPanels: [
              {
                id: "communication",
                name: "communication",
                displayName: "Communication",
                value:
                  "Uses 2-3 word phrases. Understands more than she can express.",
                isVisible: true,
                isCustom: false,
                order: 1,
              },
              {
                id: "emergency",
                name: "emergency",
                displayName: "Emergency Contact",
                value: "Mom: 555-0123, Dad: 555-0124",
                isVisible: true,
                isCustom: false,
                order: 2,
              },
            ],
            categoryConfigs: [],
            syncEnabled: false,
          };

          setSharedProfile(profile);
          setIsAuthenticated(true);
        } catch (decryptError) {
          setError("Invalid share code or decryption failed");
        }
      } catch (err) {
        setError("Failed to load shared data");
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedData();
  }, [shareCode]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <Icon
            name="security"
            size={48}
            color={manyllaColors.text}
            style={styles.loadingIcon}
          />
          <Text style={styles.loadingTitle}>Verifying Access</Text>
          <Text style={styles.loadingSubtitle}>Verifying access code...</Text>
          <ActivityIndicator
            size="large"
            color={manyllaColors.text}
            style={styles.spinner}
          />
        </View>
      </View>
    );
  }

  if (!isAuthenticated && error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorCard}>
          <Icon name="error" size={48} color={manyllaColors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!sharedProfile) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorCard}>
          <Icon name="error" size={48} color={manyllaColors.error} />
          <Text style={styles.errorText}>
            No profile data found for this share code
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Provider Mode Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>manylla</Text>
        <View style={styles.headerRight}>
          <Icon
            name="visibility"
            size={20}
            color={manyllaColors.textSecondary}
          />
          <View style={styles.profileChip}>
            <Icon name="person" size={16} color={manyllaColors.text} />
            <Text style={styles.profileChipText}>
              {sharedProfile.preferredName || sharedProfile.name}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Access Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Shared Access:</Text> You are viewing
            information shared by the family. This is a temporary link that will
            expire.
          </Text>
        </View>

        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(sharedProfile.preferredName || sharedProfile.name)
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileName}>
            {sharedProfile.preferredName || sharedProfile.name}
          </Text>
          <Text style={styles.profileDetails}>
            {sharedProfile.pronouns ? `${sharedProfile.pronouns} • ` : ""}
            Born {sharedProfile.dateOfBirth.toLocaleDateString()}
          </Text>
        </View>

        {/* Quick Info */}
        {sharedProfile.quickInfoPanels &&
          sharedProfile.quickInfoPanels.length > 0 && (
            <View style={styles.quickInfoCard}>
              <Text style={styles.sectionTitle}>Quick Information</Text>
              {sharedProfile.quickInfoPanels
                .filter((panel) => panel.isVisible && panel.value)
                .map((panel) => (
                  <View key={panel.id} style={styles.quickInfoItem}>
                    <Text style={styles.quickInfoLabel}>
                      {panel.displayName}:
                    </Text>
                    <Text style={styles.quickInfoValue}>{panel.value}</Text>
                  </View>
                ))}
            </View>
          )}

        {/* Entries by category */}
        {unifiedCategories
          .filter((cat) => cat.isVisible)
          .sort((a, b) => a.order - b.order)
          .map((category) => {
            const entries = sharedProfile.entries.filter(
              (e) => e.category === category.name,
            );
            if (entries.length === 0 && !category.isQuickInfo) return null;

            // Handle Quick Info category specially
            if (category.isQuickInfo) {
              const quickInfoEntries = sharedProfile.entries.filter(
                (e) => e.category === "quick-info",
              );
              if (
                quickInfoEntries.length === 0 &&
                (!sharedProfile.quickInfoPanels ||
                  sharedProfile.quickInfoPanels.length === 0)
              ) {
                return null;
              }
            }

            return (
              <View key={category.id} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View
                    style={[
                      styles.categoryIndicator,
                      { backgroundColor: category.color },
                    ]}
                  />
                  <Text style={styles.categoryTitle}>
                    {category.displayName}
                  </Text>
                </View>
                {entries.map((entry) => (
                  <View key={entry.id} style={styles.entryItem}>
                    <Text style={styles.entryTitle}>{entry.title}</Text>
                    <Text style={styles.entryDescription}>
                      {entry.description}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: manyllaColors.background,
  },
  // Loading States
  loadingContainer: {
    flex: 1,
    backgroundColor: manyllaColors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingCard: {
    backgroundColor: manyllaColors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    width: width - 40,
    maxWidth: 600,
  },
  loadingIcon: {
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: manyllaColors.text,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: manyllaColors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  spinner: {
    marginTop: 16,
  },
  // Error States
  errorContainer: {
    flex: 1,
    backgroundColor: manyllaColors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorCard: {
    backgroundColor: manyllaColors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    width: width - 40,
    maxWidth: 600,
  },
  errorText: {
    fontSize: 16,
    color: manyllaColors.error,
    textAlign: "center",
    marginTop: 16,
  },
  // Main View
  header: {
    backgroundColor: manyllaColors.paper,
    borderBottomWidth: 1,
    borderBottomColor: manyllaColors.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: manyllaColors.text,
    letterSpacing: -1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: manyllaColors.text,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  profileChipText: {
    fontSize: 14,
    color: manyllaColors.text,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  infoBanner: {
    backgroundColor: manyllaColors.paper,
    borderWidth: 1,
    borderColor: manyllaColors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: manyllaColors.text,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: "600",
  },
  profileCard: {
    backgroundColor: manyllaColors.paper,
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: manyllaColors.textSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "bold",
    color: manyllaColors.paper,
  },
  profileName: {
    fontSize: 14,
    fontWeight: "bold",
    color: manyllaColors.text,
    marginBottom: 8,
  },
  profileDetails: {
    fontSize: 16,
    color: manyllaColors.textSecondary,
  },
  quickInfoCard: {
    backgroundColor: manyllaColors.paper,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: manyllaColors.text,
    marginBottom: 16,
  },
  quickInfoItem: {
    marginBottom: 12,
  },
  quickInfoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: manyllaColors.textSecondary,
    marginBottom: 8,
  },
  quickInfoValue: {
    fontSize: 16,
    color: manyllaColors.text,
    lineHeight: 22,
  },
  categoryCard: {
    backgroundColor: manyllaColors.paper,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryIndicator: {
    width: 10,
    height: 24,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: manyllaColors.text,
  },
  entryItem: {
    marginBottom: 16,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: manyllaColors.text,
    marginBottom: 8,
  },
  entryDescription: {
    fontSize: 14,
    color: manyllaColors.textSecondary,
    lineHeight: 20,
  },
});
