import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  StyleSheet,
  TextInput,
  Alert,
  Switch,
  Platform,
  Clipboard,
  ActivityIndicator,
} from "react-native";
import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { useTheme } from "../../context/ThemeContext";
import { ThemedModal } from "../Common";
import { API_ENDPOINTS } from "../../config/api";

const sharePresets = [
  {
    id: "education",
    label: "Education",
    icon: "🎓",
    categories: ["goals", "strengths", "challenges", "education", "behaviors"],
    description: "Educational needs  classroom support",
  },
  {
    id: "support",
    label: "Support",
    icon: "👶",
    categories: ["quick-info", "behaviors", "tips-tricks", "daily-care"],
    description: "Care instructions  helpful tips",
  },
  {
    id: "medical",
    label: "Medical",
    icon: "🏥",
    categories: [
      "quick-info",
      "medical",
      "therapies",
      "behaviors",
      "challenges",
    ],
    description: "Health information  medical history",
  },
  {
    id: "custom",
    label: "Custom",
    icon: "⚙️",
    categories: [],
    description: "Choose exactly what to share",
  },
];

const expirationOptions = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "3 months" },
  { value: 180, label: "6 months" },
];

export const ShareDialogOptimized = ({ open, onClose, profile }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [step, setStep] = useState("configure");
  const [loading, setLoading] = useState(false);

  // Configuration state
  const [selectedPreset, setSelectedPreset] = useState("education");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [expirationDays, setExpirationDays] = useState(7);
  const [includePhoto, setIncludePhoto] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Complete state
  const [generatedLink, setGeneratedLink] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setStep("configure");
      setSelectedPreset("education");
      const educationPreset = sharePresets.find((p) => p.id === "education");
      setSelectedCategories(educationPreset?.categories || []);
      setExpirationDays(7);
      setIncludePhoto(false);
      setShowPreview(false);
      setGeneratedLink("");
      setCopiedLink(false);
    }
  }, [open]);

  // Auto-select categories when preset changes
  const handlePresetChange = (presetId) => {
    setSelectedPreset(presetId);
    const preset = sharePresets.find((p) => p.id === presetId);
    if (preset && presetId !== "custom") {
      setSelectedCategories(preset.categories);
    }
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      // Generate invite code in XXXX-XXXX format (matching StackMap)
      const { generateInviteCode } = require("../../utils/inviteCode");
      const token = generateInviteCode();

      // Generate 32-byte encryption key
      const shareKey = nacl.randomBytes(32);

      // Prepare share data
      const sharedProfile = {
        ...profile,
        entries: profile.entries.filter((entry) =>
          selectedCategories.includes(entry.category),
        ),
        photo: includePhoto ? profile.photo : "",
        quickInfoPanels: [],
      };

      const shareData = {
        profile: sharedProfile,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(
          Date.now() + expirationDays * 24 * 60 * 60 * 1000,
        ).toISOString(),
        version: 2, // Version 2 indicates encrypted share
      };

      // Encrypt the share data
      const nonce = nacl.randomBytes(24);
      const messageBytes = util.decodeUTF8(JSON.stringify(shareData));
      const encrypted = nacl.secretbox(messageBytes, nonce, shareKey);

      // Combine nonce + ciphertext
      const encryptedBlob = util.encodeBase64(
        new Uint8Array([...nonce, ...encrypted]),
      );

      // Phase 3tore encrypted share in database via API
      const response = await fetch(API_ENDPOINTS.share.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_code: token,
          encrypted_data: encryptedBlob,
          recipient_type: selectedPreset,
          expiry_hours: expirationDays * 24,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        Alert.alert("Error", "Failed to create share link. Please try again.");
        return;
      }

      const result = await response.json();

      // Generate link with key in fragment
      const getShareDomain = () => {
        // In React Native, we'll use a configured domain
        return "https://manylla.com/qual";
      };

      const shareDomain = getShareDomain();
      const keyBase64 = util.encodeBase64(shareKey);
      // Use path format for shares
      setGeneratedLink(`${shareDomain}/share/${token}#${keyBase64}`);
      setStep("complete");
    } catch (error) {
      Alert.alert("Error", "Failed to create share link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    Clipboard.setString(generatedLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareLink = async () => {
    try {
      const subject = `${profile.preferredName || profile.name}'s Information`;
      const expiration =
        expirationDays <= 30
          ? `${expirationDays} ${expirationDays === 1 ? "day" : "days"}`
          : expirationDays === 90
            ? "3 months"
            : "6 months";
      const message = `Here's a secure encrypted link to view ${profile.preferredName || profile.name}'s information:\n\n${generatedLink}\n\nThis link will expire in ${expiration}.\n\nNotehis link contains encrypted data. Please use the complete link exactly as provided.`;

      await Share.share({
        message,
        title: subject,
      });
    } catch (error) {}
  };

  const getSelectedEntriesCount = () => {
    return profile.entries.filter((entry) =>
      selectedCategories.includes(entry.category),
    ).length;
  };

  const renderConfigureStep = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Preset Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Who are you sharing with?</Text>
        <View style={styles.presetGrid}>
          {sharePresets.map((preset) => (
            <TouchableOpacity
              key={preset.id}
              style={[
                styles.presetCard,
                selectedPreset === preset.id && styles.presetCardSelected,
              ]}
              onPress={() => handlePresetChange(preset.id)}
            >
              <Text style={styles.presetIcon}>{preset.icon}</Text>
              <Text
                style={[
                  styles.presetLabel,
                  selectedPreset === preset.id && styles.presetLabelSelected,
                ]}
              >
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {selectedPreset && (
          <Text style={styles.presetDescription}>
            {sharePresets.find((p) => p.id === selectedPreset)?.description}
          </Text>
        )}
      </View>

      {/* Categories Selection */}
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
            onPress={() => setIncludePhoto(!includePhoto)}
          >
            <Text
              style={[
                styles.categoryChipText,
                includePhoto && styles.categoryChipTextSelected,
              ]}
            >
              👤 Photo
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
                onPress={() => handleCategoryToggle(category.name)}
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

      {/* Expiration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Access expires in</Text>
        <View style={styles.expirationGrid}>
          {expirationOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.expirationButton,
                expirationDays === option.value &&
                  styles.expirationButtonSelected,
              ]}
              onPress={() => setExpirationDays(option.value)}
            >
              <Text
                style={[
                  styles.expirationButtonText,
                  expirationDays === option.value &&
                    styles.expirationButtonTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Preview */}
      <TouchableOpacity
        style={styles.previewButton}
        onPress={() => setShowPreview(!showPreview)}
      >
        <Text style={styles.previewButtonText}>
          {showPreview ? "Hide" : "Show"} preview ({getSelectedEntriesCount()}{" "}
          entries)
        </Text>
      </TouchableOpacity>

      {showPreview && (
        <View style={styles.previewBox}>
          {profile.entries
            .filter((entry) => selectedCategories.includes(entry.category))
            .slice(0, 5)
            .map((entry) => (
              <View key={entry.id} style={styles.previewItem}>
                <Text style={styles.previewCategory}>
                  {
                    profile.categories.find((c) => c.name === entry.category)
                      ?.displayName
                  }
                </Text>
                <Text style={styles.previewTitle}>{entry.title}</Text>
              </View>
            ))}
          {getSelectedEntriesCount() > 5 && (
            <Text style={styles.previewMore}>
              ...and {getSelectedEntriesCount() - 5} more entries
            </Text>
          )}
        </View>
      )}

      {/* Generate Button */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          (selectedCategories.length === 0 || loading) && styles.buttonDisabled,
        ]}
        onPress={handleGenerateLink}
        disabled={selectedCategories.length === 0 || loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.text.primary} />
        ) : (
          <Text style={styles.primaryButtonText}>Generate Share Link</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCompleteStep = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.successAlert}>
        <Text style={styles.successAlertText}>
          ✓ Share link created successfully!
        </Text>
        <Text style={styles.successAlertSubtext}>
          This link will expire in{" "}
          {expirationDays <= 30
            ? `${expirationDays} ${expirationDays === 1 ? "day" : "days"}`
            : expirationDays === 90
              ? "3 months"
              : "6 months"}
          .
        </Text>
      </View>

      {/* Share Link */}
      <View style={styles.linkCard}>
        <Text style={styles.linkCardTitle}>Share Link</Text>
        <View style={styles.linkInputContainer}>
          <TextInput
            style={styles.linkInput}
            value={generatedLink}
            editable={false}
            multiline
          />
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyLink}>
            <Text style={styles.copyButtonText}>{copiedLink ? "✓" : "📋"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Security Info */}
      <View style={styles.securityCard}>
        <Text style={styles.securityCardTitle}>🔒 Secure Share</Text>
        <Text style={styles.securityCardText}>
          This link contains an encrypted version of the selected information.
          The encryption key is included in the link and never sent to any
          server. Only someone with this exact link can view the shared
          information.
        </Text>
      </View>

      {/* Share Options */}
      <View style={styles.shareOptions}>
        <Text style={styles.shareOptionsTitle}>Share via</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShareLink}>
          <Text style={styles.shareButtonText}>📤 Share Link</Text>
        </TouchableOpacity>
      </View>

      {/* Create Another */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => {
          setStep("configure");
          setSelectedPreset("education");
          const educationPreset = sharePresets.find(
            (p) => p.id === "education",
          );
          setSelectedCategories(educationPreset?.categories || []);
          setIncludePhoto(false);
        }}
      >
        <Text style={styles.secondaryButtonText}>Create another share</Text>
      </TouchableOpacity>

      {/* Done Button */}
      <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
        <Text style={styles.primaryButtonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <ThemedModal
      visible={open}
      onClose={onClose}
      title={step === "configure" ? "Create Share Link" : "Share Created!"}
      headerStyle="primary"
      presentationStyle="pageSheet"
    >

      {step === "configure" ? renderConfigureStep() : renderCompleteStep()}
    </ThemedModal>
  );
};

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.background.paper,
      flex: 1,
      textAlign: "center",
    },
    closeButton: {
      padding: 8,
    },
    closeButtonText: {
      fontSize: 20,
      color: colors.background.paper,
    },
    headerSpacer: {
      width: 36,
    },
    scrollView: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
    },
    sectionCount: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: "600",
    },
    presetGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
    },
    presetCard: {
      flex: 1,
      minWidth: "45%",
      backgroundColor: colors.background.paper,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
    },
    presetCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.background.manila,
    },
    presetIcon: {
      fontSize: 18,
      marginBottom: 8,
    },
    presetLabel: {
      fontSize: 14,
      color: colors.text.primary,
    },
    presetLabelSelected: {
      fontWeight: "600",
      color: colors.primary,
    },
    presetDescription: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 8,
    },
    categoryRow: {
      marginBottom: 8,
    },
    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    categoryChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.background.paper,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
    },
    categoryChipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryChipQuickInfo: {
      borderWidth: 1,
    },
    categoryChipText: {
      fontSize: 14,
      color: colors.text.primary,
    },
    categoryChipTextSelected: {
      color: colors.background.paper,
      fontWeight: "600",
    },
    expirationGrid: {
      flexDirection: "row",
      gap: 8,
      marginTop: 12,
    },
    expirationButton: {
      flex: 1,
      paddingVertical: 12,
      backgroundColor: colors.background.paper,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      alignItems: "center",
    },
    expirationButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    expirationButtonText: {
      fontSize: 14,
      color: colors.text.primary,
    },
    expirationButtonTextSelected: {
      color: colors.background.paper,
      fontWeight: "600",
    },
    previewButton: {
      padding: 12,
      marginBottom: 16,
    },
    previewButtonText: {
      fontSize: 14,
      color: colors.primary,
      textAlign: "center",
    },
    previewBox: {
      backgroundColor: colors.background.paper,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
    },
    previewItem: {
      marginBottom: 12,
    },
    previewCategory: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 8,
    },
    previewTitle: {
      fontSize: 14,
      color: colors.text.primary,
    },
    previewMore: {
      fontSize: 12,
      color: colors.text.secondary,
      fontStyle: "italic",
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 16,
    },
    primaryButtonText: {
      color: colors.background.paper,
      fontSize: 16,
      fontWeight: "600",
    },
    secondaryButton: {
      paddingVertical: 12,
      alignItems: "center",
      marginBottom: 16,
    },
    secondaryButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "600",
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    successAlert: {
      backgroundColor: colors.background.manila,
      borderWidth: 1,
      borderColor: "#67B26F",
      borderRadius: 8,
      padding: 16,
      marginBottom: 20,
    },
    successAlertText: {
      color: "#67B26F",
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
    },
    successAlertSubtext: {
      color: "#67B26F",
      fontSize: 14,
    },
    linkCard: {
      backgroundColor: colors.background.paper,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
    },
    linkCardTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 12,
    },
    linkInputContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    linkInput: {
      flex: 1,
      backgroundColor: colors.background.default,
      borderRadius: 8,
      padding: 12,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      fontSize: 12,
      color: colors.text.primary,
    },
    copyButton: {
      marginLeft: 8,
      padding: 12,
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    copyButtonText: {
      fontSize: 18,
      color: colors.background.paper,
    },
    securityCard: {
      backgroundColor: colors.background.default,
      borderRadius: 8,
      padding: 16,
      marginBottom: 20,
    },
    securityCardTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 8,
    },
    securityCardText: {
      fontSize: 13,
      color: colors.text.secondary,
      lineHeight: 18,
    },
    shareOptions: {
      marginBottom: 20,
    },
    shareOptionsTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 12,
    },
    shareButton: {
      backgroundColor: colors.background.paper,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
    },
    shareButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "600",
    },
  });
