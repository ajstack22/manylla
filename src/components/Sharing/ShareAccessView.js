import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { useTheme } from "../../context/ThemeContext";
import { API_ENDPOINTS } from "../../config/api";
import platform from "../../utils/platform";

export const ShareAccessView = ({ accessCode, encryptionKey }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharedProfile, setSharedProfile] = useState(null);
  const [shareInfo, setShareInfo] = useState(null);

  const fetchAndDecryptShare = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch encrypted share from API
      const response = await fetch(API_ENDPOINTS.share.access, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_code: accessCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to access share");
      }

      const data = await response.json();

      // Store share metadata
      setShareInfo({
        recipientType: data.recipient_type,
        createdAt: new Date(data.created_at),
        expiresAt: new Date(data.expires_at),
        hoursRemaining: data.hours_remaining,
        viewCount: data.view_count,
        maxViews: data.max_views,
        viewsRemaining: data.views_remaining,
      });

      // Decrypt the share data
      const encryptedBlob = util.decodeBase64(data.encrypted_data);
      const key = util.decodeBase64(encryptionKey);

      // Extract nonce and ciphertext
      const nonce = encryptedBlob.slice(0, 24);
      const ciphertext = encryptedBlob.slice(24);

      // Decrypt
      const decryptedBytes = nacl.secretbox.open(ciphertext, nonce, key);

      if (!decryptedBytes) {
        throw new Error("Failed to decrypt share data");
      }

      const decryptedData = JSON.parse(util.encodeUTF8(decryptedBytes));
      setSharedProfile(decryptedData.profile);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accessCode, encryptionKey]);

  useEffect(() => {
    if (accessCode && encryptionKey) {
      fetchAndDecryptShare();
    }
  }, [accessCode, encryptionKey, fetchAndDecryptShare]);

  const renderCategory = (categoryName, entries) => {
    if (!entries || entries.length === 0) return null;

    const category = sharedProfile.categories?.find(
      (c) => c.name === categoryName,
    );
    const displayName = category?.displayName || categoryName;

    return (
      <View key={categoryName} style={styles.categorySection}>
        <Text style={styles.categoryTitle}>{displayName}</Text>
        {entries.map((entry) => (
          <View key={entry.id} style={styles.entryCard}>
            <Text style={styles.entryTitle}>{entry.title}</Text>
            {entry.description && (
              <Text style={styles.entryDescription}>{entry.description}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const handlePrint = () => {
    if (platform.isWeb) {
      window.print();
    } else {
      Alert.alert("Print", "Printing is available in the web version");
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading shared profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Unable to Access Share</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  if (!sharedProfile) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>No Profile Data</Text>
        <Text style={styles.errorMessage}>
          The shared profile could not be loaded
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Shared Profile</Text>
          <Text style={styles.headerSubtitle}>
            Secure access link • {shareInfo?.recipientType || "Custom share"}
          </Text>
        </View>
      </View>

      {/* Expiration Warning */}
      {shareInfo && shareInfo.hoursRemaining < 24 && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⏰ This share expires in {shareInfo.hoursRemaining} hours
          </Text>
        </View>
      )}

      {/* View Count Warning */}
      {shareInfo &&
        shareInfo.viewsRemaining !== null &&
        shareInfo.viewsRemaining <= 2 && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              👁️ {shareInfo.viewsRemaining} view
              {shareInfo.viewsRemaining !== 1 ? "s" : ""} remaining
            </Text>
          </View>
        )}

      {/* Profile Info */}
      <View style={styles.profileSection}>
        {sharedProfile.photo && (
          <View style={styles.photoContainer}>
            <Text style={styles.photoPlaceholder}>👤</Text>
          </View>
        )}
        <Text style={styles.profileName}>
          {sharedProfile.preferredName || sharedProfile.name}
        </Text>
        {sharedProfile.pronouns && (
          <Text style={styles.profilePronouns}>{sharedProfile.pronouns}</Text>
        )}
        {sharedProfile.birthDate && (
          <Text style={styles.profileDetail}>
            Born: {new Date(sharedProfile.birthDate).toLocaleDateString()}
          </Text>
        )}
      </View>

      {/* Quick Info */}
      {sharedProfile.quickInfoPanels &&
        sharedProfile.quickInfoPanels.length > 0 && (
          <View style={styles.quickInfoSection}>
            <Text style={styles.sectionTitle}>Quick Info</Text>
            {sharedProfile.quickInfoPanels.map((panel, index) => (
              <View key={index} style={styles.quickInfoCard}>
                <Text style={styles.quickInfoLabel}>{panel.label}</Text>
                <Text style={styles.quickInfoValue}>{panel.value}</Text>
              </View>
            ))}
          </View>
        )}

      {/* Entries by Category */}
      <View style={styles.entriesSection}>
        {sharedProfile.categories?.map((category) => {
          const entries = sharedProfile.entries?.filter(
            (e) => e.category === category.name,
          );
          return renderCategory(category.name, entries);
        })}
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.printButton} onPress={handlePrint}>
          <Text style={styles.printButtonText}>🖨️ Print This Page</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This information was securely shared via Manylla
        </Text>
        <Text style={styles.footerSubtext}>
          All data is encrypted and will be automatically deleted when the share
          expires
        </Text>
      </View>
    </ScrollView>
  );
};

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: colors.background.default,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.text.secondary,
    },
    errorIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    errorTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 8,
    },
    errorMessage: {
      fontSize: 16,
      color: colors.text.secondary,
      textAlign: "center",
      maxWidth: 300,
    },
    header: {
      backgroundColor: colors.primary,
      padding: 20,
      paddingTop: platform.isWeb ? 20 : 60,
    },
    headerContent: {
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "600",
      color: colors.background.paper,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.background.paper,
      opacity: 0.9,
    },
    warningBanner: {
      backgroundColor: colors.warning,
      padding: 12,
      alignItems: "center",
    },
    warningText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "500",
    },
    profileSection: {
      padding: 20,
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    photoContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.background.manila,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    photoPlaceholder: {
      fontSize: 36,
    },
    profileName: {
      fontSize: 24,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 4,
    },
    profilePronouns: {
      fontSize: 16,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    profileDetail: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    quickInfoSection: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 12,
    },
    quickInfoCard: {
      backgroundColor: colors.background.paper,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    quickInfoLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    quickInfoValue: {
      fontSize: 16,
      color: colors.text.primary,
    },
    entriesSection: {
      padding: 20,
    },
    categorySection: {
      marginBottom: 24,
    },
    categoryTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.primary,
      marginBottom: 12,
    },
    entryCard: {
      backgroundColor: colors.background.paper,
      padding: 16,
      borderRadius: 8,
      marginBottom: 8,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    entryTitle: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text.primary,
      marginBottom: 4,
    },
    entryDescription: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 20,
    },
    actionsSection: {
      padding: 20,
      alignItems: "center",
    },
    printButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    printButtonText: {
      color: colors.background.paper,
      fontSize: 16,
      fontWeight: "500",
    },
    footer: {
      padding: 20,
      alignItems: "center",
      backgroundColor: colors.background.manila,
    },
    footerText: {
      fontSize: 14,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    footerSubtext: {
      fontSize: 12,
      color: colors.text.secondary,
      textAlign: "center",
      maxWidth: 300,
    },
  });

export default ShareAccessView;
