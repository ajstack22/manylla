import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { getTextStyle } from "../../utils/platformStyles";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ChildProfile, Entry } from "../../types/ChildProfile";

import platform from "../../utils/platform";

const colors = {
  primary: "#A08670",
  secondary: "#A0937D",
  background: "#FDFBF7",
  surface: "#F4E4C1",
  text: "#4A4A4A",
  textSecondary: "#666666",
  border: "#E0E0E0",
  white: "#FFFFFF",
  error: "#D32F2F",
  warning: "#ED6C02",
  info: "#0288D1",
  success: "#2E7D32",
  hover: "#F5F5F5",
};

export const SharedProfileView = ({ isAuthenticated = false }) => {
  const [accessCode, setAccessCode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(isAuthenticated);
  const [error, setError] = useState("");

  const handleUnlock = () => {
    // Mock validation
    if (accessCode.toUpperCase() === "ABC123") {
      setIsUnlocked(true);
      setError("");
    } else {
      setError("Invalid access code. Please try again.");
    }
  };

  // Mock shared data
  const sharedData = {
    childName: "Ellie Thompson",
    sharedBy: "Sarah Thompson (Parent)",
    sharedDate: new Date("2024-01-20"),
    expiresDate: new Date("2024-01-27"),
    recipientName: "Ms. Johnson",
    note: "Ellie will be in your class starting Monday. Here's some helpful information about her needs and communication style.",
    quickInfo: {
      communication:
        "Uses 2-3 word phrases. Understands more than she can express.",
      emergency: "Mom: 555-0123, Dad: 555-0124",
    },
    sharedCategories: {
      strengths: [
        {
          title: "Visual Learning",
          description:
            "Ellie learns best with visual aids. Picture cards and demonstrations work much better than verbal instructions alone.",
        },
      ],
      challenges: [
        {
          title: "Loud Noises",
          description:
            "Sudden loud noises cause significant distress. Always warn beforehand when possible. Noise-canceling headphones help.",
        },
      ],
    },
  };

  if (!isUnlocked) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.unlockContainer}>
          <View style={styles.unlockCard}>
            <Icon
              name="lock"
              size={64}
              color={colors.primary}
              style={styles.lockIcon}
            />

            <Text style={styles.unlockTitle}>Secure Shared Profile</Text>

            <Text style={styles.unlockDescription}>
              This information has been securely shared with you. Please enter
              the access code provided by the parent.
            </Text>

            <View style={styles.inputContainer}>
              <Icon
                name="lock"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.accessCodeInput,
                  error ? styles.inputError : null,
                  getTextStyle("input"),
                  platform.isAndroid && { color: "#000000" },
                ]}
                value={accessCode}
                onChangeText={(text) => {
                  setAccessCode(text);
                  if (error) setError("");
                }}
                placeholder="Enter 6-character code"
                placeholderTextColor={platform.isAndroid ? "#999" : undefined}
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
                maxLength={6}
              />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[
                styles.unlockButton,
                accessCode.length < 6 ? styles.buttonDisabled : null,
              ]}
              onPress={handleUnlock}
              disabled={accessCode.length < 6}
            >
              <Text style={styles.unlockButtonText}>Access Profile</Text>
            </TouchableOpacity>

            <Text style={styles.hint}>Access codes are case-insensitive</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Manylla - Shared Profile</Text>
          <View style={styles.expiryChip}>
            <Icon name="access-time" size={16} color={colors.warning} />
            <Text style={styles.expiryText}>
              Expires {sharedData.expiresDate.toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Share Info Banner */}
        <View style={styles.infoBanner}>
          <Icon name="person" size={20} color={colors.info} />
          <View style={styles.infoBannerText}>
            <Text style={styles.infoText}>
              <Text style={styles.boldText}>{sharedData.sharedBy}</Text> shared
              this information with{" "}
              <Text style={styles.boldText}>{sharedData.recipientName}</Text> on{" "}
              {sharedData.sharedDate.toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Note from Parent */}
        {sharedData.note && (
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>Note from Parent:</Text>
            <Text style={styles.noteText}>{sharedData.note}</Text>
          </View>
        )}

        {/* Child Info */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {sharedData.childName.charAt(0)}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.childName}>{sharedData.childName}</Text>
              <Text style={styles.profileSubtitle}>Shared Profile</Text>
            </View>
          </View>

          {/* Quick Info */}
          {sharedData.quickInfo && (
            <View style={styles.quickInfoSection}>
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionTitle}>Quick Information</Text>
              {Object.entries(sharedData.quickInfo).map(([key, value]) => (
                <View key={key} style={styles.quickInfoItem}>
                  <Text style={styles.quickInfoKey}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                  <Text style={styles.quickInfoValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Shared Categories */}
        {Object.entries(sharedData.sharedCategories).map(
          ([category, entries]) => (
            <View key={category} style={styles.categorySection}>
              <Text
                style={[
                  styles.categoryTitle,
                  {
                    color:
                      category === "strengths" ? colors.warning : colors.error,
                  },
                ]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
              {entries.map((entry, index) => (
                <View key={index} style={styles.entryCard}>
                  <Text style={styles.entryTitle}>{entry.title}</Text>
                  <Text style={styles.entryDescription}>
                    {entry.description}
                  </Text>
                </View>
              ))}
            </View>
          ),
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>
            This information is confidential and shared via Manylla's secure
            platform.
          </Text>
          <Text style={styles.footerText}>
            Please do not share the access code or take screenshots.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Unlock Screen Styles
  unlockContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 100,
  },
  unlockCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lockIcon: {
    marginBottom: 16,
  },
  unlockTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  unlockDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 6,
    marginBottom: 8,
    width: "100%",
  },
  inputIcon: {
    marginRight: 12,
  },
  accessCodeInput: {
    flex: 1,
    fontSize: 18,
    color: colors.text,
    paddingVertical: 16,
    textAlign: "center",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  unlockButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: colors.border,
  },
  unlockButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  // Main View Styles
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  expiryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 8,
  },
  expiryText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: "500",
  },
  content: {
    padding: 20,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 12,
  },
  infoBannerText: {
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: "600",
  },
  noteCard: {
    backgroundColor: colors.hover,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  profileSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  quickInfoSection: {
    marginTop: 16,
  },
  sectionDivider: {
    height: 2,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  quickInfoItem: {
    marginBottom: 12,
  },
  quickInfoKey: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  quickInfoValue: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  entryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  entryDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  footer: {
    marginTop: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  footerDivider: {
    height: 2,
    backgroundColor: colors.border,
    width: "100%",
    marginBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 8,
  },
});
